<script lang="ts">
	import { interval, intervalToDuration } from 'date-fns/fp';
	import { time } from '$stores/stores';
	import { timerFormat } from '$lib/utils/dateUtils';

	export let entry;

	$: elapsed = entry ? intervalToDuration(interval($time, entry.startTime)) : {};
	$: formatted = timerFormat(elapsed);
</script>

<div>{formatted}</div>
