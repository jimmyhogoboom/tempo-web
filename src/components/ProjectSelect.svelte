<script lang="ts">
  import { unwrapOr } from 'true-myth/maybe';
  import Projects, { type NewProject, type ProjectUpdate } from '$lib/Projects';
  import Entries from '$lib/Entries';
  import { projects, entries } from '$stores/stores';
  import { empty, isNumber } from '$lib/utils/general';

  const { addOrUpdate, getProject, deleteProject } = Projects;
  const { updateEntries } = Entries;

  export let onSave: (projectId?: UUID) => void;
  export let projectId: UUID | undefined;
  export let readOnly: boolean;

  $: createOpen = false;
  $: editOpen = false;

  let projectCreating: NewProject = { title: undefined, rate: undefined };
  $: projectCreating;

  let selectedProjectId: UUID | undefined;
  $: selectedProjectId = projectId;

  let selectedProject: Project | undefined;
  $: selectedProject = selectedProjectId
    ? (unwrapOr(undefined, getProject($projects, selectedProjectId)) as Project)
    : undefined;

  let projectEditing: ProjectUpdate | undefined;
  $: projectEditing = selectedProject?.id ? { ...selectedProject } : undefined;

  const isNumberOrEmpty = (val?: string | number) => empty(val) || isNumber(val);
  $: formValid =
    (createOpen && !empty(projectCreating.title) && isNumberOrEmpty(projectCreating.rate)) ||
    (editOpen && !empty(projectEditing?.title) && isNumberOrEmpty(projectEditing?.rate));

  const byProjectName = (p1: Project, p2: Project) => {
    if (p1.title === p2.title) return 0;
    return p1.title > p2.title ? 1 : -1;
  };

  const onChange = (project: NewProject | ProjectUpdate, key: keyof (NewProject | ProjectUpdate)) => (e: any) => {
    project = { ...project, [key]: e.target.value };
    if ('id' in project) {
      projectEditing = project;
    } else {
      projectCreating = project;
    }
  };

  const handleSaveClick = (project?: NewProject | ProjectUpdate) => () => {
    if (project === undefined) return;

    projects.update((ps) => {
      const r = addOrUpdate(ps, project);

      if (r.isOk) {
        selectedProjectId = r.value.project.id;
        return r.value.projects;
      }

      // TODO: better error message handling
      console.error(r.error);

      return ps;
    });

    createOpen = false;
    editOpen = false;
  };

  $: handleDeleteClick = () => {
    if (selectedProjectId === undefined) return;

    const deletedEntries = entries.where((e: TimeEntry) => e.projectId === selectedProjectId);
    const countMap: { [key: number]: string } = {
      1: 'the entry',
      2: 'both entries',
    };
    const count = countMap[deletedEntries.length] || `all ${deletedEntries.length} entries`;
    const warning = deletedEntries.length > 0 ? `, and ${count} attached to this project will become orphaned` : '';

    if (!confirm(`Are you sure you want to delete this Project? This cannot be undone${warning}.`)) {
      return;
    }

    // TODO: This component shouldn't need to know about these details. Handle in the models.
    projects.update((ps) => deleteProject(ps, selectedProjectId!));
    entries.update(
      (es) =>
        updateEntries(
          es,
          deletedEntries.map((e) => ({ ...e, projectId: undefined }))
        ).entries
    );

    selectedProjectId = undefined;
  };
</script>

<div class="container">
  {#if readOnly}
    <div class="title-display">
      <button class="secondary" on:click={() => (readOnly = false)}>
        {selectedProject ? selectedProject.title : 'No project'}
        {selectedProject?.rate ? ` - $${selectedProject?.rate}` : ''}
      </button>
    </div>
  {:else if editOpen && projectEditing}
    <div class="new-project">
      <input
        value={projectEditing.title || ''}
        on:input={onChange(projectEditing, 'title')}
        type="text"
        id="edit-title"
        placeholder="Project Title"
      />
      <input
        value={projectEditing.rate || ''}
        on:input={onChange(projectEditing, 'rate')}
        type="text"
        id="edit-rate"
        placeholder="Rate"
      />
      <div class="create-buttons">
        <button class="secondary" on:click={() => (editOpen = false)}>Cancel</button>
        <button class="primary" on:click={handleSaveClick(projectEditing)} disabled={!formValid}>Save</button>
      </div>
    </div>
  {:else if createOpen}
    <div class="new-project">
      <input
        value={projectCreating.title || ''}
        on:input={onChange(projectCreating, 'title')}
        type="text"
        id="title"
        placeholder="Project Title"
      />
      <input
        value={projectCreating.rate || ''}
        on:input={onChange(projectCreating, 'rate')}
        type="text"
        id="rate"
        placeholder="Rate"
      />
      <div class="create-buttons">
        <button class="secondary" on:click={() => (createOpen = false)}>Cancel</button>
        <button class="primary" on:click={handleSaveClick(projectCreating)} disabled={!formValid}>Create</button>
      </div>
    </div>
  {:else}
    {#if $projects.length < 1}
      <div class="empty">No Projects</div>
    {:else}
      <label for="project">Project:</label>
      <select id="project" bind:value={selectedProjectId}>
        <option value={undefined}>- No Project -</option>
        {#each $projects.sort(byProjectName) as project}
          <option value={project.id}>
            {project.title}{project.rate ? ` - $${project.rate}/hr` : ''}
          </option>
        {/each}
      </select>
    {/if}

    <div class="controls">
      <div>
        <button on:click={() => (createOpen = true)} class="secondary success">+ New</button>
        {#if $projects.length > 0}
          <button on:click={() => (editOpen = true)} class="secondary" disabled={!selectedProjectId}>Edit</button>
          <button on:click={() => {}} class="error" disabled={!selectedProjectId} on:click={handleDeleteClick}>
            Delete
          </button>
        {/if}
      </div>

      <div>
        <button
          on:click={() => {
            selectedProjectId = projectId;
            readOnly = true;
            createOpen = false;
            editOpen = false;
          }}
          class="secondary"
        >
          Cancel
        </button>
        <button
          on:click={() => {
            onSave(selectedProjectId);
            readOnly = true;
            createOpen = false;
          }}
          class="primary"
        >
          Ok
        </button>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../styles/variables';
  @use '../styles/button';
  @use '../styles/colors';

  .new-project {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 1rem 0;
    gap: 0.5rem;

    input {
      display: block;
    }
  }

  input {
    font-size: 1rem;
    border: none;
    margin: 0;
    padding: 1rem;
    background: darken(colors.$surface-100, 6);
    color: inherit;
    text-align: center;
    box-shadow: inset 0 5px 6px -6px darken(colors.$surface-100, 10);
  }

  .title-display {
    margin-left: 1rem;
    font-size: 1rem;

    button {
      padding: 1rem;
    }

    @media screen and (max-width: variables.$small) {
      width: 100%;
      height: 100%;
      margin-bottom: 1rem;
    }
  }

  button {
    padding: 0.5rem;
  }

  select {
    font-size: 1rem;
    border: none;
    margin: 0;
    padding: 1rem;
    margin-bottom: 1rem;
    max-width: 15rem;
    background: darken(colors.$surface-100, 6);
    color: inherit;
    box-shadow: inset 0 5px 6px -6px darken(colors.$surface-100, 10);

    @media screen and (max-width: variables.$small) {
      padding: 0.5rem;
    }
  }

  .controls {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  .empty {
    padding: 1rem;
  }

  .container {
    width: 100%;
    min-width: 14rem;

    @media screen and (max-width: variables.$small) {
      padding: 0 1rem;
    }
  }
</style>
