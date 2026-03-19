import { useEffect, useState } from 'react';
import type { ColourGrade } from '@/types';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/activity';

const COLOUR_GRADE_PRESETS: Record<string, ColourGrade> = {
  Original: { brightness: 100, contrast: 100, saturate: 100, temperature: 0, shadows: 0 },
  'Food Pop': { brightness: 105, contrast: 112, saturate: 130, temperature: 8, shadows: -10 },
  'Warm Gold': { brightness: 103, contrast: 105, saturate: 115, temperature: 18, shadows: -5 },
  'Cool Clean': { brightness: 105, contrast: 108, saturate: 95, temperature: -12, shadows: 5 },
  'Rich Cinema': { brightness: 97, contrast: 118, saturate: 110, temperature: 5, shadows: -15 },
  'Matte Film': { brightness: 102, contrast: 92, saturate: 90, temperature: 3, shadows: 12 },
  'Vibrant': { brightness: 103, contrast: 110, saturate: 145, temperature: 2, shadows: -8 },
  'Moody Dark': { brightness: 90, contrast: 120, saturate: 105, temperature: -5, shadows: -20 },
  'Pastel Soft': { brightness: 108, contrast: 90, saturate: 85, temperature: 6, shadows: 8 },
  'High Key': { brightness: 115, contrast: 95, saturate: 100, temperature: 0, shadows: 10 },
  'Earthy': { brightness: 100, contrast: 108, saturate: 105, temperature: 12, shadows: -8 },
  'Punchy': { brightness: 100, contrast: 125, saturate: 125, temperature: 0, shadows: -12 },
};

