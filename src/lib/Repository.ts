import Result, { ok, err } from 'true-myth/result';
import { just, nothing } from 'true-myth/maybe';
import replaceProps from './utils/replaceProps';
import type { IStorable } from './utils/LocalStorageService';

export type Update<T extends IStorable> = {
	[Property in keyof T]+?: T[Property];
} & { id: UUID };

export type Create<T extends IStorable> = Omit<Update<T>, 'id'>;

export const isUpdate = <T extends IStorable>(
	newEntry?: Create<T> | Update<T>
): newEntry is Update<T> => {
	return newEntry !== undefined && 'id' in newEntry;
};

type AddOutput<T extends IStorable> = { values: T[]; newValue: T };
type UpdateOutput<T extends IStorable> = { values: T[]; newValue: T };
type UpdateManyOutput<T extends IStorable> = { values: T[]; newValues: T[] };

const hasId =
	<T extends IStorable>(recordId: string) =>
	(record: T) =>
		record.id === recordId;

export function init<T extends IStorable>(_crypto: ICrypto) {
	const hasRecord = (records: T[], recordId: string) => records.some(hasId(recordId));

	const get = (records: T[], recordId: string) => {
		const record = records.find(hasId(recordId));
		if (record) {
			return just(record);
		}

		return nothing();
	};

	const add = (records: T[], record?: Create<T>): Result<AddOutput<T>, string> => {
		const newId = _crypto.randomUUID();
		// Ensure a new id
		const _record = record
			? ({ ...record, createdAt: new Date(), id: newId } as T)
			: ({
					id: newId,
					createdAt: new Date()
				} as T);

		const _entries = [...records, _record];

		return ok({
			values: _entries,
			newValue: _record
		});
	};

	const update = (records: T[], recordUpdate: Update<T>): Result<UpdateOutput<T>, string> => {
		const record = get(records, recordUpdate.id);
		if (record.isNothing) {
			return err(`Record with id ${recordUpdate.id} does not exist`);
		}

		const newEntry = { ...replaceProps(record.value, recordUpdate), updatedAt: new Date() };
		const index = records.findIndex((e) => e.id === record.value.id);

		records[index] = newEntry;

		return ok({ values: records, newValue: newEntry } as UpdateOutput<T>);
	};

	const updateMany = (records: T[], recordUpdates: Update<T>[]): UpdateManyOutput<T> => {
		const updates = recordUpdates.reduce((_updates, recordUpdate) => {
			const record = get(records, recordUpdate.id);
			if (record.isNothing) {
				return _updates;
			}

			const newEntry = { ...replaceProps(record.value, recordUpdate), updatedAt: new Date() };
			const index = records.findIndex((e) => e.id === record.value.id);

			records[index] = newEntry;

			return [..._updates, newEntry];
		}, [] as T[]);

		return { values: records, newValues: updates };
	};

	const deleteOne = (records: T[], id: UUID) => {
		const record = get(records, id);
		if (record.isNothing) {
			return records;
		}

		return records.filter((e) => e.id !== id);
	};

	const deleteMany = (records: T[], ids: UUID[]) => {
		return records.filter((e) => ids.includes(e.id));
	};

	const addOrUpdate = (entries: T[], newEntry: Create<T> | Update<T>) => {
		const id = isUpdate(newEntry) ? newEntry.id : undefined;

		return id
			? update(entries, { id, ...newEntry } as Update<T>)
			: add(entries, newEntry ?? undefined);
	};

	return {
		hasRecord,
		add,
		update,
		updateMany,
		addOrUpdate,
		deleteOne,
		deleteMany
	};
}

export default init(crypto);
