import { useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { ClipCard } from '@/components/ClipCard';
import { getThumbnailFiles } from '@/lib/drive';
import {
  Search,
  Grid3X3,
  List,
  CheckSquare,
  XSquare,
  RotateCcw,
  Film,
  ChevronDown,
} from 'lucide-react';
import type { Clip } from '@/types';

// Stats component
function StatsBar({ clips }: { clips: Clip[] }) {
  const total = clips.length;
  const approved = clips.filter((c) => c.approved).length;
  const rejected = clips.filter((c) => c.rejected).length;
  const pending = total - approved - rejected;

  const types = clips.reduce<Record<string, number>>((acc, c) => {
    const t = c.type || 'untyped';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
      <span className="font-medium text-zinc-200">{total} clips</span>
      <span className="text-green-500">{approved} approved</span>
      <span className="text-red-500">{rejected} rejected</span>
      <span className="text-zinc-500">{pending} pending</span>
      <span className="text-zinc-600">|</span>
      {Object.entries(types)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count]) => (
          <span key={type} className="text-zinc-500">
            {type}: {count}
          </span>
        ))}
    </div>
  );
}

export function Shots() {
  const {
    clips,
    loading,
    workspace,
    fetchClips,
    thumbnailMap,
    setThumbnailMap,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    resetFilters,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    selectedClips,
    selectAllVisible,
    clearSelection,
    setActiveTab,
  } = useStore();

  // Set active tab
  useEffect(() => {
    setActiveTab('shots');
  }, [setActiveTab]);

  // Fetch clips + thumbnails on mount
  useEffect(() => {
    if (workspace) {
      fetchClips(workspace.id);
      getThumbnailFiles()
        .then(setThumbnailMap)
        .catch((err) => console.error('Failed to load thumbnails:', err));
    }
  }, [workspace, fetchClips, setThumbnailMap]);

  // Get unique values for filter dropdowns
  const categories = useMemo(
    () => [...new Set(clips.map((c) => c.category).filter(Boolean))].sort(),
    [clips]
  );
  const types = useMemo(
    () => [...new Set(clips.map((c) => c.type).filter(Boolean))].sort(),
    [clips]
  );
  const subTypes = useMemo(
    () => [...new Set(clips.map((c) => c.sub_type).filter((v): v is string => !!v))].sort(),
    [clips]
  );
  const ratios = useMemo(
    () => [...new Set(clips.map((c) => c.ratio).filter(Boolean))].sort(),
    [clips]
  );

  // Apply filters + sort
  const filteredClips = useMemo(() => {
    let result = [...clips];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }

    // Type
    if (filters.type) {
      result = result.filter((c) => c.type === filters.type);
    }

    // Sub-type
    if (filters.subType) {
      result = result.filter((c) => c.sub_type === filters.subType);
    }

    // Approval status
    if (filters.approved === 'approved') {
      result = result.filter((c) => c.approved);
    } else if (filters.approved === 'rejected') {
      result = result.filter((c) => c.rejected);
    } else if (filters.approved === 'pending') {
      result = result.filter((c) => !c.approved && !c.rejected);
    }

    // Ratio
    if (filters.ratio) {
      result = result.filter((c) => c.ratio === filters.ratio);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [clips, filters, sortField, sortDirection]);

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.type ||
    filters.subType ||
    filters.approved !== 'all' ||
    filters.ratio;

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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Shot Library</h1>
            <StatsBar clips={filteredClips} />
          </div>
          <div className="flex items-center gap-2">
            {selectedClips.size > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-indigo-400">
                  {selectedClips.size} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              </div>
            )}
            <button
              onClick={() => selectAllVisible(filteredClips.map((c) => c.id))}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Select all visible"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title={viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid3X3 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search clips..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter dropdowns */}
          <FilterSelect
            value={filters.category}
            onChange={(v) => setFilters({ category: v })}
            options={categories}
            placeholder="Category"
          />
          <FilterSelect
            value={filters.type}
            onChange={(v) => setFilters({ type: v })}
            options={types}
            placeholder="Type"
          />
          <FilterSelect
            value={filters.subType}
            onChange={(v) => setFilters({ subType: v })}
            options={subTypes}
            placeholder="Sub-type"
          />
          <FilterSelect
            value={filters.ratio}
            onChange={(v) => setFilters({ ratio: v })}
            options={ratios}
            placeholder="Ratio"
          />
          <FilterSelect
            value={filters.approved}
            onChange={(v) => setFilters({ approved: v as 'all' | 'approved' | 'rejected' | 'pending' })}
            options={['all', 'approved', 'rejected', 'pending']}
            placeholder="Status"
          />

          {/* Sort */}
          <div className="flex items-center gap-1">
            <FilterSelect
              value={sortField}
              onChange={(v) => setSortField(v as typeof sortField)}
              options={['name', 'duration', 'size_mb', 'category', 'created_at']}
              placeholder="Sort by"
            />
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredClips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          {hasActiveFilters ? (
            <>
              <XSquare className="w-10 h-10 mb-3 text-zinc-600" />
              <p className="text-sm">No clips match your filters</p>
              <button
                onClick={resetFilters}
                className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
              >
                Reset filters
              </button>
            </>
          ) : (
            <>
              <Film className="w-10 h-10 mb-3 text-zinc-600" />
              <p className="text-sm">No clips yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Clips will appear here once loaded from Google Drive
              </p>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredClips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredClips.map((clip) => (
            <ClipListRow key={clip.id} clip={clip} thumbnailMap={thumbnailMap} />
          ))}
        </div>
      )}
    </div>
  );
}

