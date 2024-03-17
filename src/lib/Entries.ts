export const addEntry = (entries: TimeEntry[], entry?: TimeEntry) => {
	const _entries = [...entries];
	// if list has no open task, start a new one
	// if a task is already open, just return the list?
	return {
		ok: _entries
	};
};
