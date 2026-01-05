import { supabase } from '$lib/supabase'
import type { Project, ProjectCreate, ProjectUpdate } from '$lib/types/domain/project'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'
import { reliableQuery } from '$lib/api/reliable-loader'

export const projectService = {
  /**
   * List all projects for the current team
   */
  async list(filters?: { status?: string }): Promise<Project[]> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    const queryFn = async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .eq('team_id', team.id)
        .order('updated_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      return await query
    }

    const result = await reliableQuery(queryFn, { maxRetries: 3, timeout: 30000 })

    if (result.error) throw result.error
    return (result.data || []).map(mapProjectFromDb)
  },

  /**
   * Get a single project by ID
   */
  async get(id: string): Promise<Project | null> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return mapProjectFromDb(data)
  },

  /**
   * Create a new project
   */
  async create(project: ProjectCreate): Promise<Project> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    // Map camelCase to snake_case for database
    const insertData: Record<string, unknown> = {
      team_id: team.id,
      character: project.character,
      series: project.series || null,
      status: project.status || 'planning',
      progress: 0,
      spent_budget: 0,
    }

    // Only include optional fields if they have values
    if (project.fromIdeaId !== undefined && project.fromIdeaId !== null) {
      insertData.from_idea_id = project.fromIdeaId
    }
    if (project.estimatedBudget !== undefined && project.estimatedBudget !== null) {
      insertData.estimated_budget = project.estimatedBudget
    }
    if (project.deadline !== undefined && project.deadline !== null) {
      insertData.deadline = project.deadline
    }
    if (project.description !== undefined && project.description !== null) {
      insertData.description = project.description
    }
    if (project.notes !== undefined && project.notes !== null) {
      insertData.notes = project.notes
    }
    if (project.coverImage !== undefined && project.coverImage !== null) {
      insertData.cover_image = project.coverImage
    }
    if (project.referenceImages !== undefined && project.referenceImages !== null) {
      insertData.reference_images = project.referenceImages
    }
    if (project.tags !== undefined && project.tags !== null) {
      insertData.tags = project.tags
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error
    return mapProjectFromDb(data)
  },

  /**
   * Update an existing project
   */
  async update(id: string, updates: ProjectUpdate): Promise<Project> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    // Map camelCase to snake_case for database
    const updateData: Record<string, unknown> = {}

    if (updates.character !== undefined) updateData.character = updates.character
    if (updates.series !== undefined) updateData.series = updates.series || null
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.progress !== undefined) updateData.progress = updates.progress
    if (updates.estimatedBudget !== undefined) updateData.estimated_budget = updates.estimatedBudget
    if (updates.spentBudget !== undefined) updateData.spent_budget = updates.spentBudget
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline
    if (updates.description !== undefined) updateData.description = updates.description || null
    if (updates.notes !== undefined) updateData.notes = updates.notes || null
    if (updates.coverImage !== undefined) updateData.cover_image = updates.coverImage || null
    if (updates.referenceImages !== undefined) updateData.reference_images = updates.referenceImages
    if (updates.tags !== undefined) updateData.tags = updates.tags

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('team_id', team.id)
      .select()
      .single()

    if (error) {
      // Provide helpful error message for schema cache issues
      if (error.message?.includes('schema cache') || error.code === 'PGRST204' || error.code === 'PGRST205') {
        throw new Error(
          `Failed to update project: ${error.message}. ` +
          `This is a PostgREST schema cache issue. Please try refreshing the page and updating again.`
        )
      }
      throw error
    }

    return mapProjectFromDb(data)
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('team_id', team.id)

    if (error) throw error
  },

  /**
   * Link a resource to a project with quantity and status
   */
  async linkResource(
    projectId: string,
    resourceId: string,
    quantity: number = 1,
    status: 'needed' | 'acquired' | 'in-progress' | 'completed' = 'needed'
  ): Promise<void> {
    // Try using RPC function first (bypasses schema cache issues)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('link_resource_safe', {
        p_project_id: projectId,
        p_resource_id: resourceId,
        p_quantity: quantity,
        p_status: status,
      } as any)

      if (!rpcError) {
        // Success - function exists and worked
        return
      }
      
      // If RPC fails due to function not existing (404 or function error code), fall through to direct insert
      const isFunctionNotFound = 
        rpcError.message?.includes('function') || 
        rpcError.code?.includes('42883') ||
        (rpcError as any).status === 404 ||
        rpcError.message?.includes('does not exist')
      
      if (isFunctionNotFound) {
        console.warn('[ProjectService] link_resource_safe function not found, trying direct insert')
        // Fall through to direct insert
      } else {
        // Function exists but returned an error (permission, validation, etc.)
        console.error('[ProjectService] link_resource_safe error:', rpcError)
        throw new Error(rpcError.message || 'Failed to link resource: ' + JSON.stringify(rpcError))
      }
    } catch (rpcErr: any) {
      // If it's not a "function doesn't exist" error, throw it
      const isFunctionNotFound = 
        rpcErr?.message?.includes('function') || 
        rpcErr?.code?.includes('42883') ||
        rpcErr?.status === 404 ||
        rpcErr?.message?.includes('does not exist')
      
      if (!isFunctionNotFound) {
        console.error('[ProjectService] link_resource_safe exception:', rpcErr)
        throw rpcErr
      }
      // Otherwise, continue to direct insert fallback
      console.warn('[ProjectService] link_resource_safe function not available, using direct insert')
    }

    // Fallback: Direct insert (for when RPC function doesn't exist)
    try {
      const { data, error } = await supabase.from('project_resources').insert({
        project_id: projectId,
        resource_id: resourceId,
        quantity,
        status,
      } as any).select()

      if (error) {
        console.error('[ProjectService] Direct insert error:', error)
        
        // Table doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || (error as any).status === 404) {
          throw new Error(
            'Cannot link resource: project_resources table does not exist. ' +
            'Please run migration 20250000000007_join_tables.sql in your Supabase SQL Editor.'
          )
        }
        
        // Schema cache issue
        if (error.message?.includes('schema cache') || error.code === 'PGRST205' || error.code === 'PGRST204') {
          throw new Error(
            'Cannot link resource: project_resources table not available (schema cache issue). ' +
            'Please run: NOTIFY pgrst, \'reload schema\'; in SQL Editor and wait 5-10 minutes, ' +
            'or use link_resource_safe function by running migration 20251101150000_create_link_resource_safe.sql'
          )
        }
        
        // Permission errors
        if (error.code === '42501' || error.message?.includes('permission')) {
          throw new Error(
            'Permission denied: You must be an owner or editor to link resources. ' +
            'Ensure your team membership has status=\'active\'.'
          )
        }
        
        throw new Error(error.message || 'Failed to link resource: ' + JSON.stringify(error))
      }
      
      console.log('[ProjectService] Resource linked successfully via direct insert')
    } catch (err: any) {
      console.error('[ProjectService] Link resource failed:', err)
      throw err
    }
  },

  /**
   * Unlink a resource from a project
   */
  async unlinkResource(projectId: string, resourceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_resources')
        .delete()
        .eq('project_id', projectId)
        .eq('resource_id', resourceId)

      if (error) {
        // If schema cache error, provide helpful message
        if (error.message?.includes('schema cache') || error.code === 'PGRST205') {
          throw new Error(
            'Cannot unlink resource: project_resources table is not available. ' +
            'This is a schema cache issue. Please refresh the Supabase schema cache or try again later.'
          )
        }
        throw error
      }
    } catch (err: any) {
      // If it's a schema cache error, throw a user-friendly message
      if (err?.message?.includes('schema cache') || err?.code === 'PGRST205') {
        throw new Error(
          'Cannot unlink resource: project_resources table is not available. ' +
          'Please try again later or contact support.'
        )
      }
      throw err
    }
  },

  /**
   * Update resource link (quantity, status, notes)
   */
  async updateResourceLink(
    projectId: string,
    resourceId: string,
    updates: {
      quantity?: number
      status?: 'needed' | 'acquired' | 'in-progress' | 'completed'
      notes?: string
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_resources')
        .update(updates as any)
        .eq('project_id', projectId)
        .eq('resource_id', resourceId)

      if (error) {
        // If schema cache error, provide helpful message
        if (error.message?.includes('schema cache') || error.code === 'PGRST205') {
          throw new Error(
            'Cannot update resource link: project_resources table is not available. ' +
            'This is a schema cache issue. Please refresh the Supabase schema cache or try again later.'
          )
        }
        throw error
      }
    } catch (err: any) {
      // If it's a schema cache error, throw a user-friendly message
      if (err?.message?.includes('schema cache') || err?.code === 'PGRST205') {
        throw new Error(
          'Cannot update resource link: project_resources table is not available. ' +
          'Please try again later or contact support.'
        )
      }
      throw err
    }
  },

  /**
   * Get all resources linked to a project
   * Falls back gracefully if project_resources table isn't in schema cache
   */
  async getLinkedResources(projectId: string): Promise<any[]> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    try {
      const { data, error } = await supabase
        .from('project_resources')
        .select(`
          *,
          resource:resources (*)
        `)
        .eq('project_id', projectId)

      if (error) {
        // If schema cache error, return empty array with warning
        if (error.message?.includes('schema cache') || error.code === 'PGRST205') {
          console.warn('[ProjectService] project_resources table not in schema cache, returning empty list')
          return []
        }
        throw error
      }
      return data || []
    } catch (err: any) {
      // If query fails for any reason related to schema cache, return empty array
      if (err?.message?.includes('schema cache') || err?.code === 'PGRST205') {
        console.warn('[ProjectService] Failed to fetch project_resources due to schema cache, returning empty list')
        return []
      }
      // Re-throw other errors
      throw err
    }
  },

  /**
   * Calculate project progress using the PostgreSQL function
   * Falls back to client-side calculation if RPC fails due to schema cache issues
   */
  async calculateProgress(projectId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_project_progress', {
        project_uuid: projectId,
      } as any)

      if (!error && data !== null && data !== undefined) {
        return data as number
      }

      // If error is 404 or function not found, fall back to client-side calculation
      if (error) {
        const isFunctionNotFound = 
          (error as any)?.status === 404 ||
          error?.message?.includes('function') ||
          error?.message?.includes('does not exist') ||
          error?.code?.includes('42883') ||
          error?.message?.includes('schema cache') ||
          error?.code === 'PGRST204'
        
        if (isFunctionNotFound) {
          console.warn('[ProjectService] RPC calculate_project_progress not available, using fallback calculation')
        } else {
          // Other errors - try fallback but log the error
          console.warn('[ProjectService] calculate_project_progress RPC error, using fallback:', error.message)
        }
      }
    } catch (rpcError: any) {
      // If RPC fails due to schema cache or function not found, fall back to client-side calculation
      const isFunctionNotFound = 
        rpcError?.status === 404 ||
        rpcError?.message?.includes('function') ||
        rpcError?.message?.includes('does not exist') ||
        rpcError?.code?.includes('42883') ||
        rpcError?.message?.includes('schema cache') ||
        rpcError?.code === 'PGRST204'
      
      if (isFunctionNotFound) {
        console.warn('[ProjectService] RPC calculate_project_progress not available, using fallback calculation')
      } else {
        // Other unexpected errors - still try fallback but log
        console.warn('[ProjectService] calculate_project_progress exception, using fallback:', rpcError?.message)
      }
    }

    // Fallback: calculate progress client-side
    try {
      // Get project tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('completed, resource_id')
        .eq('project_id', projectId)

      if (tasksError) throw tasksError

      // Calculate task completion (tasks without resource_id)
      const projectTasks = (tasks || []).filter(t => !t.resource_id)
      const taskProgress = projectTasks.length > 0
        ? Math.round((projectTasks.filter(t => t.completed).length / projectTasks.length) * 100)
        : 0

      // Get linked resources - handle schema cache errors gracefully
      let resources: any[] = []
      let resourceCount = 0
      try {
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('project_resources')
          .select('status, resource_id')
          .eq('project_id', projectId)

        if (resourcesError) {
          // If schema cache error, log warning and skip resource progress
          if (resourcesError.message?.includes('schema cache') || resourcesError.code === 'PGRST205') {
            console.warn('[ProjectService] project_resources table not in schema cache, using task-only progress')
            return taskProgress
          }
          throw resourcesError
        }

        resources = resourcesData || []
        resourceCount = resources.length
      } catch (resourceQueryError: any) {
        // If query fails for any reason (schema cache or other), fall back to task-only progress
        console.warn('[ProjectService] Failed to fetch project_resources, using task-only progress:', resourceQueryError?.message)
        return taskProgress
      }

      if (resourceCount === 0) {
        return taskProgress
      }

      // Calculate resource progress
      let resourceProgress = 0
      for (const resource of resources) {
        const statusProgress = {
          'needed': 0,
          'acquired': 25,
          'in-progress': 50,
          'completed': 100,
        }[resource.status as keyof typeof statusProgress] || 0

        // Get tasks for this resource
        const resourceTasks = (tasks || []).filter(t => t.resource_id === resource.resource_id)
        const resourceTaskProgress = resourceTasks.length > 0
          ? (resourceTasks.filter(t => t.completed).length / resourceTasks.length) * 100
          : 0

        resourceProgress += (statusProgress + resourceTaskProgress) / 2
      }

      resourceProgress = resourceProgress / resourceCount

      // Hybrid calculation
      if (projectTasks.length === 0) {
        return Math.round(resourceProgress)
      }

      return Math.round((taskProgress + resourceProgress) / 2)
    } catch (fallbackError: any) {
      console.error('[ProjectService] Fallback progress calculation failed:', fallbackError)
      // Return 0 as last resort
      return 0
    }
  },

  /**
   * Convert a project back to an idea
   * This deletes the project and creates a new idea with the project's data
   */
  async convertToIdea(projectId: string): Promise<{ ideaId: string }> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    // Get the project
    const project = await this.get(projectId)
    if (!project) throw new Error('Project not found')

    // Import ideaService here to avoid circular dependencies
    const { ideaService } = await import('./ideaService')

    // Create idea from project data
    const idea = await ideaService.create(team.id, {
      character: project.character,
      series: project.series || undefined,
      description: project.description || undefined,
      difficulty: 'beginner', // Default since we don't store difficulty on projects
      estimatedCost: project.estimatedBudget || undefined,
      images: project.referenceImages || (project.coverImage ? [project.coverImage] : []),
      tags: project.tags || [],
      notes: project.notes || undefined, // Feature: 004-bugfix-testing - T038: Preserve notes when converting back
    })

    // Delete the project after successful conversion
    await this.delete(projectId)

    return {
      ideaId: idea.id,
    }
  },
}

/**
 * Map database row (snake_case) to Project type (camelCase)
 */
function mapProjectFromDb(row: any): Project {
  return {
    id: row.id,
    teamId: row.team_id,
    fromIdeaId: row.from_idea_id ?? undefined,
    character: row.character,
    series: row.series ?? undefined,
    status: row.status,
    progress: row.progress ?? 0,
    estimatedBudget: row.estimated_budget ? Number(row.estimated_budget) : undefined,
    spentBudget: row.spent_budget ? Number(row.spent_budget) : 0,
    deadline: row.deadline ?? undefined,
    description: row.description ?? undefined,
    notes: row.notes ?? undefined,
    coverImage: row.cover_image ?? undefined,
    referenceImages: row.reference_images || [],
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

