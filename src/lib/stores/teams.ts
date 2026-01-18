import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { teamService, type Team, type TeamRole } from '$lib/api/services/teamService'
import { supabase } from '$lib/supabase'

type TeamsState = {
  items: Team[]
  current: Team | null
  currentUserRole: TeamRole | null
  loading: boolean
  error: string | null
}

const CURRENT_TEAM_STORAGE_KEY = 'cosplans_current_team_id'

const initialState: TeamsState = {
  items: [],
  current: null,
  currentUserRole: null,
  loading: false,
  error: null,
}

function createTeamsStore() {
  const { subscribe, set, update } = writable<TeamsState>(initialState)

  return {
    subscribe,
    get: (): TeamsState => {
      let value: TeamsState = initialState
      const unsub = subscribe((v) => (value = v))
      unsub()
      return value
    },
    async load(userId?: string) {
      update((s) => ({ ...s, loading: true, error: null }))
      try {
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser()
        }
        const items = await teamService.list(userId)
        let current: Team | null = items[0] ?? null
        if (browser) {
          const storedId = localStorage.getItem(CURRENT_TEAM_STORAGE_KEY)
          const storedTeam = storedId ? items.find((team) => team.id === storedId) : null
          if (storedTeam) {
            current = storedTeam
          }
        }
        
        // Load user role for current team
        let currentUserRole: TeamRole | null = null
        if (current) {
          currentUserRole = await teamService.getUserRole(current.id)
        }
        
        set({ items, current, currentUserRole, loading: false, error: null })
      } catch (e: any) {
        update((s) => ({ ...s, loading: false, error: e?.message || 'Failed to load teams' }))
      }
    },
    async setCurrent(teamId: string) {
      update((s) => {
        const team = s.items.find((t) => t.id === teamId)
        return {
          ...s,
          current: team || s.current,
        }
      })

       if (browser) {
         try {
           localStorage.setItem(CURRENT_TEAM_STORAGE_KEY, teamId)
         } catch (error) {
           console.warn('Failed to persist current team id', error)
         }
       }
      
      // Load user role for the team
      const role = await teamService.getUserRole(teamId)
      update((s) => ({
        ...s,
        currentUserRole: role,
      }))
    },
    setCurrentUserRole(role: TeamRole | null) {
      update((s) => ({
        ...s,
        currentUserRole: role,
      }))
    },
    reset() {
      set(initialState)
    },
  }
}

export const teams = createTeamsStore()

// Derived store for current team
export const currentTeam = {
  subscribe: (fn: (value: Team | null) => void) => {
    return teams.subscribe((state) => {
      fn(state.current)
    })
  },
  get: (): Team | null => {
    return teams.get().current
  },
  // Wait for teams to load if they're currently loading
  async waitForLoad(): Promise<Team | null> {
    const state = teams.get()
    // If already loaded and has a current team, return it
    if (!state.loading && state.current) {
      return state.current
    }
    // If not loading but no current team, teams might not be loaded yet
    if (!state.loading && state.items.length === 0) {
      // Try to get user from auth and load teams
      const { supabase } = await import('$lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await teams.load(user.id)
        return teams.get().current
      }
    }
    // Wait for loading to complete
    return new Promise((resolve) => {
      let unsubscribe: (() => void) | null = null
      unsubscribe = teams.subscribe((state) => {
        if (!state.loading && unsubscribe) {
          unsubscribe()
          resolve(state.current)
        }
      })
      // Timeout after 5 seconds
      setTimeout(() => {
        if (unsubscribe) {
          unsubscribe()
        }
        resolve(teams.get().current)
      }, 5000)
    })
  },
}

// Derived store for current user role
export const currentUserRole = {
  subscribe: (fn: (value: TeamRole | null) => void) => {
    return teams.subscribe((state) => {
      fn(state.currentUserRole)
    })
  },
  get: (): TeamRole | null => {
    return teams.get().currentUserRole
  },
}
