-- Migration: Add personal team tracking to users
-- Feature: 004-bugfix-testing
-- Date: 2026-01-03

-- Add personal_team_id column to users table (if it exists)
-- Note: Supabase auth.users is managed, so we'll use a profile/user_metadata approach
-- Create a public users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only access their own profile
CREATE POLICY user_profiles_select ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY user_profiles_update ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Migrate existing users: find or create personal team
DO $$
DECLARE
  user_record RECORD;
  personal_team_id UUID;
  user_email TEXT;
  team_exists BOOLEAN;
BEGIN
  -- Temporarily disable constraints for migration
  ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
  ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
  DROP TRIGGER IF EXISTS team_owner_must_be_member_trigger ON teams;
  
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = user_record.id;
    
    -- Find existing personal team (owned by user)
    SELECT t.id INTO personal_team_id
    FROM teams t
    WHERE t.owner_id = user_record.id
      AND t.name LIKE '%' || COALESCE(user_email, 'Personal') || '%'
    LIMIT 1;
    
    -- Create if doesn't exist
    IF personal_team_id IS NULL THEN
      -- First, check if user has any team where they're a member
      SELECT t.id INTO personal_team_id
      FROM teams t
      INNER JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = user_record.id
        AND tm.role = 'owner'
      LIMIT 1;
      
      -- Still null? Create new team
      IF personal_team_id IS NULL THEN
        INSERT INTO teams (name, owner_id, created_by)
        VALUES (COALESCE(user_email, 'User') || '''s Team', user_record.id, user_record.id)
        RETURNING id INTO personal_team_id;
        
        -- Add user as member
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (personal_team_id, user_record.id, 'owner')
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
    -- Insert or update user profile with personal team
    INSERT INTO public.user_profiles (id, personal_team_id)
    VALUES (user_record.id, personal_team_id)
    ON CONFLICT (id) DO UPDATE SET personal_team_id = EXCLUDED.personal_team_id;
  END LOOP;
  
  -- Re-enable constraints
  CREATE TRIGGER team_owner_must_be_member_trigger
    BEFORE INSERT OR UPDATE OF owner_id ON teams
    FOR EACH ROW EXECUTE FUNCTION check_team_owner_is_member();
  
  ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
  ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
END $$;



