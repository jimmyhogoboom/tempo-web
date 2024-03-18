import { beforeAll, beforeEach, afterEach, afterAll, describe, expect, it, vi } from 'vitest';
import { addEntry } from '$lib/Entries';
import { ok, err } from 'true-myth/result';

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
