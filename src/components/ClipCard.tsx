import type { Clip } from '@/types';

const TYPE_BADGE_COLORS: Record<string, string> = {
  body: 'bg-indigo-600',
  hook: 'bg-orange-500',
  product: 'bg-purple-600',
  cta: 'bg-teal-500',
  social_proof: 'bg-pink-500',
  transition: 'bg-zinc-600',
};

interface ClipCardProps {
  clip: Clip;
}

export function ClipCard({ clip }: ClipCardProps) {
  // Note: selectedClips and toggleSelectClip removed - not used in this design

  const formatDuration = (seconds: number): string => {
    return `${seconds.toFixed(1)}s`;
  };

  const getStatusBadge = () => {
    if (clip.approved) {
      return {
        text: 'APPROVED',
        color: 'bg-emerald-600/20 text-emerald-400',
      };
    }
    if (clip.rejected) {
      return {
        text: 'REJECTED',
        color: 'bg-red-600/20 text-red-400',
      };
    }
    return {
      text: 'UNGRADED',
      color: 'bg-amber-600/20 text-amber-500',
    };
  };

  const statusBadge = getStatusBadge();
  const clipType = (clip.type || 'body').toLowerCase();
  const typeBgColor = TYPE_BADGE_COLORS[clipType] || 'bg-zinc-700';

  return (
    <div className="overflow-hidden rounded-lg cursor-pointer transition-all hover:shadow-lg">
      {/* Thumbnail Area */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-zinc-700/50 to-zinc-800 rounded-t-lg flex items-center justify-center">
        {/* Faint clip name text */}
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-600 px-2 text-center">
          <span className="line-clamp-1">{clip.name}</span>
        </div>

        {/* TYPE Badge - TOP-LEFT */}
        <div className={`absolute top-1.5 left-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${typeBgColor}`}>
          {clipType}
        </div>

        {/* RATIO Badge - TOP-RIGHT */}
        {clip.ratio && (
          <div className="absolute top-1.5 right-1.5 text-[9px] text-zinc-400 bg-zinc-900/70 px-1 py-0.5 rounded-sm">
            {clip.ratio}
          </div>
        )}

        {/* STATUS Badge - BOTTOM-LEFT */}
        <div className={`absolute bottom-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${statusBadge.color}`}>
          {statusBadge.text}
        </div>

        {/* DURATION - BOTTOM-RIGHT */}
        {clip.duration > 0 && (
          <div className="absolute bottom-1.5 right-1.5 text-[10px] text-zinc-300 font-mono">
            {formatDuration(clip.duration)}
          </div>
        )}
      </div>

      {/* Text Area */}
      <div className="px-2 py-1.5 bg-zinc-900">
        <div className="text-[11px] font-medium text-zinc-200 truncate">
          {clip.name}
        </div>
        {clip.fullname && (
          <div className="text-[10px] text-zinc-400 truncate">
            {clip.fullname}
          </div>
        )}
        {clip.category && (
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider truncate">
            {clip.category}
          </div>
        )}
      </div>
    </div>
  );
}
