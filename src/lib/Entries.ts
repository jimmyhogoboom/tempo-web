import Result, { ok, err } from 'true-myth/result';
import { just, nothing } from 'true-myth/maybe';
import replaceProps from './utils/replaceProps';

export type TimeEntryUpdate = {
	id: UUID;
	startTime?: Date;
	endTime?: Date;
	title?: string;
	projectId?: UUID;
};
export type NewTimeEntry = Omit<TimeEntryUpdate, 'id'>;

export const isUpdate = (
	newEntry?: NewTimeEntry | TimeEntryUpdate
): newEntry is TimeEntryUpdate => {
	return newEntry !== undefined && 'id' in newEntry;
};

type AddEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntriesOutput = { entries: TimeEntry[]; updatedEntries: TimeEntry[] };

const hasId = (entryId: string) => (entry: TimeEntry) => entry.id === entryId;

export function initEntries(_crypto: ICrypto) {
	/**
	 * True if the entry has no endTime, and is therefore currently being tracked
	 */
	const entryOpen = (entry?: TimeEntry | NewTimeEntry | TimeEntryUpdate) =>
		entry && entry.startTime && !entry.endTime;

	/**
	 * True when at least one entry in the list is open
	 */
	const hasOpenEntry = (entries: TimeEntry[]) => entries.some(entryOpen);

	const findOpenEntry = (entries: TimeEntry[]): Result<TimeEntry, string> => {
		const entry = entries.find(entryOpen);
		if (entry) {
			return ok(entry);
		}

		return err('No open entries');
	};

	const hasEntry = (entries: TimeEntry[], entryId: string) => entries.some(hasId(entryId));

	const getEntry = (entries: TimeEntry[], entryId: string) => {
		const entry = entries.find(hasId(entryId));
		if (entry) {
			return just(entry);
		}

		return nothing();
	};

	const addEntry = (entries: TimeEntry[], entry?: NewTimeEntry): Result<AddEntryOutput, string> => {
		if (hasOpenEntry(entries)) {
			return err("There's already a timer running");
		}

		const newId = _crypto.randomUUID();
		// Ensure a new id
		const _entry: TimeEntry = entry
			? ({ ...entry, createdAt: new Date(), id: newId } as TimeEntry)
			: {
					id: newId,
					title: '',
					startTime: new Date(),
					createdAt: new Date()
				};

		const _entries = [...entries, _entry];

		return ok({
			entries: _entries,
			entry: _entry
		});
	};

	const updateEntry = (
		entries: TimeEntry[],
		entryUpdate: TimeEntryUpdate
	): Result<UpdateEntryOutput, string> => {
		const entry = getEntry(entries, entryUpdate.id);
		if (entry.isNothing) {
			return err(`Entry with id ${entryUpdate.id} does not exist`);
		}

		const newEntry = { ...replaceProps(entry.value, entryUpdate), updatedAt: new Date() };
		const index = entries.findIndex((e) => e.id === entry.value.id);

		entries[index] = newEntry;

		return ok({ entries, entry: newEntry } as UpdateEntryOutput);
	};

	const updateEntries = (
		entries: TimeEntry[],
		entryUpdates: TimeEntryUpdate[]
	): UpdateEntriesOutput => {
		const updates = entryUpdates.reduce((_updates, entryUpdate) => {
			const entry = getEntry(entries, entryUpdate.id);
			if (entry.isNothing) {
				return _updates;
			}

			const newEntry = { ...replaceProps(entry.value, entryUpdate), updatedAt: new Date() };
			const index = entries.findIndex((e) => e.id === entry.value.id);

			entries[index] = newEntry;

			return [..._updates, newEntry];
		}, [] as TimeEntry[]);

		return { entries, updatedEntries: updates };
	};

	const deleteEntry = (entries: TimeEntry[], id: UUID) => {
		const entry = getEntry(entries, id);
		if (entry.isNothing) {
			return entries;
		}

		return entries.filter((e) => e.id !== id);
	};

	const deleteEntries = (entries: TimeEntry[], ids: UUID[]) => {
		return entries.filter((e) => ids.includes(e.id));
	};

	const addOrUpdate = (entries: TimeEntry[], newEntry: NewTimeEntry | TimeEntryUpdate) => {
		const id = isUpdate(newEntry) ? newEntry.id : undefined;

		return id
			? updateEntry(entries, { id, ...newEntry })
			: addEntry(entries, newEntry ?? undefined);
	};

	return {
		entryOpen,
		hasOpenEntry,
		findOpenEntry,
		hasEntry,
		addEntry,
		updateEntry,
		updateEntries,
		addOrUpdate,
		deleteEntry,
		deleteEntries
	};
}

export default initEntries(crypto);
