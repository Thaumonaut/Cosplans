<script lang="ts">
    import {
        MoreHorizontal,
        Image as ImageIcon,
        Instagram,
        Palette,
        Folder,
        Shirt,
    } from "lucide-svelte";

    let {
        type,
        title,
        x,
        y,
        data,
        theme = "tactile",
    }: {
        type: string;
        title: string;
        x: number;
        y: number;
        data: any;
        theme?: "minimal" | "os" | "tactile";
    } = $props();

    let isSelected = $state(false);

    // Fixed dimensions vary by theme? No, keep dimensions constant for now to avoid layout jumps.
    // Although 'minimal' might want to be tighter.
    const dimensions = {
        image: { w: 200, h: 280 },
        instagram: { w: 240, h: 360 },
        note: { w: 200, h: 200 },
        palette: { w: 300, h: 120 },
        container: { w: 240, h: 140 },
        fabric: { w: 180, h: 180 },
    };

    const dim = dimensions[type as keyof typeof dimensions] || {
        w: 200,
        h: 200,
    };
</script>

<div
    class="
    group absolute cursor-move select-none transition-all duration-300
    {theme === 'tactile'
        ? 'bg-white dark:bg-zinc-900 rounded-sm shadow-sm hover:shadow-lg hover:z-50'
        : ''}
    {theme === 'os'
        ? 'bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:shadow-md'
        : ''}
    {theme === 'minimal' ? 'hover:z-50' : ''}
    {isSelected ? 'z-40' : 'z-0'}
  "
    style="left: {x}px; top: {y}px; width: {dim.w}px; height: {dim.h}px;"
    onclick={() => (isSelected = !isSelected)}
