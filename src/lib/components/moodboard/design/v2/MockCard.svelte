<script lang="ts">
    import {
        MoreHorizontal,
        Instagram,
        Youtube,
        Link,
        Maximize2,
        Palette,
        StickyNote,
        Scissors,
        Ruler,
        Wallet,
        Folder,
        User,
        CheckSquare,
        Plus,
    } from "lucide-svelte";
    import { Button } from "$lib/components/ui";

    let { card }: { card: any } = $props();

    // Map size classes to grid spans (CSS Grid Layout)
    const sizeClasses = {
        small: "col-span-1 row-span-2", // ~250w x 200h (Notes)
        medium: "col-span-1 row-span-4", // ~250w x 400h (Images)
        wide: "col-span-2 row-span-4", // ~500w x 400h (Video/Palette)
        tall: "col-span-1 row-span-5", // ~250w x 500h (Social)
        large: "col-span-2 row-span-6", // ~500w x 600h (Hero)
    };

    // Content type badge colors - Matching Dashboard "Idea"/"Planning" pills
    const typeColors = {
        instagram:
            "bg-gradient-to-tr from-orange-100 to-pink-100 text-pink-700 border border-pink-100",
        palette: "bg-purple-50 text-purple-700 border border-purple-100",
        note: "bg-yellow-50 text-yellow-700 border border-yellow-100",
        fabric: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        measurements: "bg-blue-50 text-blue-700 border border-blue-100",
        youtube: "bg-red-50 text-red-700 border border-red-100",
        image: "bg-gray-50 text-gray-700 border border-gray-100",
        budget: "bg-green-50 text-green-700 border border-green-100",
        contact: "bg-violet-50 text-violet-700 border border-violet-100",
        link: "bg-sky-50 text-sky-700 border border-sky-100",
        tiktok: "bg-gradient-to-tr from-black to-gray-700 text-white border border-gray-800",
        container: "bg-purple-50 text-purple-700 border border-purple-100",
        checklist: "bg-indigo-50 text-indigo-700 border border-indigo-100",
        character: "bg-rose-50 text-rose-700 border border-rose-100",
    };

    const gridClass =
        sizeClasses[card.size as keyof typeof sizeClasses] ||
        sizeClasses.medium;

    let isHovered = $state(false);
</script>

<!-- 
  CARD COMPONENT - "Warm Clean Aesthetic"
  Matches Cosplans Dashboard: White cards, soft shadows, rounded-2xl, gentle hover lift
