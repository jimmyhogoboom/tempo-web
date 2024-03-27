<script lang="ts">
	import Projects, { type NewProject } from '$lib/Projects';
	import { projects } from '$stores/stores';

	const { addOrUpdate, deleteProject } = Projects;

	export let onCancelClick: () => void;
	export let onSaveClick: (projectId?: UUID) => void;
	export let entry: TimeEntry | undefined;

	$: createOpen = false;

	let projectCreating: NewProject = { title: undefined, rate: undefined };
	$: projectCreating;

	let selectedProjectId: UUID | undefined = entry?.projectId;

	const handleCreateClick = () => {
		projects.update((ps) => {
			const r = addOrUpdate(ps, projectCreating);

			if (r.isOk) {
				selectedProjectId = r.value.project.id;
				return r.value.projects;
			}

			// TODO: better error message handling
			console.error(r.error);

			return ps;
		});

		createOpen = false;
	};
</script>

<div>
	{#if createOpen}
		<div>
			<input
				bind:value={projectCreating.title}
				type="text"
				id="title"
				placeholder="Project Title"
			/>
			<input bind:value={projectCreating.rate} type="text" id="rate" placeholder="Rate" />
		</div>

		<button on:click={() => (createOpen = false)}>Cancel</button>
		<button on:click={handleCreateClick}>Create</button>
	{:else}
		{#if $projects.length < 1}
			<div>No Projects</div>
		{:else}
			<label for="project">Project:</label>
			<select id="project" bind:value={selectedProjectId}>
				<option>- No Project -</option>
				{#each $projects as project}
					<option value={project.id}>
						{project.title}{project.rate ? ` - $${project.rate}/hr` : ''}
					</option>
				{/each}
			</select>
		{/if}
		<button on:click={() => (createOpen = true)}>+ Create New Project</button>

		<button on:click={onCancelClick}>Cancel</button>
		<button on:click={() => onSaveClick(selectedProjectId)}>Ok</button>
	{/if}
</div>

<style lang="scss">
</style>
