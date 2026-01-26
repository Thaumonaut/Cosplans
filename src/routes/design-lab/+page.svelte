<script lang="ts">
    import { Button } from "$lib/components/ui";
    import {
        Grid,
        List,
        Maximize2,
        MoreHorizontal,
        Move,
        Palette,
        Image as ImageIcon,
        StickyNote,
        Instagram,
        Youtube,
        Scissors,
        Shirt,
        Ruler,
    } from "lucide-svelte";
    import MockCard from "$lib/components/moodboard/design/v2/MockCard.svelte";
    import MockCanvasNode from "$lib/components/moodboard/design/v2/MockCanvasNode.svelte";

    let activeView = $state<"gallery" | "canvas">("gallery");
    let canvasTheme = $state<"minimal" | "os" | "tactile">("tactile");
    let zoom = $state(100);

    // COMPREHENSIVE MOCK DATA FOR ALL CARD TYPES
    const mockCards = [
        // 1. Instagram (Vertical)
        {
            id: "insta-1",
            type: "instagram",
            size: "tall",
            data: {
                handle: "@cosplay_official",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                caption:
                    "Working on the new armor set! The detailing took forever but it was worth it. #cosplay #wip",
                platform: "instagram",
            },
        },
        // 2. Palette (Wide)
        {
            id: "palette-1",
            type: "palette",
            size: "wide",
            data: {
                title: "Character Theme",
                colors: [
                    "#2E236C",
                    "#433D8B",
                    "#C8ACD6",
                    "#17153B",
                    "#C7C8CC",
                    "#F5F5F5",
                ],
            },
        },
        // 3. Note (Short)
        {
            id: "note-1",
            type: "note",
            size: "small",
            data: {
                text: "Buy 4mm EVA foam.",
                color: "yellow",
            },
        },
        // 4. Fabric (Texture)
        {
            id: "fabric-1",
            type: "fabric",
            size: "small",
            data: {
                name: "Royal Velvet",
                price: "$24.99/yd",
                image: "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=500&q=80",
                store: "JoAnn Fabrics",
            },
        },
        // 5. Image (Portrait)
        {
            id: "img-1",
            type: "image",
            size: "medium",
            data: {
                title: "Shoulder Detail Reference",
                image: "https://images.unsplash.com/photo-1542272212-2591a27f6e07?auto=format&fit=crop&w=800&q=80",
            },
        },
        // 6. YouTube (Video)
        {
            id: "yt-1",
            type: "youtube",
            size: "wide",
            data: {
                title: "How to make foam armor - Part 1",
                thumbnail:
                    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
                duration: "12:45",
                channel: "Kamui Cosplay",
            },
        },
        // 7. Measurements (Rich Data)
        {
            id: "meas-1",
            type: "measurements",
            size: "medium", // Taller to fit more data
            data: {
                title: "Body Measurements",
                lastUpdated: "Oct 24",
                values: [
                    { label: "Bust", value: '34"' },
                    { label: "Waist", value: '28"' },
                    { label: "Hips", value: '36"' },
                    { label: "Underbust", value: '30"' },
                    { label: "Shoulder", value: '16"' },
                    { label: "Nape to Waist", value: '15.5"' },
                    { label: "Arm Length", value: '23"' },
                ],
            },
        },
        // 8. Budget Item (Rich Data)
        {
            id: "budget-1",
            type: "budget",
            size: "medium", // Taller for progress
            data: {
                item: "Wig (Arda)",
                cost: 45.0,
                total_budget: 200.0,
                currency: "$",
                status: "Purchased",
                image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=500&q=80",
                vendor: "Arda Wigs",
            },
        },
        // 9. Contact (Vendor)
        {
            id: "contact-1",
            type: "contact",
            size: "small",
            data: {
                name: "Sarah Seamstress",
                role: "Commission",
                email: "sarah@example.com",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
            },
        },
        // 10. Link Preview (Website)
        {
            id: "link-1",
            type: "link",
            size: "medium",
            data: {
                title: "CosplayTutorials.com - Foamsmithing",
                domain: "cosplaytutorials.com",
                image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
                description:
                    "The ultimate guide to working with EVA foam for armor.",
            },
        },
        // 11. TikTok (Vertical Video)
        {
            id: "tiktok-1",
            type: "tiktok",
            size: "tall",
            data: {
                handle: "@cosplay_hacks",
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
                caption: "Fastest way to prime foam! #cosplayhacks",
                platform: "tiktok",
            },
        },
        // 12. Note (Long)
        {
            id: "note-2",
            type: "note",
            size: "medium",
            data: {
                text: "TODO List:\n1. Buy primer\n2. Sand edges\n3. Heat seal\n\nRemember to wear a respirator when using contact cement!",
                color: "blue",
            },
        },
        // 13. Container (Folder - Redesigned Data)
        {
            id: "container-1",
            type: "container",
            size: "medium",
            data: {
                title: "Weapon Reference",
                count: 12,
                color: "purple", // For folder icon style
            },
        },
        // 14. Checklist (New)
        {
            id: "list-1",
            type: "checklist",
            size: "medium",
            data: {
                title: "Shopping List",
                items: [
                    { text: "EVA Foam (5mm)", checked: true },
                    { text: "Contact Cement", checked: false },
                    { text: "PlastiDip", checked: false },
                    { text: "Heat Gun", checked: true },
                    { text: "Utility Knife", checked: false },
                ],
            },
        },
        // 15. Character (New)
        {
            id: "char-1",
            type: "character",
            size: "large",
            data: {
                name: "Zelda",
                source: "Twilight Princess",
                avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80",
                cover: "https://images.unsplash.com/photo-1620216447879-11fc7b1442c5?auto=format&fit=crop&w=1200&q=80",
                progress: 45,
            },
        },
    ];
