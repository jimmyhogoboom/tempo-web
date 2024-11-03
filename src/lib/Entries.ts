import Result, { ok, err } from 'true-myth/result';
import { just, nothing } from 'true-myth/maybe';
import replaceProps from './utils/replaceProps';

// TODO: Output shouldn't include `entries` list
type AddEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntriesOutput = { entries: TimeEntry[]; updatedEntries: TimeEntry[] };

export const isUpdate = (newEntry?: NewTimeEntry | TimeEntryUpdate): newEntry is TimeEntryUpdate => {
  return newEntry !== undefined && 'id' in newEntry;
};

const hasId = (entryId: string) => (entry: TimeEntry) => entry.id === entryId;

/**
 * True if the entry has no endTime, and is therefore currently being tracked
 */
export const entryOpen = (entry?: TimeEntry | NewTimeEntry | TimeEntryUpdate) => entry && entry.startTime && !entry.endTime;

// TODO: what is this.
// Some of these are more about manipulating the internal array of values in the store
// Is this a boundary between the raw value of the store and something else?
// Seems like this should be some kind of service
// Almost all of this logic could be generalized to finding stuff in a list.

// TODO: Maybe instead of accepting TimeEntry[], it should take a TimeEntryRepository
export default function Entries(entries: TimeEntry[], _crypto: ICrypto = crypto) {
  /**
   * True when at least one entry in the list is open
   */
  const hasOpenEntry = () => entries.some(entryOpen);

  // TODO: This might need to be `findOpenEntries => TimeEntry[]`
  const findOpenEntry = (): Result<TimeEntry, string> => {
    const entry = entries.find(entryOpen);
    if (entry) {
      return ok(entry);
    }

    return err('No open entries');
  };

  const hasEntry = (entryId: string) => entries.some(hasId(entryId));

  const getEntry = (entryId: string) => {
    const entry = entries.find(hasId(entryId));
    if (entry) {
      return just(entry);
    }

    return nothing();
  };

  const addEntry = (entry?: NewTimeEntry): Result<AddEntryOutput, string> => {
    if (hasOpenEntry()) {
      return err("There's already a timer running");
    }

    const newId = _crypto.randomUUID();
    // Ensure a new id
    const _entry: TimeEntry = entry
      ? ({ ...entry, createdAt: new Date(), id: newId } as TimeEntry)
      : {
          id: newId,
          title: '',
          startTime: new Date(),
          createdAt: new Date(),
        };

    const _entries = [...entries, _entry];

    return ok({
      entries: _entries,
      entry: _entry,
    });
  };

  const updateEntry = (entryUpdate: TimeEntryUpdate): Result<UpdateEntryOutput, string> => {
    const entry = getEntry(entryUpdate.id);
    if (entry.isNothing) {
      return err(`Entry with id ${entryUpdate.id} does not exist`);
    }

    const newEntry = { ...replaceProps(entry.value, entryUpdate), updatedAt: new Date() };
    const index = entries.findIndex((e) => e.id === entry.value.id);

    entries[index] = newEntry;

    return ok({ entries, entry: newEntry } as UpdateEntryOutput);
  };

  const updateEntries = (entryUpdates: TimeEntryUpdate[]): UpdateEntriesOutput => {
    const updates = entryUpdates.reduce((_updates, entryUpdate) => {
      const entry = getEntry(entryUpdate.id);
      if (entry.isNothing) {
        return _updates;
      }

      const newEntry = { ...replaceProps(entry.value, entryUpdate), updatedAt: new Date() };
      const index = entries.findIndex((e) => e.id === entry.value.id);

      entries[index] = newEntry;

      return [..._updates, newEntry];
    }, [] as TimeEntry[]);

    return { entries, updatedEntries: updates };
  };

  const deleteEntry = (id: UUID) => {
    const entry = getEntry(id);
    if (entry.isNothing) {
      return entries;
    }

    return entries.filter((e) => e.id !== id);
  };

  const deleteEntries = (ids: UUID[]) => {
    return entries.filter((e) => ids.includes(e.id));
  };

  const addOrUpdate = (newEntry: NewTimeEntry | TimeEntryUpdate) => {
    const id = isUpdate(newEntry) ? newEntry.id : undefined;

    return id ? updateEntry({ id, ...newEntry }) : addEntry(newEntry ?? undefined);
  };

  return {
    entryOpen,
    hasOpenEntry,
    findOpenEntry,
    hasEntry,
    addEntry,
    updateEntry,
    updateEntries,
    addOrUpdate,
    deleteEntry,
    deleteEntries,
  };
}

// export default initEntries(crypto);
