import Result, { ok, err } from 'true-myth/result';
// import Entries from '$lib/Entries';
import { createListStore } from '$stores/stores';

// const { addEntry, updateEntry } = Entries;

export type EditResult = Result<TimeEntry, string>;
export type AddResult = Result<TimeEntry, string>;

const UNEXEPECTED_ERROR = 'unexepected error ocurred';

// The purpose of a store is to facilitate reactive data.
// TODO: This should probably not be used for direct access to the final persistance location
// It should only be used for UI state
const store = createListStore<TimeEntry>('entry');
export const entries = {
  ...store,
  // edit: (newEntry: TimeEntryUpdate): EditResult => {
  //   let r: ReturnType<typeof updateEntry> | undefined;
  //   store.update((es) => {
  //     r = updateEntry(es, newEntry);

  //     if (r.isOk) {
  //       return r.value.entries;
  //     }

  //     // TODO: better error message handling
  //     console.error(r.error);

  //     return es;
  //   });

  //   return r?.isOk ? ok(r.value.entry) : err(UNEXEPECTED_ERROR);
  // },
  // add: (newEntry: NewTimeEntry): AddResult => {
  //   let r: ReturnType<typeof addEntry> | undefined;
  //   store.update((es) => {
  //     r = addEntry(es, newEntry);

  //     if (r.isOk) {
  //       return r.value.entries;
  //     }

  //     // TODO: better error message handling
  //     console.error(r.error);

  //     return es;
  //   });

  //   return r?.isOk ? ok(r.value.entry) : err(UNEXEPECTED_ERROR);
  // },
};
