export const entryOpen = (entry: TimeEntry) => entry && !entry.endTime;

export const hasOpenEntry = (entries: TimeEntry[]) => entries.some(entryOpen);

export const openEntry = (entries: TimeEntry[]) => entries.find(entryOpen);

export const addEntry = (entries: TimeEntry[], entry?: TimeEntry) => {
	if (hasOpenEntry(entries)) {
		return {
			err: "There's already a timer running"
		};
	}

	const _entry = entry
		? entry
		: {
				id: '', // TODO: generate guid
				startTime: new Date(),
				title: ''
			};

	const _entries = [...entries, _entry];

	return {
		// TODO: make ok: boolean, and add data property
		ok: _entries
	};
};
