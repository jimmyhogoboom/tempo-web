import Result, { ok, err } from 'true-myth/result';

export const entryOpen = (entry: TimeEntry) => entry && !entry.endTime;

export const hasOpenEntry = (entries: TimeEntry[]) => entries.some(entryOpen);

export const openEntry = (entries: TimeEntry[]) => entries.find(entryOpen);

const hasId = (entryId: string) => (entry: TimeEntry) => entry.id === entryId;
export const hasEntry = (entries: TimeEntry[], entryId: string) => entries.some(hasId(entryId));

const replaceProps = <T, U>(existing: T, replace: U): T => ({ ...existing, ...replace });

type AddEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntryOutput = { entries: TimeEntry[] };

export const addEntry = (
	entries: TimeEntry[],
	entry?: TimeEntry
): Result<AddEntryOutput, string> => {
	if (hasOpenEntry(entries)) {
		return err("There's already a timer running");
	}

	const _entry = entry ?? {
		id: '', // TODO: generate guid
		startTime: new Date(),
		title: ''
	};

	const _entries = [...entries, _entry];

	return ok({
		entries: _entries,
		entry: _entry
	});
};

export const updateEntry = (
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
