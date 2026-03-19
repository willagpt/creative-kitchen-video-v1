import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useStore } from '@/store';
import { Dropdown } from '@/components/Dropdown';

interface RenderedAd {
  id: string;
  name: string;
  ratio: string;
  duration: string;
  status: 'ready' | 'pushed' | 'live';
  roas: number | null;
}

interface PushStatus {
  timestamp: string;
  count: number;
}

const demoRenderedAds: RenderedAd[] = [
  { id: '1', name: 'CK_hs1_10s_1x1_V1', ratio: '1:1', duration: '10.3s', status: 'ready', roas: null },
  { id: '2', name: 'CK_hs1_10s_1x1_V2', ratio: '1:1', duration: '10.3s', status: 'ready', roas: null },
  { id: '3', name: 'CK_hs1_10s_1x1_V3', ratio: '1:1', duration: '10.3s', status: 'pushed', roas: 36.2 },
  { id: '4', name: 'CK_hs1_10s_1x1_V4', ratio: '1:1', duration: '10.3s', status: 'pushed', roas: 22.5 },
  { id: '5', name: 'CK_hs1_10s_1x1_V5', ratio: '1:1', duration: '10.3s', status: 'live', roas: 50.4 },
];

const demoAccounts = [
  { value: 'big-tasty-us', label: 'Big Tasty – US' },
  { value: 'big-tasty-uk', label: 'Big Tasty – UK' },
];

const demoCampaigns = [
  { value: 'summer-2026', label: 'Summer 2026 – Awareness' },
  { value: 'q3-conversions', label: 'Q3 Conversions' },
  { value: 'retargeting', label: 'Retargeting – Lookalike' },
];

const demoAdSets = [
  { value: 'health-25-45', label: 'Health 25-45 – Interest' },
  { value: 'broad-18-65', label: 'Broad 18-65' },
  { value: 'custom-purchasers', label: 'Custom – Purchasers' },
];

