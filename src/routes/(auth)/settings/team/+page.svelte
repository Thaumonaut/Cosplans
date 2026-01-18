<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Plus,
    UserPlus,
    Trash2,
    Crown,
    Shield,
    Mail,
    MoreVertical,
    Settings,
    Users,
    Loader2,
    Link2,
    Copy,
    Check,
    X,
    Sparkles,
    RefreshCw,
    AlertTriangle
  } from 'lucide-svelte';
  import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Input,
    Label,
    Textarea,
    Switch,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    Dialog,
    DialogFooter,
    Select
  } from '$lib/components/ui';
  import { teamService, type Team, type TeamMember, type TeamJoinLink } from '$lib/api/services/teamService';
  import { teams, currentTeam } from '$lib/stores/teams';
  import { user, authActions } from '$lib/stores/auth-store';
  import { toast } from '$lib/stores/toast';
  import { get } from 'svelte/store';
  import CustomFieldsManagement from '$lib/components/settings/CustomFieldsManagement.svelte';

  let loading = $state(false);
  let loadingMembers = $state(false);
  let isLoadingInProgress = $state(false);
  let showCreateTeamDialog = $state(false);
  let showInviteMemberDialog = $state(false);
  let showRemoveMemberDialog = $state(false);
  let memberToRemove = $state<TeamMember | null>(null);
  let showDeleteTeamDialog = $state(false);
  let deletingTeam = $state(false);
  let deleteConfirmText = $state('');

  let allTeams = $state<Team[]>([]);
  let currentTeamData = $state<Team | null>(null);
  let teamMembers = $state<TeamMember[]>([]);
  let teamMemberCounts = $state<Record<string, number>>({});
  let pendingInvites = $state<any[]>([]); // For future implementation

  // Join links
  let joinLinks = $state<TeamJoinLink[]>([]);
  let showJoinLinksDialog = $state(false);
  let newLinkRole: 'editor' | 'viewer' = $state('viewer');
  let loadingLinks = $state(false);

  // Create team form
  let newTeamName = $state('');
  let newTeamType = $state<'personal' | 'private'>('private');
  let newTeamDescription = $state('');
  let suggestedTeamName = $state('');

  // Generate team name based on user's name
  function generateTeamNameFromUser(): string {
    const currentUser = get(user);
    if (!currentUser) {
      // Fallback to generic name
      return `My ${newTeamType === 'personal' ? 'Personal' : 'Private'} Team`;
    }

    // Try to get name from user metadata first, then email
    const firstName = currentUser.user_metadata?.first_name ||
                      currentUser.user_metadata?.name?.split(' ')[0] ||
                      currentUser.email?.split('@')[0] ||
                      'User';

    if (newTeamType === 'personal') {
      return `${firstName}'s Personal Team`;
    } else {
      // For private teams, generate something like "John's Team" or "John's Cosplay Team"
      return `${firstName}'s Team`;
    }
  }

  // Generate a unique team name with random suffix
  function generateUniqueTeamName(): string {
    const currentUser = get(user);
    const userName = currentUser?.user_metadata?.first_name ||
                     currentUser?.user_metadata?.name?.split(' ')[0] ||
                     currentUser?.email?.split('@')[0] ||
                     'Team';

    // Generate random suffix (2-3 words from a list)
    const adjectives = ['Epic', 'Awesome', 'Creative', 'Amazing', 'Fantastic', 'Brilliant', 'Stellar', 'Dynamic'];
    const nouns = ['Squad', 'Group', 'Collective', 'Circle', 'Guild', 'Crew', 'Assembly'];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    if (newTeamType === 'personal') {
      return `${userName}'s ${randomAdjective} Team`;
    } else {
      return `${randomAdjective} ${randomNoun}`;
    }
  }

  // Auto-suggest name when dialog opens or team type changes
  function updateSuggestedName() {
    suggestedTeamName = generateTeamNameFromUser();
    // Auto-fill if name is empty
    if (!newTeamName.trim()) {
      newTeamName = suggestedTeamName;
    }
  }

  // Watch for team type changes and update suggested name
  $effect(() => {
    if (showCreateTeamDialog && newTeamType) {
      // Update suggested name when type changes
      updateSuggestedName();
    }
  });

  // Invite member form
  let inviteEmail = $state('');
  let inviteRole = $state<'editor' | 'viewer'>('editor');

  // Load teams and members
  async function loadData() {
    // Prevent multiple simultaneous loads
    if (isLoadingInProgress) {
      console.log('[TeamSettings] Load already in progress, skipping');
      return;
    }

    try {
      isLoadingInProgress = true;
      loading = true;

      const currentUser = get(user);
      if (!currentUser) {
        console.warn('[TeamSettings] No user available, cannot load teams');
        toast.error('Not Authenticated', 'Please sign in to view teams');
        loading = false;
        return;
      }

      // Load all teams
      console.log('[TeamSettings] Loading teams for user:', currentUser.id);
      try {
        allTeams = await teamService.list(currentUser.id);
        console.log('[TeamSettings] Loaded teams:', allTeams.length);
        await loadTeamMemberCounts(allTeams);
      } catch (listError: any) {
        console.error('[TeamSettings] teamService.list() failed:', listError);
        throw listError; // Re-throw to be caught by outer catch
      }

      // Set current team (use selected team or first team)
      const selectedTeam = get(currentTeam);
      currentTeamData = selectedTeam || allTeams[0] || null;
      console.log('[TeamSettings] Current team:', currentTeamData?.name || 'none');

      // Load members for current team
      if (currentTeamData) {
        await loadTeamMembers(currentTeamData.id);
        await loadJoinLinks(currentTeamData.id);
      } else {
        console.warn('[TeamSettings] No team available to load members');
      }
    } catch (error: any) {
      console.error('[TeamSettings] Failed to load teams:', error);
      console.error('[TeamSettings] Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack
      });
      toast.error('Failed to Load Teams', error?.message || 'Could not load your teams');
    } finally {
      loading = false;
      isLoadingInProgress = false;
    }
  }

  async function loadTeamMembers(teamId: string) {
    try {
      loadingMembers = true;
      console.log('[TeamSettings] Loading members for team:', teamId);
      teamMembers = await teamService.getMembers(teamId);
      teamMemberCounts = {
        ...teamMemberCounts,
        [teamId]: teamMembers.length,
      };
      console.log('[TeamSettings] Loaded members:', teamMembers.length);
    } catch (error: any) {
      console.error('[TeamSettings] Failed to load team members:', error);
      console.error('[TeamSettings] Member load error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack
      });
      toast.error('Failed to Load Members', error?.message || 'Could not load team members');
    } finally {
      loadingMembers = false;
    }
  }

  async function loadTeamMemberCounts(teams: Team[]) {
    if (!teams.length) return;
    const entries = await Promise.all(
      teams.map(async (team) => {
        try {
          const members = await teamService.getMembers(team.id);
          return [team.id, members.length] as const;
        } catch (countError) {
          console.warn('[TeamSettings] Failed to load member count', {
            teamId: team.id,
            error: countError,
          });
          return [team.id, 0] as const;
        }
      }),
    );

    teamMemberCounts = entries.reduce<Record<string, number>>(
      (acc, [teamId, count]) => {
        acc[teamId] = count;
        return acc;
      },
      { ...teamMemberCounts },
    );
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim()) {
      toast.error('Team Name Required', 'Please enter a team name');
      return;
    }

    try {
      const created = await teamService.create({
        name: newTeamName.trim(),
        type: newTeamType,
      });

      toast.success('Team Created', `${created.name} has been created successfully`);

      // Reset form
      newTeamName = '';
      newTeamType = 'private';
      newTeamDescription = '';
      showCreateTeamDialog = false;

      // Reload teams
      await loadData();
    } catch (error: any) {
      console.error('Failed to create team:', error);
      toast.error('Failed to Create Team', error?.message || 'Could not create team');
    }
  }

  async function handleInviteMember() {
    if (!inviteEmail.trim()) {
      toast.error('Email Required', 'Please enter an email address');
      return;
    }

    if (!currentTeamData) {
      toast.error('No Team Selected', 'Please select a team first');
      return;
    }

    try {
      await teamService.invite(currentTeamData.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      toast.success('Member Invited', `Invitation sent to ${inviteEmail}`);

      // Reset form
      inviteEmail = '';
      inviteRole = 'editor';
      showInviteMemberDialog = false;

      // Reload members
      await loadTeamMembers(currentTeamData.id);
    } catch (error: any) {
      console.error('Failed to invite member:', error);
      toast.error('Failed to Invite Member', error?.message || 'Could not send invitation');
    }
  }

  function openRemoveMemberDialog(member: TeamMember) {
    memberToRemove = member;
    showRemoveMemberDialog = true;
  }

  async function handleRemoveMember() {
    if (!currentTeamData || !memberToRemove) return;

    // Check if removing the last owner
    const ownerCount = teamMembers.filter(m => m.role === 'owner').length;
    if (memberToRemove.role === 'owner' && ownerCount <= 1) {
      toast.error(
        'Cannot Remove Last Owner',
        'You cannot remove the last owner from the team. Please transfer ownership to another member first, or add another owner before removing this one.'
      );
      return;
    }

    try {
      await teamService.removeMember(currentTeamData.id, memberToRemove.userId);
      toast.success('Member Removed', 'Member has been removed from the team');
      showRemoveMemberDialog = false;
      memberToRemove = null;
      await loadTeamMembers(currentTeamData.id);
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to Remove Member', error?.message || 'Could not remove member');
    }
  }

  async function handleChangeRole(member: TeamMember, newRole: 'owner' | 'editor' | 'viewer') {
    if (!currentTeamData) return;

    try {
      await teamService.updateMemberRole(currentTeamData.id, member.userId, newRole);
      toast.success('Role Updated', 'Member role has been updated');
      await loadTeamMembers(currentTeamData.id);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error('Failed to Update Role', error?.message || 'Could not update member role');
    }
  }

  async function loadJoinLinks(teamId: string) {
    try {
      loadingLinks = true;
      joinLinks = await teamService.listJoinLinks(teamId);
    } catch (error: any) {
      console.error('Failed to load join links:', error);
      toast.error('Failed to Load Join Links', error?.message || 'Could not load join links');
    } finally {
      loadingLinks = false;
    }
  }

  async function handleCreateJoinLink() {
    if (!currentTeamData) return;

    try {
      const newLink = await teamService.createJoinLink(currentTeamData.id, newLinkRole);
      toast.success('Join Link Created', `Code: ${newLink.code}`);
      await loadJoinLinks(currentTeamData.id);
      showJoinLinksDialog = false;
      newLinkRole = 'viewer';
    } catch (error: any) {
      console.error('Failed to create join link:', error);
      toast.error('Failed to Create Join Link', error?.message || 'Could not create join link');
    }
  }

  async function handleDeleteJoinLink(linkId: string) {
    try {
      await teamService.deleteJoinLink(linkId);
      toast.success('Join Link Deleted', 'The join link has been removed');
      if (currentTeamData) {
        await loadJoinLinks(currentTeamData.id);
      }
    } catch (error: any) {
      console.error('Failed to delete join link:', error);
      toast.error('Failed to Delete Join Link', error?.message || 'Could not delete join link');
    }
  }

  async function handleToggleJoinLink(link: TeamJoinLink) {
    try {
      await teamService.updateJoinLink(link.id, { active: !link.is_active });
      toast.success(link.is_active ? 'Join Link Deactivated' : 'Join Link Activated');
      if (currentTeamData) {
        await loadJoinLinks(currentTeamData.id);
      }
    } catch (error: any) {
      console.error('Failed to toggle join link:', error);
      toast.error('Failed to Update Join Link', error?.message || 'Could not update join link');
    }
  }

  function copyJoinCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success('Code Copied', `Join code "${code}" copied to clipboard`);
  }

  function copyJoinLink(code: string) {
    const url = `${window.location.origin}/teams/join?code=${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Link Copied', 'Join link copied to clipboard');
  }

  async function handleDeleteTeam() {
    if (!currentTeamData) return;
    if (deletingTeam) return;
    if (deleteConfirmText !== currentTeamData.name) {
      toast.error('Invalid Confirmation', `Please type "${currentTeamData.name}" to confirm deletion`);
      return;
    }

    deletingTeam = true;
    try {
      await teamService.delete(currentTeamData.id);
      toast.success('Team Deleted', 'The team has been permanently deleted');
      showDeleteTeamDialog = false;
      deleteConfirmText = '';
      // Reload teams list
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete team:', error);
      toast.error('Failed to Delete Team', error?.message || 'Could not delete team');
    } finally {
      deletingTeam = false;
    }
  }

  async function handleSwitchTeam(team: Team) {
    currentTeamData = team;
    await loadTeamMembers(team.id);
    await loadJoinLinks(team.id);
    // Update current team in store
    await teams.setCurrent(team.id);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'Unknown';
    }
  }

  function getInitials(name?: string, email?: string) {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  function getRoleDisplayName(role: string) {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  function getTeamMemberCount(teamId: string) {
    if (teamMemberCounts[teamId] !== undefined) {
      return teamMemberCounts[teamId];
    }
    if (currentTeamData?.id === teamId) {
      return teamMembers.length;
    }
    return 0;
  }

  // Track if we've already attempted to load data
  let hasLoaded = $state(false);

  onMount(async () => {
    // Wait for user to be available before loading
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds total

    while (attempts < maxAttempts) {
      const currentUser = get(user);
      if (currentUser) {
        if (!hasLoaded) {
          hasLoaded = true;
          await loadData();
        }
        return;
      }

      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    // If user still not available, try to get from Supabase directly
    if (!hasLoaded) {
      try {
        const { supabase } = await import('$lib/supabase');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          authActions.setUser(authUser);
          hasLoaded = true;
          await loadData();
          return;
        }
      } catch (err) {
        console.error('[TeamSettings] Failed to get user:', err);
      }

      // Still no user - show error
      if (!hasLoaded) {
        toast.error('Not Authenticated', 'Please sign in to view teams');
        loading = false;
      }
    }
  });
</script>

<svelte:head>
  <title>Team Settings - Cosplay Tracker</title>
</svelte:head>

<div class="space-y-6 p-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Team Settings</h1>
      <p class="text-muted-foreground">Manage your teams and collaboration settings</p>
    </div>
    <Button onclick={() => {
      showCreateTeamDialog = true;
      updateSuggestedName();
    }}>
      <Plus class="mr-2 size-4" />
      Create Team
    </Button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-20">
      <Loader2 class="mr-2 size-5 animate-spin text-muted-foreground" />
      <span class="text-sm text-muted-foreground">Loading teams...</span>
    </div>
  {:else}
  <!-- Teams Overview -->
  <div>
    <h2 class="mb-4 text-xl font-semibold">Your Teams</h2>
      {#if allTeams.length === 0}
        <Card>
          <CardContent class="py-12 text-center">
            <Users class="mx-auto mb-4 size-12 text-muted-foreground" />
            <p class="mb-2 text-lg font-semibold">No teams yet</p>
            <p class="mb-4 text-sm text-muted-foreground">Create your first team to start collaborating</p>
            <Button onclick={() => showCreateTeamDialog = true}>
              <Plus class="mr-2 size-4" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {#each allTeams as team (team.id)}
            <button
              type="button"
              class="w-full text-left h-full"
              onclick={() => handleSwitchTeam(team)}
              aria-label="Select team {team.name}"
            >
            <Card
              class="transition-all hover:shadow-md h-full flex flex-col {currentTeamData?.id === team.id ? 'ring-2 ring-primary' : ''}"
            >
          <CardHeader class="flex-shrink-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <CardTitle class="text-lg">{team.name}</CardTitle>
                    <CardDescription class="mt-1">
                      {team.type === 'personal' ? 'Personal workspace' : 'Team collaboration'}
                    </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="flex-shrink-0 mt-auto">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                    <Badge variant="secondary" class="h-[22px]">{team.type === 'personal' ? 'Personal' : 'Team'}</Badge>
              </div>
              <div class="flex items-center gap-1 text-sm text-muted-foreground">
                <Users class="size-4" />
                    {getTeamMemberCount(team.id)}
              </div>
            </div>
          </CardContent>
        </Card>
            </button>
      {/each}
    </div>
      {/if}
  </div>

  <!-- Current Team Details -->
    {#if currentTeamData}
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
              <CardTitle>{currentTeamData.name}</CardTitle>
          <CardDescription>Manage members and team settings</CardDescription>
        </div>
        <Button onclick={() => showInviteMemberDialog = true}>
          <UserPlus class="mr-2 size-4" />
          Invite Member
        </Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Team Members -->
      <div>
            <h3 class="mb-3 font-semibold">
              Team Members
              {#if loadingMembers}
                <Loader2 class="ml-2 inline size-4 animate-spin" />
              {:else}
                ({teamMembers.length})
              {/if}
            </h3>
            {#if loadingMembers}
              <div class="flex items-center justify-center py-8">
                <Loader2 class="mr-2 size-5 animate-spin text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Loading members...</span>
              </div>
            {:else if teamMembers.length === 0}
              <div class="rounded-lg border border-dashed p-8 text-center">
                <Users class="mx-auto mb-2 size-8 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">No members yet. Invite someone to get started!</p>
              </div>
            {:else}
        <div class="space-y-2">
                {#each teamMembers as member (member.id)}
            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="flex items-center gap-3">
                <Avatar>
                        <AvatarImage
                          src={member.user?.avatarUrl || '/placeholder-user.jpg'}
                          alt={member.user?.name || member.user?.email || 'Team member'}
                        />
                        <AvatarFallback>
                          {getInitials(member.user?.name, member.user?.email)}
                        </AvatarFallback>
                </Avatar>
                <div>
                  <div class="flex items-center gap-2">
                          <span class="font-medium">{member.user?.name || member.user?.email || 'Unknown'}</span>
                          {#if member.role === 'owner'}
                      <Crown class="size-4 text-amber-500" />
                          {:else if member.role === 'editor'}
                      <Shield class="size-4 text-blue-500" />
                    {/if}
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{member.user?.email || 'Invited member'}</span>
                          {#if member.joinedAt}
                    <span>•</span>
                            <span>Joined {formatDate(member.joinedAt)}</span>
                          {/if}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                      <Badge variant="outline">{getRoleDisplayName(member.role)}</Badge>
                      {#if member.role !== 'owner'}
                  <DropdownMenu>
                          {#snippet trigger()}
                            <Button variant="ghost" size="icon">
                      <MoreVertical class="size-4" />
                    </Button>
                          {/snippet}
                          {#snippet children()}
                            <DropdownMenuItem onclick={() => handleChangeRole(member, 'editor')}>
                              Change to Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem onclick={() => handleChangeRole(member, 'viewer')}>
                              Change to Viewer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onclick={() => openRemoveMemberDialog(member)}
                            >
                              Remove from Team
                            </DropdownMenuItem>
                          {/snippet}
                  </DropdownMenu>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
          </div>

      <!-- Join Links Section -->
      <div class="border-t pt-6">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="font-semibold">Join Links & Codes</h3>
          <Button
            variant="outline"
            size="sm"
            onclick={() => {
              showJoinLinksDialog = true;
              newLinkRole = 'viewer';
            }}
          >
            <Link2 class="mr-2 size-4" />
            Create Join Link
          </Button>
        </div>
        <p class="mb-4 text-sm text-muted-foreground">
          Create shareable links and codes that allow others to join your team directly.
        </p>
        {#if loadingLinks}
          <div class="flex items-center justify-center py-8">
            <Loader2 class="mr-2 size-5 animate-spin text-muted-foreground" />
            <span class="text-sm text-muted-foreground">Loading join links...</span>
          </div>
        {:else if joinLinks.length === 0}
          <div class="rounded-lg border border-dashed p-6 text-center">
            <Link2 class="mx-auto mb-2 size-8 text-muted-foreground" />
            <p class="mb-2 text-sm font-medium">No join links yet</p>
            <p class="mb-4 text-xs text-muted-foreground">Create a join link to let others join your team with a code or link</p>
            <Button
              variant="outline"
              size="sm"
              onclick={() => {
                showJoinLinksDialog = true;
                newLinkRole = 'viewer';
              }}
            >
              <Link2 class="mr-2 size-4" />
              Create Join Link
            </Button>
          </div>
        {:else}
          <div class="space-y-2">
            {#each joinLinks as link (link.id)}
              <div class="flex items-center justify-between rounded-lg border p-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <code class="rounded bg-muted px-2 py-1 text-sm font-mono font-semibold">{link.code}</code>
                    <Badge variant={link.is_active ? 'default' : 'secondary'}>
                      {link.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{link.role}</Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    Created {new Date(link.created_at).toLocaleDateString()}
                    {#if link.expires_at}
                      • Expires {new Date(link.expires_at).toLocaleDateString()}
                    {:else}
                      • Never expires
                    {/if}
                  </p>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8"
                    onclick={() => copyJoinCode(link.code)}
                  >
                    <Copy class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8"
                    onclick={() => copyJoinLink(link.code)}
                  >
                    <Link2 class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8"
                    onclick={() => handleToggleJoinLink(link)}
                  >
                    {#if link.is_active}
                      <Check class="size-4" />
                    {:else}
                      <X class="size-4" />
                    {/if}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8 text-destructive hover:text-destructive"
                    onclick={() => handleDeleteJoinLink(link.id)}
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Danger Zone -->
      {#if currentTeamData.createdBy === get(user)?.id}
        <div class="border-t pt-6 mt-6">
          <div class="rounded-lg border border-destructive bg-destructive/5 p-6">
            <div class="flex items-start gap-4">
              <AlertTriangle class="size-6 text-destructive flex-shrink-0 mt-1" />
              <div class="flex-1">
                <h3 class="font-semibold text-destructive mb-2">Delete Team</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  Permanently delete this team and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onclick={() => showDeleteTeamDialog = true}
                >
                  <Trash2 class="mr-2 size-4" />
                  Delete Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Custom Fields Section -->
      <div class="border-t pt-6 mt-6">
        <CustomFieldsManagement teamId={currentTeamData.id} />
      </div>
        </CardContent>
      </Card>
    {:else}
      <Card>
        <CardContent class="py-12 text-center">
          <p class="text-muted-foreground">Select a team to view details</p>
    </CardContent>
  </Card>
    {/if}
  {/if}
</div>

<!-- Create Team Dialog -->
<Dialog
  bind:open={showCreateTeamDialog}
  title="Create New Team"
  description="Set up a new team for collaboration"
>
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Team Name</Label>
            <div class="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onclick={() => {
                  newTeamName = generateTeamNameFromUser();
                }}
              >
                <Sparkles class="mr-1 size-3" />
                Suggest
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onclick={() => {
                  newTeamName = generateUniqueTeamName();
                }}
              >
                <RefreshCw class="mr-1 size-3" />
                Generate
              </Button>
            </div>
          </div>
      <Input
        bind:value={newTeamName}
        placeholder={suggestedTeamName || "Enter team name..."}
      />
          {#if suggestedTeamName && newTeamName !== suggestedTeamName}
            <p class="text-xs text-muted-foreground">
              Suggested: <button
                type="button"
                class="text-primary hover:underline"
                onclick={() => newTeamName = suggestedTeamName}
              >
                {suggestedTeamName}
              </button>
            </p>
          {/if}
        </div>
        <div class="space-y-2">
          <Label>Team Type</Label>
      <Select
        bind:value={newTeamType}
        options={[
          { value: 'private', label: 'Private Team' },
          { value: 'personal', label: 'Personal' }
        ]}
      />
        </div>
        <div class="space-y-2">
      <Label>Description (Optional)</Label>
      <Textarea
        bind:value={newTeamDescription}
        placeholder="What's this team for?"
      />
        </div>
    <div class="flex gap-2">
      <Button
        class="flex-1"
        onclick={handleCreateTeam}
        disabled={!newTeamName.trim()}
      >
        Create Team
      </Button>
      <Button
        variant="outline"
        class="flex-1"
        onclick={() => {
          showCreateTeamDialog = false;
          newTeamName = '';
          newTeamType = 'private';
          newTeamDescription = '';
          suggestedTeamName = '';
        }}
      >
        Cancel
      </Button>
      </div>
    </div>
  </Dialog>

<!-- Invite Member Dialog -->
<Dialog
  bind:open={showInviteMemberDialog}
  title="Invite Team Member"
  description="Send an invitation to join your team"
>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Email Address</Label>
      <Input
        type="email"
        bind:value={inviteEmail}
        placeholder="member@example.com"
      />
        </div>
        <div class="space-y-2">
          <Label>Role</Label>
      <Select
        bind:value={inviteRole}
        options={[
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' }
        ]}
      />
        </div>
    <div class="flex gap-2">
      <Button
        class="flex-1"
        onclick={handleInviteMember}
        disabled={!inviteEmail.trim()}
      >
        Send Invitation
      </Button>
      <Button
        variant="outline"
        class="flex-1"
        onclick={() => {
          showInviteMemberDialog = false;
          inviteEmail = '';
          inviteRole = 'editor';
        }}
      >
        Cancel
      </Button>
      </div>
    </div>
  </Dialog>

  <!-- Remove Member Confirmation Dialog -->
  <Dialog
    bind:open={showRemoveMemberDialog}
    title="Remove Team Member"
    description={memberToRemove ? `Are you sure you want to remove ${memberToRemove.user?.name || memberToRemove.user?.email || 'this member'} from the team? This action cannot be undone.` : 'Are you sure you want to remove this member from the team?'}
  >
    <DialogFooter>
      <Button
        variant="outline"
        onclick={() => {
          showRemoveMemberDialog = false;
          memberToRemove = null;
        }}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onclick={handleRemoveMember}
      >
        Remove Member
      </Button>
    </DialogFooter>
  </Dialog>

  <!-- Create Join Link Dialog -->
  <Dialog
    bind:open={showJoinLinksDialog}
    title="Create Join Link"
    description="Generate a code or link that others can use to join your team"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <Label>Default Role</Label>
        <Select
          bind:value={newLinkRole}
          options={[
            { value: 'editor', label: 'Editor' },
            { value: 'viewer', label: 'Viewer' }
          ]}
        />
        <p class="text-xs text-muted-foreground">
          Users joining via this link will be assigned this role
        </p>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onclick={() => {
            showJoinLinksDialog = false;
            newLinkRole = 'viewer';
          }}
        >
          Cancel
        </Button>
        <Button
          onclick={handleCreateJoinLink}
        >
          Create Join Link
        </Button>
      </DialogFooter>
    </div>
  </Dialog>

<!-- Delete Team Confirmation Dialog -->
<Dialog
  bind:open={showDeleteTeamDialog}
  title="Delete Team"
  description={`This will permanently delete "${currentTeamData?.name || 'this team'}" and all associated data. This action cannot be undone.`}
>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>Type <span class="font-mono font-bold">{currentTeamData?.name}</span> to confirm</Label>
      <Input
        bind:value={deleteConfirmText}
        placeholder={currentTeamData?.name || 'Team name'}
        class="font-mono text-foreground"
      />
    </div>
    <div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <p class="font-semibold mb-1">Warning:</p>
      <p>All team data will be permanently deleted, including members, join links, and associated content.</p>
    </div>
  </div>
  <DialogFooter>
    <Button
      variant="outline"
      onclick={() => {
        showDeleteTeamDialog = false;
        deleteConfirmText = '';
      }}
      disabled={deletingTeam}
    >
      Cancel
    </Button>
    <Button
      variant="destructive"
      onclick={handleDeleteTeam}
      disabled={deletingTeam || deleteConfirmText !== currentTeamData?.name}
    >
      <Trash2 class="mr-2 size-4" />
      {deletingTeam ? 'Deleting...' : 'Delete Team'}
    </Button>
  </DialogFooter>
</Dialog>