// Simple filter select
function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
    </div>
  );
}

// List view row
function ClipListRow({ clip, thumbnailMap }: { clip: Clip; thumbnailMap: Map<string, string> }) {
  const { selectedClips, toggleSelectClip } = useStore();
  const isSelected = selectedClips.has(clip.id);

  const thumbFileName = clip.name.replace(/\.[^.]+$/, '.jpg');
  const thumbFileId = thumbnailMap.get(thumbFileName);
  const thumbUrl = thumbFileId ? `https://lh3.googleusercontent.com/d/${thumbFileId}=w100` : null;

  const SUB_TYPE_COLORS: Record<string, string> = {
    'food-action': 'bg-orange-500/20 text-orange-500',
    'food-beauty': 'bg-yellow-500/20 text-yellow-500',
    'lifestyle': 'bg-purple-500/20 text-purple-500',
    'product': 'bg-cyan-500/20 text-cyan-500',
    'stop-motion': 'bg-pink-500/20 text-pink-500',
  };

  return (
    <div
      onClick={() => toggleSelectClip(clip.id)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-indigo-600/10 border border-indigo-500/30'
          : 'hover:bg-zinc-900 border border-transparent'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-16 h-9 bg-zinc-800 rounded overflow-hidden shrink-0">
        {thumbUrl ? (
          <img src={thumbUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-3 h-3 text-zinc-600" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-zinc-200 truncate">{clip.name}</div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0">
        {clip.sub_type && (
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded ${
              SUB_TYPE_COLORS[clip.sub_type] || 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {clip.sub_type}
          </span>
        )}
        {clip.category && (
          <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-500 text-[10px] rounded">
            {clip.category}
          </span>
        )}
        <span className="text-xs text-zinc-500 w-12 text-right">
          {clip.duration > 0 ? `${Math.floor(clip.duration / 60)}:${Math.floor(clip.duration % 60).toString().padStart(2, '0')}` : '—'}
        </span>
        <span className="text-xs text-zinc-600 w-14 text-right">
          {clip.size_mb > 0 ? `${clip.size_mb.toFixed(1)}MB` : ''}
        </span>
        {/* Status dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            clip.approved
              ? 'bg-green-500'
              : clip.rejected
              ? 'bg-red-500'
              : 'bg-zinc-600'
          }`}
        />
      </div>
    </div>
  );
}
