import Result, { ok, err } from 'true-myth/result';
import Maybe, { just, nothing } from 'true-myth/maybe';
import replaceProps from './utils/replaceProps';

type AddEntryOutput = { entries: TimeEntry[]; entry: OpenTimeEntry };
type UpdateEntryOutput = { entries: TimeEntry[]; entry: TimeEntry };
type UpdateEntriesOutput = { entries: TimeEntry[]; updatedEntries: TimeEntry[] };
export type UpdateEntryResult = Result<UpdateEntryOutput, string>;
export type AddEntryResult = Result<AddEntryOutput, string>;

export const isUpdate = (newEntry?: NewTimeEntry | TimeEntryUpdate): newEntry is TimeEntryUpdate => {
  return newEntry !== undefined && 'id' in newEntry;
};

const hasId = (entryId: string) => (entry: TimeEntry) => entry.id === entryId;

/**
 * True if the entry has no endTime, and is therefore currently being tracked
 */
export const entryOpen = (entry?: TimeEntry | NewTimeEntry | TimeEntryUpdate) => entry && entry.startTime && !entry.endTime;

// This is a boundary between the raw value of the store and something else
// Almost all of this logic could be generalized to finding stuff in a list.
// This is logic specifically for the local storage store
// TODO: Generalize and Move localStorage-related logic (like searching and updating an array) into the localStorage store (stores.ts)

export default function Entries(entries: TimeEntry[], _crypto: ICrypto = crypto) {
  /**
   * True when at least one entry in the list is open
   */
  const hasOpenEntry = () => entries.some(entryOpen);

  const findOpenEntry = (): Maybe<OpenTimeEntry> => {
    const entry = entries.find(entryOpen);
    if (entry) {
      return just(entry as OpenTimeEntry);
    } else {
      return nothing();
    }
  };

  const hasEntry = (entryId: string) => entries.some(hasId(entryId));

  const getEntry = (entryId: string) => {
    const entry = entries.find(hasId(entryId));
    if (entry) {
      return just(entry);
    }

    return nothing();
  };

  const addEntry = (entry?: NewTimeEntry): AddEntryResult => {
    // TODO: This line is basically the only business logic in here specific to Entries, along with the concept of open
    // entries. These should be moved directly into the store.
    if (hasOpenEntry()) {
      return err("There's already a timer running");
    }

    const newId = _crypto.randomUUID();
    // Ensure a new id
    const _entry: OpenTimeEntry = entry
      ? ({ ...entry, createdAt: new Date(), id: newId } as OpenTimeEntry)
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

  const updateEntry = (entryUpdate: TimeEntryUpdate): UpdateEntryResult => {
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
