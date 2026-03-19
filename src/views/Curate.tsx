import { useEffect, useState } from 'react';
import { useStore } from '@/store';

export function Curate() {
  const { clips, setActiveTab } = useStore();
  const [clipsLoaded, setClipsLoaded] = useState(false);

  useEffect(() => {
    setActiveTab('curate');
  }, [setActiveTab]);

  // Count clips by approval status
  const pendingCount = clips.filter((c) => !c.approved && !c.rejected && !c.archived).length;
  const approvedCount = clips.filter((c) => c.approved && !c.archived).length;
  const rejectedCount = clips.filter((c) => c.rejected && !c.archived).length;
  const allCount = clips.filter((c) => !c.archived).length;

  // Calculate curation percentage
  const curatedCount = approvedCount + rejectedCount;
  const curatedPercent = allCount > 0 ? Math.round((curatedCount / allCount) * 100) : 0;

  // Get first pending clip for display
  const firstPendingClip = clips.find((c) => !c.approved && !c.rejected && !c.archived);

  const TabButton = ({
    label,
    count,
    active,
    onClick,
  }: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-indigo-500 text-indigo-300'
          : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label} <span className="text-xs ml-1 text-zinc-600">({count})</span>
    </button>
  );

  if (!clipsLoaded && clips.length === 0) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Clip Curation</h1>
          <p className="text-sm text-zinc-400">Review, trim, and approve clips before they enter the generation pool</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-zinc-800 mb-8 pb-0">
          <TabButton label="Pending" count={0} active={true} onClick={() => {}} />
          <TabButton label="Approved" count={0} active={false} onClick={() => {}} />
          <TabButton label="Rejected" count={0} active={false} onClick={() => {}} />
          <TabButton label="All" count={0} active={false} onClick={() => {}} />

          {/* Right side buttons and indicator */}
          <div className="ml-auto flex items-center gap-4">
            <button className="px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
              + Clips
            </button>
            <button className="px-3 py-1.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
              + Music
            </button>
            <div className="text-sm text-zinc-500">0% curated</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-8 items-center">
          <select className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-300 focus:outline-none focus:border-zinc-600">
            <option>All types</option>
          </select>
          <input
            type="text"
            placeholder="Search clips..."
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 flex-1 max-w-xs"
          />
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-200 mb-2">Load Your Clips</h2>
              <p className="text-sm text-zinc-500 max-w-md">
                Select the folder containing your video clips. Files are saved in your browser
                automatically — you only need to do this once.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setClipsLoaded(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Select Clips Folder
              </button>
              <button className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors">
                Select Music Folder
              </button>
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <p className="text-xs text-zinc-600 font-mono">
                Workflow: Shots → <span className="text-indigo-400">Curate</span> → Generate → Review
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // With clips loaded - show player
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Clip Curation</h1>
        <p className="text-sm text-zinc-400">
          Review, trim, and approve clips before they enter the generation pool
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 px-6 border-b border-zinc-800 pb-0 items-center">
        <TabButton label="Pending" count={pendingCount} active={true} onClick={() => {}} />
        <TabButton label="Approved" count={approvedCount} active={false} onClick={() => {}} />
        <TabButton label="Rejected" count={rejectedCount} active={false} onClick={() => {}} />
        <TabButton label="All" count={allCount} active={false} onClick={() => {}} />

        {/* Right side buttons and indicator */}
        <div className="ml-auto flex items-center gap-4">
          <button className="px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
            + Clips
          </button>
          <button className="px-3 py-1.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
            + Music
          </button>
          <div className="text-sm text-zinc-500">{curatedPercent}% curated</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 px-6 py-3 border-b border-zinc-800 items-center">
        <select className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-300 focus:outline-none focus:border-zinc-600">
          <option>All types</option>
        </select>
        <input
          type="text"
          placeholder="Search clips..."
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 flex-1 max-w-xs"
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-6">
        {firstPendingClip ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Video player area */}
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center border border-zinc-800">
                {firstPendingClip.thumbnail_url ? (
                  <img
                    src={firstPendingClip.thumbnail_url}
                    alt={firstPendingClip.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-zinc-600 text-sm">
                    {firstPendingClip.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 text-center">Click anywhere to annotate · Space to play/pause</p>
            </div>

            {/* Clip info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">{firstPendingClip.name}</h3>
                <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                  {firstPendingClip.category}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-zinc-500">
                <span>{firstPendingClip.duration.toFixed(1)}s</span>
                <span>{firstPendingClip.ratio}</span>
                <span className="capitalize">{firstPendingClip.type || 'body'}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Approve
              </button>
              <button className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors">
                Reject
              </button>
              <button className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors">
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-zinc-500">No clips to review</p>
          </div>
        )}
      </div>
    </div>
  );
}
