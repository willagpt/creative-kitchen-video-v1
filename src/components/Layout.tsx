import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';
import {
  ChefHat,
  Film,
  Scissors,
  Layers,
  Play,
  BarChart3,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { id: 'shots', label: 'Shots', icon: Film, path: '/shots' },
  { id: 'curate', label: 'Curate', icon: Scissors, path: '/curate', disabled: true },
  { id: 'generate', label: 'Generate', icon: Layers, path: '/generate', disabled: true },
  { id: 'review', label: 'Review', icon: Play, path: '/review', disabled: true },
  { id: 'pipeline', label: 'Pipeline', icon: BarChart3, path: '/pipeline', disabled: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const { activeTab, setActiveTab, workspace, user } = useStore();
  const navigate = useNavigate();

  const handleNav = (item: typeof navItems[0]) => {
    if (item.disabled) return;
    setActiveTab(item.id);
    navigate(item.path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-indigo-400" />
            <div>
              <div className="text-sm font-semibold text-zinc-100">Creative Kitchen</div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-500 text-[10px] font-bold rounded uppercase tracking-wider">
                  Video
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace name */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Workspace</div>
          <div className="text-sm font-medium text-zinc-300 truncate">
            {workspace?.name}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : item.disabled
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.disabled && (
                  <span className="ml-auto text-[10px] text-zinc-600">Soon</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Static tool link */}
        <div className="p-2 border-t border-zinc-800">
          <a
            href="https://creative-kitchen-static.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Static Tool
          </a>
        </div>

        {/* User / Sign out */}
        <div className="p-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 truncate mb-2">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
