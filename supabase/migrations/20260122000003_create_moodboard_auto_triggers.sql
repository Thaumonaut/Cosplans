-- Feature: 006-brainstorming-moodboard
-- Migration: Auto-create moodboards on entity creation (CAP-01)
-- Task: T-004

-- Function to create personal moodboard for new users
CREATE OR REPLACE FUNCTION public.create_personal_moodboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.moodboards (owner_type, owner_id, title)
  VALUES ('user', NEW.id, 'Personal Moodboard');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create team moodboard on team creation
CREATE OR REPLACE FUNCTION public.create_team_moodboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.moodboards (owner_type, owner_id, title)
  VALUES ('team', NEW.id, NEW.name || ' Moodboard');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create idea moodboard on idea creation
CREATE OR REPLACE FUNCTION public.create_idea_moodboard()
RETURNS TRIGGER AS $$
DECLARE
  new_moodboard_id UUID;
BEGIN
  -- Only create if moodboard_id is not already set
  IF NEW.moodboard_id IS NULL THEN
    INSERT INTO public.moodboards (owner_type, owner_id, title)
    VALUES ('idea', NEW.id, NEW.title)
    RETURNING id INTO new_moodboard_id;

    NEW.moodboard_id := new_moodboard_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for personal moodboard on user creation
-- Note: This triggers on user_profiles, not auth.users, since we control that table
DROP TRIGGER IF EXISTS create_personal_moodboard_trigger ON public.user_profiles;
CREATE TRIGGER create_personal_moodboard_trigger
AFTER INSERT ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.create_personal_moodboard();

-- Trigger for team moodboard on team creation
DROP TRIGGER IF EXISTS create_team_moodboard_trigger ON public.teams;
CREATE TRIGGER create_team_moodboard_trigger
AFTER INSERT ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.create_team_moodboard();

-- Trigger for idea moodboard on idea creation
DROP TRIGGER IF EXISTS create_idea_moodboard_trigger ON public.ideas;
CREATE TRIGGER create_idea_moodboard_trigger
BEFORE INSERT ON public.ideas
FOR EACH ROW EXECUTE FUNCTION public.create_idea_moodboard();

-- Backfill: Create personal moodboards for existing users who don't have one
INSERT INTO public.moodboards (owner_type, owner_id, title)
SELECT 'user', up.id, 'Personal Moodboard'
FROM public.user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM public.moodboards m
  WHERE m.owner_type = 'user' AND m.owner_id = up.id
);

-- Backfill: Create team moodboards for existing teams that don't have one
INSERT INTO public.moodboards (owner_type, owner_id, title)
SELECT 'team', t.id, t.name || ' Moodboard'
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 FROM public.moodboards m
  WHERE m.owner_type = 'team' AND m.owner_id = t.id
);

-- Backfill: Create idea moodboards for existing ideas that don't have one
DO $$
DECLARE
  idea_record RECORD;
  new_moodboard_id UUID;
BEGIN
  FOR idea_record IN
    SELECT id, title
    FROM public.ideas
    WHERE moodboard_id IS NULL
  LOOP
    INSERT INTO public.moodboards (owner_type, owner_id, title)
    VALUES ('idea', idea_record.id, idea_record.title)
    RETURNING id INTO new_moodboard_id;

    UPDATE public.ideas
    SET moodboard_id = new_moodboard_id
    WHERE id = idea_record.id;
  END LOOP;
END $$;
