import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';
import {
  ChefHat,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { id: 'shots', label: 'Shots', path: '/shots' },
  { id: 'curate', label: 'Curate', path: '/curate', disabled: true },
  { id: 'generate', label: 'Generate', path: '/generate', disabled: true },
  { id: 'review', label: 'Review', path: '/review', disabled: true },
  { id: 'pipeline', label: 'Pipeline', path: '/pipeline', disabled: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const { activeTab, setActiveTab, user } = useStore();
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
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-zinc-800" style={{ backgroundColor: 'rgba(9, 9, 11, 0.85)' }}>
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6 text-indigo-400" />
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-zinc-100">Creative Kitchen</span>
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-[10px] font-bold rounded-sm uppercase tracking-wider">
                Video
              </span>
            </div>
          </div>

          {/* Center: Tab Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  disabled={item.disabled}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    active
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : item.disabled
                      ? 'text-zinc-600 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Links & User */}
          <div className="flex items-center gap-4">
            <a
              href="https://creative-kitchen-static.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Static
            </a>
            <div className="h-4 border-r border-zinc-700" />
            <div className="text-xs text-zinc-500 max-w-[180px] truncate">
              {user?.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-3 px-6 text-center text-xs text-zinc-600">
        Creative Kitchen — Big Tasty Productions © 2026
      </footer>
    </div>
  );
}