</script>

<div
    class="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 flex flex-col"
>
    <!-- Header -->
    <div
        class="h-16 border-b bg-white dark:bg-neutral-900 flex items-center justify-between px-6 sticky top-0 z-50"
    >
        <div class="flex items-center gap-4">
            <div
                class="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold"
            >
                D
            </div>
            <h1 class="font-semibold text-lg">Design System Lab</h1>
            <span
                class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200"
                >PROTOTYPE</span
            >
        </div>

        <div class="flex items-center gap-4">
            <!-- Canvas Theme Switcher -->
            {#if activeView === "canvas"}
                <div
                    class="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg"
                >
                    <button
                        class="px-2 py-1 text-xs font-medium rounded {canvasTheme ===
                        'minimal'
                            ? 'bg-white shadow-sm text-black'
                            : 'text-gray-500 hover:text-gray-900'}"
                        onclick={() => (canvasTheme = "minimal")}
                        >Minimal</button
                    >
                    <button
                        class="px-2 py-1 text-xs font-medium rounded {canvasTheme ===
                        'os'
                            ? 'bg-white shadow-sm text-black'
                            : 'text-gray-500 hover:text-gray-900'}"
                        onclick={() => (canvasTheme = "os")}>OS</button
                    >
                    <button
                        class="px-2 py-1 text-xs font-medium rounded {canvasTheme ===
                        'tactile'
                            ? 'bg-white shadow-sm text-black'
                            : 'text-gray-500 hover:text-gray-900'}"
                        onclick={() => (canvasTheme = "tactile")}
                        >Tactile</button
                    >
                </div>
                <div class="w-px h-4 bg-gray-200"></div>
            {/if}

            <Button
                variant={activeView === "gallery" ? "default" : "ghost"}
                size="sm"
                class="gap-2 h-8"
                onclick={() => (activeView = "gallery")}
            >
                <Grid class="size-4" /> Gallery
            </Button>
            <Button
                variant={activeView === "canvas" ? "default" : "ghost"}
                size="sm"
                class="gap-2 h-8"
                onclick={() => (activeView = "canvas")}
            >
                <Move class="size-4" /> Canvas
            </Button>
        </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto p-8 relative">
        {#if activeView === "gallery"}
            <div class="max-w-[1600px] mx-auto">
                <div class="mb-8">
                    <h2 class="text-2xl font-bold mb-2">Hybrid Grid System</h2>
                    <p class="text-gray-500 max-w-2xl">
                        A responsive 12-column grid with intelligent content
                        sizing. Cards span 1x1 (Small), 2x2 (Medium), 4x2
                        (Wide), 2x4 (Tall), or 4x4 (Large) grid units.
                    </p>
                </div>

                <!-- 
          HYBRID GRID IMPLEMENTATION 
          Base unit: ~300px min width (Bigger cards)
          Row height: 100px (finer control)
        -->
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 auto-dense"
                    style="grid-auto-rows: 100px;"
                >
                    {#each mockCards as card}
                        <MockCard {card} />
                    {/each}
                </div>
            </div>
        {:else}
            <div
                class="w-full h-full min-h-[800px] relative overflow-hidden bg-neutral-100 dark:bg-[#1a1a1a] rounded-xl border shadow-inner"
            >
                <!-- Dot Grid Pattern -->
                <div
                    class="absolute inset-0 opacity-10 pointer-events-none"
                    style="background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 20px 20px;"
                ></div>

                <div
                    class="absolute top-4 left-4 z-10 bg-white/80 dark:bg-black/50 backdrop-blur p-2 rounded-lg border shadow-sm"
                >
                    <h2 class="text-sm font-semibold mb-1">Canvas Nodes</h2>
                    <p class="text-xs text-gray-500">
                        Fixed sizes • Compact • Draggable
                    </p>
                </div>

                <!-- Canvas Nodes (Freeform positioning for demo) -->
                <div class="relative w-full h-full">
                    <!-- Image Node -->
                    <MockCanvasNode
                        type="image"
                        title="Reference"
                        x={100}
                        y={100}
                        data={mockCards[4].data}
                        theme={canvasTheme}
                    />

                    <!-- Note Node -->
                    <MockCanvasNode
                        type="note"
                        title="Note"
                        x={350}
                        y={150}
                        data={mockCards[2].data}
                        theme={canvasTheme}
                    />

                    <!-- Instagram Node (Tall) -->
                    <MockCanvasNode
                        type="instagram"
                        title="Post"
                        x={600}
                        y={100}
                        data={mockCards[0].data}
                        theme={canvasTheme}
                    />

                    <!-- Container Node -->
                    <MockCanvasNode
                        type="container"
                        title="Character"
                        x={100}
                        y={450}
                        data={{ title: "Zelda (TP)", count: 3, icon: "user" }}
                        theme={canvasTheme}
                    />

                    <!-- Palette Node -->
                    <MockCanvasNode
                        type="palette"
                        title="Theme"
                        x={400}
                        y={400}
                        data={mockCards[1].data}
                        theme={canvasTheme}
                    />

                    <!-- Fabric Node -->
                    <MockCanvasNode
                        type="fabric"
                        title="Fabric"
                        x={600}
                        y={400}
                        data={mockCards[3].data}
                    />
                </div>
            </div>
        {/if}
    </main>
</div>
