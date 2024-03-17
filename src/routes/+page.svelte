<script lang="ts">
	import { addEntry } from '$lib/Entries';
	import { entries } from '$stores/stores';

	const handleStartClick = () =>
		entries.update((es: TimeEntry[]) => {
			const r = addEntry(es);
			if (r.ok) return r.ok;

			// TODO: better error message handling
			console.error(r.err);

			return [];
		});
</script>

<div>
	<button on:click={handleStartClick}>Start</button>

	<ul>
		{JSON.stringify($entries)}
	</ul>
</div>
