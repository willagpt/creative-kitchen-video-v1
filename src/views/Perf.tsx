import { useEffect } from 'react';
import { useStore } from '@/store';

export function Perf() {
  const { setActiveTab } = useStore();

  useEffect(() => {
    setActiveTab('perf');
  }, [setActiveTab]);

  // Demo performance data
  const performanceStats = {
    totalSpend: 2450.5,
    totalRevenue: 18750.0,
    blendedRoas: 7.65,
    totalPurchases: 234,
  };

  // Demo performance legend
  const legend = [
    { label: 'WINNER', threshold: '50x+', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    { label: 'ITERATE', threshold: '30x+', color: 'bg-blue-500', textColor: 'text-blue-500' },
    { label: 'REWORK', threshold: '15x+', color: 'bg-amber-500', textColor: 'text-amber-500' },
    { label: 'KILL', threshold: '0x+', color: 'bg-red-500', textColor: 'text-red-500' },
  ];

  // Demo ad performance data
  const adPerformance = [
    {
      name: 'Hero Intro - Seasonal',
      spend: 450.0,
      roas: 12.5,
      badge: 'WINNER',
      badgeColor: 'bg-emerald-900/30 border-emerald-700 text-emerald-400',
    },
    {
      name: 'Product Showcase 2',
      spend: 380.0,
      roas: 8.2,
      badge: 'WINNER',
      badgeColor: 'bg-emerald-900/30 border-emerald-700 text-emerald-400',
    },
    {
      name: 'Customer Testimonial Mix',
      spend: 320.0,
      roas: 5.1,
      badge: 'ITERATE',
      badgeColor: 'bg-blue-900/30 border-blue-700 text-blue-400',
    },
    {
      name: 'Quick Demo Variant',
      spend: 280.0,
      roas: 3.8,
      badge: 'REWORK',
      badgeColor: 'bg-amber-900/30 border-amber-700 text-amber-400',
    },
    {
      name: 'Text Heavy Overlay',
      spend: 220.0,
      roas: 1.2,
      badge: 'KILL',
      badgeColor: 'bg-red-900/30 border-red-700 text-red-400',
    },
    {
      name: 'Silent Auto-play Test',
      spend: 150.0,
      roas: 2.1,
      badge: 'REWORK',
      badgeColor: 'bg-amber-900/30 border-amber-700 text-amber-400',
    },
  ];

  const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex-1 min-w-[160px]">
      <div className="text-3xl font-bold text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-auto">
      <div className="flex-1 p-6 space-y-8">
        {/* Stat Cards */}
        <div className="flex gap-4 flex-wrap">
          <StatCard label="Total Spend" value={`$${performanceStats.totalSpend.toFixed(2)}`} />
          <StatCard label="Total Revenue" value={`$${performanceStats.totalRevenue.toFixed(2)}`} />
          <StatCard label="Blended ROAS" value={`${performanceStats.blendedRoas.toFixed(2)}x`} />
          <StatCard label="Total Purchases" value={performanceStats.totalPurchases} />
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Performance Legend
          </h3>
          <div className="flex flex-wrap gap-4">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-zinc-300">{item.label}</span>
                <span className="text-zinc-600">({item.threshold})</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROAS by Ad section (placeholder bar chart) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">ROAS by Ad</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 h-48 flex items-center justify-center">
            <div className="text-center text-zinc-500">
              <div className="text-sm font-medium mb-2">Chart visualization</div>
              <div className="text-xs text-zinc-600">
                Bar chart showing ROAS distribution across all ads
              </div>
              {/* Simple placeholder bar visualization */}
              <div className="mt-6 flex items-end justify-center gap-3 h-24">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-emerald-500 w-8 h-16 rounded-t" />
                  <span className="text-[9px] text-zinc-500">Ad 1</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-emerald-500 w-8 h-12 rounded-t" />
                  <span className="text-[9px] text-zinc-500">Ad 2</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-blue-500 w-8 h-10 rounded-t" />
                  <span className="text-[9px] text-zinc-500">Ad 3</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-amber-500 w-8 h-8 rounded-t" />
                  <span className="text-[9px] text-zinc-500">Ad 4</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-red-500 w-8 h-4 rounded-t" />
                  <span className="text-[9px] text-zinc-500">Ad 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Performance List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">Ad Performance</h3>
          <div className="space-y-2">
            {adPerformance.map((ad) => (
              <div
                key={ad.name}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-300 font-medium truncate">{ad.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">${ad.spend.toFixed(2)} spend</div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-zinc-100">{ad.roas.toFixed(1)}x</div>
                    <div className="text-[10px] text-zinc-500">ROAS</div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded border text-[10px] font-semibold whitespace-nowrap ${ad.badgeColor}`}
                  >
                    {ad.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
