import Result, { ok, err } from 'true-myth/result';
import Maybe, { just, nothing } from 'true-myth/maybe';
import replaceProps from './utils/replaceProps';
import type { ListStorage } from '$stores/stores';

export type UpdateEntryResult = Result<TimeEntry, string>;
export type AddEntryResult = Result<OpenTimeEntry, string>;

export const isUpdate = (newEntry?: NewTimeEntry | TimeEntryUpdate): newEntry is TimeEntryUpdate => {
  return newEntry !== undefined && 'id' in newEntry;
};

export const hasId = (entryId: string) => (entry: TimeEntry) => entry.id === entryId;

/**
 * True if the entry has no endTime, and is therefore currently being tracked
 */
export const entryOpen = (entry?: TimeEntry) => !!(entry && entry.startTime && !entry.endTime);

export default function Entries(entries: ListStorage<TimeEntry>, _crypto: ICrypto = crypto) {
  /**
   * True when at least one entry in the list is open
   */
  const hasOpenEntry = () => entries.find(entryOpen);

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

    entries.update((es) => {
      return es.concat(_entry);
    });

    return ok(_entry);
  };

  const updateEntry = (entryUpdate: TimeEntryUpdate): UpdateEntryResult => {
    const entry = getEntry(entryUpdate.id);
    if (entry.isNothing) {
      return err(`Entry with id ${entryUpdate.id} does not exist`);
    }

    const newEntry = { ...replaceProps(entry.value, entryUpdate), updatedAt: new Date() };

    entries.update((es) => {
      const index = es.findIndex((e) => e.id === entry.value.id);

      es[index] = newEntry;

      return es;
    });

    return ok(newEntry);
  };

  const updateEntries = (entryUpdates: TimeEntryUpdate[]): TimeEntry[] => {
    let updates: TimeEntry[] = [];
    entries.update((es) => {
      updates = entryUpdates.reduce((_updates, entryUpdate) => {
        const entry = getEntry(entryUpdate.id);
        if (entry.isNothing) {
          return _updates;
        }

        const newEntry = { ...replaceProps(entry.value, entryUpdate), updatedAt: new Date() };
        const index = es.findIndex((e) => e.id === entry.value.id);

        es[index] = newEntry;

        return [..._updates, newEntry];
      }, [] as TimeEntry[]);

      return es;
    });

    return updates;
  };

  const deleteEntry = (id: UUID) => {
    const entry = getEntry(id);
    if (entry.isNothing) {
      return;
    }

    entries.delete(id);
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
  };
}
