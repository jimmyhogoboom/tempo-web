import Result, { ok, err } from 'true-myth/result';

export const entryOpen = (entry: TimeEntry) => entry && !entry.endTime;

export const hasOpenEntry = (entries: TimeEntry[]) => entries.some(entryOpen);

export const openEntry = (entries: TimeEntry[]) => entries.find(entryOpen);

type AddEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };

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
