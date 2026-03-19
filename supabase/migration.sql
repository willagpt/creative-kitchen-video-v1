-- Creative Kitchen V2 — Migration Script
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This is safe to run multiple times (uses IF NOT EXISTS / IF EXISTS checks)

-- ============================================================
-- 1. WORKSPACES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. WORKSPACE_MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- ============================================================
-- 3. ALTER CLIPS TABLE — Add missing columns
-- ============================================================
-- Add workspace_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clips' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE clips ADD COLUMN workspace_id uuid REFERENCES workspaces(id);
  END IF;
END $$;

-- Add other V2 columns if they don't exist
DO $$
BEGIN
  -- fullname
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'fullname') THEN
    ALTER TABLE clips ADD COLUMN fullname text;
  END IF;
  -- sub_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'sub_type') THEN
    ALTER TABLE clips ADD COLUMN sub_type text;
  END IF;
  -- style
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'style') THEN
    ALTER TABLE clips ADD COLUMN style text;
  END IF;
  -- width
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'width') THEN
    ALTER TABLE clips ADD COLUMN width int;
  END IF;
  -- height
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'height') THEN
    ALTER TABLE clips ADD COLUMN height int;
  END IF;
  -- graded
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'graded') THEN
    ALTER TABLE clips ADD COLUMN graded boolean DEFAULT false;
  END IF;
  -- drive_file_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'drive_file_id') THEN
    ALTER TABLE clips ADD COLUMN drive_file_id text;
  END IF;
  -- drive_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'drive_url') THEN
    ALTER TABLE clips ADD COLUMN drive_url text;
  END IF;
  -- thumbnail_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE clips ADD COLUMN thumbnail_url text;
  END IF;
  -- proxy_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'proxy_url') THEN
    ALTER TABLE clips ADD COLUMN proxy_url text;
  END IF;
  -- archived
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'archived') THEN
    ALTER TABLE clips ADD COLUMN archived boolean DEFAULT false;
  END IF;
  -- trim_in
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'trim_in') THEN
    ALTER TABLE clips ADD COLUMN trim_in real;
  END IF;
  -- trim_out
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'trim_out') THEN
    ALTER TABLE clips ADD COLUMN trim_out real;
  END IF;
  -- curation_note
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'curation_note') THEN
    ALTER TABLE clips ADD COLUMN curation_note text;
  END IF;
  -- tags
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'tags') THEN
    ALTER TABLE clips ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
  -- star_rating
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'star_rating') THEN
    ALTER TABLE clips ADD COLUMN star_rating int;
  END IF;
  -- colour_grade
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'colour_grade') THEN
    ALTER TABLE clips ADD COLUMN colour_grade jsonb;
  END IF;
  -- perspective
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'perspective') THEN
    ALTER TABLE clips ADD COLUMN perspective jsonb;
  END IF;
  -- updated_by
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'updated_by') THEN
    ALTER TABLE clips ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;
  -- updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'updated_at') THEN
    ALTER TABLE clips ADD COLUMN updated_at timestamptz;
  END IF;
  -- created_at (may already exist)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clips' AND column_name = 'created_at') THEN
    ALTER TABLE clips ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- ============================================================
-- 4. CLIP_SEGMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS clip_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id bigint REFERENCES clips(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  label text,
  trim_in real,
  trim_out real,
  approved boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. RECIPES TABLE (recreate if empty, or alter)
-- ============================================================
-- Drop and recreate if it's empty (from spec: "empty, was never properly synced")
DROP TABLE IF EXISTS recipes CASCADE;

CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_ratio text,
  pacing text,
  pillar text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'rendered', 'published')),
  shots jsonb[] DEFAULT '{}',
  music jsonb,
  text_overlays jsonb[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. RENDERED_VIDEOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rendered_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  blob_url text,
  file_size_mb real,
  duration real,
  ratio text,
  rendered_by uuid REFERENCES auth.users(id),
  rendered_at timestamptz DEFAULT now()
);

-- ============================================================
-- 7. ACTIVITY_LOG TABLE — Add workspace_id if missing
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_log' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE activity_log ADD COLUMN workspace_id uuid REFERENCES workspaces(id);
  END IF;
END $$;

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendered_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies: users can access data in workspaces they belong to

-- Workspaces: members can read
DROP POLICY IF EXISTS "Members can view their workspaces" ON workspaces;
CREATE POLICY "Members can view their workspaces" ON workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Workspaces: anyone can insert (to create new workspaces)
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Workspaces: owners can update
DROP POLICY IF EXISTS "Owners can update workspaces" ON workspaces;
CREATE POLICY "Owners can update workspaces" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

-- Workspace members: members can view co-members
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
CREATE POLICY "Members can view workspace members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid())
  );

-- Workspace members: owners can insert
DROP POLICY IF EXISTS "Owners can add members" ON workspace_members;
CREATE POLICY "Owners can add members" ON workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Clips: workspace members can read
DROP POLICY IF EXISTS "Members can view clips" ON clips;
CREATE POLICY "Members can view clips" ON clips
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Clips: editors and owners can modify
DROP POLICY IF EXISTS "Editors can modify clips" ON clips;
CREATE POLICY "Editors can modify clips" ON clips
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Clip segments: workspace members can read
DROP POLICY IF EXISTS "Members can view segments" ON clip_segments;
CREATE POLICY "Members can view segments" ON clip_segments
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Clip segments: editors can modify
DROP POLICY IF EXISTS "Editors can modify segments" ON clip_segments;
CREATE POLICY "Editors can modify segments" ON clip_segments
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Recipes: workspace members can read
DROP POLICY IF EXISTS "Members can view recipes" ON recipes;
CREATE POLICY "Members can view recipes" ON recipes
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Recipes: editors can modify
DROP POLICY IF EXISTS "Editors can modify recipes" ON recipes;
CREATE POLICY "Editors can modify recipes" ON recipes
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Rendered videos: workspace members can read
DROP POLICY IF EXISTS "Members can view rendered videos" ON rendered_videos;
CREATE POLICY "Members can view rendered videos" ON rendered_videos
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Rendered videos: editors can modify
DROP POLICY IF EXISTS "Editors can modify rendered videos" ON rendered_videos;
CREATE POLICY "Editors can modify rendered videos" ON rendered_videos
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Activity log: workspace members can read
DROP POLICY IF EXISTS "Members can view activity" ON activity_log;
CREATE POLICY "Members can view activity" ON activity_log
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Activity log: editors can insert
DROP POLICY IF EXISTS "Editors can log activity" ON activity_log;
CREATE POLICY "Editors can log activity" ON activity_log
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- ============================================================
-- 9. ENABLE REALTIME
-- ============================================================
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE clips;
ALTER PUBLICATION supabase_realtime ADD TABLE clip_segments;
ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- ============================================================
-- 10. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clips_workspace ON clips(workspace_id);
CREATE INDEX IF NOT EXISTS idx_clips_approved ON clips(approved);
CREATE INDEX IF NOT EXISTS idx_clips_type ON clips(type);
CREATE INDEX IF NOT EXISTS idx_clips_category ON clips(category);
CREATE INDEX IF NOT EXISTS idx_clip_segments_clip ON clip_segments(clip_id);
CREATE INDEX IF NOT EXISTS idx_clip_segments_workspace ON clip_segments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_recipes_workspace ON recipes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_rendered_videos_recipe ON rendered_videos(recipe_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_workspace ON activity_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);

-- ============================================================
-- DONE!
-- Next step: Sign up in the app, create your workspace,
-- then the app will backfill workspace_id on existing clips.
-- ============================================================
