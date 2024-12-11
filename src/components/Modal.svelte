<script lang="ts">
  import { closeModal } from 'svelte-modals';
  
  interface Props {
    // provided by Modals
    isOpen: boolean;
    children?: import('svelte').Snippet;
  }

  let { isOpen, children }: Props = $props();
</script>

{#if isOpen}
  <div role="dialog" class="modal">
    <div class="actions">
      <button id="x" onclick={closeModal}>✕</button>
    </div>
    <div class="contents">
      {@render children?.()}
    </div>
  </div>
{/if}

<style lang="scss">
  @use '../styles/colors';
  @use '../styles/button';

  .modal {
    position: fixed;
    top: 10rem;
    right: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    z-index: 999;
    min-width: 240px;
    max-width: 800px;
    border-radius: 1rem;
    padding: 1rem;
    margin: 0 auto;
    background-color: colors.$background-color;

    /* allow click-through to backdrop */
    /* pointer-events: none; */

    & * {
      z-index: 999;
    }
  }

  .contents {
    pointer-events: auto;
    height: 100%;
    width: 100%;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  #x {
    padding: 0.5rem 0.7rem;
  }
</style>