-->
<div
    class="
    group relative flex flex-col overflow-hidden transition-all duration-500 ease-out
    bg-white dark:bg-zinc-900 rounded-2xl
    ring-1 ring-gray-900/5 dark:ring-white/10
    shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04),0_0_2px_rgba(0,0,0,0.04)]
    hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.08),0_4px_12px_-4px_rgba(0,0,0,0.04),0_0_2px_rgba(0,0,0,0.08)]
    hover:-translate-y-1
    {gridClass}
  "
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
>
    <!-- Resize Handle (Verification Prototype) -->
    {#if isHovered}
        <div
            class="absolute bottom-3 right-3 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] cursor-se-resize z-50 text-gray-500 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 scale-90 group-hover:scale-100 border border-gray-100 pointer-events-none z-10"
        >
            <Maximize2 class="size-3.5" />
        </div>
    {/if}

    <!-- Header (Optional based on type) -->
    {#if card.type !== "image" && card.type !== "character"}
        <div class="px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
                {#if card.type === "instagram"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.instagram}"
                    >
                        <Instagram class="size-3" />
                        <span>Instagram</span>
                    </div>
                {:else if card.type === "tiktok"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.tiktok}"
                    >
                        <div class="size-3 bg-white rounded-full"></div>
                        <!-- Mock Icon -->
                        <span>TikTok</span>
                    </div>
                {:else if card.type === "youtube"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.youtube}"
                    >
                        <Youtube class="size-3" />
                        <span>YouTube</span>
                    </div>
                {:else if card.type === "link"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.link}"
                    >
                        <Link class="size-3" />
                        <span>Link</span>
                    </div>
                {:else if card.type === "palette"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.palette}"
                    >
                        <Palette class="size-3" />
                        <span>Palette</span>
                    </div>
                {:else if card.type === "note"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.note}"
                    >
                        <StickyNote class="size-3" />
                        <span>Note</span>
                    </div>
                {:else if card.type === "fabric"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.fabric}"
                    >
                        <Scissors class="size-3" />
                        <span>Fabric</span>
                    </div>
                {:else if card.type === "budget"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.budget}"
                    >
                        <Wallet class="size-3" />
                        <span>Budget</span>
                    </div>
                {:else if card.type === "contact"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.contact}"
                    >
                        <User class="size-3" />
                        <span>Contact</span>
                    </div>
                {:else if card.type === "container"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.container}"
                    >
                        <Folder class="size-3" />
                        <span>Container</span>
                    </div>
                {:else if card.type === "measurements"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.measurements}"
                    >
                        <Ruler class="size-3" />
                        <span>Measurements</span>
                    </div>
                {:else if card.type === "checklist"}
                    <div
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 {typeColors.checklist}"
                    >
                        <CheckSquare class="size-3" />
                        <span>Checklist</span>
                    </div>
                {/if}
            </div>
            <Button
                variant="ghost"
                size="icon"
                class="size-6 hover:bg-gray-100 rounded-full"
            >
                <MoreHorizontal class="size-4 text-gray-400" />
            </Button>
        </div>
    {/if}

    <!-- Content Area -->
    <div class="flex-1 min-h-0 relative overflow-hidden">
        <!-- IMAGE TYPE -->
        {#if card.type === "image"}
            <img
                src={card.data.image}
                alt={card.data.title}
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
                class="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/60 via-black/30 to-transparent text-white opacity-100 transition-opacity"
            >
                <p class="font-bold text-sm truncate drop-shadow-sm">
                    {card.data.title}
                </p>
            </div>

            <!-- INSTAGRAM / TIKTOK TYPE -->
        {:else if card.type === "instagram" || card.type === "tiktok"}
            <div class="h-full flex flex-col">
                <div class="flex-1 relative overflow-hidden">
                    <img
                        src={card.data.image}
                        alt="post"
                        class="w-full h-full object-cover"
                    />
                </div>
                <div
                    class="p-4 bg-white dark:bg-zinc-900 border-t border-gray-50 dark:border-white/5 text-sm"
                >
                    <p
                        class="line-clamp-2 text-gray-600 dark:text-gray-300 leading-snug"
                    >
                        {card.data.caption}
                    </p>
                    <div
                        class="mt-2 flex gap-2 text-[10px] font-medium text-gray-400 uppercase tracking-wide"
                    >
                        <span>{card.data.handle}</span>
                    </div>
                </div>
            </div>

            <!-- PALETTE TYPE -->
        {:else if card.type === "palette"}
            <div class="h-full flex flex-col p-5 pt-0">
                <div
                    class="flex-1 flex rounded-xl overflow-hidden shadow-inner ring-1 ring-black/5"
                >
                    {#each card.data.colors as color}
                        <div
                            class="flex-1 h-full hover:flex-[1.5] transition-all duration-300 flex items-end pb-4 justify-center group/swatch cursor-pointer"
                            style="background-color: {color}"
                        >
                            <span
                                class="bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-mono opacity-0 group-hover/swatch:opacity-100 transition-opacity shadow-sm scale-90"
                            >
                                {color}
                            </span>
                        </div>
                    {/each}
                </div>
                <div class="mt-3">
                    <h3 class="font-bold text-sm text-gray-800">
                        {card.data.title}
                    </h3>
                </div>
            </div>

            <!-- NOTE TYPE -->
        {:else if card.type === "note"}
            <div class="h-full px-5 pb-5 flex flex-col">
                <div
                    class="flex-1 p-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100/50"
                >
                    <p
                        class="text-sm font-handwriting leading-relaxed text-gray-700 dark:text-gray-200"
                    >
                        {@html card.data.text.replace(/\n/g, "<br/>")}
                    </p>
                </div>
            </div>

            <!-- FABRIC TYPE -->
        {:else if card.type === "fabric"}
            <div class="h-full relative group/fabric flex flex-col pb-5 px-5">
                <div
                    class="flex-1 rounded-xl overflow-hidden relative shadow-inner"
                >
                    <img
                        src={card.data.image}
                        alt={card.data.name}
                        class="w-full h-full object-cover"
                    />
                    <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover/fabric:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <div
                            class="bg-white/95 backdrop-blur rounded-lg px-3 py-2 text-center shadow-lg transform translate-y-2 group-hover/fabric:translate-y-0 transition-transform"
                        >
                            <p class="font-bold text-gray-900 text-sm">
                                {card.data.price}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <h3 class="font-bold text-sm text-gray-800 truncate">
                        {card.data.name}
                    </h3>
                    <p class="text-xs text-gray-500">{card.data.store}</p>
                </div>
            </div>

            <!-- YOUTUBE / LINK TYPE -->
        {:else if card.type === "youtube" || card.type === "link"}
            <div class="h-full flex flex-col">
                <div class="flex-1 relative group/video cursor-pointer">
                    <img
                        src={card.data.thumbnail || card.data.image}
                        alt="thumb"
                        class="w-full h-full object-cover"
                    />
                    {#if card.type === "youtube"}
                        <div
                            class="absolute inset-0 bg-black/10 group-hover/video:bg-black/30 transition-colors flex items-center justify-center"
                        >
                            <div
                                class="size-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover/video:scale-100 transition-transform"
                            >
                                <Youtube class="size-5 fill-current" />
                            </div>
                        </div>
                    {/if}
                </div>
                <div
                    class="p-4 bg-white dark:bg-zinc-900 border-t border-gray-50"
                >
                    <h3 class="font-bold text-sm line-clamp-1 text-gray-900">
                        {card.data.title}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-1">
                        {card.data.channel || card.data.domain}
                    </p>
                </div>
            </div>

            <!-- MEASUREMENTS TYPE (Rich Technical View) -->
        {:else if card.type === "measurements"}
            <div class="h-full px-5 pb-5 flex flex-col">
                <div class="flex justify-between items-end mb-3 px-1">
                    <span
                        class="text-[10px] uppercase font-bold text-gray-400 tracking-wider"
                        >Last Updated: {card.data.lastUpdated}</span
                    >
                    <span
                        class="text-xs text-blue-600 font-bold cursor-pointer hover:underline"
                        >Edit</span
                    >
                </div>
                <div
                    class="flex-1 bg-slate-50 rounded-xl p-0 border border-slate-100 overflow-hidden text-sm"
                >
                    {#each card.data.values as m, i}
                        <div
                            class="flex justify-between items-center px-4 py-2 border-b border-white/50 last:border-0 {i %
                                2 ===
                            0
                                ? 'bg-slate-50'
                                : 'bg-slate-100/50'}"
                        >
                            <span
                                class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                >{m.label}</span
                            >
                            <span class="font-mono font-bold text-gray-800"
                                >{m.value}</span
                            >
                        </div>
                    {/each}
                </div>
            </div>

            <!-- BUDGET TYPE (Financial View) -->
        {:else if card.type === "budget"}
            <div class="h-full px-5 pb-5 flex flex-col">
                <!-- Main Item Row -->
                <div class="flex gap-4">
                    <div
                        class="size-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-sm"
                    >
                        <img
                            src={card.data.image}
                            class="w-full h-full object-cover"
                            alt="item"
                        />
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col justify-center">
                        <div class="font-bold text-base text-gray-900 truncate">
                            {card.data.item}
                        </div>
                        <div class="text-xs text-gray-500 truncate">
                            {card.data.vendor}
                        </div>
                        <div class="mt-1">
                            <span
                                class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full {card
                                    .data.status === 'Purchased'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'}"
                                >{card.data.status}</span
                            >
                        </div>
                    </div>
                </div>

                <div class="mt-auto space-y-3">
                    <!-- Cost Breakdown -->
                    <div class="flex justify-between items-end">
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 font-bold uppercase"
                                >Cost</span
                            >
                            <span class="text-xl font-bold text-gray-900"
                                >{card.data.currency}{card.data.cost}</span
                            >
                        </div>
                        <div class="flex flex-col text-right">
                            <span
                                class="text-[10px] text-gray-400 font-bold uppercase"
                                >Budget Contribution</span
                            >
                            <span class="text-xs font-bold text-gray-600"
                                >{Math.round(
                                    (card.data.cost / card.data.total_budget) *
                                        100,
                                )}%</span
                            >
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div
                        class="h-2 w-full bg-gray-100 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full bg-green-500 rounded-full"
                            style="width: {Math.round(
                                (card.data.cost / card.data.total_budget) * 100,
                            )}%"
                        ></div>
                    </div>

                    <div
                        class="flex justify-between items-center text-[10px] text-gray-400"
                    >
                        <span
                            >Total Budget: {card.data.currency}{card.data
                                .total_budget}</span
                        >
                    </div>
                </div>
            </div>

            <!-- CONTACT TYPE -->
        {:else if card.type === "contact"}
            <div
                class="h-full px-5 pb-5 flex flex-col items-center justify-center text-center"
            >
                <div
                    class="size-14 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm mb-3"
                >
                    <img
                        src={card.data.avatar}
                        class="w-full h-full object-cover"
                        alt="avatar"
                    />
                </div>
                <h3 class="font-bold text-gray-900 text-sm">
                    {card.data.name}
                </h3>
                <p
                    class="text-xs text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded-full mt-1 mb-3"
                >
                    {card.data.role}
                </p>
                <Button variant="outline" size="sm" class="w-full h-7 text-xs"
                    >Email</Button
                >
            </div>

            <!-- CONTAINER TYPE (Folder Look) -->
        {:else if card.type === "container"}
            <div
                class="h-full px-5 pb-5 flex flex-col items-center justify-center text-center"
            >
                <div class="relative mb-3">
                    <Folder class="size-16 text-purple-400 fill-purple-50" />
                    <div
                        class="absolute -bottom-1 -right-1 bg-white border border-purple-100 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm"
                    >
                        {card.data.count}
                    </div>
                </div>
                <span class="font-bold text-sm text-gray-900"
                    >{card.data.title}</span
                >
            </div>

            <!-- CHECKLIST TYPE (Productivity Plus) -->
        {:else if card.type === "checklist"}
            <div class="h-full px-5 pb-5 flex flex-col">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-bold text-sm text-gray-900 leading-tight">
                        {card.data.title}
                    </h3>
                    <!-- Circular Progress (Mock) -->
                    <div
                        class="size-6 relative flex items-center justify-center"
                    >
                        <svg class="size-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                class="text-gray-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="4"
                            />
                            <path
                                class="text-indigo-500"
                                stroke-dasharray="40, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="4"
                                stroke-linecap="round"
                            />
                        </svg>
                        <div
                            class="text-[8px] font-bold text-indigo-600 absolute"
                        >
                            2/5
                        </div>
                    </div>
                </div>
                <div class="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {#each card.data.items as item}
                        <label
                            class="flex items-start gap-3 group/item cursor-pointer"
                        >
                            <div class="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    class="peer appearance-none size-4 rounded-full border-2 border-gray-300 checked:bg-indigo-500 checked:border-indigo-500 shrink-0 transition-all duration-300 ease-out"
                                />
                                <svg
                                    class="absolute inset-0 size-4 text-white opacity-0 peer-checked:opacity-100 peer-checked:scale-100 scale-50 transition-all duration-200 pointer-events-none p-0.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    ><polyline points="20 6 9 17 4 12"
                                    ></polyline></svg
                                >
                            </div>
                            <span
                                class="text-sm font-medium text-gray-700 peer-checked:text-gray-400 peer-checked:line-through decoration-gray-300 transition-colors block leading-snug"
                                >{item.text}</span
                            >
                        </label>
                    {/each}
                </div>
                <!-- Add Item Ghost (Visual Hint) -->
                <div
                    class="mt-2 pt-2 border-t border-dashed border-gray-100 text-xs text-gray-400 font-medium flex items-center gap-2 cursor-pointer hover:text-indigo-500 transition-colors"
                >
                    <Plus class="size-3" /> Add item
                </div>
            </div>

            <!-- CHARACTER TYPE (New) -->
        {:else if card.type === "character"}
            <div class="h-full flex flex-col">
                <div class="h-32 w-full bg-gray-100 relative">
                    <img
                        src={card.data.cover}
                        class="w-full h-full object-cover"
                        alt="cover"
                    />
                    <div
                        class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                    ></div>
                    <div
                        class="absolute -bottom-6 left-5 size-14 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm"
                    >
                        <img
                            src={card.data.avatar}
                            class="w-full h-full object-cover"
                            alt="avatar"
                        />
                    </div>
                </div>
                <div class="flex-1 pt-8 px-5 pb-5 flex flex-col">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3
                                class="font-bold text-lg text-gray-900 leading-tight"
                            >
                                {card.data.name}
                            </h3>
                            <p class="text-xs text-gray-500 font-medium">
                                {card.data.source}
                            </p>
                        </div>
                        <div class="text-right">
                            <span
                                class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"
                                >{card.data.progress}% Done</span
                            >
                        </div>
                    </div>

                    <!-- Progress bar -->
                    <div
                        class="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                            style="width: {card.data.progress}%"
                        ></div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
