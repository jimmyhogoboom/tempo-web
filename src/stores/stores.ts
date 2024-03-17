import { writable } from 'svelte/store';

export const entries = writable([] as TimeEntry[]);

// function createListStore(listName) {
// 	const store = writable({});

// 	return {
// 		...store,
// 		init: async () => {
// 			const items = dbfun.getListItems(listName);
// 			items.then((values) => {
// 				values ? store.set(values) : store.set([]);
// 			});
// 			return items;
// 		},
// 		set: async (newVal) => {
// 			const id = Number(newVal.id);
// 			if (id) {
// 				await dbfun.updateItemInList(listName, id, newVal);
// 			} else {
// 				await dbfun.addToList(listName, newVal);
// 			}
// 			store.set(await dbfun.getListItems(listName));
// 		},
// 		delete: async (id) => {
// 			if (listName === 'inventory') {
// 				await dbfun.deleteItemFromRecipes(id);
// 				// TODO:
// 				// recipes store needs to be re-initialized after this
// 			}
// 			await dbfun.deleteFromList(listName, id);
// 			store.set(await dbfun.getListItems(listName));
// 		}
// 	};
// }
