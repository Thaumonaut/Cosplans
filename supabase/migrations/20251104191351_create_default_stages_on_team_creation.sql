-- Update setup_new_user to create default stages when team is created
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
    -- Explicitly qualify team_id to avoid ambiguity with column name
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
    
    -- Create default task stages for the new team
    PERFORM public.create_default_task_stages_for_team(v_team_id);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'team_id', v_team_id
  );
END;
$$;

-- Update create_team_safe to create default stages when team is created
CREATE OR REPLACE FUNCTION public.create_team_safe(
  team_name TEXT,
  creator_id UUID,
  team_type TEXT DEFAULT 'private'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_by UUID,
  type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_team_id UUID;
BEGIN
  -- Insert team directly using SQL to bypass schema cache
  INSERT INTO public.teams (name, created_by, type)
  VALUES (team_name, creator_id, team_type)
  RETURNING teams.id INTO new_team_id;

  -- Add creator as owner in team_members
  -- Try with status column first, fall back to without it if column doesn't exist
  BEGIN
    INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
    VALUES (new_team_id, creator_id, 'owner', 'active', NOW())
    ON CONFLICT (team_id, user_id) DO UPDATE SET status = 'active', role = 'owner';
  EXCEPTION WHEN OTHERS THEN
    -- Status column doesn't exist, insert without it
    INSERT INTO public.team_members (team_id, user_id, role, joined_at)
    VALUES (new_team_id, creator_id, 'owner', NOW())
    ON CONFLICT (team_id, user_id) DO UPDATE SET role = 'owner';
  END;

  -- Create default task stages for the new team
  PERFORM public.create_default_task_stages_for_team(new_team_id);

  -- Return the created team (only columns that exist)
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.created_by,
    t.type,
    t.created_at,
    t.updated_at
  FROM public.teams t
  WHERE t.id = new_team_id;
END;
$$;

