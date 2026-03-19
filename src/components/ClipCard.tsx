import type { Clip } from '@/types';
import { useStore } from '@/store';

const SUB_TYPE_COLORS: Record<string, string> = {
  'food-action': 'bg-orange-500/20 text-orange-500',
  'food-beauty': 'bg-yellow-500/20 text-yellow-500',
  'lifestyle': 'bg-purple-500/20 text-purple-500',
  'product': 'bg-cyan-500/20 text-cyan-500',
  'stop-motion': 'bg-pink-500/20 text-pink-500',
};

interface ClipCardProps {
  clip: Clip;
}

export function ClipCard({ clip }: ClipCardProps) {
  const { selectedClips, toggleSelectClip } = useStore();
  const isSelected = selectedClips.has(clip.id);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer transition-all"
    >
      {/* Thumbnail - aspect-video */}
      <div className="aspect-video relative overflow-hidden bg-zinc-800 flex items-center justify-center">
        {/* Placeholder gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800" />

        {/* Selection checkbox - top-left */}
        <div
          onClick={() => toggleSelectClip(clip.id)}
          className={`absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded border flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-zinc-500 bg-black/30 backdrop-blur-sm'
          }`}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Hover overlay - opacity 0 to 100 on hover */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button className="px-3 py-1.5 text-[10px] font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded transition-colors">
            Manage
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors">
            Archive
          </button>
          <button className="px-3 py-1.5 text-[10px] font-medium bg-red-600 hover:bg-red-500 text-white rounded transition-colors">
            Delete
          </button>
        </div>

        {/* Duration badge - bottom-right, bg-black/70 */}
        {clip.duration > 0 && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 font-mono">
            {formatDuration(clip.duration)}
          </div>
        )}

        {/* Status badge - top-right (if needed) */}
        {(clip.approved || clip.rejected) && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-emerald-500">
            {clip.approved ? '✓' : clip.rejected ? '✕' : ''}
          </div>
        )}
      </div>

      {/* Card info section */}
      <div className="p-2.5 border-t border-zinc-800">
        <div className="text-[11px] font-semibold text-zinc-200 truncate mb-1.5">
          {clip.name}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {clip.sub_type && (
            <span
              className={`px-1.5 py-0.5 text-[9px] rounded-sm font-medium ${
                SUB_TYPE_COLORS[clip.sub_type] || 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {clip.sub_type}
            </span>
          )}
          {clip.category && (
            <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-500 text-[9px] rounded-sm">
              {clip.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
