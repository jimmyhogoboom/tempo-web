import { LocalStorageService } from '$lib/utils/LocalStorageService';
import { readable, writable, type Updater, type Writable } from 'svelte/store';

export { entries } from '$stores/entries';

export interface ListStorage<T> extends Writable<T[]> {
  find: (predicate: (item: T) => boolean) => T | undefined;
  where: (predicate: (item: T) => boolean) => T[];
  all: () => T[];
  some: (predicate: (item: T) => boolean) => boolean;
  delete: (id: UUID) => T[];
}

export const projects = createLocalStorageStore<Project>('project');

// This helps the time initialize as quickly as possible
const INIT_DATE = new Date();

export const time = readable<Date>(INIT_DATE, (set) => {
  const interval = setInterval(() => {
    set(new Date());
  }, 1);

  return () => {
    clearInterval(interval);
  };
});

export function createLocalStorageStore<T extends IStorable>(listName: string): ListStorage<T> {
  const storage = new LocalStorageService<T>(listName);
  const { set: _set, ...rest } = writable(storage.getAll());

  const set = (...args: Parameters<typeof _set>) => {
    _set(...args);
    storage.set(args[0]);
  };

  return {
    set,
    ...rest,
    update: (fn: Updater<T[]>) => {
      const items = storage.getAll();
      const newItems = fn(items);
      set(newItems);
      storage.set(newItems);
    },
    find: (predicate: (item: T) => boolean) => {
      const items = storage.getAll();
      return items.find(predicate);
    },
    where: (predicate: (item: T) => boolean) => {
      const items = storage.getAll();
      return items.filter(predicate);
    },
    all: () => {
      return storage.getAll();
    },
    some: (predicate: (item: T) => boolean) => {
      return storage.getAll().some(predicate);
    },
    // init: async () => {
    // 	const items = storage.getAll();
    // 	store.set(items);
    // 	return items;
    // },
    // add: (item: Omit<T, 'id'>) => {
    // 	const { item: newItem, items } = storage.add(item);
    // 	store.set(items);
    // 	return newItem;
    // },
    // update: (item: T) => {
    // 	const found = storage.get(item.id);
    // 	if (found.isNothing) {
    // 		return err(`No item with id ${item.id} in ${listName}`);
    // 	}
    // 	store.set(storage.getAll().map((i) => (i.id === item.id ? item : i)));
    // },
    delete: (id: UUID) => {
      const items = storage.remove(id);
      storage.set(items);
      return items;
    },
  };
}
