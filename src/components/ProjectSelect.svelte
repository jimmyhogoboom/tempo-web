<script lang="ts">
	import { unwrapOr } from 'true-myth/maybe';
	import Projects, { type NewProject } from '$lib/Projects';
	import { projects } from '$stores/stores';

	const { addOrUpdate, getProject, deleteProject } = Projects;

	export let onSave: (projectId?: UUID) => void;
	export let projectId: UUID | undefined;

	$: readOnly = true;

	$: createOpen = false;

	let projectCreating: NewProject = { title: undefined, rate: undefined };
	$: projectCreating;

	let selectedProjectId: UUID | undefined;
	$: selectedProjectId = projectId;

	let selectedProject: Project | undefined;
	$: selectedProject = selectedProjectId
		? (unwrapOr(undefined, getProject($projects, selectedProjectId)) as Project)
		: undefined;

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
	{#if readOnly}
		<button class="title-display secondary" on:click={() => (readOnly = false)}>
			{selectedProject ? selectedProject.title : 'No project'}
			{selectedProject?.rate ? ` - $${selectedProject?.rate}` : ''}
		</button>
	{:else if createOpen}
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

		<button
			on:click={() => {
				selectedProjectId = projectId;
				readOnly = true;
				createOpen = false;
			}}
		>
			Cancel
		</button>
		<button
			on:click={() => {
				onSave(selectedProjectId);
				readOnly = true;
				createOpen = false;
			}}
		>
			Ok
		</button>
	{/if}
</div>

<style lang="scss">
	@use '../styles/variables';
	@use '../styles/button';

	.title-display {
		margin-left: 1rem;
	}

	button {
		padding: 1rem;

		@media screen and (max-width: variables.$small) {
			padding: 0.5rem;
		}
	}

	select {
		padding: 1rem;

		@media screen and (max-width: variables.$small) {
			padding: 0.5rem;
		}
	}
</style>
