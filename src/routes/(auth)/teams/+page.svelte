<script lang="ts">
  import { onMount } from "svelte";
  import {
    teamService,
    type Team,
    type TeamMember,
    type TeamRole,
  } from "$lib/api/services/teamService";
  import { teams, currentTeam } from "$lib/stores/teams";
  import { user } from "$lib/stores/auth-store";
  import { Button, Input, Dialog, DialogFooter } from "$lib/components/ui";
  import OwnershipTransferDialog from "$lib/components/teams/OwnershipTransferDialog.svelte";
  import TeamDeleteModal from "$lib/components/teams/TeamDeleteModal.svelte";
  import { Badge } from "flowbite-svelte";
  import {
    Plus,
    Users,
    Mail,
    Shield,
    Edit,
    Trash2,
    UserPlus,
    Sparkles,
    RefreshCw,
  } from "lucide-svelte";
  import { canManageTeam } from "$lib/utils/permissions";
  import { currentUserRole } from "$lib/stores/teams";
  import { get } from "svelte/store";

  let loading = $state(true);
  let error = $state<string | null>(null);
  let showCreateForm = $state(false);
  let showInviteForm = $state(false);
  let selectedTeam: Team | null = $state(null);
  let teamMembers: TeamMember[] = $state([]);
  let membersLoading = $state(false);

  // Create form
  let newTeamName = $state("");
  let suggestedTeamName = $state("");

  // Generate team name based on user's name
  function generateTeamNameFromUser(): string {
    const currentUser = get(user);
    if (!currentUser) {
      return "My Team";
    }

    // Try to get name from user metadata first, then email
    const firstName =
      currentUser.user_metadata?.first_name ||
      currentUser.user_metadata?.name?.split(" ")[0] ||
      currentUser.email?.split("@")[0] ||
      "User";

    return `${firstName}'s Team`;
  }

  // Generate a unique team name with random suffix
  function generateUniqueTeamName(): string {
    const currentUser = get(user);
    const userName =
      currentUser?.user_metadata?.first_name ||
      currentUser?.user_metadata?.name?.split(" ")[0] ||
      currentUser?.email?.split("@")[0] ||
      "Team";

    // Generate random suffix
    const adjectives = [
      "Epic",
      "Awesome",
      "Creative",
      "Amazing",
      "Fantastic",
      "Brilliant",
      "Stellar",
      "Dynamic",
    ];
    const nouns = [
      "Squad",
      "Group",
      "Collective",
      "Circle",
      "Guild",
      "Crew",
      "Assembly",
    ];

    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${randomAdjective} ${randomNoun}`;
  }

  // Update suggested name when form opens
  function updateSuggestedName() {
    suggestedTeamName = generateTeamNameFromUser();
    if (!newTeamName.trim()) {
      newTeamName = suggestedTeamName;
    }
  }

  // Invite form
  let inviteEmail = $state("");
  let inviteRole: TeamRole = $state("editor");

  onMount(async () => {
    const currentUser = get(user);
    if (currentUser) {
      await loadTeams(currentUser.id);
    }
  });

  async function loadTeams(userId: string) {
    try {
      loading = true;
      await teams.load(userId);
    } catch (err: any) {
      error = err?.message || "Failed to load teams";
    } finally {
      loading = false;
    }
  }

  async function loadTeamMembers(teamId: string) {
    try {
      membersLoading = true;
      teamMembers = await teamService.getMembers(teamId);
    } catch (err: any) {
      console.error("Failed to load team members:", err);
    } finally {
      membersLoading = false;
    }
  }

  function handleSelectTeam(team: Team) {
    selectedTeam = team;
    loadTeamMembers(team.id);
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim()) {
      error = "Team name is required";
      return;
    }

    try {
      const created = await teamService.create({ name: newTeamName.trim() });
      const currentUser = get(user);
      if (currentUser) {
        await loadTeams(currentUser.id);
      }
      newTeamName = "";
      showCreateForm = false;
      selectedTeam = created;
      await loadTeamMembers(created.id);
    } catch (err: any) {
      error = err?.message || "Failed to create team";
    }
  }

  async function handleInvite() {
    if (!selectedTeam || !inviteEmail.trim()) {
      error = "Email is required";
      return;
    }

    try {
      await teamService.invite(selectedTeam.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      await loadTeamMembers(selectedTeam.id);
      inviteEmail = "";
      inviteRole = "editor";
      showInviteForm = false;
      error = null;
    } catch (err: any) {
      error = err?.message || "Failed to invite member";
    }
  }

  async function handleUpdateRole(userId: string, role: TeamRole) {
    if (!selectedTeam) return;

    try {
      await teamService.updateMemberRole(selectedTeam.id, userId, role);
      await loadTeamMembers(selectedTeam.id);
    } catch (err: any) {
      error = err?.message || "Failed to update role";
    }
  }

  let showRemoveMemberDialog = $state(false);
  let memberToRemoveId = $state<string | null>(null);

  function openRemoveMemberDialog(userId: string) {
    memberToRemoveId = userId;
    showRemoveMemberDialog = true;
  }

  async function handleRemoveMember() {
    if (!selectedTeam || !memberToRemoveId) return;

    // Check if removing the last owner
    const memberToRemove = teamMembers.find(
      (m) => m.userId === memberToRemoveId,
    );
    const ownerCount = teamMembers.filter((m) => m.role === "owner").length;
    if (memberToRemove?.role === "owner" && ownerCount <= 1) {
      error =
        "Cannot remove the last owner from the team. Please transfer ownership to another member first.";
      return;
    }

    try {
      await teamService.removeMember(selectedTeam.id, memberToRemoveId);
      showRemoveMemberDialog = false;
      memberToRemoveId = null;
      await loadTeamMembers(selectedTeam.id);
    } catch (err: any) {
      error = err?.message || "Failed to remove member";
    }
  }

  const roleOptions: { value: TeamRole; label: string }[] = [
    { value: "owner", label: "Owner" },
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Viewer" },
  ];

  // Team Management dialogs
  let showTransferDialog = $state(false);
  let showDeleteTeamDialog = $state(false);
  let deleteLoading = $state(false);

  async function handleDeleteTeam() {
    if (!selectedTeam) return;

    // Check member count (excluding status check if needed, but assuming active/invited count)
    // Filter out the current user (owner)
    const currentUser = get(user);
    // Logic moved to Modal display state

    try {
      deleteLoading = true;
      await teamService.delete(selectedTeam.id);

      // Reset selection and reload list
      selectedTeam = null;
      teamMembers = [];
      if (currentUser) {
        await loadTeams(currentUser.id);
      }
      showDeleteTeamDialog = false;
    } catch (err: any) {
      error = err?.message || "Failed to delete team";
    } finally {
      deleteLoading = false;
    }
  }

  function handleTransferSuccess() {
    const currentUser = get(user);
    if (selectedTeam && currentUser) {
      loadTeamMembers(selectedTeam.id);
      loadTeams(currentUser.id);
      // If we transferred ownership, our role changed, so check if we can still manage
      // Actually currentUserRole store should update if we reload teams,
      // but selectedTeam reference might be stale?
      // Reloading teams works.
    }
  }
</script>

<svelte:head>
  <title>Teams - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Teams</h1>
    <p class="text-pretty text-gray-600 dark:text-gray-400">
      Manage teams and collaborate with others
    </p>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
      {error}
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Teams List -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Your Teams</h2>
        <Button
          onclick={() => {
            showCreateForm = !showCreateForm;
            if (showCreateForm) {
              updateSuggestedName();
            }
          }}
          size="sm"
        >
          <Plus class="mr-2 size-4" />
          New Team
        </Button>
      </div>

      <!-- Create Form -->
      {#if showCreateForm}
        <div class="rounded-lg border bg-card p-4 space-y-3">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-sm font-medium">Team Name</span>
            <div class="flex gap-1">
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
          <input
            type="text"
            bind:value={newTeamName}
            placeholder={suggestedTeamName || "Team name"}
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onkeydown={(e) => {
              if (e.key === "Enter") {
                handleCreateTeam();
              }
            }}
          />
          {#if suggestedTeamName && newTeamName !== suggestedTeamName}
            <p class="text-xs text-muted-foreground">
              Suggested: <button
                type="button"
                class="text-primary hover:underline"
                onclick={() => (newTeamName = suggestedTeamName)}
              >
                {suggestedTeamName}
              </button>
            </p>
          {/if}
          <div class="flex gap-2">
            <Button onclick={handleCreateTeam} disabled={!newTeamName.trim()}
              >Create</Button
            >
            <Button
              variant="outline"
              onclick={() => {
                showCreateForm = false;
                newTeamName = "";
                suggestedTeamName = "";
              }}>Cancel</Button
            >
          </div>
        </div>
      {/if}

      <!-- Teams -->
      {#if loading}
        <div class="text-sm text-muted-foreground">Loading teams...</div>
      {:else if $teams.items.length === 0}
        <div
          class="rounded-lg border border-dashed bg-muted/30 p-8 text-center"
        >
          <Users
            class="mx-auto mb-4 size-12 text-muted-foreground opacity-50"
          />
          <p class="mb-4 text-sm text-muted-foreground">No teams yet</p>
          <Button onclick={() => (showCreateForm = true)}>
            <Plus class="mr-2 size-4" />
            Create First Team
          </Button>
        </div>
      {:else}
        <div class="space-y-2">
          {#each $teams.items as team (team.id)}
            <button
              onclick={() => handleSelectTeam(team)}
              class="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted {selectedTeam?.id ===
              team.id
                ? 'border-primary'
                : ''}"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">{team.name}</div>
                  <div class="text-sm text-muted-foreground">
                    {team.type === "personal" ? "Personal" : "Private"} Team
                  </div>
                </div>
                {#if $currentTeam?.id === team.id}
                  <Badge class="bg-primary text-primary-foreground"
                    >Current</Badge
                  >
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Team Members -->
    {#if selectedTeam}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Members</h2>
          {#if canManageTeam($currentUserRole)}
            <Button
              onclick={() => (showInviteForm = !showInviteForm)}
              size="sm"
              variant="outline"
            >
              <UserPlus class="mr-2 size-4" />
              Invite
            </Button>
          {/if}
        </div>

        <!-- Invite Form -->
        {#if showInviteForm && canManageTeam($currentUserRole)}
          <div class="rounded-lg border bg-card p-4 space-y-3">
            <Input
              bind:value={inviteEmail}
              type="email"
              placeholder="Email address"
            />
            <select
              bind:value={inviteRole}
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {#each roleOptions.filter((r) => r.value !== "owner") as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <div class="flex gap-2">
              <Button onclick={handleInvite} disabled={!inviteEmail.trim()}
                >Invite</Button
              >
              <Button variant="outline" onclick={() => (showInviteForm = false)}
                >Cancel</Button
              >
            </div>
          </div>
        {/if}

        <!-- Members List -->
        {#if teamMembers.length === 0}
          <div
            class="rounded-lg border border-dashed bg-muted/30 p-8 text-center"
          >
            <Users
              class="mx-auto mb-4 size-12 text-muted-foreground opacity-50"
            />
            <p class="text-sm text-muted-foreground">No members yet</p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each teamMembers as member (member.id)}
              <div
                class="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-10 items-center justify-center rounded-full bg-muted"
                  >
                    {#if member.user?.avatarUrl}
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.name || "User"}
                        class="size-10 rounded-full"
                      />
                    {:else}
                      <Users class="size-5 text-muted-foreground" />
                    {/if}
                  </div>
                  <div>
                    <div class="font-medium">
                      {member.user?.name || member.user?.email || "Unknown"}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {member.user?.email}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  {#if canManageTeam($currentUserRole)}
                    <select
                      value={member.role}
                      onchange={(e) =>
                        handleUpdateRole(
                          member.userId,
                          e.currentTarget.value as TeamRole,
                        )}
                      class="rounded-md border border-input bg-background px-2 py-1 text-sm"
                      disabled={member.role === "owner"}
                    >
                      {#each roleOptions as option}
                        <option value={option.value}>{option.label}</option>
                      {/each}
                    </select>
                    {#if member.role !== "owner"}
                      <Button
                        variant="ghost"
                        size="sm"
                        onclick={() => openRemoveMemberDialog(member.userId)}
                        class="text-destructive hover:text-destructive"
                      >
                        <Trash2 class="size-4" />
                      </Button>
                    {/if}
                  {:else}
                    <Badge>{member.role}</Badge>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div
        class="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 p-16"
      >
        <div class="text-center">
          <Users
            class="mx-auto mb-4 size-12 text-muted-foreground opacity-50"
          />
          <p class="text-sm text-muted-foreground">
            Select a team to view members
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Danger Zone for Owners -->
  {#if selectedTeam && $currentUserRole === "owner"}
    <div
      class="mt-8 rounded-lg border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-900/10"
    >
      <h3 class="mb-4 text-lg font-semibold text-red-900 dark:text-red-200">
        Danger Zone
      </h3>
      <div class="flex flex-col gap-4 sm:flex-row">
        <Button
          variant="outline"
          class="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900 dark:border-red-800 dark:text-red-400"
          onclick={() => (showTransferDialog = true)}
          disabled={membersLoading}
        >
          <Shield class="mr-2 size-4" />
          Transfer Ownership
        </Button>
        <Button
          variant="destructive"
          onclick={() => {
            showDeleteTeamDialog = true;
          }}
          disabled={membersLoading}
        >
          <Trash2 class="mr-2 size-4" />
          Delete Team
        </Button>
      </div>
    </div>
  {/if}
</div>

{#if selectedTeam}
  <OwnershipTransferDialog
    bind:open={showTransferDialog}
    teamId={selectedTeam.id}
    currentOwnerId={selectedTeam.createdBy}
    on:success={handleTransferSuccess}
  />

  <TeamDeleteModal
    bind:open={showDeleteTeamDialog}
    teamName={selectedTeam.name}
    activeMemberCount={teamMembers.filter(
      (m) =>
        (m.status === "active" || m.status === "invited") &&
        m.userId !== $user?.id,
    ).length}
    onDelete={handleDeleteTeam}
    onTransfer={() => (showTransferDialog = true)}
    loading={deleteLoading}
  />
{/if}

<!-- Remove Member Confirmation Dialog -->
<Dialog
  bind:open={showRemoveMemberDialog}
  title="Remove Team Member"
  description="Are you sure you want to remove this member from the team? This action cannot be undone."
>
  <DialogFooter>
    <Button
      variant="outline"
      onclick={() => {
        showRemoveMemberDialog = false;
        memberToRemoveId = null;
      }}
    >
      Cancel
    </Button>
    <Button variant="destructive" onclick={handleRemoveMember}>
      Remove Member
    </Button>
  </DialogFooter>
</Dialog>
