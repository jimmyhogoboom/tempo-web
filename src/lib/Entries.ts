import Result, { ok, err } from 'true-myth/result';

type AddEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntryOutput = { entries: TimeEntry[] };

const hasId = (entryId: string) => (entry: TimeEntry) => entry.id === entryId;
const replaceProps = <T, U>(existing: T, replace: U): T => ({ ...existing, ...replace });

export function buildEntries(_crypto: ICrypto) {
	/**
	 * True if the entry has no endTime, and is therefore currently being tracked
	 */
	const entryOpen = (entry: TimeEntry) => entry && !entry.endTime;

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
  }

	const hasEntry = (entries: TimeEntry[], entryId: string) => entries.some(hasId(entryId));

	const addEntry = (entries: TimeEntry[], entry?: TimeEntry): Result<AddEntryOutput, string> => {
		if (hasOpenEntry(entries)) {
			return err("There's already a timer running");
		}

		const _entry = entry ?? {
			id: _crypto.randomUUID(),
			startTime: new Date(),
			title: ''
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
		if (!hasEntry(entries, entryUpdate.id)) {
			return err(`Entry with id ${entryUpdate.id} does not exist`);
		}

		const newEntries: TimeEntry[] = entries.reduce<TimeEntry[]>((es, e) => {
			return [...es, hasId(entryUpdate.id)(e) ? replaceProps(e, entryUpdate) : e];
		}, []);

		return ok({ entries: newEntries } as UpdateEntryOutput);
	};

	return {
		entryOpen,
		hasOpenEntry,
		openEntry,
		hasEntry,
		addEntry,
		updateEntry
	};
}

export default buildEntries(crypto);
