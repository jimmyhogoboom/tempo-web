<script lang="ts">
	import { interval, intervalToDuration } from 'date-fns/fp';
	import { time } from '$stores/stores';
	import { timerFormat } from '$lib/utils/dateUtils';

	export let entry: TimeEntry | undefined;

	const formattedInterval = (end?: Date, start?: Date) =>
		timerFormat(end && start && intervalToDuration(interval(end, start)));

	$: stopTime = entry?.endTime ?? $time;
	$: formatted = formattedInterval(stopTime, entry?.startTime);
</script>

<div>{formatted}</div>
