import { Check, X, Clock } from 'lucide-react';
import type { Clip } from '@/types';
import { useStore } from '@/store';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'food-action': { bg: 'bg-orange-600/30', text: 'text-orange-300' },
  'food-beauty': { bg: 'bg-yellow-600/30', text: 'text-yellow-300' },
  'lifestyle': { bg: 'bg-purple-600/30', text: 'text-purple-300' },
  'product': { bg: 'bg-cyan-600/30', text: 'text-cyan-300' },
  'stop-motion': { bg: 'bg-pink-600/30', text: 'text-pink-300' },
};

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

  // Generate monogram placeholder
  const firstLetter = clip.name.charAt(0).toUpperCase();
  const categoryKey = clip.sub_type || clip.category || 'product';
  const colors = CATEGORY_COLORS[categoryKey] || { bg: 'bg-cyan-600/30', text: 'text-cyan-300' };

  const statusIcon = clip.approved ? (
    <div className="absolute top-3 right-3 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
      <Check className="w-3.5 h-3.5 text-white" />
    </div>
  ) : clip.rejected ? (
    <div className="absolute top-3 right-3 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
      <X className="w-3.5 h-3.5 text-white" />
    </div>
  ) : null;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={() => toggleSelectClip(clip.id)}
      className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-zinc-950 scale-[1.02]'
          : 'hover:scale-[1.02] hover:ring-1 hover:ring-zinc-600'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
        {/* Monogram placeholder */}
        <div className={`absolute inset-0 flex items-center justify-center ${colors.bg}`}>
          <span className={`text-4xl font-bold ${colors.text}`}>
            {firstLetter}
          </span>
        </div>

        {statusIcon}

        {/* Duration badge - overlaid on gradient at bottom */}
        {clip.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-end pb-2 pr-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-sm text-[11px] text-zinc-200">
              <Clock className="w-3 h-3" />
              {formatDuration(clip.duration)}
            </div>
          </div>
        )}

        {/* Selection checkbox */}
        <div
          className={`absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-zinc-400 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 bg-zinc-900 border border-t-0 border-zinc-800">
        <div className="text-sm font-semibold text-zinc-100 truncate mb-2">
          {clip.name}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {clip.sub_type && (
            <span
              className={`px-2 py-0.5 text-[10px] font-medium rounded-sm ${
                SUB_TYPE_COLORS[clip.sub_type] || 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {clip.sub_type}
            </span>
          )}
          {clip.category && (
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded-sm">
              {clip.category}
            </span>
          )}
          {clip.ratio && (
            <span className="text-[10px] text-zinc-500">{clip.ratio}</span>
          )}
        </div>
        {clip.size_mb > 0 && (
          <div className="text-[10px] text-zinc-600 mt-1.5">
            {clip.size_mb.toFixed(1)} MB
          </div>
        )}
      </div>
    </div>
  );
}
