import { supabase } from '$lib/supabase'
import type { Idea, IdeaCreate, IdeaUpdate } from '$lib/types/domain/idea'
import { generateIdeaTitle } from '$lib/types/domain/idea'
import { reliableQuery } from '$lib/api/reliable-loader'

export const ideaService = {
  async list(teamId: string): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapIdeaFromDb)
  },

  async get(id: string): Promise<Idea | null> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data ? mapIdeaFromDb(data) : null
  },

  async create(teamId: string, idea: IdeaCreate): Promise<Idea> {
    // Ensure user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Verify user is a member of the team
    // Try query first, but if it fails due to schema cache, use more permissive check
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .maybeSingle()

    // If query fails or no membership found, check if user is team owner as fallback
    if (membershipError || !membership) {
      // Check if user is the team owner (owner_id column)
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('owner_id')
        .eq('id', teamId)
        .single()

      if (!teamError && teamData && (teamData as any).owner_id === user.id) {
        // User is team owner, allow creation (membership might not be visible due to cache)
        console.warn('Team membership not found, but user is team owner - allowing idea creation')
      } else {
        // Not a member and not the owner
        throw new Error(
          `You must be a member of this team to create ideas. ` +
          `If you just created this team, please refresh the page and try again. ` +
          `Error: ${membershipError?.message || 'Membership not found'}`
        )
      }
    }

    // Generate title if not provided
    const title = idea.title?.trim() || generateIdeaTitle(idea.character, idea.series);

    // Build insert data, handling undefined/null values
    const insertData: Record<string, unknown> = {
      team_id: teamId,
      title: title, // Required: either custom or auto-generated
      character: idea.character || null,
      series: idea.series || null,
      difficulty: idea.difficulty,
      images: idea.images || [],
      tags: idea.tags || [],
      status: 'saved',
    }

    // Only include optional fields if they have values
    if (idea.description !== undefined && idea.description !== null) {
      insertData.description = idea.description
    }
    if (idea.estimatedCost !== undefined && idea.estimatedCost !== null) {
      insertData.estimated_cost = idea.estimatedCost
    }
    if (idea.notes !== undefined && idea.notes !== null) {
      insertData.notes = idea.notes
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Provide more helpful error message for RLS violations
      if (error.code === '42501') {
        throw new Error(
          `Permission denied: You must be a member of this team to create ideas. ` +
          `If you believe this is an error, please refresh the page and try again.`
        )
      }
      throw error
    }
    return mapIdeaFromDb(data)
  },

  async update(id: string, updates: IdeaUpdate): Promise<Idea | null> {
    // Handle title: if not provided or empty, regenerate from character/series
    if (updates.title === null || updates.title === '') {
      // Get current idea to use existing character/series if not being updated
      const current = await this.get(id)
      if (current) {
        const char = updates.character !== undefined ? updates.character : current.character
        const ser = updates.series !== undefined ? updates.series : current.series
        updates.title = generateIdeaTitle(char, ser)
      } else {
        // Fallback if idea not found
        updates.title = generateIdeaTitle(updates.character, updates.series)
      }
    }

    const dbUpdates: Record<string, unknown> = {}
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.character !== undefined) dbUpdates.character = updates.character
    if (updates.series !== undefined) dbUpdates.series = updates.series
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty
    if (updates.estimatedCost !== undefined) dbUpdates.estimated_cost = updates.estimatedCost
    if (updates.images !== undefined) dbUpdates.images = updates.images
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    if (updates.primaryImageIndex !== undefined) dbUpdates.primary_image_index = updates.primaryImageIndex

    const { data, error } = await supabase
      .from('ideas')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data ? mapIdeaFromDb(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async convert(ideaId: string, teamId: string): Promise<{ projectId: string }> {
    // Get the idea first
    const idea = await this.get(ideaId)
    if (!idea) throw new Error('Idea not found')

    // Create project from idea
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        team_id: teamId,
        from_idea_id: ideaId,
        planning_idea_id: ideaId,
        character: idea.character,
        series: idea.series || null,
        description: idea.description || null,
        notes: idea.notes || null, // Feature: 004-bugfix-testing - T038: Persist notes from idea phase
        status: 'planning',
        progress: 0,
        estimated_budget: idea.estimatedCost || null,
        spent_budget: 0,
        cover_image: idea.images[0] || null,
        tags: idea.tags || [],
      })
      .select()
      .single()

    if (projectError) throw projectError

    try {
      const { data: links } = await supabase
        .from('reference_links')
        .select('reference_id')
        .eq('idea_id', ideaId)

      if (links && links.length > 0) {
        const linkRows = links.map((link) => ({
          reference_id: link.reference_id,
          project_id: projectData.id,
        }))

        const { error: linkError } = await supabase
          .from('reference_links')
          .insert(linkRows)

        if (linkError) {
          console.warn('Failed to link references to project after conversion:', linkError?.message || linkError)
        }
      }
    } catch (linkingError: any) {
      console.warn('Failed to copy reference links after conversion:', linkingError?.message || linkingError)
    }

    // Keep the idea so references remain shared with the project.
    // Mark the idea as converted and link it to the new project.
    try {
      const { error: ideaUpdateError } = await supabase
        .from('ideas')
        .update({
          status: 'converted',
          converted_project_id: projectData.id,
        })
        .eq('id', ideaId)

      if (ideaUpdateError) {
        console.warn('Failed to update idea status after conversion:', ideaUpdateError?.message || ideaUpdateError)
      }
    } catch (updateError: any) {
      console.warn('Failed to mark idea as converted after conversion:', updateError?.message || updateError)
    }

    return {
      projectId: projectData.id,
    }
  },
}

function mapIdeaFromDb(row: any): Idea {
  return {
    id: row.id,
    teamId: row.team_id,
    title: row.title || generateIdeaTitle(row.character, row.series), // Required: use DB value or generate fallback
    character: row.character,
    series: row.series,
    description: row.description,
    difficulty: row.difficulty,
    estimatedCost: row.estimated_cost ? Number(row.estimated_cost) : undefined,
    images: row.images || [],
    tags: row.tags || [],
    notes: row.notes,
    status: row.status,
    convertedProjectId: row.converted_project_id,
    primaryImageIndex: row.primary_image_index !== undefined && row.primary_image_index !== null ? Number(row.primary_image_index) : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
