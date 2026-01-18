-- Sync auth.users to public.users and auto-create personal team
-- This ensures that when a user signs up, they get:
-- 1. A profile in public.users
-- 2. A personal team automatically created

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  v_team_id UUID;
  team_name TEXT;
BEGIN
  -- Get user info from auth.users
  user_email := NEW.email;
  
  -- Try to construct name from metadata if available
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    IF NEW.raw_user_meta_data->>'first_name' IS NOT NULL AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL THEN
      user_name := (NEW.raw_user_meta_data->>'first_name') || ' ' || (NEW.raw_user_meta_data->>'last_name');
    ELSIF NEW.raw_user_meta_data->>'first_name' IS NOT NULL THEN
      user_name := NEW.raw_user_meta_data->>'first_name';
    END IF;
  END IF;
  
  -- If no name from metadata, use email prefix
  IF user_name IS NULL OR user_name = '' THEN
    user_name := split_part(user_email, '@', 1) || '''s Personal Team';
  ELSE
    user_name := user_name || '''s Personal Team';
  END IF;
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    COALESCE(user_name, split_part(user_email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Create personal team
  INSERT INTO public.teams (name, type, created_by, created_at, updated_at)
  VALUES (
    user_name,
    'personal',
    NEW.id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_team_id;
  
  -- Add user as owner member of their personal team
  INSERT INTO public.team_members (team_id, user_id, role, status, joined_at, created_at)
  VALUES (
    v_team_id,
    NEW.id,
    'owner',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (team_id, user_id) DO UPDATE SET
    role = 'owner',
    status = 'active',
    joined_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users INSERT
-- Note: This requires a database webhook or we need to use Supabase's auth triggers
-- For Supabase, we'll use a different approach - a function that can be called from the app

-- Alternative: Create a function that the app can call after signup
-- This is more reliable than relying on triggers which may not work in all Supabase setups
CREATE OR REPLACE FUNCTION public.setup_new_user(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  v_team_id UUID;
  team_name TEXT;
  user_record RECORD;
BEGIN
  -- Get user from auth.users (requires SECURITY DEFINER to access auth schema)
  SELECT email, raw_user_meta_data INTO user_record
  FROM auth.users
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  user_email := user_record.email;
  
  -- Try to construct name from metadata if available
  IF user_record.raw_user_meta_data IS NOT NULL THEN
    IF user_record.raw_user_meta_data->>'first_name' IS NOT NULL AND user_record.raw_user_meta_data->>'last_name' IS NOT NULL THEN
      user_name := (user_record.raw_user_meta_data->>'first_name') || ' ' || (user_record.raw_user_meta_data->>'last_name');
      team_name := (user_record.raw_user_meta_data->>'first_name') || '''s Personal Team';
    ELSIF user_record.raw_user_meta_data->>'first_name' IS NOT NULL THEN
      user_name := user_record.raw_user_meta_data->>'first_name';
      team_name := user_name || '''s Personal Team';
    ELSE
      user_name := split_part(user_email, '@', 1);
      team_name := user_name || '''s Personal Team';
    END IF;
  ELSE
    user_name := split_part(user_email, '@', 1);
    team_name := user_name || '''s Personal Team';
  END IF;
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    p_user_id,
    user_email,
    user_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  -- Check if user already has a personal team
  SELECT id INTO v_team_id
  FROM public.teams
  WHERE created_by = p_user_id
  AND type = 'personal'
  LIMIT 1;
  
  -- Only create team if one doesn't exist
  IF v_team_id IS NULL THEN
    INSERT INTO public.teams (name, type, created_by, created_at, updated_at)
    VALUES (
      team_name,
      'personal',
      p_user_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_team_id;
    
    -- Add user as owner member of their personal team
    INSERT INTO public.team_members (team_id, user_id, role, status, joined_at, created_at)
    VALUES (
      v_team_id,
      p_user_id,
      'owner',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (team_id, user_id) DO UPDATE SET
      role = 'owner',
      status = 'active',
      joined_at = NOW();
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'team_id', v_team_id
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.setup_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;

