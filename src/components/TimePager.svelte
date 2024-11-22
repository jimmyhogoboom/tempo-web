<script lang="ts">
  import { format } from 'date-fns/fp';
  import { time } from '$stores/stores';
  import { entriesTotalTime, formattedDuration } from '$lib/utils/entryUtils';
  import { openModal } from 'svelte-modals';
  import ReportModal from './ReportModal.svelte';

  interface Props {
    entries: TimeEntry[];
    startDate: Date;
    endDate: Date;
    onPrevClick: () => void;
    onNextClick: () => void;
  }

  let {
    entries,
    startDate,
    endDate,
    onPrevClick,
    onNextClick
  }: Props = $props();

  let totalTime = $derived(entriesTotalTime(entries, $time));
  let formattedTime = $derived(formattedDuration(totalTime));

  const formatDate = format('M/d');

  type ShowOption = 'time' | 'earned'
  let show = 'time';

  const setShow = (type: ShowOption) => (show = type);
</script>

<div class="pager-wrapper">
  <div class="pager">
    <button id="prev" onclick={onPrevClick} class="secondary">&lt;</button>
    <div class="info">
      <div>Week {formatDate(startDate)} - {formatDate(endDate)}</div>
      <div id="total-time">
        <button onclick={() => openModal(ReportModal, { entries })} class="secondary">
          Week Total: <span>{formattedTime}</span>
        </button>
      </div>
    </div>
    <button id="next" onclick={onNextClick} class="secondary">&gt;</button>
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
