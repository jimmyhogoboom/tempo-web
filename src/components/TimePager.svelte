<script lang="ts">
  import { format } from 'date-fns/fp';
  import { time } from '$stores/stores';
  import { entriesTotalTime, formattedDuration } from '$lib/utils/entryUtils';
  import { openModal } from 'svelte-modals';
  import ReportModal from './ReportModal.svelte';

  export let entries: TimeEntry[];
  export let startDate: Date;
  export let endDate: Date;
  export let onPrevClick: () => void;
  export let onNextClick: () => void;

  $: totalTime = entriesTotalTime(entries, $time);
  $: formattedTime = formattedDuration(totalTime);

  const formatDate = format('M/d');

  enum ShowOption {
    time,
    earned,
  }
  let show = ShowOption.time;

  const setShow = (type: ShowOption) => (show = type);
</script>

<div class="pager-wrapper">
  <div class="pager">
    <button id="prev" on:click={onPrevClick}>&lt;</button>
    <div class="info">
      <div>Week {formatDate(startDate)} - {formatDate(endDate)}</div>
      <div id="total-time">
        <button on:click={() => openModal(ReportModal, { entries })}>
          Week Total: <span>{formattedTime}</span>
        </button>
      </div>
    </div>
    <button id="next" on:click={onNextClick}>&gt;</button>
  </div>
</div>

<style lang="scss">
  @use '../styles/colors';
  @use '../styles/button';

  .pager {
    background-color: colors.$background-color;
    border-radius: 0.3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  button {
    height: fit-content;
    min-width: 2rem;
  }
</style>
