<script lang="ts">
  import { dateFormat } from '$lib/utils/dateUtils';
  import EntryTime from '$components/EntryTime.svelte';

  export let entry: TimeEntry;
  export let onClick: () => void;
  export let selected: boolean;
  $: selected = false;
</script>

<li class="flex {selected && 'selected'}">
  <button on:click={onClick} class="flex main">
    <div class="title">
      {#if entry.title.length}
        {entry.title}
      {:else}
        <div class="flex placeholder">
          <div class="nowrap">{dateFormat(entry?.startTime)}</div>
          <span style="padding: 0 0.3rem;">→</span>
          <div class="nowrap">{dateFormat(entry?.endTime)}</div>
        </div>
      {/if}
    </div>
    <div class="time"><EntryTime {entry} /></div>
  </button>
</li>

<style lang="scss">
  @use '../styles/colors';

  .flex {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;

    &.placeholder {
      justify-content: start;
      gap: 0.2rem;
      color: colors.$surface-400;
    }
  }

  .nowrap {
    white-space: nowrap;
  }

  li {
    overflow: hidden;
    list-style: none;
    padding: 0;
    justify-content: space-evenly;
    border-top: 1px solid colors.$surface-500;
    background-color: colors.$background-color;
  }

  $border-radius: 0.3rem;
  li:first-child {
    border-top: none;
    border-radius: $border-radius $border-radius 0 0;
  }

  /* nth-last-child(2) to compensate for the edit panel */
  li:nth-last-child(2) {
    border-radius: 0 0 $border-radius $border-radius;
  }

  li:first-child:nth-last-child(2) {
    border-radius: $border-radius $border-radius $border-radius $border-radius;
  }

  .main {
    gap: 2rem;
    margin: 0px;
    width: 100%;
    height: 100%;
    color: inherit;
    border: none;
    padding: 1rem 2rem;
    background: transparent;
    cursor: pointer;
  }

  li:hover,
  li.selected {
    background-color: colors.$surface-200;
  }

  li:hover .main,
  li.selected .main {
    color: colors.$text;
  }

  .title {
    font-weight: bold;
    text-align: start;
    flex-grow: 2;
  }

  .time {
    font-size: 1rem;
  }
</style>
