import { useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { ClipCard } from '@/components/ClipCard';
import { getThumbnailFiles } from '@/lib/drive';
import { Film, Grid3X3, List } from 'lucide-react';

export function Shots() {
  const {
    clips,
    loading,
    workspace,
    fetchClips,
    setThumbnailMap,
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

  // Count clips by type for stats bar
  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {
      body: 0,
      hook: 0,
      product: 0,
      cta: 0,
      archived: 0,
    };
    clips.forEach((clip) => {
      if (clip.archived) {
        counts.archived = (counts.archived || 0) + 1;
      } else {
        const type = (clip.type || 'body').toLowerCase();
        if (type in counts) {
          counts[type] = (counts[type] || 0) + 1;
        }
      }
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
    <div className="flex flex-col h-full">
      {/* STATS BAR */}
      <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center gap-4 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-zinc-300 font-medium">Total</span>
          <span className="text-zinc-100 font-bold">{clips.length}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-zinc-400">Body</span>
          <span className="text-zinc-100 font-bold">{typeStats.body}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-zinc-400">Hook</span>
          <span className="text-zinc-100 font-bold">{typeStats.hook}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-zinc-400">Product</span>
          <span className="text-zinc-100 font-bold">{typeStats.product}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-teal-400" />
          <span className="text-zinc-400">CTA</span>
          <span className="text-zinc-100 font-bold">{typeStats.cta}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
          <span className="text-zinc-400">Archived</span>
          <span className="text-zinc-100 font-bold">{typeStats.archived}</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950 shrink-0">
        <input
          type="text"
          placeholder="Search shots..."
          className="w-48 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-300 placeholder-zinc-600"
        />
        <select className="appearance-none px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-300 cursor-pointer">
          <option>All Types</option>
        </select>
        <select className="appearance-none px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-300 cursor-pointer">
          <option>All Styles</option>
        </select>
        <select className="appearance-none px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-300 cursor-pointer">
          <option>All Ratios</option>
        </select>
        <select className="appearance-none px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-300 cursor-pointer">
          <option>All</option>
        </select>
        <select className="appearance-none px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-300 cursor-pointer">
          <option>All Categories</option>
        </select>
        <select className="appearance-none px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] text-zinc-300 cursor-pointer">
          <option>Hide Archived</option>
        </select>

        {/* Right side: View controls and clip count */}
        <div className="ml-auto flex items-center gap-2">
          <button className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center transition-colors">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded text-zinc-500 hover:text-zinc-300 flex items-center justify-center transition-colors">
            <List className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-zinc-400 mx-2">{clips.length} clips</span>
          <button className="text-[11px] font-medium text-zinc-200 hover:text-white transition-colors">
            Manage
          </button>
        </div>
      </div>

      {/* GRID CONTENT */}
      <div className="flex-1 overflow-auto px-4 py-4 bg-zinc-950">
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
            className="grid gap-3"
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
  );
}