>
    <!-- ============================================== -->
    <!-- THEME: MINIMAL (Milanote Style - Raw Content) -->
    <!-- ============================================== -->
    {#if theme === "minimal"}
        {#if type === "image"}
            <div class="w-full h-full relative group/min">
                <img
                    src={data.image}
                    class="w-full h-full object-cover"
                    alt="ref"
                />
                <!-- Hover Title -->
                <div
                    class="absolute -bottom-6 left-0 text-xs font-semibold text-gray-500 opacity-0 group-hover/min:opacity-100 transition-opacity whitespace-nowrap overflow-visible"
                >
                    {title}
                </div>
            </div>
        {:else if type === "note"}
            <div class="h-full w-full bg-white p-2">
                <p class="text-sm text-gray-800 leading-relaxed font-sans">
                    {data.text}
                </p>
            </div>
        {:else if type === "container"}
            <div
                class="flex flex-col items-center justify-center h-full gap-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400"
            >
                <Folder class="size-6 text-gray-400" />
                <span class="text-xs font-medium text-gray-500"
                    >{data.title}</span
                >
            </div>
        {:else}
            <div
                class="w-full h-full bg-gray-50 border border-gray-100 p-2 text-xs text-gray-400"
            >
                {type}
            </div>
        {/if}

        <!-- Minimal Selection (Just a border) -->
        {#if isSelected}
            <div
                class="absolute -inset-2 border-2 border-blue-500 rounded-lg pointer-events-none"
            ></div>
        {/if}

        <!-- ============================================== -->
        <!-- THEME: OS (Linear / Mac Style)                -->
        <!-- ============================================== -->
    {:else if theme === "os"}
        <!-- Mac Window Header -->
        <div
            class="h-6 px-2 flex items-center gap-1.5 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 rounded-t-lg"
        >
            <div class="size-2 rounded-full bg-red-400"></div>
            <div class="size-2 rounded-full bg-yellow-400"></div>
            <div class="size-2 rounded-full bg-green-400"></div>
            <div
                class="ml-2 text-[10px] font-medium text-gray-400 truncate flex-1 text-center"
            >
                {title}
            </div>
        </div>

        <div
            class="flex-1 h-[calc(100%-24px)] relative overflow-hidden rounded-b-lg"
        >
            {#if type === "image" || type === "instagram"}
                <img
                    src={data.image}
                    class="w-full h-full object-cover"
                    alt="os"
                />
            {:else if type === "note"}
                <div
                    class="p-4 bg-white/50 h-full text-sm text-gray-600 font-mono"
                >
                    {data.text}
                </div>
            {:else if type === "container"}
                <div class="h-full flex flex-col p-2 space-y-1 overflow-y-auto">
                    <div
                        class="h-6 flex items-center gap-2 text-xs text-gray-600 hover:bg-black/5 rounded px-1"
                    >
                        <Folder class="size-3" /> <span>Reference_1.jpg</span>
                    </div>
                    <div
                        class="h-6 flex items-center gap-2 text-xs text-gray-600 hover:bg-black/5 rounded px-1"
                    >
                        <Folder class="size-3" /> <span>Reference_2.jpg</span>
                    </div>
                </div>
            {/if}
        </div>

        {#if isSelected}
            <div
                class="absolute -inset-px rounded-lg ring-2 ring-blue-500 pointer-events-none shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
            ></div>
        {/if}

        <!-- ============================================== -->
        <!-- THEME: TACTILE (Current Rich Style)           -->
        <!-- ============================================== -->
    {:else}
        <!-- IMAGE NODE (Photo / Polaroid Style) -->
        {#if type === "image"}
            <div
                class="w-full h-full bg-white p-1.5 pb-8 shadow-sm rounded-sm transform rotate-1 transition-transform hover:rotate-0 hover:scale-[1.02]"
            >
                <div class="w-full h-full bg-gray-100 relative overflow-hidden">
                    <img
                        src={data.image}
                        class="w-full h-full object-cover"
                        alt="ref"
                    />
                </div>
                <div class="absolute bottom-2 left-2 right-2 text-center">
                    <span
                        class="font-handwriting text-xs text-gray-600 truncate block"
                        >{title}</span
                    >
                </div>
            </div>

            <!-- INSTAGRAM NODE (Phone Screen Style) -->
        {:else if type === "instagram"}
            <div
                class="w-full h-full bg-black rounded-3xl p-1.5 shadow-lg border border-gray-800 relative z-10"
            >
                <div
                    class="w-full h-full bg-white rounded-2xl overflow-hidden relative"
                >
                    <img
                        src={data.image}
                        class="w-full h-full object-cover"
                        alt="insta"
                    />
                    <div
                        class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8"
                    >
                        <div class="flex items-center gap-1.5 mb-1">
                            <Instagram class="size-3 text-white" />
                            <span class="text-[10px] font-bold text-white"
                                >@user</span
                            >
                        </div>
                        <p
                            class="text-[9px] text-gray-200 line-clamp-2 leading-tight"
                        >
                            {data.caption}
                        </p>
                    </div>
                </div>
            </div>

            <!-- NOTE NODE (Yellow Sticky Note - Modern/Clean) -->
        {:else if type === "note"}
            <div
                class="w-full h-full bg-[#fef3c7] shadow-sm from-yellow-50 to-yellow-100 bg-gradient-to-br p-5 transform -rotate-1 hover:rotate-0 transition-transform mask-sticky flex flex-col justify-start items-start text-left group-hover:shadow-md"
            >
                <p
                    class="font-medium text-sm leading-relaxed text-yellow-900/90 w-full selection:bg-yellow-200"
                >
                    {data.text}
                </p>
            </div>

            <!-- PALETTE NODE (Paint Chip) -->
        {:else if type === "palette"}
            <div
                class="w-full h-full bg-white shadow-sm rounded-lg p-1.5 flex flex-col gap-1.5 ring-1 ring-black/5"
            >
                <div class="flex-1 flex gap-0.5 rounded overflow-hidden">
                    {#each data.colors as color}
                        <div
                            class="flex-1 h-full"
                            style="background-color: {color}"
                        ></div>
                    {/each}
                </div>
                <div class="h-5 flex items-center justify-between px-1">
                    <span
                        class="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                        >{data.title}</span
                    >
                </div>
            </div>

            <!-- CONTAINER NODE (Folder/Stack) -->
        {:else if type === "container"}
            <div class="w-full h-full relative">
                <!-- Stack effect -->
                <div
                    class="absolute inset-0 bg-purple-100 rounded-lg transform rotate-3 scale-95 origin-bottom-right border border-purple-200"
                ></div>
                <div
                    class="absolute inset-0 bg-purple-50 rounded-lg transform -rotate-2 scale-95 origin-bottom-left border border-purple-200"
                ></div>
                <!-- Main Folder -->
                <div
                    class="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center p-3 gap-2"
                >
                    <Folder class="size-8 text-purple-400 fill-purple-50" />
                    <div class="text-center">
                        <div
                            class="font-bold text-xs text-gray-800 leading-tight"
                        >
                            {data.title}
                        </div>
                        <div class="text-[10px] text-gray-400 mt-0.5">
                            {data.count} items
                        </div>
                    </div>
                </div>
            </div>

            <!-- FABRIC NODE (Swatch) -->
        {:else if type === "fabric"}
            <div
                class="w-full h-full relative shadow-md rounded overflow-hidden group"
            >
                <img
                    src={data.image}
                    class="w-full h-full object-cover"
                    alt="fabric"
                />
                <!-- Pinking shears edge effect (simulated with border) -->
                <div
                    class="absolute inset-0 border-4 border-white/50 border-dashed"
                ></div>

                <div
                    class="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-gray-800 shadow-sm"
                >
                    {data.price}
                </div>
            </div>
        {/if}

        <!-- Tactile Selection (Ring with padding) -->
        {#if isSelected}
            <div
                class="absolute -inset-2 rounded-lg border-2 border-blue-500 pointer-events-none border-dashed opacity-50"
            ></div>
        {/if}
    {/if}
</div>
