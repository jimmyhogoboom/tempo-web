import Result from 'true-myth/result';
import Maybe from 'true-myth/maybe';
import Entries from '$lib/Entries';
import { createLocalStorageStore } from '$stores/stores';

export type UpdateResult = Result<TimeEntry, string>;
export type AddResult = Result<OpenTimeEntry, string>;

// An interface for the front end to access long-term storage
// which consolidates that access to multiple storage methods
const entriesLocalStorageStore = createLocalStorageStore<TimeEntry>('entry');
const entriesStorage = Entries(entriesLocalStorageStore);
export const entries = {
  ...entriesLocalStorageStore,
  findOpenEntry: (): Maybe<OpenTimeEntry> => {
    return entriesStorage.findOpenEntry();
  },
  update: (entryUpdate: TimeEntryUpdate): UpdateResult => {
    return entriesStorage.updateEntry(entryUpdate);
  },
  add: (newEntry: NewTimeEntry): AddResult => {
    return entriesStorage.addEntry(newEntry);
  },
};
