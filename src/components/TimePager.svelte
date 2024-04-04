<script lang="ts">
  import { formattedInterval } from '$lib/utils/entryUtils';

  export let entries: TimeEntry[];
  export let OnPrevClick: () => {};
  export let OnNextClick: () => {};

  // TODO: calculate these
  let totalTime = formattedInterval(new Date(), new Date('2024-03-31'));
  let totalEarned = 1234.45;

  enum ShowOption {
    time,
    earned,
  }
  let show = ShowOption.time;

  const setShow = (type: ShowOption) => (show = type);
</script>

<div class="pager-wrapper">
  <div class="pager">
    <button id="prev" on:click={OnPrevClick}>&lt;</button>
    <div class="info">
      <div>Week 3/31 - 4/6</div>
      {#if show === ShowOption.time}
        <div id="total-time">
          <button on:click={() => setShow(ShowOption.earned)}>
            Week Total: <span>{totalTime}</span>
          </button>
        </div>
      {/if}
      {#if show === ShowOption.earned}
        <div id="total-earned">
          <button on:click={() => setShow(ShowOption.time)}>
            Week Total: ${totalEarned}
          </button>
        </div>
      {/if}
    </div>
    <button id="next" on:click={OnNextClick}>&gt;</button>
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
