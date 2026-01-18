<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from '$lib/components/ui';
  import { teamService } from '$lib/api/services/teamService';
  import { teams } from '$lib/stores/teams';
  import { toast } from '$lib/stores/toast';
  import { Users, KeyRound, Loader2, CheckCircle, XCircle } from 'lucide-svelte';

  let joinCode = $state('');
  let joining = $state(false);
  let error = $state<string | null>(null);
  let success = $state<{ teamId: string; teamName: string; role: string } | null>(null);

  // Auto-uppercase and filter join code
  $effect(() => {
    if (joinCode) {
      joinCode = joinCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    }
  });

  // Check for code in URL params
  onMount(() => {
    const code = $page.url.searchParams.get('code');
    if (code) {
      joinCode = code.toUpperCase().trim();
      handleJoin();
    }
  });

  async function handleJoin() {
    if (!joinCode.trim()) {
      error = 'Please enter a join code';
      return;
    }

    joining = true;
    error = null;
    success = null;

    try {
      const result = await teamService.joinByCode(joinCode.trim());
      console.debug('[join page] joinByCode result', result);
      success = result;
      toast.success('Joined Team', `You've joined "${result.teamName}" as a ${result.role}`);

      if (result.teamId) {
        await teamService.ensureActiveMembership(result.teamId);
      }
      
      // Reload teams and redirect after a short delay
      const { data: { user } } = await teamService.getCurrentUser();
      await teams.load(user?.id);
      console.debug('[join page] teams after load', {
        teamCount: $teams.items.length,
        teamIds: $teams.items.map((t) => t.id),
      });
      if (result.teamId) {
        await teams.setCurrent(result.teamId);
        console.debug('[join page] setCurrent', { teamId: result.teamId });
      }
      setTimeout(() => {
        goto('/settings/team');
      }, 1500);
    } catch (err: any) {
      error = err?.message || 'Failed to join team. The code may be invalid or expired.';
      console.error('Failed to join team:', err);
    } finally {
      joining = false;
    }
  }
</script>

<svelte:head>
  <title>Join Team - Cosplay Tracker</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-6">
  <Card class="w-full max-w-md">
    <CardHeader>
      <div class="flex items-center justify-center mb-4">
        <div class="rounded-full bg-primary/10 p-3">
          <Users class="size-6 text-primary" />
        </div>
      </div>
      <CardTitle class="text-center">Join a Team</CardTitle>
      <CardDescription class="text-center">
        Enter the join code provided by the team owner
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      {#if success}
        <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <CheckCircle class="mx-auto mb-2 size-8 text-green-600" />
          <p class="font-medium text-green-900">Successfully Joined!</p>
          <p class="text-sm text-green-700">
            You've joined <strong>{success.teamName}</strong> as a <strong>{success.role}</strong>
          </p>
          <p class="mt-2 text-xs text-green-600">Redirecting to team settings...</p>
        </div>
      {:else}
        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleJoin();
          }}
          class="space-y-4"
        >
          <div class="space-y-2">
            <Label for="join-code">Join Code</Label>
            <div class="relative">
              <KeyRound class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="join-code"
                type="text"
                bind:value={joinCode}
                placeholder="ABC12345"
                class="pl-9 font-mono uppercase"
                disabled={joining}
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Enter the 6-12 character code provided by the team owner
            </p>
          </div>

          {#if error}
            <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <div class="flex items-start gap-2">
                <XCircle class="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          {/if}

          <Button
            type="submit"
            class="w-full"
            disabled={!joinCode.trim() || joining}
          >
            {#if joining}
              <Loader2 class="mr-2 size-4 animate-spin" />
              Joining...
            {:else}
              <Users class="mr-2 size-4" />
              Join Team
            {/if}
          </Button>
        </form>
      {/if}
    </CardContent>
  </Card>
</div>
