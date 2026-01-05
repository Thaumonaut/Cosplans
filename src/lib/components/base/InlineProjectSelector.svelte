<script lang="ts">
  /**
   * Inline Project Selector Component
   * Feature: 004-bugfix-testing - T039
   * Purpose: Inline project selection for task linking
   */
  import { cn } from '$lib/utils'
  import { onMount } from 'svelte'
  import { projectService } from '$lib/api/services/projectService'
  import type { Project } from '$lib/types/domain/project'

  interface Props {
    value?: string | null // Project ID
    editable?: boolean
    onSave?: (projectId: string | null) => Promise<void> | void
    placeholder?: string
    className?: string
    allowUnlink?: boolean
  }

  let {
    value = $bindable(null),
    editable = true,
    onSave,
    placeholder = 'Link to project...',
    className = '',
    allowUnlink = true,
  }: Props = $props()

  let isOpen = $state(false)
  let isSaving = $state(false)
  let isLoading = $state(false)
  let searchQuery = $state('')
  let projects = $state<Project[]>([])
  let dropdownElement: HTMLDivElement | null = $state(null)

  // Get selected project
  let selectedProject = $derived(() => {
    if (!value) return null
    return projects.find(p => p.id === value) || null
  })

  // Filter projects by search query
  let filteredProjects = $derived(() => {
    if (!searchQuery) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(p =>
      (p.character && p.character.toLowerCase().includes(query)) ||
      (p.series && p.series.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    )
  })

  // Load projects when dropdown opens
  async function loadProjects() {
    if (projects.length > 0) return // Already loaded

    isLoading = true
    try {
      projects = await projectService.list()
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      isLoading = false
    }
  }

  async function selectProject(projectId: string | null) {
    if (!editable) return

    const previousValue = value
    value = projectId
    isOpen = false
    searchQuery = ''

    if (onSave && value !== previousValue) {
      isSaving = true
      try {
        await onSave(value)
      } catch (err) {
        value = previousValue
        console.error('Failed to save project selection:', err)
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
        loadProjects()
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
    {#if selectedProject()}
      <!-- Selected Project -->
      <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span class="font-medium truncate max-w-[200px]">
        {selectedProject().character || 'Untitled Project'}
        {#if selectedProject().series}
          <span class="text-gray-500">- {selectedProject().series}</span>
        {/if}
      </span>
    {:else}
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
          placeholder="Search projects..."
          class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <!-- Project List -->
      <div class="max-h-60 overflow-y-auto p-1">
        {#if allowUnlink}
          <button
            type="button"
            onclick={() => selectProject(null)}
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
            <span class="text-gray-600">No project</span>
          </button>
        {/if}

        {#each filteredProjects() as project (project.id)}
          <button
            type="button"
            onclick={() => selectProject(project.id)}
            class={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
              'hover:bg-gray-100',
              value === project.id && 'bg-blue-50 text-blue-700'
            )}
          >
            <svg class="h-5 w-5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="flex-1 truncate">
              <div class="font-medium">
                {project.character || 'Untitled Project'}
              </div>
              {#if project.series}
                <div class="text-xs text-gray-500">{project.series}</div>
              {/if}
            </div>
            {#if value === project.id}
              <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        {:else}
          <div class="px-3 py-4 text-center text-sm text-gray-500">
            {#if isLoading}
              Loading projects...
            {:else}
              No projects found
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
