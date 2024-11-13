import Result, { ok, err } from 'true-myth/result';
import Entries, { type UpdateEntryResult, type AddEntryResult } from '$lib/Entries';
import { createLocalStorageStore } from '$stores/stores';

export type UpdateResult = Result<TimeEntry, string>;
export type AddResult = Result<OpenTimeEntry, string>;

const UNEXEPECTED_ERROR = 'unexepected error ocurred';

// An interface for the front end to access long-term storage
// which consolidates that access to multiple storage methods
const entriesLocalStorageStore = createLocalStorageStore<TimeEntry>('entry');
export const entries = {
  ...entriesLocalStorageStore,
  findOpenEntry: () => {
    // TODO: Should just be return entriesLocalStorageStore.find(entryOpen); after Entries refactor
    const { findOpenEntry } = Entries(entriesLocalStorageStore.all());
    return findOpenEntry();
  },
  delete: (entryId: TimeEntry['id']) => {
    // TODO: Should just be return entriesLocalStorageStore.delete(entry); after Entries refactor
    entriesLocalStorageStore.update((es) => {
      const { deleteEntry } = Entries(es);
      return deleteEntry(entryId);
    });
  },
  update: (entry: TimeEntryUpdate): UpdateResult => {
    let r: UpdateEntryResult | undefined;
    // TODO: Should just be const r = entriesLocalStorageStore.update(entry); after Entries refactor
    entriesLocalStorageStore.update((es) => {
      const { updateEntry } = Entries(es);
      r = updateEntry(entry);

      if (r.isOk) {
        return r.value.entries;
      }

      console.error(r.error);

      return es;
    });

    return r?.isOk ? ok(r.value.entry) : err(UNEXEPECTED_ERROR);
  },
  // TODO: Should just be const r = entriesLocalStorageStore.add(entry); after Entries refactor
  add: (newEntry: NewTimeEntry): AddResult => {
    let r: AddEntryResult | undefined;
    entriesLocalStorageStore.update((es) => {
      const { addEntry } = Entries(es);
      r = addEntry(newEntry);

      if (r.isOk) {
        return r.value.entries;
      }

      console.error(r.error);

      return es;
    });

    return r?.isOk ? ok(r.value.entry) : err(UNEXEPECTED_ERROR);
  },
};
