<script lang="ts">
	import { unwrapOr } from 'true-myth/maybe';
	import Projects, { type NewProject } from '$lib/Projects';
	import { projects } from '$stores/stores';

	const { addOrUpdate, getProject } = Projects;

	export let onSave: (projectId?: UUID) => void;
	export let projectId: UUID | undefined;

	$: readOnly = true;

	$: createOpen = false;

	let projectCreating: NewProject = { title: undefined, rate: undefined };
	$: projectCreating = { title: undefined, rate: undefined };

	let selectedProjectId: UUID | undefined;
	$: selectedProjectId = projectId;

	let selectedProject: Project | undefined;
	$: selectedProject = selectedProjectId
		? (unwrapOr(undefined, getProject($projects, selectedProjectId)) as Project)
		: undefined;

	const byProjectName = (p1: Project, p2: Project) => {
		if (p1.title === p2.title) return 0;
		return p1.title > p2.title ? 1 : -1;
	};

	const filterNumericalInput = (input: string) => {
		const val = parseFloat(input.replace(/[^0-9.]/g, ''));
		return Number.isNaN(val) ? undefined : val;
	};

	// TODO: Find correct type for e
	const onRateChange = (e: any) => {
		const newRate = filterNumericalInput(e.target.value);

		if (newRate) projectCreating.rate = newRate;
	};

	// TODO: Find correct type for e
	const preventNonNumbers = (e: any) => {
		const allowedKeys = ['Backspace', 'Period'];
		if (allowedKeys.includes(e.code)) return;
		if (e.code.replace(/[^0-9]/g, '').length < 1) e.preventDefault();
	};

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

<div style="width: 100%;">
	{#if readOnly}
		<div class="title-display">
			<button class="secondary" on:click={() => (readOnly = false)}>
				{selectedProject ? selectedProject.title : 'No project'}
				{selectedProject?.rate ? ` - $${selectedProject?.rate}` : ''}
			</button>
		</div>
	{:else if createOpen}
		<div class="new-project">
			<input
				bind:value={projectCreating.title}
				type="text"
				id="title"
				placeholder="Project Title"
			/>
			<input
				value={projectCreating.rate || ''}
				on:input={onRateChange}
				on:keydown={preventNonNumbers}
				type="text"
				id="rate"
				placeholder="Rate"
			/>
			<div class="create-buttons">
				<button class="secondary" on:click={() => (createOpen = false)}>Cancel</button>
				<button class="primary" on:click={handleCreateClick}>Create</button>
			</div>
		</div>
	{:else}
		{#if $projects.length < 1}
			<div>No Projects</div>
		{:else}
			<label for="project">Project:</label>
			<select id="project" bind:value={selectedProjectId}>
				<option>- No Project -</option>
				{#each $projects.sort(byProjectName) as project}
					<option value={project.id}>
						{project.title}{project.rate ? ` - $${project.rate}/hr` : ''}
					</option>
				{/each}
			</select>
		{/if}
		<button on:click={() => (createOpen = true)} class="secondary">+ Create New Project</button>

		<button
			on:click={() => {
				selectedProjectId = projectId;
				readOnly = true;
				createOpen = false;
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
		padding: 0.5rem;
		margin-bottom: 1rem;

		@media screen and (max-width: variables.$small) {
			padding: 0.5rem;
		}
	}
</style>
