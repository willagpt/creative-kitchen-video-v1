# Creative Kitchen Video — V2

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS v4 (@tailwindcss/vite plugin)
- Zustand for state management
- Supabase (Postgres + Auth + Realtime)
- Lucide React for icons
- Google Drive API for video assets

## Design System

<creative_kitchen_design>
You are building UI for Creative Kitchen, a professional video ad creation platform
used by performance marketers and creative teams. The aesthetic is dark, dense, and
data-rich — closer to a professional DAW or color grading suite than a typical SaaS app.

DESIGN PHILOSOPHY:
- Tool-first, not marketing-first. Every pixel serves the workflow.
- Dense information display — users are power users who want to see everything at once.
- Dark mode only. Light backgrounds are never used.
- Color is functional, not decorative. Colors encode meaning (shot types, status, performance tiers).

COLOR SYSTEM (CSS variables / Tailwind):
- Background layers: #0a0a0f (deepest), #111118 (panels), #1a1a24 (cards), #222230 (elevated)
- Text: #ffffff (primary), #a0a0b0 (secondary), #666678 (muted)
- Shot type colors (these are sacred — never change):
  - Hook (ATT): #ff6b6b (coral red)
  - Body (INT/BOD/DES): #6b8aff (soft blue)
  - Product (PRO): #f0a030 (amber/orange)
  - CTA (ACT): #4ecdc4 (teal/cyan)
- Status colors:
  - Winner: #22c55e (green) — 50x+ ROAS
  - Iterate: #3b82f6 (blue) — 30x+ ROAS
  - Rework: #eab308 (yellow) — 15x+ ROAS
  - Kill: #ef4444 (red) — below 15x ROAS
- Accent: #7c3aed (purple) for primary actions only (Generate button, selected states)
- Grading status: #22c55e (graded/green), #f59e0b (ungraded/amber)

TYPOGRAPHY:
- Primary font: Inter
- Use font-weight extremes: 400 for body, 700-800 for stat numbers
- Stat numbers should be large (text-3xl to text-5xl) and white
- Labels beneath stats are small (text-xs), uppercase, tracking-wide, muted color
- Section headers: text-sm, uppercase, tracking-widest, muted
- Use tabular-nums (font-variant-numeric: tabular-nums) for all numbers

LAYOUT PATTERNS:
- Top navigation: h-11 horizontal tab bar with numbered workflow steps
- Active tab gets a pill/chip highlight
- Stat cards: row of 4-5 across the top, big number + small label
- Cards have subtle borders (border-white/5) not drop shadows
- Grid layouts for media thumbnails (auto-fill, minmax(180px, 1fr))
- Dense tool UI spacing

COMPONENTS:
- Badges/Tags: Small rounded pills with background color matching shot type
- Progress bars: Thin (h-2), segmented by color, rounded ends
- Buttons: Primary = accent filled. Secondary = transparent with subtle border
- Cards: Dark background, 1px border, rounded-lg
- Dropdowns: Dark background, subtle border, small chevron icon

WHAT TO AVOID:
- Light backgrounds or white panels
- Gradients on backgrounds or buttons
- Cards with drop shadows (use borders instead)
- Excessive spacing — keep it dense
- Generic dashboard templates
</creative_kitchen_design>

## Key Files
- src/components/Layout.tsx — App shell with header + bottom bar
- src/views/Shots.tsx — Clip library grid
- src/views/Curate.tsx — Clip review with grading, trim, tags
- src/views/Generate.tsx — Ad variation generator
- src/views/Review.tsx — Video review + Meta push flow
- src/views/Recipes.tsx — Recipe builder + timeline
- src/views/Perf.tsx — Performance analytics dashboard
- src/views/Pipeline.tsx — Pipeline overview dashboard

## Supabase
- Project: ifrxylvoufncdxyltgqt
- Tables: clips, workspaces, workspace_members, clip_segments, recipes, rendered_videos, activity_log
- RLS enabled on all tables
- Realtime enabled on clips, clip_segments, recipes, activity_log

## Lessons Learned
1. Never monkey-patch native APIs
2. Pull before push on startup
3. Never write null for numeric fields — use undefined
4. Supabase is the sole source of truth — no localStorage for critical data
5. CSS filters work for real-time grading — no WebGL needed
6. Pre-generated thumbnails are essential
7. Type (HOOK/BODY/CTA) is per-recipe-slot, not per-clip
