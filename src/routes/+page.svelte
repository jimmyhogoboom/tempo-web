<script lang="ts">
	import { unwrapOr } from 'true-myth/result';
	import { entries } from '$stores/stores';
	import Entries, { type NewTimeEntry, type TimeEntryUpdate, isUpdate } from '$lib/Entries';
	import Timer from '$components/Timer.svelte';
	import EntryListItem from '$components/EntryListItem.svelte';
	import EntryEdit from '$components/EntryEdit.svelte';

	const { addEntry, openEntry, updateEntry, deleteEntry } = Entries;

	let currentEntry: TimeEntry | undefined;
	$: currentEntry = unwrapOr(undefined, openEntry($entries));

	$: open = false;
	let selectedEntry: TimeEntry | undefined;
	$: selectedEntry = undefined;

	$: savedTitle = '';

	// TODO: addOrUpdate is probably doing too much here, and should be somewhere else.
	const addOrUpdate = (newEntry?: NewTimeEntry | TimeEntryUpdate) => {
		const id = isUpdate(newEntry) ? newEntry.id : undefined;
		entries.update((es) => {
			const r = id ? updateEntry(es, { id, ...newEntry }) : addEntry(es, newEntry ?? undefined);

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
			? ({ ...currentEntry, endTime: null } as TimeEntryUpdate) // Closed task will be re-opened (endTime removed)
			: {
					...currentEntry,
					title: currentEntry?.title || savedTitle,
					// Task without start is given one
					startTime: currentEntry?.startTime ?? new Date()
				};

		// Must be cleared to avoid polluting next entry
		savedTitle = '';

		addOrUpdate(arg);
	};

	const handleStopClick = () => {
		addOrUpdate({ ...currentEntry, endTime: new Date() });
		currentEntry = undefined;
	};

	const handleTitleChange = (entry?: TimeEntry) => (text: string) => {
		if (!entry) {
			savedTitle = text;
		} else {
			addOrUpdate({ ...entry, title: text });
		}
		console.log(savedTitle);
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

		addOrUpdate({
			...entry,
			startTime: undefined,
			endTime: undefined,
			id: undefined
		});
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
				{#each $entries as entry}
					{@const isSelected = selectedEntry?.id === entry.id}
					<EntryListItem {entry} onClick={handleEntryClick(entry)} selected={isSelected} />
					<div class="popout {isSelected && 'open'}">
						<EntryEdit
							{entry}
							onCopyClick={handleCopyClick(entry)}
							onDeleteClick={handleDeleteClick(entry)}
							onChange={handleTitleChange(entry)}
						/>
					</div>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style lang="scss">
	@use '../styles/colors';

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
		overflow-x: hidden;
		z-index: 1;

		.list-container {
			width: 100%;

			.popout {
				transition: height 0.6s;
				overflow: hidden;
				height: 0;

				&.open {
					height: 9rem;
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
	}

	.background-dark {
		background-color: darken(colors.$background-color, 3);
		color: colors.$text-dim;
	}
</style>
