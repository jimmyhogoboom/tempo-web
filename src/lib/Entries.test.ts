import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { initEntries, type NewTimeEntry } from '$lib/Entries';
import { ok, err } from 'true-myth/result';
import { addHours } from 'date-fns/fp';

const mockCrypto = (uuid: UUID) => ({
	randomUUID: (): UUID => uuid
});

const mockId = crypto.randomUUID();
const { addEntry, updateEntry, deleteEntry } = initEntries(mockCrypto(mockId));

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
				createdAt: date,
				title: ''
			};
			expect(addEntry([])).toStrictEqual(
				ok({
					entries: [expectedEntry],
					entry: expectedEntry
				})
			);
		});

		it.each<() => [NewTimeEntry, TimeEntry]>([
			() => [
				{ title: 'my title' } as NewTimeEntry,
				{ id: mockId, title: 'my title', createdAt: date } as TimeEntry
			],
			() => [
				{ title: 'my title', startTime: date } as NewTimeEntry,
				{
					id: mockId,
					title: 'my title',
					startTime: date,
					createdAt: date
				} as TimeEntry
			]
		])('adds specified new entry to list', (getCase) => {
			// Cases must be populated through a function to get the value of `date`.
			const [input, expectedEntry] = getCase();
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
						title: '',
						startTime: date,
						createdAt: date
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
					title: 'old title',
					startTime: date,
					createdAt: date
				},
				{
					id: crypto.randomUUID(),
					title: 'the other one',
					startTime: date,
					createdAt: date
				}
			];
		});

		it('updates expected entry', () => {
			const endDate = addHours(2, date);
			vi.setSystemTime(endDate);
			const newTitle = 'new title';
			const projectId = crypto.randomUUID();
			const expectedEntry = {
				id: mockId,
				title: newTitle,
				startTime: date,
				endTime: endDate,
				createdAt: date,
				updatedAt: endDate,
				projectId
			};

			expect(
				updateEntry(existingEntries, {
					id: mockId,
					endTime: endDate,
					title: newTitle,
					projectId
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

	describe('deleteEntry', () => {
		let existingEntries: TimeEntry[];
		beforeAll(() => {
			existingEntries = [
				{
					id: mockId,
					startTime: date,
					createdAt: date,
					title: 'delete me'
				},
				{
					id: crypto.randomUUID(),
					startTime: date,
					createdAt: date,
					title: 'the other one'
				}
			];
		});

		it('removes expected entry', () => {
			expect(deleteEntry(existingEntries, mockId)).toStrictEqual([existingEntries[1]]);
		});
	});
});
