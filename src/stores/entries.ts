import Maybe from 'true-myth/maybe';
import Entries, { type AddEntryResult, type UpdateEntryResult } from '$lib/Entries';
import { createLocalStorageStore } from '$stores/stores';

// An interface for the front end to access long-term storage
// which consolidates that access to multiple storage methods
const entriesLocalStorageStore = createLocalStorageStore<TimeEntry>('entry');
const entriesStorage = Entries(entriesLocalStorageStore);
export const entries = {
  ...entriesLocalStorageStore,
  findOpenEntry: (): Maybe<OpenTimeEntry> => {
    return entriesStorage.findOpenEntry();
  },
  update: (entryUpdate: TimeEntryUpdate): UpdateEntryResult => {
    return entriesStorage.updateEntry(entryUpdate);
  },
  add: (newEntry: NewTimeEntry): AddEntryResult => {
    return entriesStorage.addEntry(newEntry);
  },
};
