import { describe, expect, it } from 'vitest';
import { addEntry } from '$lib/Entries';

describe('Entries', () => {
	it('adds new entry to empty list', () => {
		expect(addEntry([])).toBe({
			ok: [
				{
					id: '', // TODO: generate guid
					startTime: new Date(),
					title: ''
				}
			]
		});
	});

	it('forbids adding open entry when one already exists', () => {
		expect(addEntry([])).toBe({
			err: "There's already a timer running"
		});
	});
});