export function Review() {
  const { setActiveTab } = useStore();
  const [selectedAds, setSelectedAds] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [account, setAccount] = useState('big-tasty-us');
  const [campaign, setCampaign] = useState('summer-2026');
  const [adSet, setAdSet] = useState('health-25-45');
  const [dailyBudget, setDailyBudget] = useState('50');
  const [pushProgress, setPushProgress] = useState(0);
  const [pushComplete, setPushComplete] = useState(false);
  const [pushHistory, setPushHistory] = useState<PushStatus[]>([]);
  const duration = 15;

  useEffect(() => {
    setActiveTab('review');
  }, [setActiveTab]);

  const handleToggleAdSelection = (adId: string) => {
    const newSelected = new Set(selectedAds);
    if (newSelected.has(adId)) {
      newSelected.delete(adId);
    } else {
      newSelected.add(adId);
    }
    setSelectedAds(newSelected);
  };

  const handleSelectAllReady = () => {
    const readyIds = demoRenderedAds
      .filter((ad) => ad.status === 'ready')
      .map((ad) => ad.id);
    setSelectedAds(new Set(readyIds));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getStatusBadgeColor = (status: 'ready' | 'pushed' | 'live') => {
    if (status === 'ready') return 'bg-zinc-800 text-zinc-300';
    if (status === 'pushed') return 'bg-amber-900/40 text-amber-400';
    return 'bg-emerald-900/40 text-emerald-400';
  };

  const getTargetingSummary = () => {
    const accountLabel = demoAccounts.find((a) => a.value === account)?.label || '';
    const campaignLabel = demoCampaigns.find((c) => c.value === campaign)?.label || '';
    const adSetLabel = demoAdSets.find((a) => a.value === adSet)?.label || '';
    return `${accountLabel} • ${campaignLabel} • ${adSetLabel}`;
  };

  const handlePushToMeta = async () => {
    if (selectedAds.size === 0) return;

    setPushProgress(0);
    setPushComplete(false);

    // Simulate progress over 3 seconds
    const interval = setInterval(() => {
      setPushProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPushComplete(true);
          const now = new Date().toLocaleTimeString();
          setPushHistory((prev) => [{ timestamp: now, count: selectedAds.size }, ...prev].slice(0, 5));
          return 100;
        }
        return prev + 33.33;
      });
    }, 1000);
  };

  const handleBudgetChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDailyBudget(e.target.value);
  };

  return (
    <div className="h-full flex overflow-hidden bg-zinc-950">
      {/* LEFT SECTION - VIDEO PLAYER & AD LIST */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Video Player */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-full max-w-md aspect-square bg-black border border-zinc-800 rounded-lg flex flex-col items-center justify-center relative group">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-5"
              >
                <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
              <span className="text-[11px] text-zinc-500">Click to play</span>
            </div>
          </div>
        </div>

        {/* Playback controls */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handlePlayPause}
              className="w-7 h-7 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 transition-colors flex-shrink-0"
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

            <span className="text-[10px] text-zinc-500 font-mono w-12 text-right flex-shrink-0">
              {Math.floor(currentTime)}.{Math.floor((currentTime % 1) * 10)}s
            </span>
          </div>
        </div>

        {/* Rendered Videos List */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-200">Rendered Videos</h3>
            <button
              onClick={handleSelectAllReady}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Select all ready
            </button>
          </div>

          <div className="space-y-2">
            {demoRenderedAds.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAds.has(ad.id)}
                  onChange={() => handleToggleAdSelection(ad.id)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 cursor-pointer accent-indigo-500"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-100 truncate">{ad.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500">{ad.ratio}</span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-500">{ad.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${getStatusBadgeColor(ad.status)}`}>
                    {ad.status.toUpperCase()}
                  </span>
                  {ad.roas !== null && (
                    <span className="text-xs font-semibold text-emerald-400">{ad.roas.toFixed(1)}x</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - META ADS CONFIG */}
      <div className="w-80 border-l border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Meta Ads
          </h3>
        </div>

        {/* Config Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Ad Account */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-2">Ad Account</label>
            <Dropdown
              value={account}
              onChange={setAccount}
              options={demoAccounts}
              placeholder="Select account"
            />
          </div>

          {/* Campaign */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-2">Campaign</label>
            <Dropdown
              value={campaign}
              onChange={setCampaign}
              options={demoCampaigns}
              placeholder="Select campaign"
            />
          </div>

          {/* Ad Set */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-2">Ad Set</label>
            <Dropdown
              value={adSet}
              onChange={setAdSet}
              options={demoAdSets}
              placeholder="Select ad set"
            />
          </div>

          {/* Targeting Summary */}
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-[11px] text-zinc-400 leading-relaxed">{getTargetingSummary()}</p>
          </div>

          {/* Daily Budget */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-2">Daily Budget</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 font-medium">$</span>
              <input
                type="number"
                value={dailyBudget}
                onChange={handleBudgetChange}
                className="flex-1 text-sm bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-600"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Push Button & Progress */}
        <div className="px-4 py-4 border-t border-zinc-800 flex-shrink-0 space-y-3">
          {!pushComplete ? (
            <>
              <button
                onClick={handlePushToMeta}
                disabled={selectedAds.size === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                Push {selectedAds.size} Ad{selectedAds.size !== 1 ? 's' : ''} to Meta
              </button>

              {pushProgress > 0 && pushProgress < 100 && (
                <div className="space-y-2">
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${pushProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 text-center">
                    Pushing {selectedAds.size} ad{selectedAds.size !== 1 ? 's' : ''}...
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 justify-center py-3 bg-emerald-900/20 rounded-lg border border-emerald-700/30">
                <span className="text-emerald-400 text-lg">✓</span>
                <span className="text-emerald-400 text-sm font-semibold">
                  {selectedAds.size} ad{selectedAds.size !== 1 ? 's' : ''} pushed successfully
                </span>
              </div>
              <button
                onClick={() => {
                  setPushProgress(0);
                  setPushComplete(false);
                  setSelectedAds(new Set());
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-2 rounded-lg transition-colors text-sm"
              >
                Push More
              </button>
            </>
          )}

          {/* Push History */}
          {pushHistory.length > 0 && (
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Recently pushed
              </p>
              {pushHistory.map((entry, idx) => (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">{entry.count} ad{entry.count !== 1 ? 's' : ''}</span>
                  <span className="text-zinc-600">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
