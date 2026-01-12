<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface CardProps {
    class?: string
    /** Disable default padding (useful for full-bleed content like images) */
    noPadding?: boolean
  }

  let {
    class: className = '',
    noPadding = false,
    children,
    ...restProps
  }: CardProps & { children?: any } = $props()
</script>

<div
  data-slot="card"
  class={cn(
    'flex flex-col gap-6 rounded-xl border shadow-sm',
    'bg-[var(--theme-card-bg)] text-[var(--theme-foreground)] border-[var(--theme-border)]',
    noPadding ? '' : 'p-6',
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</div>