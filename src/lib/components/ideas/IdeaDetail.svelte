<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { ideas } from "$lib/stores/ideas";
    import { ideaService } from "$lib/api/services/ideaService";
    import { currentTeam, teams } from "$lib/stores/teams";
    import { user } from "$lib/stores/auth-store";
    import { get } from "svelte/store";
    import { Button, Dialog, DialogFooter } from "$lib/components/ui";
    import { toast } from "$lib/stores/toast";
    import { AlertCircle, AlertTriangle } from "lucide-svelte";
    import { Badge } from "flowbite-svelte";
    import {
        ArrowRight,
        Plus,
        ImageIcon,
        X,
        Clock,
        DollarSign,
        Tag as TagIcon,
        Calendar,
        Upload,
        Sparkles,
        Trash2,
        Star,
    } from "lucide-svelte";
    import InlineTextEditor from "$lib/components/base/InlineTextEditor.svelte";
    import InlineNumberEditor from "$lib/components/base/InlineNumberEditor.svelte";
    import InlineSelect from "$lib/components/base/InlineSelect.svelte";
    import InlineImageUpload from "$lib/components/base/InlineImageUpload.svelte";
    import DifficultySelector from "$lib/components/base/DifficultySelector.svelte";
    import TagSelector from "$lib/components/base/TagSelector.svelte";
    import CommentBox from "$lib/components/base/CommentBox.svelte";
    import NotFound from "$lib/components/base/NotFound.svelte";
    import { processImage } from "$lib/utils/image";
    import { uploadImageToStorage } from "$lib/utils/storage";
    import type { Idea, IdeaCreate } from "$lib/types/domain/idea";
    import { moodboard } from "$lib/stores/moodboard";
    import ReferencesTab from "./ReferencesTab.svelte";

    interface Props {
        ideaId?: string;
        mode?: "create" | "edit" | "view";
        isFlyout?: boolean;
        onSuccess?: (ideaId: string) => void;
    }

    let { ideaId, mode, isFlyout = false, onSuccess }: Props = $props();

    let idea: Idea | null = $state(null);
    let newIdea: IdeaCreate = $state({
        character: "",
        series: undefined,
        difficulty: "beginner",
        description: undefined,
        estimatedCost: undefined,
        images: [],
        tags: [],
        notes: undefined,
    });
    let loading = $state(true);
    let error = $state<string | null>(null);
    let isConverting = $state(false);
    let saving = $state(false);
    let deleting = $state(false);
    let showDeleteDialog = $state(false);
    let activeTab = $state<"overview" | "images" | "notes" | "references">("overview");

    let estimatedCostValue = $state(0);
    $effect(() => {
        if (mode === "create") {
            estimatedCostValue = newIdea.estimatedCost ?? 0;
        } else if (idea) {
            estimatedCostValue = idea.estimatedCost ?? 0;
        }
    });

    let estimatedCostSetter = (v: number) => {
        if (mode === "create") {
            newIdea.estimatedCost = v || undefined;
            estimatedCostValue = v;
        } else if (idea) {
            idea.estimatedCost = v || undefined;
            estimatedCostValue = v;
        }
    };

    const difficultyOptions = [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
    ];

    const difficultyColors = {
        beginner:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
        intermediate:
            "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
        advanced:
            "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    };

    const isReadOnly = $derived.by(() => {
        if (mode === "create") return false;
        if (!idea) return false;
        return idea.status === "converted";
    });

    const currentMode = $derived(() => {
        if (mode) return mode;
        if (!ideaId) return "create";
        return idea ? "edit" : "view";
    });

    const currentTags = $derived(() => {
        return currentMode() === "create"
            ? (newIdea.tags ?? [])
            : (idea?.tags ?? []);
    });

    // State declarations - must be before derived statements that use them
    let characterValue = $state("");
    let seriesValue = $state("");
    let difficultyValue = $state<"beginner" | "intermediate" | "advanced">(
        "beginner",
    );
    let descriptionValue = $state("");
    let notesValue = $state("");
    let imagesValue = $state<string[]>([]);
    // Track which images have failed to load
    let imageErrors = $state<Set<number>>(new Set());
    // Track which image index is the primary/header image
    let primaryImageIndex = $state(0);

    // Lightbox state
    let lightboxOpen = $state(false);
    let lightboxImageIndex = $state(0);

    // Zoom and pan state
    let zoomLevel = $state(1);
    let panX = $state(0);
    let panY = $state(0);
    let isPanning = $state(false);
    let panStartX = $state(0);
    let panStartY = $state(0);

    // Touch/swipe state for mobile navigation
    let touchStartX = $state<number | null>(null);
    let touchStartY = $state<number | null>(null);
    let touchEndX = $state<number | null>(null);
    let touchEndY = $state<number | null>(null);
    let initialDistance = $state<number | null>(null);
    let lastZoomLevel = $state(1);

    // Drag and drop state for reordering
    let draggedIndex = $state<number | null>(null);
    let dragOverIndex = $state<number | null>(null);

    // Double tap state
    let lastTapTime = $state(0);
    let lastTapX = $state(0);
    let lastTapY = $state(0);

    // Upload state
    let isUploading = $state(false);

    // Get primary image - fallback to first available image if primary fails
    const primaryImage = $derived.by(() => {
        const imageArray = imagesValue;
        if (!imageArray || imageArray.length === 0) return undefined;

        // Try to get the selected primary image first
        if (
            primaryImageIndex >= 0 &&
            primaryImageIndex < imageArray.length &&
            !imageErrors.has(primaryImageIndex)
        ) {
            return imageArray[primaryImageIndex];
        }

        // Fallback to first available (non-error) image (don't update state here)
        const firstAvailable = imageArray.findIndex(
            (_, idx) => !imageErrors.has(idx),
        );
        if (firstAvailable !== -1) {
            return imageArray[firstAvailable];
        }

        // If all images have errors, still return the first one (for display of error state)
        return imageArray[0];
    });

    // Get effective primary image index (for display purposes)
    const effectivePrimaryIndex = $derived.by(() => {
        const imageArray = imagesValue;
        if (!imageArray || imageArray.length === 0) return -1;

        // If current primary has error, find first available
        if (
            primaryImageIndex >= 0 &&
            primaryImageIndex < imageArray.length &&
            !imageErrors.has(primaryImageIndex)
        ) {
            return primaryImageIndex;
        }

        const firstAvailable = imageArray.findIndex(
            (_, idx) => !imageErrors.has(idx),
        );
        if (firstAvailable !== -1) {
            return firstAvailable;
        }

        return primaryImageIndex >= 0 && primaryImageIndex < imageArray.length
            ? primaryImageIndex
            : 0;
    });

    // Check if primary image has an error
    const primaryImageHasError = $derived.by(() => {
        const imageArray = imagesValue;
        if (!imageArray || imageArray.length === 0) return false;
        const effectiveIndex = effectivePrimaryIndex;
        return (
            effectiveIndex >= 0 &&
            effectiveIndex < imageArray.length &&
            imageErrors.has(effectiveIndex)
        );
    });

    const createdDate = $derived(() => {
        if (currentMode() === "create") return null;
        if (!idea?.createdAt) return null;
        return new Date(idea.createdAt);
    });

    onMount(async () => {
        if (currentMode() === "create") {
            loading = false;
            return;
        }

        if (!ideaId) {
            error = "Invalid idea ID";
            loading = false;
            return;
        }

        try {
            const loaded = await ideas.loadOne(ideaId);
            if (!loaded) {
                const direct = await ideaService.get(ideaId);
                if (direct) {
                    idea = direct;
                } else {
                    error = "Idea not found";
                }
            } else {
                idea = loaded;
            }
        } catch (err: any) {
            error = err?.message || "Failed to load idea";
        } finally {
            loading = false;
        }
    });

    async function handleSaveField(field: string, value: any) {
        if (currentMode() === "create") {
            if (field === "character") newIdea.character = value;
            else if (field === "series") newIdea.series = value;
            else if (field === "difficulty") newIdea.difficulty = value;
            else if (field === "estimatedCost")
                newIdea.estimatedCost = value || undefined;
            else if (field === "description")
                newIdea.description = value || undefined;
            else if (field === "notes") newIdea.notes = value || undefined;
            else if (field === "images") newIdea.images = value || [];
            else if (field === "tags") newIdea.tags = value || [];
            return;
        }

        if (!idea || isReadOnly) return;

        try {
            const updates: any = { [field]: value };
            const updated = await ideas.update(idea.id, updates);
            if (updated) {
                idea = updated;
            }
        } catch (err: any) {
            error = err?.message || "Failed to save";
        }
    }

    function validateRequired(value: string): string | null {
        if (!value || value.trim().length === 0) {
            return "This field is required";
        }
        return null;
    }

    function addTag(tagToAdd: string) {
        const tags = currentTags();
        const trimmedTag = tagToAdd.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            if (currentMode() === "create") {
                newIdea.tags = [...(newIdea.tags ?? []), trimmedTag];
            } else if (idea) {
                idea.tags = [...(idea.tags ?? []), trimmedTag];
                handleSaveField("tags", idea.tags);
            }
        }
    }

    function removeTag(tagToRemove: string) {
        if (currentMode() === "create") {
            newIdea.tags = (newIdea.tags ?? []).filter(
                (t) => t !== tagToRemove,
            );
        } else if (idea) {
            idea.tags = (idea.tags ?? []).filter((t) => t !== tagToRemove);
            handleSaveField("tags", idea.tags);
        }
    }

    async function handleCreate() {
        console.log("[IdeaDetail] handleCreate called", {
            isFlyout,
            onSuccess: !!onSuccess,
            newIdea,
        });
        error = null;

        if (!newIdea.character) {
            console.log("[IdeaDetail] Validation failed: missing character");
            const errorMsg = "Character name is required";
            error = errorMsg;
            toast.error("Cannot Create Character", errorMsg);
            return;
        }

        // Ensure teams are loaded before checking for current team
        let team = currentTeam.get();
        if (!team) {
            console.log("[IdeaDetail] No team selected, trying to load teams");
            const currentUser = get(user);
            if (currentUser) {
                try {
                    await teams.load(currentUser.id);
                    team = currentTeam.get();
                } catch (err) {
                    console.error("[IdeaDetail] Failed to load teams", err);
                }
            }
        }

        if (!team) {
            console.log("[IdeaDetail] No team available after loading");
            const teamsState = get(teams);
            let errorMsg = "";
            if (teamsState.items.length === 0) {
                errorMsg =
                    "No teams found. A personal team should have been created automatically. Please contact support or try refreshing the page.";
            } else {
                errorMsg =
                    "No team is currently selected. Please select a team from the team selector in the sidebar.";
            }
            error = errorMsg;
            toast.error("Cannot Create Character", errorMsg);
            return;
        }

        console.log("[IdeaDetail] Starting create process", {
            teamId: team.id,
        });
        saving = true;

        try {
            const created = await ideas.create(team.id, newIdea);
            console.log("[IdeaDetail] Idea created successfully", {
                createdId: created.id,
            });
            toast.success(
                "Character Created",
                `${created.character} has been saved successfully!`,
            );
            if (isFlyout && onSuccess) {
                console.log("[IdeaDetail] Calling onSuccess callback");
                onSuccess(created.id);
            } else {
                console.log("[IdeaDetail] Navigating to idea detail page");
                goto(`/ideas/${created.id}`);
            }
        } catch (err: any) {
            console.error("[IdeaDetail] Create failed", err);
            const errorMsg = err?.message || "Failed to create idea";
            error = errorMsg;
            toast.error("Failed to Create Character", errorMsg);
            saving = false;
        }
    }

    async function handleConvertToProject() {
        if (!idea || isConverting) return;

        const team = currentTeam.get();
        if (!team) {
            error = "No team selected";
            return;
        }

        isConverting = true;
        error = null;

        try {
            const result = await ideaService.convert(idea.id, team.id);

            // Idea has been deleted, so we can't reload it
            // If in a flyout, pass project ID to onSuccess callback (parent will handle redirect)
            if (isFlyout && onSuccess) {
                onSuccess(result.projectId);
            } else {
                // Direct redirect if not in flyout
                goto(`/projects/${result.projectId}`);
            }
        } catch (err: any) {
            error = err?.message || "Failed to convert idea to project";
            isConverting = false;
        }
    }

    async function handleDelete() {
        if (!idea?.id || deleting) return;

        deleting = true;
        try {
            await ideaService.delete(idea.id);
            toast.success(
                "Idea Deleted",
                "The idea has been deleted successfully",
            );
            showDeleteDialog = false;

            // Navigate away after deletion - close flyout if in one
            if (isFlyout && onSuccess) {
                // Pass empty string to indicate deletion/closure
                onSuccess("");
                // Wait a bit for state to update
                await new Promise((resolve) => setTimeout(resolve, 100));
            } else {
                goto("/ideas");
            }
        } catch (err: any) {
            toast.error(
                "Failed to Delete",
                err?.message || "Failed to delete idea",
            );
            deleting = false;
        }
    }

    // Handle touch gestures for lightbox navigation and zoom
    function handleTouchStart(e: TouchEvent) {
        if (e.touches.length === 1) {
            // Single touch - navigation swipe
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            if (zoomLevel > 1) {
                // If zoomed, start panning
                isPanning = true;
                panStartX = e.touches[0].clientX - panX;
                panStartY = e.touches[0].clientY - panY;
            }
        } else if (e.touches.length === 2) {
            // Two touches - pinch to zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY,
            );
            lastZoomLevel = zoomLevel;
            touchStartX = null; // Cancel swipe
        }
    }

    function handleTouchMove(e: TouchEvent) {
        if (e.touches.length === 1 && zoomLevel > 1 && isPanning) {
            // Pan while zoomed
            panX = e.touches[0].clientX - panStartX;
            panY = e.touches[0].clientY - panStartY;
        } else if (e.touches.length === 2 && initialDistance !== null) {
            // Pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY,
            );
            const scale = currentDistance / initialDistance;
            const newZoom = Math.min(Math.max(lastZoomLevel * scale, 1), 5); // Min 1x, max 5x
            zoomLevel = newZoom;
            if (newZoom === 1) {
                panX = 0;
                panY = 0;
            }
        } else if (e.touches.length === 1) {
            // Track for swipe navigation
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }
    }

    function handleTouchEnd() {
        if (
            touchStartX !== null &&
            touchEndX !== null &&
            touchStartY !== null &&
            touchEndY !== null
        ) {
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Only handle horizontal swipes when not zoomed and not panning
            if (
                zoomLevel === 1 &&
                !isPanning &&
                Math.abs(diffX) > Math.abs(diffY) &&
                Math.abs(diffX) > 50
            ) {
                if (diffX > 0 && lightboxImageIndex < imagesValue.length - 1) {
                    // Swipe left - next image
                    lightboxImageIndex++;
                } else if (diffX < 0 && lightboxImageIndex > 0) {
                    // Swipe right - previous image
                    lightboxImageIndex--;
                }
            }
        }

        touchStartX = null;
        touchStartY = null;
        touchEndX = null;
        touchEndY = null;
        initialDistance = null;
        isPanning = false;
    }

    function handleDoubleTap(e: MouseEvent | TouchEvent) {
        const now = Date.now();
        const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;

        if (
            now - lastTapTime < 300 &&
            Math.abs(clientX - lastTapX) < 50 &&
            Math.abs(clientY - lastTapY) < 50
        ) {
            // Double tap detected
            if (zoomLevel === 1) {
                zoomLevel = 2;
            } else {
                zoomLevel = 1;
                panX = 0;
                panY = 0;
            }
            lastTapTime = 0;
        } else {
            lastTapTime = now;
            lastTapX = clientX;
            lastTapY = clientY;
        }
    }

    // Mouse wheel zoom on desktop
    function handleWheel(e: WheelEvent) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            zoomLevel = Math.min(Math.max(zoomLevel * delta, 1), 5);
            if (zoomLevel === 1) {
                panX = 0;
                panY = 0;
            }
        }
    }

    // Mouse drag to pan when zoomed
    function handleMouseDown(e: MouseEvent) {
        if (zoomLevel > 1 && e.button === 0) {
            isPanning = true;
            panStartX = e.clientX - panX;
            panStartY = e.clientY - panY;
        }
    }

    function handleMouseMove(e: MouseEvent) {
        if (isPanning && zoomLevel > 1) {
            panX = e.clientX - panStartX;
            panY = e.clientY - panStartY;
        }
    }

    function handleMouseUp() {
        isPanning = false;
    }

    // Handle gallery upload from compact placeholder
    async function handleGalleryUpload(files: FileList) {
        if (!files || files.length === 0 || isReadOnly) return;

        const team = get(currentTeam);
        if (!team) {
            toast.error(
                "Upload Failed",
                "No team selected. Please select a team first.",
            );
            return;
        }

        isUploading = true;
        try {
            const newUrls: string[] = [];
            const filesArray = Array.from(files);

            for (const file of filesArray) {
                // Process the image (compress/resize)
                const processed = await processImage(file);

                // Upload the display version to Supabase Storage with team ID
                const result = await uploadImageToStorage(
                    processed.display,
                    "ideas",
                    team.id,
                );

                // Use the public URL from Supabase Storage
                newUrls.push(result.url);
            }

            const updated = [...imagesValue, ...newUrls];
            if (currentMode() === "create") {
                newIdea.images = updated;
                imagesValue = updated;
            } else if (idea) {
                idea.images = updated;
                imagesValue = updated;
                await handleSaveField("images", updated);
            }

            toast.success(
                "Upload Complete",
                `Successfully uploaded ${newUrls.length} image${newUrls.length > 1 ? "s" : ""}`,
            );
        } catch (err: any) {
            toast.error(
                "Upload Failed",
                err?.message || "Failed to upload images",
            );
            console.error("Upload error:", err);
        } finally {
            isUploading = false;
        }
    }

    // Reset zoom/pan when image changes
    $effect(() => {
        if (lightboxOpen && lightboxImageIndex !== undefined) {
            zoomLevel = 1;
            panX = 0;
            panY = 0;
        }
    });

    $effect(() => {
        if (currentMode() === "create") {
            characterValue = newIdea.character;
            seriesValue = newIdea.series ?? "";
            difficultyValue = newIdea.difficulty;
            descriptionValue = newIdea.description ?? "";
            notesValue = newIdea.notes ?? "";
            const newImages = newIdea.images ?? [];
            imagesValue = newImages;
            // Reset errors and primary index when images change
            imageErrors = new Set();
            primaryImageIndex = 0;
        } else if (idea) {
            characterValue = idea.character;
            seriesValue = idea.series ?? "";
            difficultyValue = idea.difficulty;
            descriptionValue = idea.description ?? "";
            notesValue = idea.notes ?? "";
            const newImages = idea.images ?? [];
            // Only reset if images actually changed
            const imagesChanged =
                JSON.stringify(imagesValue) !== JSON.stringify(newImages);
            if (imagesChanged) {
                imagesValue = newImages;
                // Reset errors when images change, give them a chance to load
                imageErrors = new Set();
                // Load saved primary image index, or default to 0
                primaryImageIndex = idea.primaryImageIndex ?? 0;
            } else if (
                idea.primaryImageIndex !== undefined &&
                primaryImageIndex !== idea.primaryImageIndex
            ) {
                // If images didn't change but primaryImageIndex did, update it
                primaryImageIndex = idea.primaryImageIndex;
            }

            // Load moodboard nodes for this idea
            if (idea.id) {
                moodboard.load(idea.id).catch(err => {
                    console.error('Failed to load moodboard:', err);
                });
            }
        }
    });
