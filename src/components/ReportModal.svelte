<script lang="ts">
  import Modal from './Modal.svelte';
  import { entries } from '$stores/stores';

  export let isOpen: boolean;
</script>

<Modal {isOpen}>Report here</Modal>
