<script lang="ts">
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { m, switchLanguage } from '$lib/paraglide';
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div>
	<button onclick={() => switchLanguage('en')}>en</button>
	<button onclick={() => switchLanguage('de')}>de</button>
</div>
