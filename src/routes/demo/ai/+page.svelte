<script lang="ts">
	import { untrack } from 'svelte';
	import { setAI } from '$lib/ui/hooks/window-ai.svelte';

	const ai = setAI();

	// const result = $derived(ai.session?.prompt('Write me a haiku about the sun.'));
	const stream = $derived(ai.session?.promptStreaming('Write me a haiku about the moon.'));
	const streamArray = $derived(stream ? readableStreamToArray(stream) : undefined);

	$effect(() => {
		console.log({ ready: ai.ready });
	});

	function readableStreamToArray<T>(stream: ReadableStream<T>): T[] {
		const reader = stream.getReader();
		const result = $state<T[]>([]);

		$effect(() => {
			return untrack(() => {
				const run = async () => {
					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;
							if (value !== undefined) {
								result.push(value);
							}
						}
					} finally {
						reader.releaseLock();
					}
				};

				run();
				return () => {
					reader.releaseLock();
				};
			});
		});

		return result;
	}
</script>

<h1>AI ready: {ai.ready}</h1>
<br />
{#if ai.ready}
	<h2>A short haiku</h2>
	<p>
		{#if streamArray}
			{#each streamArray as chunk}
				{chunk}
			{/each}
		{:else}
			loading...
		{/if}
	</p>
{/if}