</script>

{#if loading}
    <div class="flex items-center justify-center py-20">
        <div class="text-sm text-muted-foreground">Loading idea...</div>
    </div>
{:else if error && currentMode() !== "create" && !idea}
    <NotFound entityType="idea" backUrl="/ideas" searchUrl="/ideas" />
{:else}
    <div class="flex h-full flex-col">
        <!-- Header with Title and Quick Info -->
        <div class="border-b bg-[var(--theme-card-bg)] px-8 py-6">
            <div class="space-y-4">
                <!-- Title and Actions Row -->
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 space-y-2">
                        <InlineTextEditor
                            bind:value={characterValue}
                            editable={!isReadOnly}
                            onSave={async (v: string) => {
                                if (currentMode() === "create") {
                                    newIdea.character = v;
                                    characterValue = v;
                                } else {
                                    await handleSaveField("character", v);
                                }
                            }}
                            onValidate={validateRequired}
                            placeholder="Character name"
                            variant="title"
                            className="text-3xl font-semibold"
                        />
                        <InlineTextEditor
                            bind:value={seriesValue}
                            editable={!isReadOnly}
                            onSave={async (v: string) => {
                                if (currentMode() === "create") {
                                    newIdea.series = v.trim() || undefined;
                                    seriesValue = v;
                                } else {
                                    await handleSaveField(
                                        "series",
                                        v.trim() || null,
                                    );
                                }
                            }}
                            placeholder="Series or source material (optional)"
                            variant="body"
                            className="text-lg text-muted-foreground"
                        />
                    </div>

                    <!-- Delete Button (only in edit mode) -->
                    {#if currentMode() === "edit" && idea}
                        <Button
                            variant="ghost"
                            size="icon"
                            onclick={() => (showDeleteDialog = true)}
                            class="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 class="size-4" />
                            <span class="sr-only">Delete idea</span>
                        </Button>
                    {/if}
                </div>

                <!-- Metadata Bar -->
                <div class="flex flex-wrap items-center gap-6 text-sm">
                    <!-- Created Date -->
                    {#if createdDate()}
                        <div
                            class="flex items-center gap-2 text-muted-foreground"
                        >
                            <Calendar class="size-4" />
                            <span
                                >Created {createdDate()!.toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}</span
                            >
                        </div>
                    {/if}

                    <!-- Status Badges -->
                    <div class="flex items-center gap-2">
                        <DifficultySelector
                            bind:value={difficultyValue}
                            editable={!isReadOnly}
                            onSave={async (v) => {
                                if (currentMode() === "create") {
                                    newIdea.difficulty = v;
                                } else {
                                    await handleSaveField("difficulty", v);
                                }
                            }}
                        />
                        {#if idea?.status === "converted"}
                            <Badge
                                class="border bg-gray-500/10 text-gray-700 dark:text-gray-300 px-3 py-1"
                            >
                                Converted
                            </Badge>
                        {/if}
                    </div>

                    <!-- Tags -->
                    <div class="flex items-center gap-2">
                        <TagIcon class="size-4 text-muted-foreground" />
                        <div class="flex flex-wrap gap-1.5">
                            {#each currentTags() as tag}
                                <Badge
                                    class="border bg-muted px-2 py-0.5 text-xs"
                                >
                                    {tag}
                                    {#if !isReadOnly}
                                        <button
                                            onclick={() => removeTag(tag)}
                                            class="ml-1.5 opacity-60 hover:opacity-100"
                                        >
                                            <X class="size-3" />
                                        </button>
                                    {/if}
                                </Badge>
                            {/each}

                            {#if !isReadOnly}
                                <TagSelector onAddTag={addTag} />
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="border-b bg-[var(--theme-card-bg)]">
            <div class="flex gap-8 px-8">
                <button
                    onclick={() => (activeTab = "overview")}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
                    'overview'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'}"
                >
                    Overview
                </button>
                <button
                    onclick={() => (activeTab = "images")}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
                    'images'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'}"
                >
                    Images {#if imagesValue.length > 0}({imagesValue.length}){/if}
                </button>
                <button
                    onclick={() => (activeTab = "notes")}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
                    'notes'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'}"
                >
                    Notes
                </button>
                <button
                    onclick={() => (activeTab = "references")}
                    class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
                    'references'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'}"
                >
                    References {#if $moodboard.nodes.length > 0}({$moodboard.nodes.length}){/if}
                </button>
            </div>
        </div>

        <!-- Tab Content - Moodboard Style -->
        <div class="flex-1 overflow-y-auto bg-[var(--theme-card-bg)]">
            <div class="p-8">
                {#if activeTab === "overview"}
                    <!-- Overview: Hero Image + Description + Quick Details -->
                    <div class="mx-auto max-w-4xl space-y-8">
                        <!-- Primary Hero Image -->
                        <div
                            class="relative overflow-hidden rounded-lg bg-background shadow-sm"
                        >
                            {#if primaryImage && !primaryImageHasError}
                                <img
                                    src={primaryImage}
                                    alt={characterValue || "Character"}
                                    class="w-full object-cover"
                                    style="max-height: 200px;"
                                    onerror={() => {
                                        // Mark primary image as error
                                        const currentIndex =
                                            effectivePrimaryIndex;
                                        if (currentIndex >= 0) {
                                            imageErrors = new Set(
                                                imageErrors,
                                            ).add(currentIndex);
                                            // If this was the selected primary, find a new one
                                            if (
                                                currentIndex ===
                                                primaryImageIndex
                                            ) {
                                                const firstAvailable =
                                                    imagesValue.findIndex(
                                                        (_, idx) =>
                                                            idx !==
                                                                currentIndex &&
                                                            !imageErrors.has(
                                                                idx,
                                                            ),
                                                    );
                                                if (firstAvailable !== -1) {
                                                    primaryImageIndex =
                                                        firstAvailable;
                                                }
                                            }
                                        }
                                    }}
                                />
                                {#if !isReadOnly && imagesValue.length > 1}
                                    <div
                                        class="absolute top-2 right-2 flex gap-2"
                                    >
                                        <button
                                            onclick={async () => {
                                                // Find next available image to set as primary
                                                const nextIndex =
                                                    imagesValue.findIndex(
                                                        (_, idx) =>
                                                            idx !==
                                                                primaryImageIndex &&
                                                            !imageErrors.has(
                                                                idx,
                                                            ),
                                                    );
                                                if (nextIndex !== -1) {
                                                    primaryImageIndex =
                                                        nextIndex;
                                                    await handleSaveField(
                                                        "primaryImageIndex",
                                                        nextIndex,
                                                    );
                                                } else {
                                                    // If no other available, cycle to next one
                                                    const newIndex =
                                                        (primaryImageIndex +
                                                            1) %
                                                        imagesValue.length;
                                                    primaryImageIndex =
                                                        newIndex;
                                                    await handleSaveField(
                                                        "primaryImageIndex",
                                                        newIndex,
                                                    );
                                                }
                                            }}
                                            class="rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100 hover:bg-black/80"
                                            title="Change primary image"
                                        >
                                            <svg
                                                class="size-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                {/if}
                            {:else if primaryImage && primaryImageHasError}
                                <!-- Primary image has error, show placeholder -->
                                <div
                                    class="flex aspect-video items-center justify-center bg-muted"
                                >
                                    <div class="text-center space-y-3">
                                        <ImageIcon
                                            class="mx-auto size-12 text-muted-foreground"
                                        />
                                        <p
                                            class="text-sm text-muted-foreground"
                                        >
                                            Primary image unavailable
                                        </p>
                                        {#if imagesValue.length > 1}
                                            <p
                                                class="text-xs text-muted-foreground"
                                            >
                                                Select another image below or
                                                upload a new one
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onclick={async () => {
                                                    // Find first available image
                                                    const firstAvailable =
                                                        imagesValue.findIndex(
                                                            (_, idx) =>
                                                                !imageErrors.has(
                                                                    idx,
                                                                ),
                                                        );
                                                    if (firstAvailable !== -1) {
                                                        primaryImageIndex =
                                                            firstAvailable;
                                                        await handleSaveField(
                                                            "primaryImageIndex",
                                                            firstAvailable,
                                                        );
                                                    }
                                                }}
                                            >
                                                Use first available image
                                            </Button>
                                        {/if}
                                    </div>
                                </div>
                            {:else}
                                <div
                                    class="flex aspect-video items-center justify-center bg-[var(--theme-input-bg)]"
                                >
                                    <div class="text-center space-y-3">
                                        <!-- <ImageIcon
                                            class="mx-auto size-12 text-[var(--theme-muted-foreground)]"
                                        /> -->
                                        <p
                                            class="text-sm text-[var(--theme-muted-foreground)]"
                                        >
                                            No image uploaded
                                        </p>
                                        {#if !isReadOnly}
                                            <InlineImageUpload
                                                images={imagesValue}
                                                editable={true}
                                                folder="ideas"
                                                onSave={async (v: string[]) => {
                                                    if (
                                                        currentMode() ===
                                                        "create"
                                                    ) {
                                                        newIdea.images = v;
                                                        imagesValue = v;
                                                    } else if (idea) {
                                                        idea.images = v;
                                                        imagesValue = v;
                                                        await handleSaveField(
                                                            "images",
                                                            v,
                                                        );
                                                    }
                                                }}
                                                multiple={true}
                                            />
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>

                        <!-- Description Section -->
                        <div
                            class="space-y-3 rounded-lg bg-background p-6 shadow-sm"
                        >
                            <h3
                                class="text-sm font-medium text-muted-foreground"
                            >
                                Description
                            </h3>
                            <InlineTextEditor
                                bind:value={descriptionValue}
                                editable={!isReadOnly}
                                onSave={async (v: string) => {
                                    if (currentMode() === "create") {
                                        newIdea.description = v || undefined;
                                        descriptionValue = v;
                                    } else if (idea) {
                                        idea.description = v || undefined;
                                        descriptionValue = v;
                                        await handleSaveField(
                                            "description",
                                            v || undefined,
                                        );
                                    }
                                }}
                                placeholder="Describe this character and your vision for the cosplay..."
                                variant="body"
                                multiline={true}
                                className="text-base leading-relaxed min-h-[120px]"
                            />
                        </div>

                        <!-- Estimated Cost - Full Width -->
                        {#if estimatedCostValue > 0 || !isReadOnly}
                            <div
                                class="group relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/20 p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md"
                            >
                                <div class="mb-4 flex items-center gap-2">
                                    <DollarSign
                                        class="size-4 text-muted-foreground"
                                    />
                                    <span
                                        class="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                                        >Estimated Cost</span
                                    >
                                </div>
                                <InlineNumberEditor
                                    bind:value={estimatedCostValue}
                                    editable={!isReadOnly}
                                    onSave={async (v: number) => {
                                        estimatedCostSetter(v);
                                        await handleSaveField(
                                            "estimatedCost",
                                            v,
                                        );
                                    }}
                                    placeholder="$0.00"
                                    min={0}
                                />
                            </div>
                        {/if}
                    </div>
                {:else if activeTab === "images"}
                    <!-- Images Tab: Photo Gallery -->
                    <div class="mx-auto max-w-6xl space-y-6">
                        <!-- Image Grid - Photo Gallery Style -->
                        {#if imagesValue.length > 0}
                            <div
                                class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {#each imagesValue as image, index}
                                    {@const imageUrl = image}
                                    {@const isBlobUrl =
                                        imageUrl?.startsWith("blob:") || false}
                                    {@const hasError = imageErrors.has(index)}

                                    {@const isPrimary =
                                        primaryImageIndex === index}
                                    {@const isDragging = draggedIndex === index}
                                    {@const isDragOver =
                                        dragOverIndex === index}

                                    <div
                                        role="button"
                                        tabindex="0"
                                        aria-label={isPrimary
                                            ? `Primary image ${index + 1}, drag to reorder`
                                            : `Image ${index + 1}, drag to reorder`}
                                        class="group relative aspect-square overflow-hidden rounded-lg bg-background shadow-sm transition-all hover:shadow-md cursor-pointer {isPrimary
                                            ? 'ring-2 ring-primary'
                                            : ''} {isDragging
                                            ? 'opacity-50 scale-95'
                                            : ''} {isDragOver
                                            ? 'ring-2 ring-primary scale-105'
                                            : ''}"
                                        draggable={!isReadOnly && !hasError}
                                        ondragstart={(e) => {
                                            if (!isReadOnly && !hasError) {
                                                draggedIndex = index;
                                                e.dataTransfer.effectAllowed =
                                                    "move";
                                                e.dataTransfer.setData(
                                                    "text/plain",
                                                    String(index),
                                                );
                                            }
                                        }}
                                        ondragend={() => {
                                            draggedIndex = null;
                                            dragOverIndex = null;
                                        }}
                                        ondragover={(e) => {
                                            if (
                                                !isReadOnly &&
                                                !hasError &&
                                                draggedIndex !== null &&
                                                draggedIndex !== index
                                            ) {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect =
                                                    "move";
                                                dragOverIndex = index;
                                            }
                                        }}
                                        ondragleave={() => {
                                            if (dragOverIndex === index) {
                                                dragOverIndex = null;
                                            }
                                        }}
                                        ondrop={async (e) => {
                                            e.preventDefault();
                                            if (
                                                !isReadOnly &&
                                                !hasError &&
                                                draggedIndex !== null &&
                                                draggedIndex !== index
                                            ) {
                                                // Reorder images
                                                const newImages = [
                                                    ...imagesValue,
                                                ];
                                                const [removed] =
                                                    newImages.splice(
                                                        draggedIndex,
                                                        1,
                                                    );
                                                newImages.splice(
                                                    index,
                                                    0,
                                                    removed,
                                                );

                                                // Adjust primary index if needed
                                                let newPrimaryIndex =
                                                    primaryImageIndex;
                                                if (
                                                    primaryImageIndex ===
                                                    draggedIndex
                                                ) {
                                                    newPrimaryIndex = index;
                                                } else if (
                                                    primaryImageIndex >
                                                        draggedIndex &&
                                                    primaryImageIndex <= index
                                                ) {
                                                    newPrimaryIndex--;
                                                } else if (
                                                    primaryImageIndex <
                                                        draggedIndex &&
                                                    primaryImageIndex >= index
                                                ) {
                                                    newPrimaryIndex++;
                                                }

                                                // Update error indices
                                                const newErrors =
                                                    new Set<number>();
                                                imageErrors.forEach(
                                                    (errorIndex) => {
                                                        if (
                                                            errorIndex ===
                                                            draggedIndex
                                                        ) {
                                                            newErrors.add(
                                                                index,
                                                            );
                                                        } else if (
                                                            errorIndex <
                                                                draggedIndex &&
                                                            errorIndex < index
                                                        ) {
                                                            newErrors.add(
                                                                errorIndex,
                                                            );
                                                        } else if (
                                                            errorIndex >
                                                                draggedIndex &&
                                                            errorIndex > index
                                                        ) {
                                                            newErrors.add(
                                                                errorIndex,
                                                            );
                                                        } else if (
                                                            errorIndex <
                                                                draggedIndex &&
                                                            errorIndex >= index
                                                        ) {
                                                            newErrors.add(
                                                                errorIndex + 1,
                                                            );
                                                        } else if (
                                                            errorIndex >
                                                                draggedIndex &&
                                                            errorIndex <= index
                                                        ) {
                                                            newErrors.add(
                                                                errorIndex - 1,
                                                            );
                                                        }
                                                    },
                                                );

                                                imagesValue = newImages;
                                                imageErrors = newErrors;
                                                primaryImageIndex =
                                                    newPrimaryIndex;

                                                if (
                                                    currentMode() === "create"
                                                ) {
                                                    newIdea.images = newImages;
                                                } else if (idea) {
                                                    idea.images = newImages;
                                                    await handleSaveField(
                                                        "images",
                                                        newImages,
                                                    );
                                                    await handleSaveField(
                                                        "primaryImageIndex",
                                                        newPrimaryIndex,
                                                    );
                                                }
                                            }
                                            draggedIndex = null;
                                            dragOverIndex = null;
                                        }}
                                    >
                                        {#if !hasError}
                                            <img
                                                src={imageUrl}
                                                alt="Reference {index + 1}"
                                                class="size-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                                                onclick={() => {
                                                    lightboxImageIndex = index;
                                                    lightboxOpen = true;
                                                }}
                                                onload={() => {
                                                    // Image loaded successfully - ensure it's not in error set
                                                    if (
                                                        imageErrors.has(index)
                                                    ) {
                                                        const newErrors =
                                                            new Set(
                                                                imageErrors,
                                                            );
                                                        newErrors.delete(index);
                                                        imageErrors = newErrors;
                                                    }
                                                }}
                                                onerror={() => {
                                                    // Only mark as error if it's actually failing
                                                    if (
                                                        !imageErrors.has(index)
                                                    ) {
                                                        imageErrors = new Set(
                                                            imageErrors,
                                                        ).add(index);
                                                    }
                                                }}
                                            />
                                            <!-- Primary indicator badge -->
                                            {#if isPrimary && !hasError}
                                                <div
                                                    class="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-white shadow-lg"
                                                >
                                                    Primary
                                                </div>
                                            {/if}
                                        {/if}
                                        {#if hasError}
                                            <div
                                                class="absolute inset-0 size-full bg-muted flex items-center justify-center pointer-events-none"
                                            >
                                                <div class="text-center">
                                                    <svg
                                                        class="mx-auto mb-2 size-8 text-muted-foreground"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        ></path>
                                                    </svg>
                                                    <span
                                                        class="text-xs text-muted-foreground block"
                                                        >Image unavailable</span
                                                    >
                                                    {#if isBlobUrl}
                                                        <span
                                                            class="text-xs text-muted-foreground/70 block mt-1"
                                                            >Please re-upload</span
                                                        >
                                                    {/if}
                                                </div>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}

                                <!-- Compact Upload Placeholder (only show if not readonly and images exist) -->
                                {#if !isReadOnly}
                                    <div
                                        class="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-all hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                                        onclick={() => {
                                            // Trigger file input click
                                            const input =
                                                document.getElementById(
                                                    "image-upload-gallery",
                                                ) as HTMLInputElement;
                                            input?.click();
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple={true}
                                            disabled={isReadOnly || isUploading}
                                            onchange={(e) => {
                                                const files = (
                                                    e.target as HTMLInputElement
                                                )?.files;
                                                if (files) {
                                                    handleGalleryUpload(files);
                                                }
                                            }}
                                            class="hidden"
                                            id="image-upload-gallery"
                                        />
                                        <div
                                            class="absolute inset-0 flex flex-col items-center justify-center p-4"
                                        >
                                            <Upload
                                                class="mb-2 size-8 text-muted-foreground"
                                            />
                                            <span
                                                class="text-xs text-muted-foreground text-center"
                                                >Add more</span
                                            >
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            <!-- Full Upload Section (only when no images) -->
                        {:else if !isReadOnly}
                            <div
                                class="rounded-lg border-2 border-dashed bg-background p-12 text-center"
                            >
                                <Upload
                                    class="mx-auto mb-4 size-16 text-muted-foreground"
                                />
                                <p class="mb-2 text-lg font-medium">
                                    Upload reference images
                                </p>
                                <p class="mb-6 text-sm text-muted-foreground">
                                    Drag and drop images here, or click to
                                    browse
                                </p>
                                <InlineImageUpload
                                    images={imagesValue}
                                    editable={true}
                                    onSave={async (v: string[]) => {
                                        if (currentMode() === "create") {
                                            newIdea.images = v;
                                            imagesValue = v;
                                        } else if (idea) {
                                            idea.images = v;
                                            imagesValue = v;
                                            await handleSaveField("images", v);
                                        }
                                    }}
                                    multiple={true}
                                    folder="ideas"
                                />
                            </div>
                        {:else}
                            <div
                                class="flex flex-col items-center justify-center rounded-lg bg-background py-16 text-center"
                            >
                                <ImageIcon
                                    class="mb-4 size-12 text-muted-foreground"
                                />
                                <p class="text-sm text-muted-foreground">
                                    No reference images
                                </p>
                            </div>
                        {/if}
                    </div>
                {:else if activeTab === "notes"}
                    <!-- Notes Tab: Free-form Inspiration Collection -->
                    <div class="mx-auto max-w-3xl space-y-6">
                        <div class="rounded-lg bg-background p-8 shadow-sm">
                            <div
                                class="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <Sparkles class="size-4" />
                                <span
                                    >Capture your thoughts, ideas, and
                                    inspiration</span
                                >
                            </div>
                            <InlineTextEditor
                                bind:value={notesValue}
                                editable={!isReadOnly}
                                onSave={async (v: string) => {
                                    if (currentMode() === "create") {
                                        newIdea.notes = v || undefined;
                                        notesValue = v;
                                    } else if (idea) {
                                        idea.notes = v || undefined;
                                        notesValue = v;
                                        await handleSaveField(
                                            "notes",
                                            v || undefined,
                                        );
                                    }
                                }}
                                placeholder="Add notes about materials, techniques, references, or any ideas that come to mind..."
                                variant="body"
                                multiline={true}
                                className="text-base leading-relaxed min-h-[400px]"
                            />
                        </div>
                    </div>
                {:else if activeTab === "references"}
                    <!-- References Tab: Moodboard Nodes -->
                    {#if idea?.id}
                        <ReferencesTab ideaId={idea.id} />
                    {:else}
                        <div class="mx-auto max-w-3xl text-center py-12">
                            <p class="text-muted-foreground">Create the idea first to add references.</p>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>

        <!-- Actions Footer -->
        {#if currentMode() === "create"}
            <div class="border-t bg-[var(--theme-card-bg)] px-8 py-4">
                <div class="flex gap-3">
                    <Button
                        onclick={(e) => {
                            console.log(
                                "[IdeaDetail] Create Character button clicked",
                                {
                                    event: e,
                                    saving,
                                    hasCharacter: !!newIdea.character,
                                    disabled: saving || !newIdea.character,
                                },
                            );
                            e.stopPropagation();
                            handleCreate();
                        }}
                        disabled={saving || !newIdea.character}
                        class="flex-1"
                    >
                        {#if saving}
                            <div
                                class="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                            ></div>
                            Creating...
                        {:else}
                            <Sparkles class="mr-2 size-4" />
                            Create Character
                        {/if}
                    </Button>
                    <Button
                        variant="outline"
                        onclick={handleCreate}
                        disabled={saving}
                        class="flex-1"
                    >
                        Save as Draft
                    </Button>
                </div>
            </div>
        {:else if !isReadOnly}
            <div class="border-t bg-[var(--theme-card-bg)] px-8 py-4">
                <Button
                    onclick={() => {
                        console.log("Button clicked", {
                            isConverting,
                            character: idea?.character,
                            series: idea?.series,
                        });
                        handleConvertToProject();
                    }}
                    disabled={isConverting}
                >
                    {#if isConverting}
                        <div
                            class="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        ></div>
                        Converting...
                    {:else}
                        Start Planning
                        <ArrowRight class="ml-2 size-4" />
                    {/if}
                </Button>
            </div>
        {/if}

        <!-- Comments Section -->
        {#if idea}
            <div class="border-t px-8 py-6">
                <CommentBox
                    entityType="idea"
                    entityId={idea.id}
                    editable={!isReadOnly}
                />
            </div>
        {/if}
    </div>
{/if}

<!-- Delete Confirmation Dialog -->
<Dialog
    bind:open={showDeleteDialog}
    title="Delete Idea"
    description="Are you sure you want to delete this idea? This action cannot be undone."
>
    <DialogFooter>
        <Button
            variant="outline"
            onclick={() => (showDeleteDialog = false)}
            disabled={deleting}
        >
            Cancel
        </Button>
        <Button
            variant="destructive"
            onclick={handleDelete}
            disabled={deleting}
        >
            {deleting ? "Deleting..." : "Delete Idea"}
        </Button>
    </DialogFooter>
</Dialog>

<!-- Image Lightbox - Mobile Friendly with Zoom -->
<Dialog
    bind:open={lightboxOpen}
    size="xl"
    placement="center"
    class="p-0 sm:p-4"
    showCloseButton={false}
>
    <div
        class="relative w-full h-full flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] overflow-hidden"
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
        onwheel={handleWheel}
        onmousedown={handleMouseDown}
        onmousemove={handleMouseMove}
        onmouseup={handleMouseUp}
        onmouseleave={handleMouseUp}
        style="touch-action: pan-x pan-y pinch-zoom; cursor: {zoomLevel > 1
            ? 'grab'
            : 'default'}; {isPanning ? 'cursor: grabbing;' : ''}"
    >
        {#if imagesValue.length > 0 && imagesValue[lightboxImageIndex]}
            {@const currentImage = imagesValue[lightboxImageIndex]}
            {@const hasError = imageErrors.has(lightboxImageIndex)}

            {#if !hasError}
                <div
                    class="relative flex items-center justify-center w-full h-full"
                    style="transform: translate({panX}px, {panY}px);"
                >
                    <img
                        src={currentImage}
                        alt="Reference image {lightboxImageIndex + 1}"
                        class="max-h-[85vh] sm:max-h-[80vh] max-w-full w-auto h-auto object-contain rounded-lg select-none transition-transform duration-200"
                        style="transform: scale({zoomLevel}); transform-origin: center center;"
                        draggable="false"
                        onclick={handleDoubleTap}
                        onkeydown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                handleDoubleTap(e);
                            }
                        }}
                        role="button"
                        tabindex="0"
                        aria-label="Double tap or Ctrl+scroll to zoom"
                    />
                </div>

                <!-- Zoom indicator -->
                {#if zoomLevel > 1}
                    <div
                        class="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden"
                    >
                        <div
                            class="rounded-full bg-black/60 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
                        >
                            {Math.round(zoomLevel * 100)}% - Pinch or drag to
                            pan
                        </div>
                    </div>
                {/if}
            {:else}
                <div
                    class="flex flex-col items-center justify-center py-16 px-4"
                >
                    <ImageIcon class="mb-4 size-16 text-muted-foreground" />
                    <p class="text-muted-foreground text-center">
                        Image unavailable
                    </p>
                </div>
            {/if}

            {#if imagesValue.length > 1}
                <!-- Navigation Controls - Mobile Optimized -->
                <div
                    class="absolute inset-0 flex items-center justify-between pointer-events-none px-2 sm:px-4"
                >
                    <!-- Previous Button -->
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={lightboxImageIndex === 0}
                        onclick={() => {
                            if (lightboxImageIndex > 0) {
                                lightboxImageIndex--;
                            }
                        }}
                        class="pointer-events-auto bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 size-10 sm:size-12 rounded-full"
                        aria-label="Previous image"
                    >
                        <svg
                            class="size-5 sm:size-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </Button>

                    <!-- Next Button -->
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={lightboxImageIndex === imagesValue.length - 1}
                        onclick={() => {
                            if (lightboxImageIndex < imagesValue.length - 1) {
                                lightboxImageIndex++;
                            }
                        }}
                        class="pointer-events-auto bg-black/60 text-white hover:bg-black/80 disabled:opacity-30 size-10 sm:size-12 rounded-full"
                        aria-label="Next image"
                    >
                        <svg
                            class="size-5 sm:size-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Button>
                </div>

                <!-- Image Counter - Bottom Center -->
                <div
                    class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                    <div
                        class="rounded-full bg-black/60 px-3 py-1.5 text-xs sm:text-sm text-white backdrop-blur-sm"
                    >
                        {lightboxImageIndex + 1} / {imagesValue.length}
                    </div>
                </div>

                <!-- Tap hints for mobile (only show when not zoomed and on first image) -->
                {#if lightboxImageIndex === 0 && imagesValue.length > 1 && zoomLevel === 1}
                    <div
                        class="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none sm:hidden"
                    >
                        <div
                            class="rounded-full bg-black/60 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
                        >
                            Swipe to navigate • Double tap to zoom
                        </div>
                    </div>
                {/if}

                <!-- Reset zoom button (show when zoomed) -->
                {#if zoomLevel > 1}
                    <div
                        class="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-auto sm:bottom-20"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onclick={() => {
                                zoomLevel = 1;
                                panX = 0;
                                panY = 0;
                            }}
                            class="bg-black/60 text-white hover:bg-black/80"
                        >
                            Reset Zoom
                        </Button>
                    </div>
                {/if}
            {/if}

            <!-- Action buttons (Set Primary, Delete) - Top Right -->
            {#if !isReadOnly && !hasError}
                <div
                    class="absolute top-4 right-4 flex gap-2 pointer-events-auto z-20"
                >
                    <!-- Set as Primary Button -->
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={async (e) => {
                            e.stopPropagation();
                            const currentIndex = lightboxImageIndex;
                            if (currentIndex !== primaryImageIndex) {
                                primaryImageIndex = currentIndex;
                                await handleSaveField(
                                    "primaryImageIndex",
                                    currentIndex,
                                );
                                toast.success(
                                    "Primary Image Updated",
                                    "This image is now the primary image",
                                );
                            }
                        }}
                        class="bg-black/60 text-white hover:bg-black/80 size-10 sm:size-12 rounded-full {lightboxImageIndex ===
                        primaryImageIndex
                            ? 'bg-primary/80'
                            : ''}"
                        title={lightboxImageIndex === primaryImageIndex
                            ? "This is the primary image"
                            : "Set as primary image"}
                    >
                        {#if lightboxImageIndex === primaryImageIndex}
                            <svg
                                class="size-5 sm:size-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        {:else}
                            <Star class="size-5 sm:size-6" />
                        {/if}
                    </Button>

                    <!-- Delete Button -->
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={async (e) => {
                            e.stopPropagation();
                            const currentIndex = lightboxImageIndex;

                            // Confirm deletion
                            if (
                                !confirm(
                                    "Are you sure you want to delete this image?",
                                )
                            ) {
                                return;
                            }

                            // Adjust primary index if deleting the primary image
                            if (
                                primaryImageIndex === currentIndex &&
                                imagesValue.length > 1
                            ) {
                                // Set to previous image, or next if it was the first
                                if (currentIndex === 0) {
                                    primaryImageIndex = 0; // Stay at 0, which will now be the next image
                                } else {
                                    primaryImageIndex = currentIndex - 1;
                                }
                            } else if (primaryImageIndex > currentIndex) {
                                // Adjust primary index if deleting an image before it
                                primaryImageIndex--;
                            }

                            // Remove from error set if present
                            const newErrors = new Set(imageErrors);
                            newErrors.delete(currentIndex);
                            // Adjust error indices for items after the deleted one
                            const adjustedErrors = new Set<number>();
                            newErrors.forEach((errorIndex) => {
                                if (errorIndex > currentIndex) {
                                    adjustedErrors.add(errorIndex - 1);
                                } else if (errorIndex < currentIndex) {
                                    adjustedErrors.add(errorIndex);
                                }
                            });
                            imageErrors = adjustedErrors;

                            const newImages = imagesValue.filter(
                                (_, i) => i !== currentIndex,
                            );

                            // Update lightbox index if needed
                            if (lightboxImageIndex >= newImages.length) {
                                lightboxImageIndex = Math.max(
                                    0,
                                    newImages.length - 1,
                                );
                            }

                            if (currentMode() === "create") {
                                newIdea.images = newImages;
                                imagesValue = newImages;
                            } else if (idea) {
                                idea.images = newImages;
                                imagesValue = newImages;
                                await handleSaveField("images", newImages);
                                if (primaryImageIndex !== currentIndex) {
                                    await handleSaveField(
                                        "primaryImageIndex",
                                        primaryImageIndex,
                                    );
                                }
                            }

                            // Close lightbox if no images left
                            if (newImages.length === 0) {
                                lightboxOpen = false;
                            }

                            toast.success(
                                "Image Deleted",
                                "The image has been removed",
                            );
                        }}
                        class="bg-black/60 text-white hover:bg-red-600/80 size-10 sm:size-12 rounded-full"
                        title="Delete image"
                    >
                        <Trash2 class="size-5 sm:size-6" />
                    </Button>
                </div>
            {/if}
        {/if}
    </div>
</Dialog>

<!-- Keyboard navigation (desktop) - must be outside Dialog -->
<svelte:window
    onkeydown={(e) => {
        if (!lightboxOpen) return;
        if (e.key === "ArrowLeft" && lightboxImageIndex > 0) {
            lightboxImageIndex--;
        } else if (
            e.key === "ArrowRight" &&
            lightboxImageIndex < imagesValue.length - 1
        ) {
            lightboxImageIndex++;
        } else if (e.key === "Escape") {
            lightboxOpen = false;
        }
    }}
/>
