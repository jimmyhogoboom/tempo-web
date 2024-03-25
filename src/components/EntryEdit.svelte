<script lang="ts">
	import { dateFormat } from '$lib/utils/dateUtils';
	import { formatEntryDuration } from '$lib/utils/entryUtils';
	import { time } from '$stores/stores';
	import Entries, { type NewTimeEntry, type TimeEntryUpdate } from '$lib/Entries';

	const { entryOpen } = Entries;

	export let onCancelClick: () => void;
	export let onCopyClick: () => void;
	export let onDeleteClick: () => void;
	export let onChange: (updatedEntry?: TimeEntryUpdate) => void;
	export let entry: TimeEntry | undefined;

	$: currentEntry = { ...entry } as TimeEntryUpdate;
	$: formDirty =
		currentEntry &&
		entry &&
		(currentEntry.title !== entry.title ||
			currentEntry.startTime !== entry.startTime ||
			currentEntry.endTime != entry.endTime);

	const onLocalCancelClick = () => {
		currentEntry = { ...entry } as TimeEntryUpdate;
		onCancelClick();
	};

	const onSaveClick = () => {
		onChange(currentEntry);
	};

	const onLocalChange = (newEntry: NewTimeEntry) => {
		currentEntry = { ...currentEntry, ...newEntry };
	};
</script>

<div class="edit flex-col">
	<div class="flex">
		<input
			class="title"
			type="text"
			placeholder="Entry description"
			value={currentEntry.title}
			on:input={(e) => onLocalChange({ title: e.currentTarget.value })}
		/>
	</div>
	<div class="flex justify-right">
		<div class="flex nowrap">
			<input
				type="text"
				value={dateFormat(currentEntry?.startTime || undefined)}
				class="time-field"
			/>
			<span style="padding: 0 0.3rem;">→</span>
			<input
				type="text"
				value={dateFormat(currentEntry?.endTime || undefined)}
				class="time-field"
			/>
		</div>
		<input type="text" value={formatEntryDuration($time, currentEntry)} class="time-field total" />
	</div>
	<div class="flex controls">
		<div>
			{#if currentEntry && !!currentEntry.endTime}
				<button on:click={onCopyClick}>Copy</button>
			{/if}
			{#if currentEntry && !entryOpen(currentEntry)}
				<button on:click={onDeleteClick}>Delete</button>
			{/if}
		</div>
		<div>
			<button on:click={onLocalCancelClick}>Canel</button>
			<button on:click={onSaveClick} disabled={!formDirty}>Save</button>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../styles/colors';

	button {
		padding: 0.5rem;
		background-color: colors.$primary-300;
		border-radius: 0.5rem;
		cursor: pointer;
		border: 0.2rem solid transparent;

		&:hover {
			background-color: colors.$primary-200;
		}

		&:disabled {
			background-color: colors.$primary-500;
			border: 0.2rem solid transparent;
			cursor: default;
			color: colors.$surface-mixed-300;
		}
	}

	.controls {
		margin: 0 1rem;
		margin-bottom: 0.5rem;
	}

	.edit {
		font-family: sans-serif;
		background-color: darken(colors.$surface-100, 4);
		height: 100%;
	}

	.flex {
		position: relative;
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;

		&.justify-right {
			justify-content: end;
		}
	}

	.flex-col {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.nowrap {
		white-space: nowrap;
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

	.time-field {
		max-width: 130px;

		&.total {
			margin-left: 2rem;
		}
	}

	.title {
		display: block;
		width: 100%;
		padding: 1.3rem;
	}
</style>
