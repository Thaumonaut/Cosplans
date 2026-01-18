<script lang="ts">
    import Dialog from "$lib/components/ui/dialog.svelte";
    import Button from "$lib/components/ui/button.svelte";
    import DialogFooter from "$lib/components/ui/dialog-footer.svelte";

    let {
        open = $bindable(false),
        teamName,
        onDelete,
        loading = false,
        activeMemberCount = 0,
        onTransfer,
    } = $props<{
        open: boolean;
        teamName: string;
        activeMemberCount?: number;
        onDelete: () => Promise<void> | void;
        onTransfer?: () => void;
        loading?: boolean;
    }>();
</script>

<Dialog
    bind:open
    title={activeMemberCount > 0 ? "Cannot Delete Team" : "Delete Team"}
    description={activeMemberCount > 0
        ? `This team has ${activeMemberCount} active member${activeMemberCount === 1 ? "" : "s"}. You must transfer ownership before you can delete the team.`
        : `Are you sure you want to delete "${teamName}"? This action cannot be undone and all associated data will be permanently removed.`}
>
    <DialogFooter>
        <Button
            variant="outline"
            onclick={() => (open = false)}
            disabled={loading}>Cancel</Button
        >
        {#if activeMemberCount > 0}
            <Button
                variant="default"
                onclick={() => {
                    open = false;
                    onTransfer?.();
                }}
            >
                Transfer Ownership
            </Button>
        {:else}
            <Button variant="destructive" onclick={onDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Team"}
            </Button>
        {/if}
    </DialogFooter>
</Dialog>
