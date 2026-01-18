-- Fix setup_new_user RPC to avoid ambiguous column references and ensure team creation

CREATE OR REPLACE FUNCTION public.setup_new_user(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  v_team_id UUID;
  team_name TEXT;
  user_record RECORD;
BEGIN
  -- Get user from auth.users (requires SECURITY DEFINER to access auth schema)
  SELECT u.email, u.raw_user_meta_data INTO user_record
  FROM auth.users AS u
  WHERE u.id = p_user_id;

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
  SELECT t.id INTO v_team_id
  FROM public.teams AS t
  WHERE t.created_by = p_user_id
    AND t.type = 'personal'
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
    RETURNING public.teams.id INTO v_team_id;

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
