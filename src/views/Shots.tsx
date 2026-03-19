import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store';
import { ClipCard } from '@/components/ClipCard';
import { Dropdown } from '@/components/Dropdown';
import { getThumbnailFiles } from '@/lib/drive';
import { Film, Grid3X3, List } from 'lucide-react';

export function Shots() {
  const {
    clips,
    loading,
    workspace,
    fetchClips,
    setThumbnailMap,
    setActiveTab,
  } = useStore();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [ratioFilter, setRatioFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [archivedFilter, setArchivedFilter] = useState('');

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

  // Generate dropdown options from clips data
  const typeOptions = useMemo(() => {
    const types = new Set(clips.map((clip) => (clip.type || 'body').toLowerCase()));
    return [
      { value: '', label: 'All Types' },
      ...Array.from(types)
        .sort()
        .map((type) => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) })),
    ];
  }, [clips]);

  const styleOptions = useMemo(() => {
    const styles = new Set(clips.filter((clip) => clip.style).map((clip) => clip.style!));
    return [
      { value: '', label: 'All Styles' },
      ...Array.from(styles)
        .sort()
        .map((style) => ({ value: style, label: style })),
    ];
  }, [clips]);

  const ratioOptions = useMemo(() => {
    const ratios = new Set(clips.map((clip) => clip.ratio));
    return [
      { value: '', label: 'All Ratios' },
      ...Array.from(ratios)
        .sort()
        .map((ratio) => ({ value: ratio, label: ratio })),
    ];
  }, [clips]);

  const categoryOptions = useMemo(() => {
    const categories = new Set(clips.filter((clip) => clip.category).map((clip) => clip.category));
    return [
      { value: '', label: 'All Categories' },
      ...Array.from(categories)
        .sort()
        .map((category) => ({ value: category, label: category })),
    ];
  }, [clips]);

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'pending', label: 'Pending' },
  ];

  const archivedOptions = [
    { value: '', label: 'Hide Archived' },
    { value: 'show', label: 'Show Archived' },
    { value: 'only', label: 'Only Archived' },
  ];

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

  // Filter clips based on selected filters
  const filteredClips = useMemo(() => {
    return clips.filter((clip) => {
      // Search filter
      if (searchTerm && !clip.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (typeFilter && (clip.type || 'body').toLowerCase() !== typeFilter) {
        return false;
      }

      // Style filter
      if (styleFilter && clip.style !== styleFilter) {
        return false;
      }

      // Ratio filter
      if (ratioFilter && clip.ratio !== ratioFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'approved' && !clip.approved) {
        return false;
      }
      if (statusFilter === 'rejected' && !clip.rejected) {
        return false;
      }
      if (statusFilter === 'pending' && (clip.approved || clip.rejected)) {
        return false;
      }

      // Category filter
      if (categoryFilter && clip.category !== categoryFilter) {
        return false;
      }

      // Archived filter
      if (archivedFilter === '' && clip.archived) {
        return false; // Hide archived
      }
      if (archivedFilter === 'only' && !clip.archived) {
        return false; // Only archived
      }

      return true;
    });
  }, [clips, searchTerm, typeFilter, styleFilter, ratioFilter, statusFilter, categoryFilter, archivedFilter]);

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
      {/* STATS BAR — V1: px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 */}
      <div className="flex gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 overflow-x-auto shrink-0">
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

      {/* FILTER BAR — V1: px-4 py-3 border-b border-zinc-800 */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-zinc-800 items-center shrink-0">
        <input
          type="text"
          placeholder="Search shots..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-56 h-8 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
        />
        <Dropdown
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
          placeholder="All Types"
        />
        <Dropdown
          value={styleFilter}
          onChange={setStyleFilter}
          options={styleOptions}
          placeholder="All Styles"
        />
        <Dropdown
          value={ratioFilter}
          onChange={setRatioFilter}
          options={ratioOptions}
          placeholder="All Ratios"
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder="All"
        />
        <Dropdown
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
          placeholder="All Categories"
        />
        <Dropdown
          value={archivedFilter}
          onChange={setArchivedFilter}
          options={archivedOptions}
          placeholder="Hide Archived"
        />

        {/* Right side: View controls and clip count */}
        <div className="ml-auto flex items-center gap-2">
          <button className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 flex items-center justify-center">
            <List className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-400 ml-2">{filteredClips.length} clips</span>
          <button className="text-xs font-medium text-zinc-200 hover:text-white ml-2">Manage</button>
        </div>
      </div>

      {/* GRID CONTENT */}
      {/* GRID AREA — V1: flex-1 overflow-y-auto p-4, grid gap-3 */}
      <div className="flex-1 overflow-y-auto p-4">
        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Film className="w-12 h-12 mb-3 text-zinc-700" />
            <p className="text-sm font-medium">No clips yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Clips will appear here once loaded from Google Drive
            </p>
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Film className="w-12 h-12 mb-3 text-zinc-700" />
            <p className="text-sm font-medium">No clips match filters</p>
            <p className="text-xs text-zinc-600 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            }}
          >
            {filteredClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
