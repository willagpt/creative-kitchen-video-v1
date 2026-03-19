import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { Plus } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  shotCount: number;
  ratio: string;
  format: string;
  status: string;
}

interface Shot {
  id: string;
  type: string;
  duration: number;
  index: number;
}

export function Recipes() {
  const { setActiveTab } = useStore();

  // Static demo recipes
  const demoRecipes: Recipe[] = [
    { id: '1', name: 'Hero Video', shotCount: 8, ratio: '1:1', format: '10s HS1', status: 'DRAFT' },
    {
      id: '2',
      name: 'Product Showcase',
      shotCount: 6,
      ratio: '16:9',
      format: '15s Narrative',
      status: 'DRAFT',
    },
    {
      id: '3',
      name: 'Quick Hook',
      shotCount: 4,
      ratio: '9:16',
      format: '7s Snappy',
      status: 'DRAFT',
    },
  ];

  const demoShots: Shot[] = [
    { id: 'hook', type: 'HOOK', duration: 2, index: 0 },
    { id: 'body1', type: 'BODY 1', duration: 2, index: 1 },
    { id: 'body2', type: 'BODY 2', duration: 2, index: 2 },
    { id: 'body3', type: 'BODY 3', duration: 2, index: 3 },
    { id: 'cta', type: 'CTA', duration: 2, index: 4 },
  ];

  const [recipes] = useState<Recipe[]>(demoRecipes);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('1');
  const [recipeName, setRecipeName] = useState<string>('Hero Video');
  const [recipeRatio, setRecipeRatio] = useState<string>('1:1');
  const [recipeFormat, setRecipeFormat] = useState<string>('10s HS1');
  const [shots] = useState<Shot[]>(demoShots);

  useEffect(() => {
    setActiveTab('recipes');
  }, [setActiveTab]);

  const handleSelectRecipe = (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setSelectedRecipeId(id);
      setRecipeName(recipe.name);
      setRecipeRatio(recipe.ratio);
      setRecipeFormat(recipe.format);
    }
  };

  const getShotColor = (type: string) => {
    switch (type) {
      case 'HOOK':
        return 'bg-orange-500';
      case 'BODY 1':
      case 'BODY 2':
      case 'BODY 3':
      case 'BODY 4':
      case 'BODY 5':
        return 'bg-indigo-600';
      case 'PRODUCT':
        return 'bg-purple-600';
      case 'CTA':
        return 'bg-teal-500';
      default:
        return 'bg-zinc-600';
    }
  };

  return (
    <div className="h-full flex overflow-hidden bg-zinc-950">
      {/* LEFT SIDEBAR - RECIPE LIST */}
      <div className="w-56 border-r border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden">
        {/* Action buttons */}
        <div className="px-3 py-3 border-b border-zinc-800 space-y-2 flex-shrink-0">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Recipe
          </button>
          <button className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors">
            Load Clips Folder
          </button>
          <button className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors">
            Load Music Folder
          </button>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-2">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => handleSelectRecipe(recipe.id)}
                className={`w-full px-3 py-2 rounded-lg text-left border transition-all ${
                  selectedRecipeId === recipe.id
                    ? 'bg-indigo-900/30 border-indigo-500'
                    : 'bg-zinc-800/20 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="text-[11px] font-medium text-zinc-100 truncate">
                  {recipe.name}
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">
                  {recipe.shotCount} shots · {recipe.ratio}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[9px] text-zinc-600">{recipe.format}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400">
                    {recipe.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedRecipeId ? (
          <>
            {/* RECIPE HEADER */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0 space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Ratio
                  </label>
                  <select
                    value={recipeRatio}
                    onChange={(e) => setRecipeRatio(e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-[11px] text-zinc-100 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                  >
                    <option>1:1</option>
                    <option>16:9</option>
                    <option>9:16</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Format
                  </label>
                  <select
                    value={recipeFormat}
                    onChange={(e) => setRecipeFormat(e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-[11px] text-zinc-100 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                  >
                    <option>7s Snappy</option>
                    <option>10s HS1</option>
                    <option>15s Narrative</option>
                    <option>10s Product Focus</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* TIMELINE */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200 mb-3 uppercase tracking-wider">
                    Timeline
                  </h3>
                  <div className="flex gap-2 pb-4 overflow-x-auto">
                    {shots.map((shot) => (
                      <div
                        key={shot.id}
                        className="flex-shrink-0 w-20 h-20 rounded-lg bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center relative group overflow-hidden"
                      >
                        <div className={`w-full h-1.5 ${getShotColor(shot.type)}`} />
                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                          <span className="text-[9px] font-bold text-zinc-200 text-center px-1">
                            {shot.type}
                          </span>
                          <span className="text-[8px] text-zinc-500 mt-1">
                            {shot.duration}s
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SHOT LIST */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200 mb-3 uppercase tracking-wider">
                    Shot Details
                  </h3>
                  <div className="space-y-2">
                    {shots.map((shot) => (
                      <div
                        key={shot.id}
                        className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${getShotColor(shot.type)}`} />
                          <span className="text-[11px] text-zinc-300">{shot.type}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{shot.duration}s</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXPORT SECTION */}
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors">
                    Export JSON
                  </button>
                  <button className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors">
                    Copy JSON
                  </button>
                </div>

                {/* VIDEO RENDERER SECTION */}
                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="text-xs font-semibold text-zinc-200 mb-1">Video Renderer</h3>
                  <p className="text-[10px] text-zinc-500 mb-3">FFmpeg.wasm · runs in browser</p>

                  <div className="space-y-3">
                    <div className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <p className="text-[10px] text-zinc-400 mb-1">
                        <span className="text-emerald-400 font-semibold">✓ Ready</span>
                      </p>
                      <p className="text-[9px] text-zinc-500">
                        All clips matched from library
                      </p>
                    </div>

                    <button className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
                      Render Video
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[12px] text-zinc-500">Select or create a recipe</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
