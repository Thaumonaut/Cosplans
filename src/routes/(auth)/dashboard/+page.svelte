<script lang="ts">
  import type { PageData } from './$types';
  import CreationFlyout from "$lib/components/ui/CreationFlyout.svelte";
  import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Checkbox, Progress } from "$lib/components/ui";
  import {
    Plus,
    Bot,
    CheckSquare2,
    FolderPlus,
    Plug,
    Clock,
    Calendar,
    DollarSign,
    FileText,
    Sparkles,
  } from "lucide-svelte";
  import ProjectDetail from "$lib/components/projects/ProjectDetail.svelte";
  import IdeaDetail from "$lib/components/ideas/IdeaDetail.svelte";
  // TODO: TaskDetail archived during modern task UI migration (003-modern-task-ui)
  // Will be replaced with new TaskDetailPanel in Phase 4 (User Story 2)
  // See: .archive/003-modern-task-ui/MIGRATION.md
  // import TaskDetail from "$lib/components/tasks/TaskDetail.svelte";
  import ResourceDetail from "$lib/components/resources/ResourceDetail.svelte";
  import { projectService } from '$lib/api/services/projectService';
  import { photoshootService } from '$lib/api/services/photoshootService';
  import { userService } from '$lib/api/services/userService';
  import { taskService } from '$lib/api/services/taskService';
  import { projects as projectsStore } from '$lib/stores/projects';
  import { ideas } from '$lib/stores/ideas';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Project as DomainProject } from '$lib/types/domain/project';
  import { get } from 'svelte/store';
  import { currentTeam, teams } from '$lib/stores/teams';
  import { user } from '$lib/stores/auth-store';
  import { formatCurrencyFromCents } from '$lib/utils';
  import type { UserProfile } from '$lib/api/services/userService';

  let { data }: { data: PageData } = $props();

  // Dashboard state
  let showNewProjectFlyout = $state(false);
  let showNewIdeaFlyout = $state(false);
  let showProjectDetailFlyout = $state(false);
  let showTaskDetailFlyout = $state(false);
  let showResourceDetailFlyout = $state(false);
  let selectedProjectId = $state<string | null>(null);
  let selectedTaskId = $state<string | null>(null);
  let selectedResourceId = $state<string | null>(null);
  let parentProjectId = $state<string | null>(null);
  let dbProjects: DomainProject[] = $state([]);
  let dbIdeas: import('$lib/types/domain/idea').Idea[] = $state([]);
  let dbPhotoshoots: import('$lib/types/domain/photoshoot').Photoshoot[] = $state([]);
  let userProfile: UserProfile | null = $state(null);
  let loading = $state(false);

  // Watch for resource flyout closing and reopen parent if needed
  $effect(() => {
    if (!showResourceDetailFlyout && parentProjectId && !showProjectDetailFlyout) {
      // Resource flyout just closed, reopen parent
      selectedProjectId = parentProjectId
      showProjectDetailFlyout = true
      parentProjectId = null
      selectedResourceId = null
    }
  });
  
  // Handlers for opening detail flyouts
  function handleProjectClick(projectId: string) {
    selectedProjectId = projectId;
    showProjectDetailFlyout = true;
  }
  
  function handleTaskClick(taskId: string) {
    selectedTaskId = taskId;
    showTaskDetailFlyout = true;
  }
  
  function handleTimelineItemClick(item: typeof timelineItems[0]) {
    if (item.type === 'task' && item.id.startsWith('task-')) {
      const taskId = item.id.replace('task-', '');
      handleTaskClick(taskId);
    } else if (item.type === 'deadline' && item.id.startsWith('deadline-')) {
      const projectId = item.id.replace('deadline-', '');
      handleProjectClick(projectId);
    } else if (item.type === 'event' && item.id.startsWith('photoshoot-')) {
      // Navigate to photoshoot page or open flyout if we add it later
      goto('/photoshoots');
    }
  }

  // Get display name with fallback logic
  const displayName = $derived.by(() => {
    if (!userProfile) return 'Cosplayer';
    // Priority: name -> firstName lastName -> firstName -> email prefix -> 'Cosplayer'
    if (userProfile.name) return userProfile.name;
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile.firstName) return userProfile.firstName;
    if (userProfile.email) {
      const emailPrefix = userProfile.email.split('@')[0];
      if (emailPrefix) return emailPrefix;
    }
    return 'Cosplayer';
  });

  // Format date for greeting: "Mon, Oct 27"
  const currentDate = $derived(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  // Map domain projects to display format
  type DisplayProject = {
    id: string;
    character: string;
    series: string | null | undefined;
    image: string;
    progress: number;
    status: string;
    tasks: { completed: number; total: number };
    deadline?: string;
    budget: { spent: number; total: number };
  };

  const displayProjects = $derived.by((): DisplayProject[] => {
    return dbProjects.map(p => {
      // Format deadline: "Oct 15, 2025"
      let formattedDeadline: string | undefined = undefined;
      if (p.deadline) {
        try {
          const date = new Date(p.deadline);
          formattedDeadline = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
          // If date parsing fails, leave undefined
        }
      }
      
      // Get tasks for this project
      const projectTasks = allTasks.filter((t: any) => t.projectId !== undefined && String(t.projectId) === p.id);
      const tasksCompleted = projectTasks.filter((t: any) => t.completed).length;
      
      return {
        id: p.id,
        character: p.character,
        series: p.series,
        image: p.coverImage || '/placeholder.svg',
        progress: p.progress,
        status: p.status === 'archived' ? 'completed' : p.status,
        tasks: {
          completed: tasksCompleted,
          total: projectTasks.length || 0
        },
        deadline: formattedDeadline,
        budget: {
          spent: (p.spentBudget || 0) / 100, // Convert from cents
          total: (p.estimatedBudget || 0) / 100 // Convert from cents
        }
      };
    });
  });

  let allTasks = $state<any[]>([]);

  // Group tasks by status - using real data from API
  const tasksByStatus = $derived.by(() => {
    const now = new Date();
    
    // Filter out completed tasks for in-progress and to-do
    const activeTasks = allTasks.filter(t => !t.completed);
    
    // In progress: high or medium priority active tasks
    const inProgress = activeTasks
      .filter(t => t.priority === 'high' || t.priority === 'medium')
      .slice(0, 2);
    
    // To do: low priority active tasks
    const toDo = activeTasks
      .filter(t => t.priority === 'low')
      .slice(0, 1);
    
    // Upcoming: tasks with due dates in the future
    const upcoming = activeTasks
      .filter(t => {
        if (!t.dueDate) return false;
        try {
          const dueDate = new Date(t.dueDate);
          return dueDate > now;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 1);
    
    return { inProgress, toDo, upcoming };
  });

  // Get current week days for calendar
  const weekDays = $derived.by(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    return days;
  });

  // Budget overview
  const budgetOverview = $derived.by(() => {
    const totalSpent = displayProjects.reduce((sum, p) => sum + p.budget.spent, 0);
    const totalBudget = displayProjects.reduce((sum, p) => sum + p.budget.total, 0);
    return { totalSpent, totalBudget };
  });

  // Timeline items - derived from real tasks, projects, and photoshoots
  const timelineItems = $derived.by(() => {
    // Combine tasks, projects, and photoshoots for timeline
    const items: Array<{
      id: string;
      title: string;
      project: string;
      date: string;
      priority: 'high' | 'medium' | 'low';
      completed?: boolean;
      type: 'task' | 'deadline' | 'event';
    }> = [];
    
    // Add completed tasks
    allTasks.filter((t: any) => t.completed).slice(0, 3).forEach((task: any) => {
      const dueDate = task.dueDate as string | Date | null | undefined;
      if (dueDate) {
        try {
          const dateStr = typeof dueDate === 'string' 
            ? dueDate.split('T')[0] 
            : (dueDate instanceof Date ? dueDate.toISOString().split('T')[0] : '');
          if (dateStr) {
            const date = new Date(dateStr);
            items.push({
              id: `task-${task.id}`,
              title: task.title,
              project: displayProjects.find(p => p.id === String(task.projectId))?.character || 'Unknown',
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              priority: task.priority,
              completed: true,
              type: 'task'
            });
          }
        } catch {
          // Skip invalid dates
        }
      }
    });
    
    // Add upcoming deadlines
    displayProjects.filter(p => p.deadline).slice(0, 2).forEach(project => {
      items.push({
        id: `deadline-${project.id}`,
        title: `${project.character} Deadline`,
        project: project.character,
        date: project.deadline?.split(',')[0] || '',
        priority: 'high',
        type: 'deadline'
      });
    });
    
    // Add upcoming photoshoots
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dbPhotoshoots
      .filter(p => p.date && new Date(p.date) >= today)
      .slice(0, 2)
      .forEach(photoshoot => {
        const photoshootDate = new Date(photoshoot.date!);
        items.push({
          id: `photoshoot-${photoshoot.id}`,
          title: photoshoot.title,
          project: 'Photoshoot',
          date: photoshootDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          priority: 'medium',
          type: 'event'
        });
      });
    
    return items.sort((a, b) => {
      try {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    });
  });

  // Recent notes - empty for now (notes feature not yet implemented in database)
  interface Note {
    title: string;
    project: string;
    time: string;
  }
  const recentNotes = $derived<Note[]>([]);

  const statusColors = {
    'idea': 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    'planning': 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    'in-progress': 'bg-green-500/10 text-green-700 dark:text-green-300',
    'completed': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-700 dark:text-red-300',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    low: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  };

  // Note: Dashboard uses projectService directly instead of data from +page.ts
  // because the types are different (apiClient returns different Project type)
  
  // Load data on mount as primary method (since SSR is disabled)
  onMount(async () => {
    try {
      loading = true;
      
      // Load user profile first
      try {
        userProfile = await userService.getProfile();
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Continue without profile, will use fallback
      }
      
      // Wait for teams to be loaded (with timeout)
      let team = get(currentTeam);
      if (!team) {
        const currentUser = get(user);
        if (currentUser) {
          // Try loading teams
          await teams.load(currentUser.id);
          team = get(currentTeam);
          
          // If still no team after loading, wait a bit more
          if (!team) {
            const waitStart = Date.now();
            while (!team && Date.now() - waitStart < 3000) {
              await new Promise(resolve => setTimeout(resolve, 100));
              team = get(currentTeam);
            }
          }
        }
      }
      
      // Only load projects if we have a team
      if (team) {
        const [loadedProjects, loadedPhotoshoots, loadedTasks] = await Promise.all([
          projectService.list({ status: undefined }),
          photoshootService.list().catch(() => []), // Fail gracefully if photoshoots service has issues
          taskService.listAll({ completed: false }).catch(() => []), // Load tasks from API
          ideas.load(team.id)
        ]);
        dbProjects = loadedProjects.filter((p: DomainProject) => p.status !== 'completed' && p.status !== 'archived').slice(0, 3);
        dbPhotoshoots = loadedPhotoshoots || [];
        allTasks = loadedTasks || [];
        // Get recently added ideas (sorted by createdAt, most recent first)
        const allIdeas = get(ideas);
        dbIdeas = allIdeas.items
          .filter(i => i.status === 'saved') // Only show saved ideas (not converted)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5); // Show 5 most recent
      } else {
        // No team available, just load tasks (they might not need a team)
        try {
          allTasks = await taskService.listAll({ completed: false }) || [];
        } catch {
          allTasks = [];
        }
        dbProjects = []; // No projects without a team
        dbIdeas = [];
        dbPhotoshoots = [];
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Cosplay Tracker</title>
</svelte:head>

<div class="p-6 space-y-8">
  <!-- Greeting Section -->
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">{currentDate()}</p>
    <div class="space-y-2">
      <h1 class="text-4xl font-bold">
        Hello, {displayName}
      </h1>
      <p class="text-lg text-primary">How can I help you today?</p>
    </div>
  </div>

  <div class="space-y-8">
    <!-- Active Projects -->
    <div>
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-semibold">Active Projects</h2>
            <p class="text-sm text-muted-foreground">Your current cosplay projects</p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" onclick={() => (showNewIdeaFlyout = true)}>
              <Sparkles class="mr-2 size-4" />
              New Idea
            </Button>
            <Button variant="outline" size="sm" onclick={() => (showNewProjectFlyout = true)}>
              <Plus class="mr-2 size-4" />
              New Project
            </Button>
          </div>
        </div>
    <div class="space-y-4">
          {#if loading}
            <div class="text-center py-8 text-muted-foreground">Loading projects...</div>
          {:else if displayProjects.length === 0}
            <div class="text-center py-8 text-muted-foreground">No active projects. Create your first project to get started!</div>
          {:else}
            {#each displayProjects as project (project.id)}
              <Card class="overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 cursor-pointer group">
                <div 
                  class="flex gap-4"
                  onclick={() => handleProjectClick(project.id)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProjectClick(project.id);
                    }
                  }}
                >
                  <div class="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src={project.image} alt={project.character} class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div class="flex-1 space-y-3">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold">{project.character}</h3>
                        <p class="text-sm text-muted-foreground">{project.series}</p>
                      </div>
                      <Badge class={statusColors[project.status as keyof typeof statusColors] || statusColors['in-progress']} variant="secondary">
                        {project.status === 'in-progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                    <Progress value={project.progress} class="h-2" />
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="text-muted-foreground">Tasks</p>
                        <p class="font-medium">{project.tasks.completed}/{project.tasks.total}</p>
                      </div>
                      {#if project.deadline}
                        <div>
                          <p class="text-muted-foreground">Deadline</p>
                          <p class="font-medium">{project.deadline}</p>
                        </div>
                      {/if}
                      <div>
                        <p class="text-muted-foreground">Budget</p>
                        <p class="font-medium">{formatCurrencyFromCents(project.budget.spent * 100)}/{formatCurrencyFromCents(project.budget.total * 100)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            {/each}
          {/if}
        </div>
      </div>

      <!-- Recently Added Ideas -->
      {#if dbIdeas.length > 0}
        <div>
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-semibold">Recently Added Ideas</h2>
              <p class="text-sm text-muted-foreground">Your latest cosplay inspiration</p>
            </div>
            <Button variant="ghost" size="sm" onclick={() => goto('/ideas')}>
              View all
            </Button>
          </div>
          <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {#each dbIdeas as idea (idea.id)}
              <div class="cursor-pointer hover:shadow-md transition-shadow" onclick={() => goto(`/ideas/${idea.id}`)} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/ideas/${idea.id}`); } }}>
                <Card>
                  <CardContent class="p-4 space-y-3">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-base font-semibold line-clamp-1">{idea.character}</h3>
                      {#if idea.series}
                        <p class="text-sm text-muted-foreground line-clamp-1">{idea.series}</p>
                      {/if}
                    </div>
                    <Badge class="bg-purple-500/10 text-purple-700 dark:text-purple-300" variant="secondary">
                      Idea
                    </Badge>
                  </div>
                  {#if idea.images && idea.images.length > 0}
                    <div class="relative h-32 w-full overflow-hidden rounded-md bg-muted">
                      <img 
                        src={idea.images[0]} 
                        alt={idea.character} 
                        class="h-full w-full object-cover"
                        onerror={(e) => {
                          // If image fails to load (e.g., invalid blob URL), hide it
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                        }}
                      />
                    </div>
                  {/if}
                  <div class="flex items-center justify-between text-xs text-muted-foreground">
                    <span class="capitalize">{idea.difficulty}</span>
                    {#if idea.createdAt}
                      <span>{new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {/if}
                  </div>
                </CardContent>
              </Card>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    
    <!-- Sidebar Widgets -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- My Tasks -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Clock class="size-4" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- IN PROGRESS -->
          {#if tasksByStatus.inProgress.length > 0}
            <div>
              <p class="mb-2 text-xs font-medium text-muted-foreground">IN PROGRESS ({tasksByStatus.inProgress.length} tasks)</p>
              <div class="space-y-2">
                {#each tasksByStatus.inProgress as task}
                  <div 
                    class="flex items-start gap-2 cursor-pointer rounded-md p-2 -m-2 hover-sidebar"
                    onclick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task.id);
                    }}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTaskClick(task.id);
                      }
                    }}
                  >
                    <div onclick={(e: MouseEvent) => e.stopPropagation()} role="presentation">
                      <Checkbox checked={task.completed} class="mt-1" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{task.title}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge class="{priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium} text-xs" variant="secondary">
                          {task.priority}
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          {task.dueDate ? (new Date(task.dueDate).toDateString() === new Date().toDateString() ? 'Today' : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- TO DO -->
          {#if tasksByStatus.toDo.length > 0}
            <div>
              <p class="mb-2 text-xs font-medium text-muted-foreground">TO DO ({tasksByStatus.toDo.length} task)</p>
              <div class="space-y-2">
                {#each tasksByStatus.toDo as task}
                  <div 
                    class="flex items-start gap-2 cursor-pointer rounded-md p-2 -m-2 hover-sidebar"
                    onclick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task.id);
                    }}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTaskClick(task.id);
                      }
                    }}
                  >
                    <div onclick={(e: MouseEvent) => e.stopPropagation()} role="presentation">
                      <Checkbox checked={task.completed} class="mt-1" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{task.title}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge class="{priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium} text-xs" variant="secondary">
                          {task.priority}
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                {/each}
    </div>
  </div>
          {/if}

          <!-- UPCOMING -->
          {#if tasksByStatus.upcoming.length > 0}
      <div>
              <p class="mb-2 text-xs font-medium text-muted-foreground">UPCOMING ({tasksByStatus.upcoming.length} task)</p>
              <div class="space-y-2">
                {#each tasksByStatus.upcoming as task}
                  <div 
                    class="flex items-start gap-2 cursor-pointer rounded-md p-2 -m-2 hover-sidebar"
                    onclick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task.id);
                    }}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTaskClick(task.id);
                      }
                    }}
                  >
                    <div onclick={(e: MouseEvent) => e.stopPropagation()} role="presentation">
                      <Checkbox checked={task.completed} class="mt-1" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{task.title}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge class="{priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium} text-xs" variant="secondary">
                          {task.priority}
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          {#if tasksByStatus.inProgress.length === 0 && tasksByStatus.toDo.length === 0 && tasksByStatus.upcoming.length === 0}
            <p class="text-sm text-muted-foreground text-center py-4">No tasks</p>
          {/if}

          <Button variant="ghost" size="sm" class="w-full text-xs" onclick={() => goto('/tasks')}>
            <Plus class="mr-2 size-3" />
            Add task
          </Button>
        </CardContent>
      </Card>

      <!-- Calendar -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Calendar class="size-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex gap-2 mb-4">
            {#each weekDays as day}
              <div class="flex-1 text-center">
                <p class="text-xs text-muted-foreground">{day.day}</p>
                <div class={`mt-1 rounded p-2 ${day.isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                  <p class="text-sm font-medium">{day.date}</p>
                </div>
              </div>
            {/each}
          </div>
          <div class="text-right">
            <p class="text-sm text-muted-foreground">{weekDays[0]?.month}</p>
          </div>
          <!-- Upcoming events from photoshoots and project deadlines -->
          {#if timelineItems.length > 0}
            {@const nextEvent = timelineItems.filter(item => item.type === 'deadline' || item.type === 'event')[0]}
            {#if nextEvent}
              <div 
                class="mt-4 flex items-center gap-2 text-sm cursor-pointer rounded-md p-2 -m-2 hover-sidebar"
                onclick={() => handleTimelineItemClick(nextEvent)}
                role="button"
                tabindex="0"
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTimelineItemClick(nextEvent);
                  }
                }}
              >
                <div class="size-2 rounded-full bg-primary"></div>
                <div>
                  <p class="font-medium">{nextEvent.title}</p>
                  <p class="text-xs text-muted-foreground">{nextEvent.date}</p>
                </div>
              </div>
            {:else}
              <div class="mt-4 text-center text-xs text-muted-foreground">
                No upcoming events
              </div>
            {/if}
          {:else}
            <div class="mt-4 text-center text-xs text-muted-foreground">
              No upcoming events
            </div>
          {/if}
        </CardContent>
      </Card>

      <!-- Budget Overview -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <DollarSign class="size-4" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          {#each displayProjects as project}
            <div 
              class="space-y-1 cursor-pointer rounded-md p-2 -m-2 hover-sidebar"
              onclick={() => handleProjectClick(project.id)}
              role="button"
              tabindex="0"
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectClick(project.id);
                }
              }}
            >
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">{project.character}</span>
                <span class="text-muted-foreground">{formatCurrencyFromCents(project.budget.spent * 100)} of {formatCurrencyFromCents(project.budget.total * 100)} spent</span>
              </div>
              <div class="relative h-1.5 overflow-hidden rounded-full bg-muted">
                <div 
                  class="h-full bg-primary" 
                  style="width: {project.budget.total > 0 ? (project.budget.spent / project.budget.total * 100) : 0}%"
                ></div>
              </div>
            </div>
          {/each}
          <div class="pt-2 border-t">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Total Budget</span>
              <span class="text-sm font-semibold">{formatCurrencyFromCents(budgetOverview.totalSpent * 100)} / {formatCurrencyFromCents(budgetOverview.totalBudget * 100)}</span>
        </div>
      </div>
        </CardContent>
      </Card>

      <!-- Timeline -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Clock class="size-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          {#if timelineItems.length === 0}
            <p class="text-sm text-muted-foreground text-center py-4">No timeline items</p>
          {:else}
            {#each timelineItems.slice(0, 6) as item}
            <div 
              class="flex items-start gap-3 cursor-pointer rounded-md p-2 -m-2 hover-sidebar"
              onclick={() => handleTimelineItemClick(item)}
              role="button"
              tabindex="0"
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTimelineItemClick(item);
                }
              }}
            >
              {#if item.completed}
                <CheckSquare2 class="mt-0.5 size-4 text-muted-foreground" />
              {:else if item.type === 'deadline'}
                <Clock class="mt-0.5 size-4 text-destructive" />
              {:else}
                <Calendar class="mt-0.5 size-4 text-muted-foreground" />
              {/if}
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{item.title}</p>
                <p class="text-xs text-muted-foreground">{item.project} - {item.date}</p>
              </div>
              <Badge class="{priorityColors[item.priority]} text-xs" variant="secondary">
                {item.priority}
              </Badge>
            </div>
            {/each}
          {/if}
        </CardContent>
      </Card>

      <!-- Recent Notes & Updates -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <FileText class="size-4" />
            Recent Notes & Updates
          </CardTitle>
          <Button variant="ghost" size="sm" class="text-xs">View all</Button>
        </CardHeader>
        <CardContent class="space-y-3">
          {#if recentNotes.length === 0}
            <p class="text-sm text-muted-foreground text-center py-4">
              No notes yet. Notes feature coming soon.
            </p>
          {:else}
            {#each recentNotes as note}
              <div>
                <p class="text-sm font-medium">{note.title}</p>
                <p class="text-xs text-muted-foreground">{note.project} - {note.time}</p>
              </div>
            {/each}
          {/if}
        </CardContent>
      </Card>
    </div>
  </div>
</div>

<!-- New Project Detail Flyout -->
{#if showNewProjectFlyout}
  {@const flyoutOpen = showNewProjectFlyout}
  {@const setFlyoutOpen = (val: boolean) => {
    showNewProjectFlyout = val
  }}
  <CreationFlyout
    open={flyoutOpen}
    onOpenChange={setFlyoutOpen}
    title="New Project"
    onFullScreen={() => {
      goto('/projects/new')
      showNewProjectFlyout = false
    }}
  >
    <ProjectDetail
      mode="create"
      isFlyout={true}
      onSuccess={async (id) => {
        // If id is empty, project was deleted or converted - close flyout
        if (!id || id === '') {
          showNewProjectFlyout = false
          // Reload projects list
          const team = get(currentTeam)
          if (team) {
            const loadedProjects = await projectService.list({ status: undefined })
            dbProjects = loadedProjects.filter(p => p.status !== 'completed' && p.status !== 'archived').slice(0, 3)
          }
          return
        }
        
        // Project was created, close flyout and reload
        showNewProjectFlyout = false
        // Reload projects list
        const team = get(currentTeam)
        if (team) {
          const loadedProjects = await projectService.list({ status: undefined })
          dbProjects = loadedProjects.filter(p => p.status !== 'completed' && p.status !== 'archived').slice(0, 3)
        }
      }}
    />
</CreationFlyout>
{/if}

<!-- Project Detail Flyout (for viewing/editing existing projects) -->
{#if showProjectDetailFlyout && selectedProjectId}
  <CreationFlyout
    bind:open={showProjectDetailFlyout}
    title="Project"
    onFullScreen={() => {
      goto(`/projects/${selectedProjectId}`)
      showProjectDetailFlyout = false
    }}
  >
    <ProjectDetail
      projectId={selectedProjectId}
      mode="edit"
      isFlyout={true}
      onSuccess={async (id) => {
        // If id is empty, project was deleted or converted - close flyout
        if (!id || id === '') {
          showProjectDetailFlyout = false
          selectedProjectId = null
          // Reload projects list
          const team = get(currentTeam)
          if (team) {
            const loadedProjects = await projectService.list({ status: undefined })
            dbProjects = loadedProjects.filter(p => p.status !== 'completed' && p.status !== 'archived').slice(0, 3)
          }
          return
        }
        
        // Project was updated, reload projects list
        const team = get(currentTeam)
        if (team) {
          const loadedProjects = await projectService.list({ status: undefined })
          dbProjects = loadedProjects.filter(p => p.status !== 'completed' && p.status !== 'archived').slice(0, 3)
        }
      }}
      onOpenResourceDetail={(resourceId) => {
        // Close project flyout and open resource flyout
        showProjectDetailFlyout = false
        selectedResourceId = resourceId
        showResourceDetailFlyout = true
        parentProjectId = selectedProjectId
      }}
    />
  </CreationFlyout>
{/if}

<!-- Task Detail Flyout -->
<!-- TODO: TaskDetail archived during modern task UI migration (003-modern-task-ui) -->
<!-- Will be replaced with new TaskDetailPanel in Phase 4 (User Story 2) -->
<!-- For now, redirect to full tasks page -->
{#if showTaskDetailFlyout && selectedTaskId}
  <CreationFlyout
    bind:open={showTaskDetailFlyout}
    title="Task"
    onFullScreen={() => {
      goto('/tasks')
      showTaskDetailFlyout = false
    }}
  >
    <div class="p-8 text-center">
      <CheckSquare2 class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Task Details Coming Soon
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        We're building a new and improved task detail view as part of the modern task UI.
      </p>
      <Button
        onclick={() => {
          goto('/tasks')
          showTaskDetailFlyout = false
        }}
      >
        View All Tasks
      </Button>
    </div>
    <!--
    <TaskDetail
      taskId={selectedTaskId}
      mode="edit"
      isFlyout={true}
      onSuccess={async (taskId) => {
        showTaskDetailFlyout = false
        selectedTaskId = null
        // Reload tasks
        const team = get(currentTeam)
        if (team) {
          try {
            allTasks = await taskService.listAll({ completed: false }) || []
          } catch {
            allTasks = []
          }
        }
      }}
    />
    -->
  </CreationFlyout>
{/if}

<!-- Resource Detail Flyout -->
{#if showResourceDetailFlyout && selectedResourceId}
  <CreationFlyout
    bind:open={showResourceDetailFlyout}
    title="Resource"
    onFullScreen={() => {
      goto(`/resources/${selectedResourceId}`)
      showResourceDetailFlyout = false
    }}
  >
    <ResourceDetail
      resourceId={selectedResourceId}
      mode="edit"
      isFlyout={true}
      onSuccess={async () => {
        // Just close the flyout, the $effect will handle reopening parent
        showResourceDetailFlyout = false
      }}
    />
  </CreationFlyout>
{/if}

<!-- Idea Detail Flyout -->
{#if showNewIdeaFlyout}
  <CreationFlyout 
    bind:open={showNewIdeaFlyout} 
    title="New Idea"
    onFullScreen={() => {
      goto('/ideas/new')
      showNewIdeaFlyout = false
    }}
  >
    <IdeaDetail 
      mode="create" 
      isFlyout={true}
      onSuccess={async (id: string) => {
        // If id is empty, idea was deleted - close flyout
        if (!id || id === '') {
          showNewIdeaFlyout = false
          // Reload ideas list
          const team = get(currentTeam)
          if (team) {
            await ideas.load(team.id)
            // Refresh dashboard ideas
            const allIdeas = get(ideas)
            dbIdeas = allIdeas.items
              .filter(i => i.status === 'saved')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
          }
          return
        }
        
        showNewIdeaFlyout = false
        
        // Check if this ID is a project (from conversion)
        const wasConversion = id !== undefined && id !== ''
        if (wasConversion) {
          // This is a project ID from conversion, redirect to project page
          setTimeout(() => {
            goto(`/projects/${id}`)
          }, 100)
        } else {
          // Reload ideas list
          const team = get(currentTeam)
          if (team) {
            await ideas.load(team.id)
            // Refresh dashboard ideas
            const allIdeas = get(ideas)
            dbIdeas = allIdeas.items
              .filter(i => i.status === 'saved')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
          }
        }
      }}
    />
  </CreationFlyout>
{/if}
