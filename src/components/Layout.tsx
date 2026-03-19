import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

const navItems = [
  { id: 'shots', label: 'Shots', path: '/shots', step: '1', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'curate', label: 'Curate', path: '/curate', step: '2', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', disabled: true },
  { id: 'generate', label: 'Generate', path: '/generate', step: '3', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', disabled: true, accent: true },
  { id: 'review', label: 'Review', path: '/review', step: '4', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z', disabled: true },
  { id: 'recipes', label: 'Recipes', path: '/recipes', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', disabled: true },
  { id: 'performance', label: 'Perf', path: '/perf', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', disabled: true },
  { id: 'pipeline', label: 'Pipeline', path: '/pipeline', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6M9 19h6M15 19v-6a2 2 0 012-2h2a2 2 0 012 2v6', disabled: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const {
    activeTab,
    setActiveTab,
    user,
    showCuratedOnly,
    setShowCuratedOnly,
    showGradedOnly,
    setShowGradedOnly,
    showMusic,
    setShowMusic,
    columnCount,
    setColumnCount,
  } = useStore();
  const navigate = useNavigate();

  const handleNav = (item: typeof navItems[0]) => {
    if (item.disabled) return;
    setActiveTab(item.id);
    navigate(item.path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleStaticToolClick = () => {
    const pinModal = document.getElementById('ck-pin') as HTMLDivElement | null;
    if (pinModal) {
      pinModal.style.display = 'flex';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      <header className="h-11 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur flex-shrink-0">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-tight text-zinc-100">Creative Kitchen</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-600/20 text-orange-400 font-semibold">
            VIDEO
          </span>
        </div>

        {/* Center: Tab Navigation */}
        <nav className="flex gap-0.5">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                disabled={item.disabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  active
                    ? item.accent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-100'
                    : item.accent
                    ? 'text-indigo-400 hover:bg-indigo-600/20'
                    : item.disabled
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {item.step && (
                  <span
                    className={`text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      active ? 'bg-white/20' : 'bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    {item.step}
                  </span>
                )}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Controls & User */}
        <div className="flex items-center gap-2">
          {/* Checkboxes */}
          <label className="flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-300 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showCuratedOnly}
              onChange={(e) => setShowCuratedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 cursor-pointer"
            />
            <span>Curated only</span>
          </label>

          <label className="flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-300 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showGradedOnly}
              onChange={(e) => setShowGradedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 cursor-pointer"
            />
            <span>Graded only</span>
          </label>

          <label className="flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-300 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showMusic}
              onChange={(e) => setShowMusic(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 cursor-pointer"
            />
            <span>Music</span>
          </label>

          {/* Column slider */}
          <div className="flex items-center gap-1 px-2">
            <label className="text-[10px] text-zinc-400">Cols:</label>
            <input
              type="range"
              min="2"
              max="10"
              value={columnCount}
              onChange={(e) => setColumnCount(parseInt(e.target.value, 10))}
              className="w-16 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] text-zinc-400 w-5 text-right">{columnCount}</span>
          </div>

          {/* Static Tool button */}
          <button
            onClick={handleStaticToolClick}
            className="inline-flex gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-yellow-600/10 text-yellow-600 border border-yellow-600/20 hover:bg-yellow-600/20 transition-colors"
          >
            Static Tool
          </button>

          {/* User controls */}
          <span className="text-[10px] text-zinc-500 max-w-[140px] truncate">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
