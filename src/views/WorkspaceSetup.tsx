import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store';
import { ChefHat, Plus, AlertCircle } from 'lucide-react';
import type { Workspace } from '@/types';

export function WorkspaceSetup() {
  const { user, setWorkspace } = useStore();
  const [name, setName] = useState('Big Tasty Productions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // Check if user already has a workspace
  useEffect(() => {
    if (!user) return;
    setChecking(true);
    supabase
      .from('workspace_members')
      .select('workspace_id, workspaces(*)')
      .eq('user_id', user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const member = data[0] as { workspaces: unknown };
          if (member.workspaces) {
            // User already has a workspace — use it
            const ws = member.workspaces as Workspace;
            setWorkspace(ws);
          }
        }
        setChecking(false);
      });
  }, [user, setWorkspace]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          owner_id: user.id,
          plan: 'free',
          settings: {},
        })
        .select()
        .single();

      if (wsError) throw wsError;

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: ws.id,
          user_id: user.id,
          role: 'owner',
          invited_by: user.id,
        });

      if (memberError) throw memberError;

      // Backfill workspace_id on any existing clips that don't have one
      await supabase
        .from('clips')
        .update({ workspace_id: ws.id })
        .is('workspace_id', null);

      setWorkspace(ws as Workspace);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-pulse text-zinc-400">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-10 h-10 text-indigo-400" />
            <h1 className="text-2xl font-bold text-zinc-100">Set up your workspace</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Create a workspace to start managing your video clips
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Workspace name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="My Production Company"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create workspace
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
