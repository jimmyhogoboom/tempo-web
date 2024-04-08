<script lang="ts">
  import {
    endOfWeekWithOptions,
    startOfWeekWithOptions,
    isAfter,
    isBefore,
    differenceInSeconds,
    intervalToDuration,
  } from 'date-fns/fp';
  import Modal from './Modal.svelte';
  import { entries, projects, time } from '$stores/stores';
  import { entriesTotalValue } from '$lib/utils/entryUtils';
  import { timerFormat } from '$lib/utils/dateUtils';

  export let isOpen: boolean;

  const liveDurationSeconds = (time: Date, entry?: TimeEntry) =>
    entry ? differenceInSeconds(entry.startTime, entry.endTime ?? time) : 0;

  let timeEnd = endOfWeekWithOptions({ weekStartsOn: 0 }, new Date());
  let timeStart = startOfWeekWithOptions({ weekStartsOn: 0 }, new Date());
  $: entriesPage = ($entries as TimeEntry[]).filter(
    (entry: TimeEntry) => isAfter(timeStart, entry.createdAt) && isBefore(timeEnd, entry.createdAt)
  );

  $: totalValue = entriesTotalValue($projects, entriesPage);

  $: totalTime = entriesPage.reduce((total, entry) => total + liveDurationSeconds($time, entry), 0);
  $: formattedTime = timerFormat(intervalToDuration({ start: 0, end: totalTime * 1000 }));
</script>

<Modal {isOpen}>
  <div>
    <h1>Week Total:</h1>
    <h2>${totalValue}</h2>
    <h2>{formattedTime}</h2>
  </div>
</Modal>
