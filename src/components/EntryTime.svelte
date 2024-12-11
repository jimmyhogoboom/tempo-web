<script lang="ts">
  import { time } from '$stores/stores';
  import { formatEntryDuration } from '$lib/utils/entryUtils';

  interface Props {
    entry: TimeEntry | undefined;
  }

  let { entry }: Props = $props();

  let formatted = $derived(formatEntryDuration($time, entry));
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
