import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { buildEntries, type NewTimeEntry } from '$lib/Entries';
import { ok, err } from 'true-myth/result';
import { addHours } from 'date-fns/fp';

const mockCrypto = (uuid: UUID) => ({
	randomUUID: (): UUID => uuid
});

const mockId = crypto.randomUUID();
const { addEntry, updateEntry } = buildEntries(mockCrypto(mockId));

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
				id: mockId,
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

		it.each<[NewTimeEntry, TimeEntry]>([
			[{ title: 'my title' } as NewTimeEntry, { id: mockId, title: 'my title' } as TimeEntry],
			[
				{ title: 'my title', startTime: date } as NewTimeEntry,
				{
					id: mockId,
					title: 'my title',
					startTime: date
				} as TimeEntry
			]
		])('adds specified new entry to list', (input: NewTimeEntry, expectedEntry: TimeEntry) => {
			expect(addEntry([], input)).toStrictEqual(
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
						id: crypto.randomUUID(),
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
					id: mockId,
					startTime: date,
					title: 'old title'
				},
				{
					id: crypto.randomUUID(),
					startTime: date,
					title: 'the other one'
				}
			];
		});

		it('updates expected entry', () => {
			const endDate = addHours(2, date);
			const newTitle = 'new title';
			const expectedEntry = {
				id: mockId,
				startTime: date,
				endTime: endDate,
				title: newTitle
			};

			expect(
				updateEntry(existingEntries, {
					id: mockId,
					endTime: endDate,
					title: newTitle
				})
			).toStrictEqual(
				ok({
					entries: [expectedEntry, existingEntries[1]],
					entry: expectedEntry
				})
			);
		});

		it('fails when non-existant entry is updated', () => {
			const nonExistant = crypto.randomUUID();
			expect(
				updateEntry(existingEntries, {
					id: nonExistant,
					title: 'this should fail'
				})
			).toStrictEqual(err(`Entry with id ${nonExistant} does not exist`));
		});
	});
});
