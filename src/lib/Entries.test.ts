import { beforeAll, beforeEach, afterEach, afterAll, describe, expect, it, vi } from 'vitest';
import { addEntry } from '$lib/Entries';

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
		expect(addEntry([])).toStrictEqual({
			ok: [
				{
					id: '', // TODO: generate guid
					startTime: date,
					title: ''
				}
			]
		});
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
		).toStrictEqual({
			err: "There's already a timer running"
		});
	});
});