export function Curate() {
  const { clips, setActiveTab, updateClip, user, workspace } = useStore();
  const [clipsLoaded, setClipsLoaded] = useState(false);
  const [showColourPanel, setShowColourPanel] = useState(false);
  const [colourGrade, setColourGrade] = useState<ColourGrade>(COLOUR_GRADE_PRESETS.Original);
  const [activePreset, setActivePreset] = useState('Original');

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
  const pendingClips = clips.filter((c) => !c.approved && !c.rejected && !c.archived);
  const currentClipIndex = pendingClips.indexOf(firstPendingClip || pendingClips[0]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          handleApprove();
          break;
        case 'r':
          e.preventDefault();
          handleReject();
          break;
        case 's':
          e.preventDefault();
          handleSkip();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentClipIndex, pendingClips]);

  const handleApprove = async () => {
    if (!firstPendingClip) return;
    try {
      const updateData: Record<string, unknown> = { approved: true, rejected: false };
      if (activePreset !== 'Original') {
        updateData.colour_grade = colourGrade;
      }

      const { error } = await supabase
        .from('clips')
        .update(updateData)
        .eq('id', firstPendingClip.id);
      if (error) throw error;
      updateClip(firstPendingClip.id, { approved: true, rejected: false, colour_grade: activePreset !== 'Original' ? colourGrade : null });

      if (user && workspace) {
        await logActivity(
          workspace.id,
          user.id,
          user.email || '',
          'approved',
          'clip',
          firstPendingClip.id.toString(),
          { clipName: firstPendingClip.name, colourGrade: activePreset !== 'Original' ? activePreset : undefined }
        );
      }
    } catch (err) {
      console.error('Failed to approve clip:', err);
    }
  };

  const handleReject = async () => {
    if (!firstPendingClip) return;
    try {
      const { error } = await supabase
        .from('clips')
        .update({ approved: false, rejected: true })
        .eq('id', firstPendingClip.id);
      if (error) throw error;
      updateClip(firstPendingClip.id, { approved: false, rejected: true });

      if (user && workspace) {
        await logActivity(
          workspace.id,
          user.id,
          user.email || '',
          'rejected',
          'clip',
          firstPendingClip.id.toString(),
          { clipName: firstPendingClip.name }
        );
      }
    } catch (err) {
      console.error('Failed to reject clip:', err);
    }
  };

  const handleSkip = () => {
    // Skip just moves to next pending clip (UI rerender handles this)
  };

  const ColourGradePanel = () => (
    <div className="w-64 border-l border-zinc-800 bg-zinc-900/50 overflow-y-auto p-4 space-y-4">
      {/* Colour Grade Section */}
      <div className="space-y-3">
        <h3 className="text-[10px] text-zinc-500 uppercase tracking-wider">Colour Grade</h3>

        {/* Presets Grid */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(COLOUR_GRADE_PRESETS).map(([name]) => (
            <button
              key={name}
              onClick={() => {
                setColourGrade(COLOUR_GRADE_PRESETS[name]);
                setActivePreset(name);
              }}
              className={`px-2 py-1.5 rounded text-[9px] font-medium transition-colors ${
                activePreset === name
                  ? 'bg-indigo-900/60 border border-indigo-500 text-indigo-300'
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="space-y-3 pt-2">
          {/* Brightness */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400">Brightness</label>
            <input
              type="range"
              min="80"
              max="120"
              value={colourGrade.brightness}
              onChange={(e) => {
                const newGrade = { ...colourGrade, brightness: parseInt(e.target.value) };
                setColourGrade(newGrade);
                setActivePreset('');
              }}
              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[9px] text-zinc-500 float-right">{colourGrade.brightness}</span>
            <div className="clear-both" />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400">Contrast</label>
            <input
              type="range"
              min="80"
              max="130"
              value={colourGrade.contrast}
              onChange={(e) => {
                const newGrade = { ...colourGrade, contrast: parseInt(e.target.value) };
                setColourGrade(newGrade);
                setActivePreset('');
              }}
              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[9px] text-zinc-500 float-right">{colourGrade.contrast}</span>
            <div className="clear-both" />
          </div>

          {/* Saturate */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400">Saturate</label>
            <input
              type="range"
              min="50"
              max="150"
              value={colourGrade.saturate}
              onChange={(e) => {
                const newGrade = { ...colourGrade, saturate: parseInt(e.target.value) };
                setColourGrade(newGrade);
                setActivePreset('');
              }}
              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[9px] text-zinc-500 float-right">{colourGrade.saturate}</span>
            <div className="clear-both" />
          </div>

          {/* Temperature */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400">Temperature</label>
            <input
              type="range"
              min="-20"
              max="20"
              value={colourGrade.temperature}
              onChange={(e) => {
                const newGrade = { ...colourGrade, temperature: parseInt(e.target.value) };
                setColourGrade(newGrade);
                setActivePreset('');
              }}
              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[9px] text-zinc-500 float-right">{colourGrade.temperature}</span>
            <div className="clear-both" />
          </div>

          {/* Shadows */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400">Shadows</label>
            <input
              type="range"
              min="-20"
              max="20"
              value={colourGrade.shadows}
              onChange={(e) => {
                const newGrade = { ...colourGrade, shadows: parseInt(e.target.value) };
                setColourGrade(newGrade);
                setActivePreset('');
              }}
              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[9px] text-zinc-500 float-right">{colourGrade.shadows}</span>
            <div className="clear-both" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              setColourGrade(COLOUR_GRADE_PRESETS.Original);
              setActivePreset('Original');
            }}
            className="flex-1 px-2 py-1.5 text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            Reset
          </button>
          <button className="flex-1 px-2 py-1.5 text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
            Match
          </button>
        </div>
      </div>
    </div>
  );

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
  const filterStyle = {
    filter: `brightness(${colourGrade.brightness / 100}) contrast(${colourGrade.contrast / 100}) saturate(${colourGrade.saturate / 100}) hue-rotate(${colourGrade.temperature * 1.5}deg)`,
  };

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
      <div className="flex flex-1 overflow-auto relative">
        <div className="flex-1 overflow-auto p-6">
          {firstPendingClip ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Video player area */}
              <div className="space-y-4">
                <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center border border-zinc-800" style={filterStyle}>
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
                <button
                  onClick={handleApprove}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Approve <span className="text-xs ml-1 text-emerald-200">[A]</span>
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors"
                >
                  Reject <span className="text-xs ml-1 text-zinc-500">[R]</span>
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors"
                >
                  Skip <span className="text-xs ml-1 text-zinc-500">[S]</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-zinc-500">No clips to review</p>
            </div>
          )}
        </div>

        {/* Colour Grade Panel Toggle Button */}
        {firstPendingClip && (
          <button
            onClick={() => setShowColourPanel(!showColourPanel)}
            className="w-8 flex items-center justify-center bg-zinc-900/50 border-l border-zinc-800 hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            <span className="text-[10px] font-medium text-zinc-400">C</span>
          </button>
        )}

        {/* Colour Grade Panel */}
        {firstPendingClip && showColourPanel && <ColourGradePanel />}
      </div>
    </div>
  );
}
