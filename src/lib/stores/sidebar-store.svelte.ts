/**
 * Global sidebar state store using Svelte 5 runes.
 * 
 * This store enables sidebar state to be shared across sibling components
 * (e.g., SidebarTrigger in PageHeader and Sidebar in AppSidebar) which
 * cannot use Svelte's hierarchical context API.
 */
import { browser } from '$app/environment';

// Reactive state using Svelte 5 runes
let open = $state(true);
let openMobile = $state(false);
let isMobile = $state(false);

// Initialize mobile detection on client only (SSR-safe)
if (browser) {
    isMobile = window.innerWidth < 768;

    const checkMobile = () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth < 768;

        // Reset mobile sidebar when switching from desktop to mobile
        if (!wasMobile && isMobile) {
            openMobile = false;
        }
    };

    window.addEventListener('resize', checkMobile);
}

export const sidebarStore = {
    get open() { return open; },
    set open(value: boolean) {
        open = value;
        // Persist to cookie (SSR-safe)
        if (browser) {
            document.cookie = `sidebar_state=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
        }
    },

    get openMobile() { return openMobile; },
    set openMobile(value: boolean) { openMobile = value; },

    get isMobile() { return isMobile; },
    set isMobile(value: boolean) { isMobile = value; },

    get state() { return open ? 'expanded' : 'collapsed'; },

    toggleSidebar() {
        if (isMobile) {
            openMobile = !openMobile;
        } else {
            this.open = !open;
        }
    },

    setOpen(value: boolean) {
        this.open = value;
    },

    setOpenMobile(value: boolean) {
        openMobile = value;
    }
};
