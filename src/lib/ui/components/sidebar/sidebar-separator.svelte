<script lang="ts">
	import { Separator } from "$lib/ui/components/separator/index.js";
	import { cn } from "$lib/ui/utils.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	bind:ref
	data-sidebar="separator"
	class={cn("bg-sidebar-border mx-2 w-auto", className)}
	{...restProps}
/>
