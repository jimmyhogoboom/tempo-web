<script lang="ts">
	import { time } from '$stores/stores';
	import { formatEntryDuration } from '$lib/utils/entryUtils';

	export let entry: TimeEntry | undefined;

	$: formatted = formatEntryDuration($time, entry);
</script>

<div class="entry-time">{formatted}</div>

<style lang="scss">
	.entry-time {
		display: block;
		height: 100%;
		font-weight: 500;
		font-family: monospace;
	}
</style>
