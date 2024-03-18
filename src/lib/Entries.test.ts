import { beforeAll, beforeEach, afterEach, afterAll, describe, expect, it, vi } from 'vitest';
import { addEntry, updateEntry } from '$lib/Entries';
import { ok, err } from 'true-myth/result';
import { addHours } from 'date-fns/fp';

describe('Entries', () => {
	let date: Date;

	beforeAll(() => {
		date = new Date();
	});

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(date);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('addEntry', () => {
		it('adds new entry to empty list', () => {
			const expectedEntry = {
				id: '', // TODO: generate guid
				startTime: date,
				title: ''
			};
			expect(addEntry([])).toStrictEqual(
				ok({
					entries: [expectedEntry],
					entry: expectedEntry
				})
			);
		});

		it('forbids adding open entry when one already exists', () => {
			expect(
				addEntry([
					{
						id: '', // TODO: generate guid
						startTime: date,
						title: ''
					}
				])
			).toStrictEqual(err("There's already a timer running"));
		});
	});

	describe('updateEntry', () => {
		let existingEntries: TimeEntry[];
		beforeAll(() => {
			existingEntries = [
				{
					id: '', // TODO: generate guid
					startTime: date,
					title: ''
				},
				{
					id: 'a different id',
					startTime: date,
					title: 'the other one'
				}
			];
		});

		it('updates expected entry', () => {
			const endDate = addHours(2, date);
			const title = 'new title';
			const expectedEntry = {
				id: '', // TODO: generate guid
				startTime: date,
				endTime: endDate,
				title
			};

			expect(
				updateEntry(existingEntries, {
					id: '', // TODO: fill
					endTime: endDate,
					title
				})
			).toStrictEqual(
				ok({
					entries: [expectedEntry, existingEntries[1]]
				})
			);
		});

		it.todo('fails when non-existant entry is updated', () => {});
	});
});
