import { LocalStorageService } from '$lib/utils/LocalStorageService';
import { readable, writable, type Updater } from 'svelte/store';

export { entries } from '$stores/entries';

export const projects = createListStore<Project>('project');

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

export function createListStore<T extends IStorable>(listName: string) {
  const storage = new LocalStorageService<T>(listName);
  const { set, subscribe } = writable(storage.getAll());

  return {
    set: (...args: Parameters<typeof set>) => {
      set(...args);
      storage.set(args[0]);
    },
    subscribe,
    update: (fn: Updater<T[]>) => {
      const items = storage.getAll();
      const newItems = fn(items);
      set(newItems);
      storage.set(newItems);
    },
    where: (predicate: (item: T) => boolean) => {
      const items = storage.getAll();
      return items.filter(predicate);
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
    // delete: async (id: UUID) => {
    // 	const { items } = storage.remove(id);
    // 	store.set(items);
    // }
  };
}
