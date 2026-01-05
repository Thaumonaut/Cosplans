<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { ArrowRight, Users, Calendar, Zap, AlertTriangle, Wrench, CheckCircle } from 'lucide-svelte';
  import Logo from '$lib/components/Logo.svelte';
</script>

<svelte:head>
  <title>Cosplans - Cosplay Project Tracker (Beta)</title>
  <meta name="description" content="Open-source cosplay project tracker for managing builds, teams, and photoshoots. Built with SvelteKit and Supabase." />
</svelte:head>

<!-- Landing Page -->
<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- Beta Notice Banner -->
  <div class="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
    <div class="container mx-auto px-6 py-3">
      <div class="flex items-center justify-center gap-2 text-sm">
        <Wrench class="size-4 text-blue-600 dark:text-blue-500" />
        <span class="font-medium text-blue-900 dark:text-blue-100">
          Open Beta: Help us shape the future of cosplay project management
        </span>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex items-center justify-between p-6">
    <a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <Logo size="md" />
      <span class="text-xl font-bold">Cosplans</span>
      <span class="ml-2 rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">BETA</span>
    </a>
    <div class="flex items-center gap-4">
      <Button variant="ghost" href="/dashboard">Sign In</Button>
      <Button href="/dashboard">Try It Out</Button>
    </div>
  </nav>

  <!-- Hero Section -->
  <div class="container mx-auto px-6 py-20">
    <div class="text-center">
      <div class="mb-4 flex justify-center">
        <span class="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300">
          <Wrench class="size-4" />
          Open Source Work in Progress
        </span>
      </div>
      <h1 class="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
        Track Your Cosplay Journey
        <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          From Idea to Convention
        </span>
      </h1>
      <p class="mx-auto mb-4 max-w-2xl text-xl text-muted-foreground">
        An open-source cosplay project tracker built with SvelteKit and Supabase.
        Track your builds, manage your team, and bring your favorite characters to life.
      </p>
      <p class="mx-auto mb-8 max-w-xl text-sm text-muted-foreground">
        Currently in open beta with active development and regular updates.
      </p>
      <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button size="lg" href="/dashboard" class="text-lg">
          Try the Beta
          <ArrowRight class="ml-2 size-5" />
        </Button>
        <Button size="lg" variant="outline" href="https://github.com/Thaumonaut/Cosplans" class="text-lg">
          View on GitHub
        </Button>
      </div>
    </div>
  </div>

  <!-- Current Features Section -->
  <div class="container mx-auto px-6 py-20">
    <div class="text-center mb-16">
      <h2 class="mb-4 text-3xl font-bold">Current Features</h2>
      <p class="text-xl text-muted-foreground">
        What's working right now (with more coming soon)
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border bg-card p-6">
        <div class="mb-4 flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <CheckCircle class="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="mb-2 text-xl font-semibold">Project Management</h3>
            <p class="text-sm text-muted-foreground">
              Create and track cosplay projects with customizable workflows. Track ideas from inspiration through completion.
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-6">
        <div class="mb-4 flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <CheckCircle class="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="mb-2 text-xl font-semibold">Task System</h3>
            <p class="text-sm text-muted-foreground">
              Organize work with tasks, subtasks, and custom fields. Multiple views: list, board, calendar, and timeline.
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-6">
        <div class="mb-4 flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <CheckCircle class="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="mb-2 text-xl font-semibold">Team Collaboration</h3>
            <p class="text-sm text-muted-foreground">
              Work together on group cosplays with team workspaces, member management, and shared projects.
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-6">
        <div class="mb-4 flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <CheckCircle class="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="mb-2 text-xl font-semibold">Resource Library</h3>
            <p class="text-sm text-muted-foreground">
              Track materials, tools, and reference images. Link resources to specific projects and tasks.
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-6">
        <div class="mb-4 flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <CheckCircle class="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="mb-2 text-xl font-semibold">Photoshoot Planning</h3>
            <p class="text-sm text-muted-foreground">
              Plan and organize photoshoots with location tracking, participant management, and scheduling.
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 p-6">
        <div class="mb-4 flex items-start gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
            <Wrench class="size-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 class="mb-2 text-xl font-semibold">In Progress</h3>
            <p class="text-sm text-muted-foreground">
              Mobile responsiveness, offline sync, character database integration, and comprehensive testing underway.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Roadmap Section -->
  <div class="container mx-auto px-6 py-20">
    <div class="text-center mb-12">
      <h2 class="mb-4 text-3xl font-bold">Coming Soon</h2>
      <p class="text-xl text-muted-foreground">
        Features we're actively developing
      </p>
    </div>
    <div class="mx-auto max-w-4xl">
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-xl border bg-card p-6">
          <h3 class="mb-3 text-lg font-semibold">Enhanced Mobile Experience</h3>
          <p class="text-sm text-muted-foreground">
            Improved responsive layouts and touch-optimized interfaces for seamless mobile use.
          </p>
        </div>
        <div class="rounded-xl border bg-card p-6">
          <h3 class="mb-3 text-lg font-semibold">Offline Support</h3>
          <p class="text-sm text-muted-foreground">
            Work offline and sync your changes automatically when you're back online.
          </p>
        </div>
        <div class="rounded-xl border bg-card p-6">
          <h3 class="mb-3 text-lg font-semibold">Character Database</h3>
          <p class="text-sm text-muted-foreground">
            Integration with popular character databases for quick project setup and reference materials.
          </p>
        </div>
        <div class="rounded-xl border bg-card p-6">
          <h3 class="mb-3 text-lg font-semibold">Budget & Expense Tracking</h3>
          <p class="text-sm text-muted-foreground">
            Comprehensive tools to track costs, manage materials inventory, and stay within budget.
          </p>
        </div>
      </div>
      <p class="mt-8 text-center text-sm text-muted-foreground">
        🚧 This is an open beta. Some features are still being refined.
        <a href="https://github.com/Thaumonaut/Cosplans/issues" class="text-purple-600 dark:text-purple-400 hover:underline ml-1">
          Report issues or suggest features on GitHub
        </a>
      </p>
    </div>
  </div>

  <!-- CTA Section -->
  <div class="container mx-auto px-6 py-20">
    <div class="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white lg:p-16">
      <h2 class="mb-4 text-3xl font-bold lg:text-4xl">Join the Open Beta</h2>
      <p class="mb-8 text-xl opacity-90">
        Start tracking your cosplay projects today and help shape the future of the platform
      </p>
      <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button size="lg" variant="secondary" href="/dashboard" class="text-lg">
          Try the Beta
          <ArrowRight class="ml-2 size-5" />
        </Button>
        <Button size="lg" variant="outline" href="https://github.com/Thaumonaut/Cosplans" class="text-lg border-white text-white hover:bg-white/20">
          Contribute on GitHub
        </Button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t bg-background/50 py-8">
    <div class="container mx-auto px-6">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="flex items-center gap-2">
          <Logo size="sm" />
          <span class="font-semibold">Cosplans</span>
          <span class="text-xs text-muted-foreground">Beta</span>
        </div>
        <p class="text-sm text-muted-foreground">
          © 2025 Cosplans. Open source project in active development.
        </p>
      </div>
    </div>
  </footer>
</div>