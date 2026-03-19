import { useEffect, useState } from 'react';
import { useStore } from '@/store';

interface FeedbackItem {
  id: string;
  timecode: number;
  badge: string;
  comment: string;
  resolved: boolean;
}

export function Review() {
  const { setActiveTab } = useStore();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 15; // Demo video duration in seconds

  useEffect(() => {
    setActiveTab('review');
  }, [setActiveTab]);

  const handleResolve = (id: string) => {
    setFeedback((prev) =>
      prev.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item))
    );
  };

  const handleDelete = (id: string) => {
    setFeedback((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full flex overflow-hidden bg-zinc-950">
      {/* MAIN VIDEO PLAYER AREA */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black p-6">
        <div className="w-full max-w-3xl aspect-square bg-black border border-zinc-800 rounded-lg flex flex-col items-center justify-center relative group">
          {/* Video player placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-5"
            >
              <svg
                className="w-8 h-8 text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Instruction text */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <span className="text-[11px] text-zinc-500">
              Click anywhere to annotate · Space to play/pause
            </span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="mt-4 w-full max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handlePlayPause}
              className="w-7 h-7 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-zinc-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-zinc-100 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-zinc-800 rounded-full accent-indigo-500 cursor-pointer"
            />

            <span className="text-[10px] text-zinc-500 font-mono w-12 text-right">
              {Math.floor(currentTime)}.{Math.floor((currentTime % 1) * 10)}s
            </span>
          </div>
        </div>

        {/* No videos placeholder */}
        {feedback.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-[12px] text-zinc-500">
              No rendered videos to review yet. Generate and render some videos first.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR - FEEDBACK PANEL */}
      <div className="w-80 border-l border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">Feedback</h2>
        </div>

        {/* Feedback list */}
        <div className="flex-1 overflow-y-auto">
          {feedback.length === 0 ? (
            <div className="p-4 flex items-center justify-center h-full">
              <p className="text-[11px] text-zinc-500 text-center">No feedback yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition-all ${
                    item.resolved
                      ? 'bg-zinc-900/30 border-zinc-800 opacity-50'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                        item.badge === 'approve'
                          ? 'bg-emerald-900/30 border border-emerald-700 text-emerald-400'
                          : 'bg-red-900/30 border border-red-700 text-red-400'
                      }`}
                    >
                      {item.badge === 'approve' ? 'APPROVE' : 'REJECT'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {item.timecode.toFixed(1)}s
                    </span>
                  </div>

                  {item.comment && (
                    <p className="text-[11px] text-zinc-300 mb-2 break-words">
                      {item.comment}
                    </p>
                  )}

                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                    >
                      {item.resolved ? 'Unresolve' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-400 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
