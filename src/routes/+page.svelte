<script lang="ts">
	import { unwrapOr } from 'true-myth/result';
	import { entries } from '$stores/stores';
	import Entries, { type NewTimeEntry, type TimeEntryUpdate, isUpdate } from '$lib/Entries';
	import Timer from '$components/Timer.svelte';
	import EntryListItem from '$components/EntryListItem.svelte';
	import EntryEdit from '$components/EntryEdit.svelte';

	const { findOpenEntry, addOrUpdate, deleteEntry } = Entries;

	let currentEntry: TimeEntry | undefined;
	$: currentEntry = unwrapOr(undefined, findOpenEntry($entries));

	$: open = false;
	let selectedEntry: TimeEntry | undefined;
	$: selectedEntry = undefined;

	$: savedTitle = '';

	const saveEntry = (newEntry: NewTimeEntry | TimeEntryUpdate) => {
		entries.update((es) => {
			const r = addOrUpdate(es, newEntry);

			if (r.isOk) {
				if (!isUpdate(newEntry)) currentEntry = r.value.entry;
				return r.value.entries;
			}

			// TODO: better error message handling
			console.error(r.error);

			return es;
		});
	};

	const handleStartClick = () => {
		const isClosed = currentEntry && !!currentEntry.endTime;

		const arg: NewTimeEntry | TimeEntryUpdate | undefined = isClosed
			? ({ ...currentEntry, endTime: undefined } as TimeEntryUpdate) // Closed task will be re-opened (endTime removed)
			: {
					...currentEntry,
					title: currentEntry?.title || savedTitle,
					// Task without start is given one
					startTime: currentEntry?.startTime ?? new Date()
				};

		// Must be cleared to avoid polluting next entry
		savedTitle = '';

		saveEntry(arg);
	};

	const handleStopClick = () => {
		saveEntry({ ...currentEntry, endTime: new Date() });
		currentEntry = undefined;
	};

	const handleTitleChange = (entry?: TimeEntry) => (text: string) => {
		if (!entry) {
			savedTitle = text;
		} else {
			saveEntry({ ...entry, title: text });
		}
	};

	const handleChange = (entry?: TimeEntry) => (updatedEntry?: TimeEntryUpdate) => {
		if (!entry) {
			savedTitle = updatedEntry?.title || '';
		} else {
			saveEntry({ ...entry, ...updatedEntry });
		}

		if (selectedEntry) selectedEntry = undefined;
	};

	const handleEntryClick = (entry: TimeEntry) => () => {
		if (open && entry.id === selectedEntry?.id) {
			open = false;
			selectedEntry = undefined;
		} else {
			open = true;
			selectedEntry = entry;
		}
	};

	const handleCopyClick = (entry?: TimeEntry) => () => {
		if (!entry) return;

		saveEntry({
			...entry,
			startTime: undefined,
			endTime: undefined,
			id: undefined
		});

		// TODO: Set the new entry as the currentEntry
	};

	const handleDeleteClick = (entry?: TimeEntry) => () => {
		if (entry && confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
			if (currentEntry?.id === entry.id) {
				currentEntry = undefined;
			}
			entries.update((es) => {
				return deleteEntry(es, entry.id);
			});
			selectedEntry = undefined;
			open = false;
		}
	};
</script>

<div class="full background-dark">
	<div class="head-wrapper">
		<div class="timer">
			<Timer
				entry={currentEntry}
				onStart={handleStartClick}
				onStop={handleStopClick}
				onTitleChange={handleTitleChange(currentEntry)}
			/>
		</div>
	</div>

	<div class="wrapper {open && 'open'}">
		<div class="list-container">
			<ul>
				{#if $entries.length < 1}
					<div class="prompt">Hit the start button to start a new entry</div>
				{/if}
				{#each $entries as entry}
					{@const isSelected = selectedEntry?.id === entry.id}
					<EntryListItem {entry} onClick={handleEntryClick(entry)} selected={isSelected} />
					<div class="popout {isSelected && 'open'}">
						<EntryEdit
							{entry}
							onCancelClick={handleEntryClick(entry)}
							onCopyClick={handleCopyClick(entry)}
							onDeleteClick={handleDeleteClick(entry)}
							onChange={handleChange(entry)}
						/>
					</div>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../styles/colors';
	@use '../styles/variables';

	.prompt {
		font-family: sans-serif;
		font-size: 1.1rem;
		width: 100%;
		text-align: center;
		margin-top: 3rem;
	}

	.head-wrapper {
		position: sticky;
		top: 0;
		width: 100%;
		box-shadow: 0px -5px 5px 5px black;
		z-index: 10;
	}

	.wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		max-width: 800px;
		z-index: 1;

		.list-container {
			width: 100%;

			.popout {
				transition: height 0.5s;
				overflow: hidden;
				height: 0;

				&.open {
					height: 15rem;

					@media screen and (max-width: variables.$small) {
						height: 19rem;
					}
				}
			}
		}
	}

	ul {
		max-width: 800px;
		margin: 1rem auto;
	}

	.full {
		position: relative;
		margin: 0 auto;
		height: 100%;
		overflow: auto;
	}

	.background-dark {
		background-color: darken(colors.$background-color, 3);
		color: colors.$text-dim;
	}
</style>
