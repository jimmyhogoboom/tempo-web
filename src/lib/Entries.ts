import Result, { ok, err } from 'true-myth/result';
import { just, nothing } from 'true-myth/maybe';

export type TimeEntryUpdate = {
	id: UUID;
	startTime?: Date | null;
	endTime?: Date | null;
	title?: string | null;
};
export type NewTimeEntry = Omit<TimeEntryUpdate, 'id'>;

export const isUpdate = (
	newEntry?: NewTimeEntry | TimeEntryUpdate
): newEntry is TimeEntryUpdate => {
	return newEntry !== undefined && 'id' in newEntry;
};

type AddEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };

const hasId = (entryId: string) => (entry: TimeEntry) => entry.id === entryId;
const replaceProps = <T, U>(existing: T, replace: U): T => ({ ...existing, ...replace });

export function initEntries(_crypto: ICrypto) {
	/**
	 * True if the entry has no endTime, and is therefore currently being tracked
	 */
	const entryOpen = (entry: TimeEntry | NewTimeEntry | TimeEntryUpdate) =>
		entry && entry.startTime && !entry.endTime;

	/**
	 * True when at least one entry in the list is open
	 */
	const hasOpenEntry = (entries: TimeEntry[]) => entries.some(entryOpen);

	const openEntry = (entries: TimeEntry[]): Result<TimeEntry, string> => {
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
			? ({ ...entry, id: newId } as TimeEntry)
			: {
					id: newId,
					startTime: new Date(),
					title: ''
				};

		_entry.id = _crypto.randomUUID();

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

		const newEntry = replaceProps(entry.value, entryUpdate);
		const index = entries.findIndex((e) => e.id === entry.value.id);

		entries[index] = newEntry;

		return ok({ entries, entry: newEntry } as UpdateEntryOutput);
	};

	const deleteEntry = (entries: TimeEntry[], id: UUID) => {
		const entry = getEntry(entries, id);
		if (entry.isNothing) {
			return entries;
		}

		return entries.filter((e) => e.id !== id);
	};

	return {
		entryOpen,
		hasOpenEntry,
		openEntry,
		hasEntry,
		addEntry,
		updateEntry,
		deleteEntry
	};
}

export default initEntries(crypto);
