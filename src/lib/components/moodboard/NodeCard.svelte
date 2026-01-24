<script lang="ts">
  /**
   * Node Card Component
   * Feature: 006-brainstorming-moodboard
   * Task: T-006
   *
   * Displays a single moodboard node in gallery/list view.
   * Supports viewing, editing, and deleting nodes.
   */
  import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
  import {
    MoreVertical,
    Edit,
    Trash2,
    FolderOpen,
    ExternalLink,
    Image,
    Link,
    FileText,
    Users,
    Palette,
    Scissors,
    Folder,
  } from "lucide-svelte";
  import type {
    MoodboardNode,
    ContainerType,
  } from "$lib/types/domain/moodboard";
  import { isSocialMediaMetadata } from "$lib/types/domain/moodboard";

  interface Props {
    node: MoodboardNode;
    onDrillIn?: (nodeId: string) => void;
    onEdit?: (node: MoodboardNode) => void;
    onDelete?: (node: MoodboardNode) => void;
    onMoveToContainer?: (nodeId: string, containerId: string) => void;
    variant?: "gallery" | "list";
  }

  let {
    node,
    onDrillIn,
    onEdit,
    onDelete,
    onMoveToContainer,
    variant = "gallery",
  }: Props = $props();

  let dropdownOpen = $state(false);
  let isDragOver = $state(false);

  // Get icon for node type
  function getNodeIcon(n: MoodboardNode) {
    if (n.nodeType === "container") {
      switch (n.containerType) {
        case "character":
          return Users;
        case "option":
          return Palette;
        case "prop":
          return Scissors;
        default:
          return Folder;
      }
    }
    switch (n.nodeType) {
      case "image":
        return Image;
      case "link":
      case "social_media":
        return Link;
      case "note":
        return FileText;
      default:
        return FileText;
    }
  }

  // Get emoji for node type (for gallery thumbnails)
  function getNodeEmoji(n: MoodboardNode): string {
    if (n.nodeType === "container") {
      switch (n.containerType) {
        case "character":
          return "👤";
        case "option":
          return "🎭";
        case "prop":
          return "🔧";
        default:
          return "📁";
      }
    }
    switch (n.nodeType) {
      case "image":
        return "🖼️";
      case "social_media":
        return "📱";
      case "link":
        return "🔗";
      case "note":
        return "📝";
      case "budget_item":
        return "💰";
      case "color_palette":
        return "🎨";
      case "fabric":
        return "🧵";
      case "contact":
        return "👤";
      default:
        return "📄";
    }
  }

  // Get display title
  function getDisplayTitle(n: MoodboardNode): string {
    if (n.title) return n.title;
    if (n.shortComment) return n.shortComment;
    if (n.nodeType === "container" && n.containerType) {
      return n.containerType.charAt(0).toUpperCase() + n.containerType.slice(1);
    }
    if (n.nodeType === "social_media" && isSocialMediaMetadata(n.metadata)) {
      return `${n.metadata.platform} post`;
    }
    return n.nodeType;
  }

  // Check if node is a container (can be drilled into)
  const isContainer = $derived(
    node.nodeType === "container" || node.nodeType === "moodboard_link",
  );

  function handleClick() {
    if (isContainer && onDrillIn) {
      onDrillIn(node.id);
    }
  }

  function handleEdit(e: Event) {
    e.stopPropagation();
    dropdownOpen = false;
    onEdit?.(node);
  }

  function handleDelete(e: Event) {
    e.stopPropagation();
    dropdownOpen = false;
    onDelete?.(node);
  }

  function handleExternalLink(e: Event) {
    e.stopPropagation();
    if (node.contentUrl) {
      window.open(node.contentUrl, "_blank", "noopener,noreferrer");
    }
  }

  // Drag and drop handlers
  function handleDragStart(e: DragEvent) {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        nodeId: node.id,
        nodeType: node.nodeType,
        isContainer: isContainer,
      }),
    );
  }

  function handleDragOver(e: DragEvent) {
    if (!isContainer || !e.dataTransfer) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    if (!isContainer || !e.dataTransfer) return;
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.nodeId && data.nodeId !== node.id && !data.isContainer) {
        onMoveToContainer?.(data.nodeId, node.id);
      }
    } catch (error) {
      console.error("Failed to parse drop data:", error);
    }
  }
</script>

