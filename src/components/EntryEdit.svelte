<script lang="ts">
	import { dateFormat, parseTime } from '$lib/utils/dateUtils';
	import { formatEntryDuration } from '$lib/utils/entryUtils';
	import { time } from '$stores/stores';
	import Entries, { type NewTimeEntry, type TimeEntryUpdate } from '$lib/Entries';

	const { entryOpen } = Entries;

	export let onCancelClick: () => void;
	export let onCopyClick: () => void;
	export let onDeleteClick: () => void;
	export let onChange: (updatedEntry?: TimeEntryUpdate) => void;
	export let entry: TimeEntry | undefined;
	$: entry;

	type EntryForm = {
		startTime?: string;
		endTime?: string;
		totalTime?: string;
		title?: string;
	};

	const entryToFormValues = (entry?: TimeEntry) => ({
		startTime: entry && dateFormat(entry?.startTime || undefined),
		endTime: entry && dateFormat(entry?.endTime || undefined),
		title: entry ? entry.title : '',
		totalTime: entry && formatEntryDuration($time, entry)
	});

	const formValuesToEntry = (form: EntryForm): TimeEntryUpdate | undefined =>
		entry && form
			? {
					id: entry.id,
					startTime: timeToDate(entry.startTime, form.startTime),
					endTime: timeToDate(entry.endTime, form.endTime),
					title: form.title
				}
			: undefined;

	const formEqualsEntry = (form: EntryForm, entry?: TimeEntry) => {
		const entryAsForm = entryToFormValues(entry);

		return (
			entryAsForm.startTime === form.startTime &&
			entryAsForm.endTime === form.endTime &&
			entryAsForm.title === form.title
		);
	};

	$: currentEntry = entryToFormValues(entry);
	$: formDirty = currentEntry && entry && !formEqualsEntry(currentEntry, entry);
	// TODO: add formValid boolean to disable save button when input is invalid

	$: entryCanDelete = currentEntry && !entryOpen(formValuesToEntry(currentEntry));

	const onLocalCancelClick = () => {
		currentEntry = entryToFormValues(entry);
		onCancelClick();
	};

	const onSaveClick = () => {
		onChange(formValuesToEntry(currentEntry));
	};

	const onLocalChange = (newEntry: EntryForm) => {
		// TODO: if it's the totalTime that changed:
		//       if the entry is open, update the startTime to make it true
		//       if the entry is closed, update the endTime to make it true

		// TODO: update the total time when start or end date is changed
		currentEntry = { ...currentEntry, ...newEntry };
	};

	const timeToDate = (referenceDate: Date = new Date(), text?: string): Date => {
		// TODO: use the entry's createdDate as the referenceDate to avoid issues when the start/end dates are null
		if (referenceDate === null) referenceDate = new Date();
		if (!text) return referenceDate;

		const r = parseTime(referenceDate, text);

		return r.isOk ? r.value : referenceDate;
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
				class="time-field"
				value={currentEntry?.startTime}
				on:input={(e) =>
					onLocalChange({
						startTime: e.currentTarget.value
					})}
			/>
			<span style="padding: 0 0.3rem;">→</span>
			<!-- TODO: disable this input if the entry is open -->
			<input
				type="text"
				class="time-field"
				value={currentEntry?.endTime}
				on:input={(e) =>
					onLocalChange({
						endTime: e.currentTarget.value
					})}
			/>
		</div>
		<!-- TODO: disable this input if the entry is open -->
		<input type="text" value={currentEntry.totalTime} class="time-field total" />
	</div>
	<div class="flex controls">
		<div>
			<!-- {#if currentEntry && !!currentEntry.endTime} -->
			<!-- 	<button on:click={onCopyClick}>Copy</button> -->
			<!-- {/if} -->
			{#if entryCanDelete}
				<button on:click={onDeleteClick} class="error">Delete</button>
			{/if}
		</div>
		<div class="gap">
			<button on:click={onLocalCancelClick} class="secondary">Cancel</button>
			<button on:click={onSaveClick} class="primary" disabled={!formDirty}>Save</button>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../styles/colors';

	button {
		padding: 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		border: 0.2rem solid transparent;

		&.primary {
			background-color: lighten(colors.$text-dim, 25);

			&:hover {
				background-color: lighten(colors.$text-dim, 15);
			}

			&:disabled {
				background-color: darken(colors.$text-dim, 22);
				color: darken(colors.$text-dim, 35);
			}
		}

		&.secondary {
			background-color: transparent;
			color: colors.$text-dim;
			font-weight: bold;

			&:hover {
				background-color: transparentize(colors.$text-dim, 0.9);
			}
		}

		&.warning {
		}

		&.error {
			color: colors.$primary-100;
			background-color: transparent;
			font-weight: bold;

			&:hover {
				background-color: colors.$primary-300;
				color: darken(colors.$primary-100, 35);
			}

			&:disabled {
				background-color: colors.$primary-500;
				color: colors.$surface-mixed-300;
			}
		}

		&:disabled {
			cursor: default;
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

		& .gap {
			display: flex;
			gap: 1rem;
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
