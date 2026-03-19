import { useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { ClipCard } from '@/components/ClipCard';
import { getThumbnailFiles } from '@/lib/drive';
import { CheckSquare, Film } from 'lucide-react';

export function Shots() {
  const {
    clips,
    loading,
    workspace,
    fetchClips,
    setThumbnailMap,
    selectedClips,
    selectAllVisible,
    clearSelection,
    columnCount,
    setActiveTab,
  } = useStore();

  useEffect(() => {
    setActiveTab('shots');
  }, [setActiveTab]);

  useEffect(() => {
    if (workspace) {
      fetchClips(workspace.id);
      getThumbnailFiles()
        .then(setThumbnailMap)
        .catch((err) => console.error('Failed to load thumbnails:', err));
    }
  }, [workspace, fetchClips, setThumbnailMap]);

  // Count clips by type (simplified for sidebar)
  const clipsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    clips.forEach((clip) => {
      const type = clip.type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [clips]);

  if (loading && clips.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-zinc-400 text-sm">Loading clips...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* LEFT SIDEBAR */}
      <aside className="w-56 border-r border-zinc-800 flex flex-col bg-zinc-900/30 shrink-0">
        {/* Available Clips Section */}
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-[11px] font-semibold text-zinc-200 mb-3 uppercase tracking-wide">
            Available Clips
          </h3>
          <div className="space-y-2">
            {Object.entries(clipsByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-[10px]">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-zinc-300">{type}</span>
                <span className="ml-auto text-zinc-500 font-mono">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-700 text-[10px] text-zinc-400">
            <span className="font-medium text-zinc-300">{clips.length}</span>
            <span className="ml-2">total clips</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <h3 className="text-[11px] font-semibold text-zinc-200 mb-3 uppercase tracking-wide">
            Quick Actions
          </h3>
          <button className="w-full px-3 py-1.5 text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
            Re-match Recipes
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50 flex items-center gap-2 shrink-0">
          <button
            onClick={() => selectAllVisible(clips.map((c) => c.id))}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
            title="Select all"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          {selectedClips.size > 0 && (
            <>
              <span className="text-[10px] text-zinc-400">
                {selectedClips.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
              <button className="px-2 py-1 text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
                Archive
              </button>
              <button className="px-2 py-1 text-[10px] font-medium bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors border border-red-800/30">
                Delete
              </button>
            </>
          )}
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-auto p-4">
          {clips.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Film className="w-12 h-12 mb-3 text-zinc-700" />
              <p className="text-sm font-medium">No clips yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Clips will appear here once loaded from Google Drive
              </p>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              }}
            >
              {clips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
