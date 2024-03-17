export const addEntry = (entries: TimeEntry[], entry?: TimeEntry) => {
	if (entryOpen(entries)) {
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
		ok: _entries
	};
};

const entryOpen = (entries: TimeEntry[]) => entries.some((e) => !e.endTime);
