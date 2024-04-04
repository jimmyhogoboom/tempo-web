import { interval, intervalToDuration } from 'date-fns/fp';
import { timerFormat } from '$lib/utils/dateUtils';
import type { NewTimeEntry, TimeEntryUpdate } from '$lib/Entries';

export const formattedInterval = (end?: Date, start?: Date) =>
  timerFormat(end && start && intervalToDuration(interval(end, start)));

export const formatEntryDuration = (time: Date, entry?: TimeEntry | NewTimeEntry | TimeEntryUpdate) => {
  const stopTime = entry?.endTime ?? time;
  return formattedInterval(stopTime, entry?.startTime || undefined);
};
