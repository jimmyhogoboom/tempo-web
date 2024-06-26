<script lang="ts">
  import { intervalToDuration } from 'date-fns/fp';
  import Modal from './Modal.svelte';
  import { projects, time } from '$stores/stores';
  import { entriesTotalValue, entriesTotalTime, formattedDuration } from '$lib/utils/entryUtils';

  export let isOpen: boolean;
  export let entries: TimeEntry[];

  $: totalValue = entriesTotalValue($projects, entries);

  $: totalTime = entriesTotalTime(entries, $time);
  $: formattedTime = formattedDuration(totalTime);

  $: projectNames = $projects.reduce((names, project)=> ({
    ...names,
    [project.id]: project.title
  }), {} as Record<string, string>);

  type ProjectEntries = {
    entries: TimeEntry[],
    projectName: string
  };
  type ProjectDictionary = Record<UUID | '$$NOPROJECT', ProjectEntries>;
  let projectDictionary: ProjectDictionary;
  $: projectDictionary = entries.reduce((dict, entry) => {
    const projectId = entry.projectId ?? '$$NOPROJECT';

    const newVal = dict[projectId] || { entries: [], projectName: projectNames[projectId] || 'No Project' };
    newVal.entries.push(entry);

    return {
      ...dict,
      [projectId]: newVal,
    };
  }, {} as ProjectDictionary);
</script>

<Modal {isOpen}>
  <div>
    <h1>Week Total:</h1>
    <h2>Earned: ${totalValue}</h2>
    <h2>Logged: {formattedTime}</h2>
  </div>
  <hr />
  <div>
    {#each Object.entries(projectDictionary) as [projectId, projectEntries]}
      <div class="project-entry">
        <h3 class="name">{projectEntries.projectName}:</h3>
        <div class="values">
          <div>{formattedDuration(entriesTotalTime(projectEntries.entries, $time))}</div>
          {#if $projects.find(p => p.id === projectId)?.rate}
            <div>${entriesTotalValue($projects, projectEntries.entries)}</div>
          {/if}
        </div>
      </div>
    {/each}
  <div>
</Modal>

<style lang="scss">
  @use '../styles/colors';
  @use '../styles/button';

  div {
    background-color: colors.$background-color;
    font-family: sans-serif;
  }

  h1,
  h2 {
    margin-bottom: 1rem;
  }

  .values {
    display: flex;
    justify-content: flex-start;
    gap: 2rem;
  }

  .project-entry {
    margin: 1rem auto;
  }

  .name {
    margin-bottom: 0.5rem;
  }
</style>
