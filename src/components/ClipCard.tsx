import { Film, Check, X, Clock } from 'lucide-react';
import type { Clip } from '@/types';
import { useStore } from '@/store';
import { driveThumbUrl } from '@/lib/drive';

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
  const { selectedClips, toggleSelectClip, thumbnailMap } = useStore();
  const isSelected = selectedClips.has(clip.id);

  // Resolve thumbnail URL
  const thumbFileName = clip.name.replace(/\.[^.]+$/, '.jpg');
  const thumbFileId = thumbnailMap.get(thumbFileName);
  const thumbUrl = thumbFileId ? driveThumbUrl(thumbFileId) : null;

  const statusIcon = clip.approved ? (
    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
      <Check className="w-3.5 h-3.5 text-white" />
    </div>
  ) : clip.rejected ? (
    <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
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
      className={`group relative bg-zinc-900 border rounded-lg overflow-hidden cursor-pointer transition-all hover:border-zinc-600 ${
        isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-zinc-800'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-zinc-800 relative overflow-hidden">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={clip.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        {statusIcon}

        {/* Duration badge */}
        {clip.duration > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded text-[11px] text-zinc-300">
            <Clock className="w-3 h-3" />
            {formatDuration(clip.duration)}
          </div>
        )}

        {/* Selection checkbox */}
        <div
          className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-zinc-500 bg-black/30 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <div className="text-sm font-medium text-zinc-200 truncate">{clip.name}</div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {clip.category && (
            <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded uppercase">
              {clip.category}
            </span>
          )}
          {clip.sub_type && (
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded ${
                SUB_TYPE_COLORS[clip.sub_type] || 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {clip.sub_type}
            </span>
          )}
          {clip.ratio && (
            <span className="text-[10px] text-zinc-500">{clip.ratio}</span>
          )}
        </div>
        {clip.size_mb > 0 && (
          <div className="text-[10px] text-zinc-600 mt-1">
            {clip.size_mb.toFixed(1)} MB
          </div>
        )}
      </div>
    </div>
  );
}
