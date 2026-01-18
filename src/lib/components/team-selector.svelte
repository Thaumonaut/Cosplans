<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { Check, ChevronDown, Users, Lock } from 'lucide-svelte'
  import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '$lib/components/ui'
  import { teams, currentTeam } from '$lib/stores/teams'
  import { user } from '$lib/stores/auth-store'
  import { get } from 'svelte/store'
  import type { Team } from '$lib/api/services/teamService'

  const typeIcons = {
    personal: Lock,
    private: Users,
  }

  const typeLabels = {
    personal: 'Personal',
    private: 'Private',
  }

  onMount(async () => {
    const currentUser = get(user)
    if (currentUser) {
      await teams.load(currentUser.id)
    }
  })

  async function handleTeamSwitch(team: Team) {
    await teams.setCurrent(team.id)
    // Reload all stores to filter by new team
    // This would typically trigger reloads in other stores
    window.location.reload() // Simple approach for MVP
  }

  function getIcon(teamType: string) {
    return typeIcons[teamType as keyof typeof typeIcons] || Users
  }

  // Group teams by type
  const groupedTeams = $derived(
    $teams.items.reduce(
      (acc, team) => {
        if (!acc[team.type]) acc[team.type] = []
        acc[team.type].push(team)
        return acc
      },
      {} as Record<string, Team[]>
    )
  )
</script>

<DropdownMenu placement="bottom-start">
  {#snippet trigger()}
    {#if $currentTeam}
      {@const IconComponent = getIcon($currentTeam.type)}
      {@const Icon = IconComponent}
      <button
        class="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent"
        disabled={$teams.loading}
      >
        <div class="flex flex-1 items-center gap-2 overflow-hidden">
          <Icon class="size-4 shrink-0 text-muted-foreground" />
          <span class="truncate text-sm font-medium">
            {$currentTeam.name}
          </span>
        </div>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
      </button>
    {:else}
      <button
        class="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent"
        disabled={true}
      >
        <div class="flex flex-1 items-center gap-2 overflow-hidden">
          <Users class="size-4 shrink-0 text-muted-foreground" />
          <span class="truncate text-sm font-medium">Loading...</span>
        </div>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
      </button>
    {/if}
  {/snippet}

  {#snippet children()}
    <div class="py-1.5">
      {#if $teams.items.length === 0}
        <DropdownMenuItem disabled>
          <span class="px-2 text-sm text-muted-foreground">No teams available</span>
        </DropdownMenuItem>
      {:else}
        {#each Object.entries(groupedTeams) as [type, teamList]}
          <!-- Section Header -->
          <div class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {typeLabels[type as keyof typeof typeLabels] || type.toUpperCase()}
          </div>
          
          <!-- Team Items with Icons -->
          {#each teamList as team}
            {@const TeamIcon = getIcon(team.type)}
            <DropdownMenuItem
              onclick={() => handleTeamSwitch(team)}
            >
              <div class="flex w-full items-center justify-between gap-3 px-2">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <TeamIcon class="size-4 shrink-0 text-muted-foreground" />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">{team.name}</div>
                  </div>
                </div>
                {#if $currentTeam?.id === team.id}
                  <Check class="size-4 shrink-0 text-[var(--theme-primary)]" />
                {/if}
              </div>
            </DropdownMenuItem>
          {/each}
          
          {#if teamList !== Object.values(groupedTeams)[Object.values(groupedTeams).length - 1]}
            <div class="border-t border-[var(--theme-border)] my-1"></div>
          {/if}
        {/each}
      {/if}
      
      <div class="border-t border-[var(--theme-border)] my-1"></div>
      
      <!-- Manage Teams -->
      <DropdownMenuItem onclick={() => goto('/teams')}>
        <div class="flex w-full items-center gap-3 px-2">
          <Users class="size-4 shrink-0 text-muted-foreground" />
          <div class="text-sm font-medium">Manage Teams</div>
        </div>
      </DropdownMenuItem>
    </div>
  {/snippet}
</DropdownMenu>