{#if variant === "gallery"}
  <div
    class="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group"
    class:cursor-pointer={isContainer}
    class:border-primary-500={isDragOver}
    class:ring-2={isDragOver}
    class:ring-primary-200={isDragOver}
    class:dark:ring-primary-700={isDragOver}
    draggable={true}
    ondragstart={handleDragStart}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={handleClick}
    role={isContainer ? "button" : undefined}
    onkeydown={(e) => e.key === "Enter" && isContainer && handleClick()}
  >
    <!-- Thumbnail -->
    <div
      class="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative"
    >
      {#if node.thumbnailUrl}
        <img
          src={node.thumbnailUrl}
          alt={getDisplayTitle(node)}
          class="w-full h-full object-cover"
          onerror={(e) => (e.currentTarget.style.display = "none")}
        />
      {:else}
        <span class="text-3xl">{getNodeEmoji(node)}</span>
      {/if}

      <!-- Container indicator -->
      {#if isContainer}
        <div
          class="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
        >
          <FolderOpen class="w-3 h-3" />
          Open
        </div>
      {/if}

      <!-- External link button for URLs -->
      {#if node.contentUrl && !isContainer}
        <button
          onclick={handleExternalLink}
          class="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Open link"
        >
          <ExternalLink class="w-4 h-4" />
        </button>
      {/if}
    </div>

    <!-- Info -->
    <div class="p-3">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900 dark:text-white truncate">
            {getDisplayTitle(node)}
          </h3>
          {#if node.shortComment && node.title}
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {node.shortComment}
            </p>
          {/if}
        </div>

        <!-- Actions dropdown -->
        <div class="flex-shrink-0">
          <Button
            size="xs"
            color="alternative"
            class="!p-1.5"
            onclick={(e) => {
              e.stopPropagation();
              dropdownOpen = !dropdownOpen;
            }}
          >
            <MoreVertical class="w-4 h-4" />
          </Button>
          <Dropdown bind:open={dropdownOpen} class="w-36">
            {#if onEdit}
              <DropdownItem onclick={handleEdit}>
                <Edit class="w-4 h-4 mr-2" />
                Edit
              </DropdownItem>
            {/if}
            {#if node.contentUrl}
              <DropdownItem onclick={handleExternalLink}>
                <ExternalLink class="w-4 h-4 mr-2" />
                Open Link
              </DropdownItem>
            {/if}
            {#if onDelete}
              <DropdownItem
                onclick={handleDelete}
                class="text-red-600 dark:text-red-400"
              >
                <Trash2 class="w-4 h-4 mr-2" />
                Delete
              </DropdownItem>
            {/if}
          </Dropdown>
        </div>
      </div>

      <!-- Tags -->
      {#if node.tags.length > 0}
        <div class="flex flex-wrap gap-1 mt-2">
          {#each node.tags.slice(0, 3) as tag}
            <span
              class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
            >
              {tag}
            </span>
          {/each}
          {#if node.tags.length > 3}
            <span class="text-xs text-gray-400">+{node.tags.length - 3}</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <!-- List variant -->
  <tr
    class="hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
    class:cursor-pointer={isContainer}
    onclick={handleClick}
  >
    <td class="px-4 py-3 whitespace-nowrap">
      <span class="text-lg">{getNodeEmoji(node)}</span>
    </td>
    <td class="px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="text-gray-900 dark:text-white">
          {getDisplayTitle(node)}
        </span>
        {#if isContainer}
          <span class="text-gray-400">→</span>
        {/if}
        {#if node.contentUrl && !isContainer}
          <button
            onclick={handleExternalLink}
            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Open link"
          >
            <ExternalLink class="w-3 h-3" />
          </button>
        {/if}
      </div>
      {#if node.shortComment && node.title}
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
          {node.shortComment}
        </p>
      {/if}
    </td>
    <td class="px-4 py-3">
      <div class="flex flex-wrap gap-1">
        {#each node.tags.slice(0, 3) as tag}
          <span
            class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
          >
            {tag}
          </span>
        {/each}
        {#if node.tags.length > 3}
          <span class="text-xs text-gray-400">+{node.tags.length - 3}</span>
        {/if}
      </div>
    </td>
    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
      {new Date(node.createdAt).toLocaleDateString()}
    </td>
    <td class="px-4 py-3">
      <div
        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {#if onEdit}
          <button
            onclick={handleEdit}
            class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Edit"
          >
            <Edit class="w-4 h-4" />
          </button>
        {/if}
        {#if onDelete}
          <button
            onclick={handleDelete}
            class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Delete"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        {/if}
      </div>
    </td>
  </tr>
{/if}
