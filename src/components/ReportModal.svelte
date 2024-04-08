<script lang="ts">
  import { intervalToDuration } from 'date-fns/fp';
  import Modal from './Modal.svelte';
  import { projects, time } from '$stores/stores';
  import { entriesTotalValue, entriesTotalTime, formattedDuration } from '$lib/utils/entryUtils';
  import { timerFormat } from '$lib/utils/dateUtils';

  export let isOpen: boolean;
  export let entries: TimeEntry[];

  $: totalValue = entriesTotalValue($projects, entries);

  $: totalTime = entriesTotalTime(entries, $time);
  $: formattedTime = formattedDuration(totalTime);
</script>

<Modal {isOpen}>
  <div>
    <h1>Week Total:</h1>
    <h2>${totalValue}</h2>
    <h2>{formattedTime}</h2>
  </div>
</Modal>
