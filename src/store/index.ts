import { create } from 'zustand';
import type { Clip, FilterState, ViewMode, SortField, SortDirection, Workspace } from '@/types';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Workspace
  workspace: Workspace | null;
  setWorkspace: (workspace: Workspace | null) => void;

  // Clips
  clips: Clip[];
  setClips: (clips: Clip[]) => void;
  updateClip: (id: number, updates: Partial<Clip>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (dir: SortDirection) => void;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Selection
  selectedClips: Set<number>;
  toggleSelectClip: (id: number) => void;
  selectAllVisible: (ids: number[]) => void;
  clearSelection: () => void;

  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Thumbnail map (filename -> drive file id)
  thumbnailMap: Map<string, string>;
  setThumbnailMap: (map: Map<string, string>) => void;

  // Header filters
  showCuratedOnly: boolean;
  setShowCuratedOnly: (show: boolean) => void;
  showGradedOnly: boolean;
  setShowGradedOnly: (show: boolean) => void;
  showMusic: boolean;
  setShowMusic: (show: boolean) => void;
  columnCount: number;
  setColumnCount: (count: number) => void;

  // Fetch clips from Supabase
  fetchClips: (workspaceId: string) => Promise<void>;
}

const defaultFilters: FilterState = {
  search: '',
  category: '',
  type: '',
  subType: '',
  approved: 'all',
  ratio: '',
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  workspace: null,
  setWorkspace: (workspace) => set({ workspace }),

  clips: [],
  setClips: (clips) => set({ clips }),
  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  loading: false,
  setLoading: (loading) => set({ loading }),

  viewMode: 'grid',
  setViewMode: (viewMode) => set({ viewMode }),
  sortField: 'name',
  setSortField: (sortField) => set({ sortField }),
  sortDirection: 'asc',
  setSortDirection: (sortDirection) => set({ sortDirection }),
  filters: { ...defaultFilters },
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),

  selectedClips: new Set(),
  toggleSelectClip: (id) =>
    set((state) => {
      const next = new Set(state.selectedClips);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedClips: next };
    }),
  selectAllVisible: (ids) => set({ selectedClips: new Set(ids) }),
  clearSelection: () => set({ selectedClips: new Set() }),

  activeTab: 'shots',
  setActiveTab: (activeTab) => set({ activeTab }),

  thumbnailMap: new Map(),
  setThumbnailMap: (thumbnailMap) => set({ thumbnailMap }),

  showCuratedOnly: false,
  setShowCuratedOnly: (showCuratedOnly) => set({ showCuratedOnly }),
  showGradedOnly: false,
  setShowGradedOnly: (showGradedOnly) => set({ showGradedOnly }),
  showMusic: false,
  setShowMusic: (showMusic) => set({ showMusic }),
  columnCount: 6,
  setColumnCount: (columnCount) => set({ columnCount }),

  fetchClips: async (workspaceId: string) => {
    const { setClips, setLoading } = get();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name', { ascending: true });

      if (error) throw error;
      setClips((data as Clip[]) || []);
    } catch (err) {
      console.error('Failed to fetch clips:', err);
    } finally {
      setLoading(false);
    }
  },
}));
