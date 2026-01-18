<script lang="ts">
    import {
        teamService,
        type TeamMember,
    } from "$lib/api/services/teamService";
    import Dialog from "$lib/components/ui/dialog.svelte";
    import Button from "$lib/components/ui/button.svelte";
    import Select from "$lib/components/ui/select.svelte";
    import Label from "$lib/components/ui/label.svelte";
    import { createEventDispatcher } from "svelte";

    interface Props {
        open?: boolean;
        teamId: string;
        currentOwnerId: string;
    }

    let { open = $bindable(false), teamId, currentOwnerId }: Props = $props();

    const dispatch = createEventDispatcher();
    let loading = $state(false);
    let members = $state<TeamMember[]>([]);
    let selectedMemberId = $state("");
    let error = $state("");

    // Load members when open changes to true
    $effect(() => {
        if (open && teamId) {
            loadMembers();
        }
        // Convert effect to run only when relevant props change
    });

    async function loadMembers() {
        try {
            loading = true;
            error = "";
        const allMembers = await teamService.getMembers(teamId);
        // Filter out current owner only
        members = allMembers.filter((m) => m.userId !== currentOwnerId);

            // Reset selection if previously selected member is not in new list
            if (
                selectedMemberId &&
                !members.find((m) => m.userId === selectedMemberId)
            ) {
                selectedMemberId = "";
            }
        } catch (e: any) {
            error = "Failed to load members: " + (e.message || "Unknown error");
        } finally {
            loading = false;
        }
    }

    async function handleTransfer() {
        if (!selectedMemberId) return;
        try {
            loading = true;
            await teamService.transferOwnership(teamId, selectedMemberId);
            dispatch("success");
            open = false;
        } catch (e: any) {
            error = "Transfer failed: " + (e.message || "Unknown error");
        } finally {
            loading = false;
        }
    }

    const memberOptions = $derived(
        members.map((m) => ({
            value: m.userId,
            label:
                (m.user?.name || m.user?.email || "Unknown User") +
                (m.user?.email ? ` (${m.user.email})` : ""),
        })),
    );
</script>

<Dialog
    bind:open
    title="Transfer Team Ownership"
    description="Select a new owner for this team. You will become a regular member."
>
    <div class="space-y-4 py-4">
        {#if error}
            <p class="text-sm text-red-500">{error}</p>
        {/if}

        <div class="space-y-2">
            <Label for="new-owner">New Owner</Label>
            <Select
                id="new-owner"
                options={memberOptions}
                bind:value={selectedMemberId}
                placeholder="Select a team member..."
                disabled={loading || members.length === 0}
            />
            {#if members.length === 0 && !loading}
                <p class="text-xs text-muted-foreground">
                    No eligible members found to transfer ownership to.
                </p>
            {/if}
        </div>

        <div class="flex justify-end gap-2 pt-4">
            <Button
                variant="outline"
                onclick={() => (open = false)}
                disabled={loading}>Cancel</Button
            >
            <Button
                variant="destructive"
                onclick={handleTransfer}
                disabled={!selectedMemberId || loading}
            >
                {loading ? "Transferring..." : "Confirm Transfer"}
            </Button>
        </div>
    </div>
</Dialog>
