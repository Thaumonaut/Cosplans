<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authService } from "$lib/auth/auth-service";
  import { user, userProfile } from "$lib/stores/auth-store";
  import {
    Sparkles,
    LayoutDashboard,
    Clock,
    ClipboardList,
    Hammer,
    Archive,
    MessageSquare,
    User,
    Calendar,
    CheckSquare,
    DollarSign,
    Shirt,
    Package,
    Wrench,
    Palette,
    Users,
    Camera,
    Edit3,
    Settings,
    LogOut,
    MapPin,
    UserCircle,
    Clapperboard,
    Film,
    Sofa,
    Folder,
    ChevronDown,
    Store,
    BookOpen,
    Scissors,
    PartyPopper,
    Coffee,
    ImagePlay,
    LayoutGrid,
    FileText,
  } from "lucide-svelte";

  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuItem,
  } from "$lib/components/ui";
  import TeamSelector from "./team-selector.svelte";
  import Logo from "./Logo.svelte";

  // MVP Navigation - Organized by workflow phase
  const mainNav = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      ready: true,
    },
    { title: "Ideas", url: "/ideas", icon: Sparkles, ready: true },
    { title: "Projects", url: "/projects", icon: Folder, ready: true },
    { title: "Tasks", url: "/tasks", icon: CheckSquare, ready: true },
  ];

  // Production phase navigation (Feature: 004-bugfix-testing - User Story 3)
  const productionNav = [
    { title: "Resources", url: "/resources", icon: Package, ready: true },
    { title: "Tools", url: "/tools", icon: Hammer, ready: true },
    {
      title: "Photoshoots",
      url: "/photoshoots",
      icon: Clapperboard,
      ready: true,
    },
    { title: "Calendar", url: "/calendar", icon: Calendar, ready: true },
  ];

  // Collapsible state using proper Svelte 5 runes (Feature: 004-bugfix-testing - User Story 3)
  // Default to true on server, hydrate from localStorage on client

  let productionOpen = $state(true);

  // Load persisted state from localStorage after mount (SSR-safe)
  onMount(() => {
    const stored = localStorage.getItem("sidebar_production_open");
    if (stored !== null) {
      productionOpen = stored !== "false";
    }
  });

  // Persist production section state
  function toggleProduction() {
    productionOpen = !productionOpen;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("sidebar_production_open", String(productionOpen));
    }
  }

  // Get user info from auth store
  const currentUser = $derived($user);
  const profile = $derived($userProfile);

  // Get user display info
  const userName = $derived.by(() => {
    if (!profile) return "User";
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) return profile.firstName;
    return profile.email?.split("@")[0] || "User";
  });

  const userEmail = $derived(profile?.email || "");
  const userInitials = $derived.by(() => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName[0].toUpperCase();
    }
    if (userEmail) {
      return userEmail[0].toUpperCase();
    }
    return "U";
  });

  const userAvatar = $derived(profile?.avatarUrl || "/placeholder-user.jpg");

  async function handleSignOut() {
    try {
      await authService.signOut();
      // Redirect will happen via auth state change listener
      await goto("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Still redirect to login even if signOut fails
      await goto("/login");
    }
  }
</script>

<Sidebar>
  <SidebarHeader
    class="border-b border-[var(--theme-sidebar-border)] px-6 py-4"
  >
    <div class="flex items-center gap-3">
      <a
        href="/dashboard"
        class="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <Logo size="lg" />
        <div class="flex flex-1 flex-col overflow-hidden">
          <span class="text-lg font-semibold">Cosplans</span>
        </div>
      </a>
    </div>
    <div class="mt-3">
      <TeamSelector />
    </div>
  </SidebarHeader>

  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {#each mainNav as item}
            <SidebarMenuItem>
              {#if item.ready}
                <SidebarMenuButton href={item.url}>
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              {:else}
                <div
                  class="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground opacity-60 pointer-events-none"
                  title="coming soon"
                >
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </div>
              {/if}
            </SidebarMenuItem>
          {/each}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <!-- Production Section (Feature: 004-bugfix-testing - User Story 3) -->
    <SidebarGroup>
      <SidebarGroupLabel>
        <button
          class="flex w-full items-center justify-between"
          onclick={toggleProduction}
          aria-expanded={productionOpen}
          aria-label="Toggle production section"
        >
          Production
          <ChevronDown
            class="ml-auto size-4 transition-transform {productionOpen
              ? ''
              : '-rotate-90'}"
          />
        </button>
      </SidebarGroupLabel>
      {#if productionOpen}
        <SidebarGroupContent>
          <SidebarMenu>
            {#each productionNav as item}
              <SidebarMenuItem>
                {#if item.ready}
                  <SidebarMenuButton href={item.url}>
                    <item.icon class="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                {:else}
                  <div
                    class="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground opacity-60 pointer-events-none"
                    title="Coming soon"
                  >
                    <item.icon class="size-4" />
                    <span>{item.title}</span>
                  </div>
                {/if}
              </SidebarMenuItem>
            {/each}
          </SidebarMenu>
        </SidebarGroupContent>
      {/if}
    </SidebarGroup>
  </SidebarContent>

  <SidebarFooter class="border-t border-[var(--theme-sidebar-border)] p-4">
    <DropdownMenu placement="top">
      {#snippet trigger()}
        <span
          class="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent"
        >
          <Avatar class="size-8">
            <AvatarImage src={userAvatar} alt="avatar image" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div class="flex flex-col items-start text-sm min-w-0 flex-1">
            <span class="font-medium truncate w-full">{userName}</span>
            {#if userEmail}
              <span class="text-xs text-muted-foreground truncate w-full"
                >{userEmail}</span
              >
            {/if}
          </div>
        </span>
      {/snippet}

      {#snippet children()}
        <DropdownMenuItem>
          <a
            href="/settings/profile"
            class="flex cursor-pointer items-center w-full"
          >
            <User class="mr-2 size-4" />
            Profile Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a
            href="/settings/team"
            class="flex cursor-pointer items-center w-full"
          >
            <Settings class="mr-2 size-4" />
            Team Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem class="text-destructive">
          <button
            onclick={handleSignOut}
            class="flex cursor-pointer items-center w-full"
          >
            <LogOut class="mr-2 size-4" />
            Sign Out
          </button>
        </DropdownMenuItem>
      {/snippet}
    </DropdownMenu>
  </SidebarFooter>
</Sidebar>
