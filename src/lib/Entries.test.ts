import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import Entries from '$lib/Entries';
import { ok, err } from 'true-myth/result';
import { addHours } from 'date-fns/fp';
import type { ListStorage } from '$stores/stores';

const mockCrypto = (uuid: UUID) => ({
  randomUUID: (): UUID => uuid,
});

const mockId = crypto.randomUUID();
const mockStorage = (entries: Array<TimeEntry>) => ({
  find: entries.find,
  where: vi.fn(),
  all: () => entries,
  some: entries.some,
  delete: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  subscribe: vi.fn(),
});
const mockStorageInstance = mockStorage([]);
const { addEntry, updateEntry } = Entries(mockStorageInstance, mockCrypto(mockId));

describe('Entries', () => {
  let date: Date;

  beforeAll(() => {
    date = new Date();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
    vi.resetAllMocks();
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
        title: '',
      };
      expect(addEntry()).toStrictEqual(ok(expectedEntry));
      expect(mockStorageInstance.update).toHaveBeenCalledOnce();
    });

    it.each<() => [NewTimeEntry, TimeEntry]>([
      () => [{ title: 'my title' } as NewTimeEntry, { id: mockId, title: 'my title', createdAt: date } as TimeEntry],
      () => [
        { title: 'my title', startTime: date } as NewTimeEntry,
        {
          id: mockId,
          title: 'my title',
          startTime: date,
          createdAt: date,
        } as TimeEntry,
      ],
    ])('adds specified new entry to list', (getCase) => {
      // Cases must be populated through a function to get the value of `date`.
      const [input, expectedEntry] = getCase();
      expect(addEntry(input)).toStrictEqual(ok(expectedEntry));
      expect(mockStorageInstance.update).toHaveBeenCalledOnce();
    });

    it('forbids adding open entry when one already exists', () => {
      const { addEntry } = Entries(
        {
          ...mockStorageInstance,
          find: () => ({
            id: crypto.randomUUID(),
            title: '',
            startTime: date,
            createdAt: date,
          }),
        },
        mockCrypto(mockId)
      );

      expect(addEntry()).toStrictEqual(err("There's already a timer running"));
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
          createdAt: date,
        },
        {
          id: crypto.randomUUID(),
          title: 'the other one',
          startTime: date,
          createdAt: date,
        },
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
        projectId,
      };
      const entries = Entries({ ...mockStorageInstance, find: () => existingEntries[0] }, mockCrypto(mockId));

      expect(
        entries.updateEntry({
          id: mockId,
          endTime: endDate,
          title: newTitle,
          projectId,
        })
      ).toStrictEqual(ok(expectedEntry));
    });

    it('fails when non-existant entry is updated', () => {
      const nonExistant = crypto.randomUUID();
      expect(
        updateEntry({
          id: nonExistant,
          title: 'this should fail',
        })
      ).toStrictEqual(err(`Entry with id ${nonExistant} does not exist`));
    });
  });

  describe('updateEntries', () => {
    let existingEntries: TimeEntry[];
    const mockId2 = crypto.randomUUID();
    beforeAll(() => {
      existingEntries = [
        {
          id: mockId,
          title: 'old title',
          startTime: date,
          createdAt: date,
        },
        {
          id: mockId2,
          title: 'other old title',
          startTime: date,
          createdAt: date,
        },
        {
          id: crypto.randomUUID(),
          title: 'should be untouched',
          startTime: date,
          createdAt: date,
        },
      ];
    });

    it('updates expected entries', () => {
      const endDate = addHours(2, date);
      vi.setSystemTime(endDate);
      const newTitle = 'new title';
      const projectId = crypto.randomUUID();
      const expectedEntries = [
        {
          id: mockId,
          title: newTitle,
          startTime: date,
          endTime: endDate,
          createdAt: date,
          updatedAt: endDate,
          projectId,
        },
        {
          id: mockId2,
          title: newTitle,
          startTime: date,
          endTime: endDate,
          createdAt: date,
          updatedAt: endDate,
          projectId,
        },
      ];
      const storage: ListStorage<TimeEntry> = {
        ...mockStorageInstance,
        find: (x) => existingEntries.find(x),
        update: vi.fn().mockImplementation((fn) => fn(existingEntries)),
      };
      const entries = Entries(storage, mockCrypto(mockId));

      expect(
        entries.updateEntries([
          {
            id: mockId,
            endTime: endDate,
            title: newTitle,
            projectId,
          },
          {
            id: mockId2,
            endTime: endDate,
            title: newTitle,
            projectId,
          },
        ])
      ).toStrictEqual(expectedEntries);
      expect(storage.update).toHaveBeenCalledOnce();
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
          title: 'delete me',
        },
        {
          id: crypto.randomUUID(),
          startTime: date,
          createdAt: date,
          title: 'the other one',
        },
      ];
    });

    it('removes expected entry', () => {
      const storage: ListStorage<TimeEntry> = {
        ...mockStorageInstance,
        find: (x) => existingEntries.find(x),
        update: vi.fn().mockImplementation((fn) => fn(existingEntries)),
      };
      const entries = Entries(storage, mockCrypto(mockId));

      entries.deleteEntry(mockId);

      expect(mockStorageInstance.delete).toHaveBeenCalledOnce();
    });
  });
});
