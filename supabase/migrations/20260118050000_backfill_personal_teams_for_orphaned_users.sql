-- Remediation: create personal teams for users missing team membership
-- Ensures every user has a personal team + owner membership

DO $$
DECLARE
  orphan_user_id uuid;
  user_email text;
  user_name text;
  team_name text;
  v_team_id uuid;
  user_record record;
BEGIN
  FOR orphan_user_id IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.team_members tm ON tm.user_id = u.id
    WHERE tm.user_id IS NULL
  LOOP
    SELECT u.email, u.raw_user_meta_data INTO user_record
    FROM auth.users AS u
    WHERE u.id = orphan_user_id;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    user_email := user_record.email;

    IF user_record.raw_user_meta_data IS NOT NULL THEN
      IF user_record.raw_user_meta_data->>'first_name' IS NOT NULL
        AND user_record.raw_user_meta_data->>'last_name' IS NOT NULL THEN
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

    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (orphan_user_id, user_email, user_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();

    SELECT t.id INTO v_team_id
    FROM public.teams AS t
    WHERE t.created_by = orphan_user_id
      AND t.type = 'personal'
    LIMIT 1;

    IF v_team_id IS NULL THEN
      INSERT INTO public.teams (name, type, created_by, created_at, updated_at)
      VALUES (team_name, 'personal', orphan_user_id, NOW(), NOW())
      RETURNING public.teams.id INTO v_team_id;

      INSERT INTO public.team_members (team_id, user_id, role, status, joined_at, created_at)
      VALUES (v_team_id, orphan_user_id, 'owner', 'active', NOW(), NOW())
      ON CONFLICT (team_id, user_id) DO UPDATE SET
        role = 'owner',
        status = 'active',
        joined_at = NOW();

      PERFORM public.create_default_task_stages_for_team(v_team_id);
    END IF;
  END LOOP;
END $$;

-- Safety: ensure owners have team_members entries if team exists without membership
INSERT INTO public.team_members (team_id, user_id, role, status, joined_at, created_at)
SELECT t.id AS team_id, t.created_by AS user_id, 'owner', 'active', NOW(), NOW()
FROM public.teams t
WHERE t.created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = t.id AND tm.user_id = t.created_by
  )
ON CONFLICT (team_id, user_id) DO UPDATE SET
  role = 'owner',
  status = 'active',
  joined_at = NOW();
