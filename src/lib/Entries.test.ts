import { beforeAll, describe, expect, it } from 'vitest';
import { addEntry } from '$lib/Entries';

describe('Entries', () => {
	const currentDate = new Date('2018-09-20T23:00:00Z');

	beforeAll(() => {
		Date = class extends Date {
			constructor(date: string) {
				if (date) {
					return super(date);
				}

				return currentDate;
			}
		};
	});

	it('adds new entry to empty list', () => {
		expect(addEntry([])).toStrictEqual({
			ok: [
				{
					id: '', // TODO: generate guid
					startTime: currentDate,
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
					startTime: new Date(),
					title: ''
				}
			])
		).toStrictEqual({
			err: "There's already a timer running"
		});
	});
});
