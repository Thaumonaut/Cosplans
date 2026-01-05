<script lang="ts">
  /**
   * Inline Resource Selector Component
   * Feature: 004-bugfix-testing - T039
   * Purpose: Inline resource selection for task linking
   */
  import { cn } from '$lib/utils'
  import { onMount } from 'svelte'
  import { resourceService } from '$lib/api/services/resourceService'
  import type { Resource } from '$lib/types/domain/resource'

  interface Props {
    value?: string | null // Resource ID
    editable?: boolean
    onSave?: (resourceId: string | null) => Promise<void> | void
    placeholder?: string
    className?: string
    allowUnlink?: boolean
  }

  let {
    value = $bindable(null),
    editable = true,
    onSave,
    placeholder = 'Link to resource...',
    className = '',
    allowUnlink = true,
  }: Props = $props()

  let isOpen = $state(false)
  let isSaving = $state(false)
  let isLoading = $state(false)
  let searchQuery = $state('')
  let resources = $state<Resource[]>([])
  let dropdownElement: HTMLDivElement | null = $state(null)

  // Get selected resource
  let selectedResource = $derived(() => {
    if (!value) return null
    return resources.find(r => r.id === value) || null
  })

  // Filter resources by search query
  let filteredResources = $derived(() => {
    if (!searchQuery) return resources
    const query = searchQuery.toLowerCase()
    return resources.filter(r =>
      r.name.toLowerCase().includes(query) ||
      (r.description && r.description.toLowerCase().includes(query)) ||
      r.tags.some(tag => tag.toLowerCase().includes(query))
    )
  })

  // Get category badge color
  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'prop': 'bg-purple-100 text-purple-700',
      'fabric': 'bg-pink-100 text-pink-700',
      'wig': 'bg-amber-100 text-amber-700',
      'pattern': 'bg-blue-100 text-blue-700',
      'costume-piece': 'bg-green-100 text-green-700',
      'accessory': 'bg-indigo-100 text-indigo-700',
      'material': 'bg-gray-100 text-gray-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  // Load resources when dropdown opens
  async function loadResources() {
    if (resources.length > 0) return // Already loaded

    isLoading = true
    try {
      resources = await resourceService.list()
    } catch (err) {
      console.error('Failed to load resources:', err)
    } finally {
      isLoading = false
    }
  }

  async function selectResource(resourceId: string | null) {
    if (!editable) return

    const previousValue = value
    value = resourceId
    isOpen = false
    searchQuery = ''

    if (onSave && value !== previousValue) {
      isSaving = true
      try {
        await onSave(value)
      } catch (err) {
        value = previousValue
        console.error('Failed to save resource selection:', err)
      } finally {
        isSaving = false
      }
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false
      searchQuery = ''
    }
  }

  function handleOpen() {
    if (editable) {
      isOpen = !isOpen
      if (isOpen) {
        loadResources()
      }
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  })
</script>

<div class={cn('relative inline-block', className)} bind:this={dropdownElement}>
  <!-- Trigger Button -->
  <button
    type="button"
    onclick={handleOpen}
    disabled={!editable || isSaving}
    class={cn(
      'inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors',
      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
      !editable && 'cursor-not-allowed opacity-60',
      isSaving && 'cursor-wait opacity-70'
    )}
  >
    {#if selectedResource()}
      <!-- Selected Resource -->
      <svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <span class="font-medium truncate max-w-[200px]">
        {selectedResource().name}
      </span>
      {#if selectedResource().metadata?.category}
        <span class={cn('px-1.5 py-0.5 text-xs rounded', getCategoryColor(selectedResource().metadata.category))}>
          {selectedResource().metadata.category}
        </span>
      {/if}
    {:else}
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <span class="text-gray-500">{placeholder}</span>
    {/if}

    {#if isSaving || isLoading}
      <svg class="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {:else}
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    {/if}
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div class="absolute left-0 z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
      <!-- Search Input -->
      <div class="border-b border-gray-200 p-2">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search resources..."
          class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <!-- Resource List -->
      <div class="max-h-60 overflow-y-auto p-1">
        {#if allowUnlink}
          <button
            type="button"
            onclick={() => selectResource(null)}
            class={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
              'hover:bg-gray-100',
              !value && 'bg-blue-50 text-blue-700'
            )}
          >
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
              <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span class="text-gray-600">No resource</span>
          </button>
        {/if}

        {#each filteredResources() as resource (resource.id)}
          <button
            type="button"
            onclick={() => selectResource(resource.id)}
            class={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
              'hover:bg-gray-100',
              value === resource.id && 'bg-blue-50 text-blue-700'
            )}
          >
            <svg class="h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div class="flex-1 truncate">
              <div class="font-medium">{resource.name}</div>
              {#if resource.metadata?.category}
                <div class="flex items-center gap-1 mt-0.5">
                  <span class={cn('px-1.5 py-0.5 text-xs rounded', getCategoryColor(resource.metadata.category))}>
                    {resource.metadata.category}
                  </span>
                  {#if resource.tags.length > 0}
                    <span class="text-xs text-gray-400">• {resource.tags.slice(0, 2).join(', ')}</span>
                  {/if}
                </div>
              {/if}
            </div>
            {#if value === resource.id}
              <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        {:else}
          <div class="px-3 py-4 text-center text-sm text-gray-500">
            {#if isLoading}
              Loading resources...
            {:else}
              No resources found
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
