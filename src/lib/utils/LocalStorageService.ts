import Maybe from 'true-myth/maybe';

const _crypto = crypto;

/**
 * Adapted from https://stackoverflow.com/a/23744448
 */

export interface IStorable {
  id: UUID;
  createdAt: Date;
  updatedAt?: Date;
}

export enum RemoveResult {
  Removed,
  AlreadyGone,
}

export class LocalStorageService<T extends IStorable> {
  #storage: Storage;
  #crypto: ICrypto;

  #key: string;

  constructor(tableName: string, storage = window.localStorage, crypto: ICrypto = _crypto) {
    this.#storage = storage;
    this.#crypto = crypto;
    this.#key = tableName;
  }

  getAll(): T[] {
    try {
      return JSON.parse(this.#storage.getItem(this.#key) || '[]') || [];
    } catch {
      return [];
    }
  }

  get(id: UUID) {
    const items = this.getAll();
    return Maybe.of(items.find((item) => item.id === id));
  }

  set(items: T[]) {
    this.#storage.setItem(this.#key, JSON.stringify(items));
  }

  add(item: Omit<T, 'id'>) {
    const items = this.getAll();

    const newItem = { ...item, id: this.#crypto.randomUUID() } as T;

    items.push(newItem);
    this.set(items);

    return { item: newItem, items };
  }

  remove(item: T | UUID) {
    const items = this.getAll();
    const index = typeof item === 'string' ? items.findIndex((i) => i.id === item) : items.indexOf(item);

    if (index < 0) return { items, result: RemoveResult.AlreadyGone };

    items.splice(index, 1);
    this.set(items);

    return { items, result: RemoveResult.Removed };
  }

  clear() {
    this.#storage.clear();
  }
}
