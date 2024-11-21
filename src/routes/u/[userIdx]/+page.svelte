<div class="flex flex-1 flex-col gap-4 p-4">
	{#each Array.from({ length: 24 }) as _, index (index)}
		<div class="bg-muted/50 aspect-video h-12 w-full rounded-lg"></div>
	{/each}
</div>
