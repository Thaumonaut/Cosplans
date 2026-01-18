-- Create team_join_links table for code/link-based team invitations
-- This allows teams to create shareable join codes and links

CREATE TABLE IF NOT EXISTS public.team_join_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE, -- Unique join code (e.g., "ABC123")
  role TEXT NOT NULL DEFAULT 'viewer', -- Default role for users joining via this link
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ, -- NULL = never expires
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT team_join_links_role_valid CHECK (role IN ('editor', 'viewer')),
  CONSTRAINT team_join_links_code_format CHECK (code ~ '^[A-Z0-9]{6,12}$') -- 6-12 alphanumeric uppercase
);

-- Add/ensure columns exist if table exists but columns don't (in case table was created with different schema)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_join_links') THEN
    -- Ensure role column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'role') THEN
      ALTER TABLE public.team_join_links ADD COLUMN role TEXT NOT NULL DEFAULT 'viewer';
    END IF;
    
    -- Ensure is_active column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'is_active') THEN
      -- Column might be named 'active', rename it
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'active') THEN
        ALTER TABLE public.team_join_links RENAME COLUMN active TO is_active;
      ELSE
        -- Column doesn't exist, add it
        ALTER TABLE public.team_join_links ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
      END IF;
    END IF;
    
    -- Ensure other required columns exist (these should already exist if table was created properly, but check anyway)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'code') THEN
      ALTER TABLE public.team_join_links ADD COLUMN code TEXT;
      -- Note: Can't add UNIQUE constraint here if table has existing data, but column creation will work
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'team_id') THEN
      ALTER TABLE public.team_join_links ADD COLUMN team_id UUID;
      -- Note: Foreign key constraint might fail if there's existing data
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'expires_at') THEN
      ALTER TABLE public.team_join_links ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'created_by') THEN
      ALTER TABLE public.team_join_links ADD COLUMN created_by UUID;
      -- Note: Foreign key constraint might fail if there's existing data
    END IF;
    
    -- Handle token column - if it exists with NOT NULL, make it nullable or add default
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_join_links' AND column_name = 'token') THEN
      -- Check if it has NOT NULL constraint and make it nullable (we're using 'code' instead)
      BEGIN
        ALTER TABLE public.team_join_links ALTER COLUMN token DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist or already nullable, ignore
        NULL;
      END;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_join_links_team ON public.team_join_links(team_id);
CREATE INDEX IF NOT EXISTS idx_team_join_links_code ON public.team_join_links(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_team_join_links_active ON public.team_join_links(team_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.team_join_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_join_links
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Team members can view team join links" ON public.team_join_links;
DROP POLICY IF EXISTS "Owners and admins can create join links" ON public.team_join_links;
DROP POLICY IF EXISTS "Owners and admins can update join links" ON public.team_join_links;
DROP POLICY IF EXISTS "Owners and admins can delete join links" ON public.team_join_links;

-- Team members can view their team's join links
CREATE POLICY "Team members can view team join links" ON public.team_join_links
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND status = 'active'
    )
  );

-- Owners and admins can create join links
CREATE POLICY "Owners and admins can create join links" ON public.team_join_links
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('owner', 'editor')
      AND status = 'active'
    )
  );

-- Owners and admins can update join links
CREATE POLICY "Owners and admins can update join links" ON public.team_join_links
  FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('owner', 'editor')
      AND status = 'active'
    )
  );

-- Owners and admins can delete join links
CREATE POLICY "Owners and admins can delete join links" ON public.team_join_links
  FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('owner', 'editor')
      AND status = 'active'
    )
  );

-- Function to generate a random join code
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed ambiguous chars: 0, O, I, 1
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to create a join link for a team
CREATE OR REPLACE FUNCTION public.create_team_join_link(
  p_team_id UUID,
  p_role TEXT DEFAULT 'viewer',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  code TEXT,
  role TEXT,
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  new_code TEXT;
  link_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Verify user has permission (owner or editor)
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = p_team_id
    AND tm.user_id = current_user_id
    AND tm.role IN ('owner', 'editor')
    AND tm.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Permission denied: Must be owner or editor to create join links';
  END IF;
  
  -- Generate unique code
  LOOP
    new_code := public.generate_join_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.team_join_links tjl WHERE tjl.code = new_code);
  END LOOP;
  
  -- Insert join link
  INSERT INTO public.team_join_links (team_id, code, role, is_active, expires_at, created_by)
  VALUES (p_team_id, new_code, p_role, true, p_expires_at, current_user_id)
  RETURNING team_join_links.id INTO link_id;

  -- Return the created link (avoid column name ambiguity by using different aliases in subquery)
  RETURN QUERY
  SELECT 
    result.id,
    result.team_id,
    result.join_code AS code,
    result.join_role AS role,
    result.is_active,
    result.expires_at,
    result.created_at
  FROM (
    SELECT 
      public.team_join_links.id,
      public.team_join_links.team_id,
      public.team_join_links.code AS join_code,
      public.team_join_links.role AS join_role,
      public.team_join_links.is_active,
      public.team_join_links.expires_at,
      public.team_join_links.created_at
    FROM public.team_join_links
    WHERE public.team_join_links.id = link_id
  ) result;
END;
$$;

-- Function to join a team using a code
CREATE OR REPLACE FUNCTION public.join_team_by_code(
  p_code TEXT
)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  link_record RECORD;
  team_record RECORD;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Find the join link
  SELECT * INTO link_record
  FROM public.team_join_links
  WHERE code = p_code
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired join code';
  END IF;
  
  -- Get team info
  SELECT * INTO team_record
  FROM public.teams
  WHERE id = link_record.team_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found';
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = link_record.team_id
    AND team_members.user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this team';
  END IF;
  
  -- Add user as team member with the specified role
  INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
  VALUES (
    link_record.team_id,
    current_user_id,
    link_record.role,
    'active',
    NOW()
  )
  ON CONFLICT (team_id, user_id) DO UPDATE SET
    status = 'active',
    role = link_record.role,
    joined_at = NOW();
  
  -- Return team info
  RETURN QUERY
  SELECT 
    team_record.id,
    team_record.name,
    link_record.role;
END;
$$;

-- RLS Policy for team_members: Allow users to add themselves via active join link
-- This policy is created here after team_join_links table exists
DROP POLICY IF EXISTS "Users can add themselves via active join link" ON public.team_members;
CREATE POLICY "Users can add themselves via active join link" ON public.team_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_join_links tjl
    WHERE tjl.team_id = team_members.team_id
      AND tjl.code = current_setting('app.join_code', true)
      AND tjl.is_active = true
      AND (tjl.expires_at IS NULL OR tjl.expires_at > NOW())
  )
);

