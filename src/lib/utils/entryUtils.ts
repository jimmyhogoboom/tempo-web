import { interval, intervalToDuration, differenceInSeconds, differenceInMinutes } from 'date-fns/fp';
import { timerFormat } from '$lib/utils/dateUtils';

export const formattedInterval = (start?: Date, end?: Date) =>
  timerFormat(end && start && intervalToDuration(interval(end, start)));

export const liveFormattedInterval = (time: Date, start?: Date, end?: Date) => formattedInterval(start, end ?? time);

export const formatEntryDuration = (time: Date, entry?: TimeEntry | NewTimeEntry | TimeEntryUpdate) => {
  return liveFormattedInterval(time, entry?.startTime, entry?.endTime);
};

type EntryTotalOptions = {
  roundToMinute?: boolean;
};

const entryTotalWithOptions = (options: EntryTotalOptions) => (rates: ProjectRates, entry: TimeEntry) => {
  const ratePerHour = entry.projectId ? rates[entry.projectId] || 0 : 0;

  if (options.roundToMinute) {
    const minutes = entry.endTime ? differenceInMinutes(entry.startTime, entry.endTime) : 0;
    return (minutes / 60) * ratePerHour;
  }

  const seconds = entry.endTime ? differenceInSeconds(entry.startTime, entry.endTime) : 0;
  return (seconds / 60 / 60) * ratePerHour;
};

const entryTotal = entryTotalWithOptions({ roundToMinute: true });

export type ProjectRates = {
  [key: Project['id']]: number;
};

export const entriesTotalValue = (projects: Project[], entries: TimeEntry[]) => {
  const projectRates = projects.reduce(
    (rates, project: Project) => ({
      ...rates,
      ...(project.rate
        ? {
            [project.id]: project.rate,
          }
        : {}),
    }),
    {} as ProjectRates
  );

  return entries.reduce((total, entry) => total + entryTotal(projectRates, entry), 0).toFixed(2);
};

const liveDurationSeconds = (time: Date, entry?: TimeEntry) =>
  entry ? differenceInSeconds(entry.startTime, entry.endTime ?? time) : 0;

export const entriesTotalTime = (entries: TimeEntry[], time: Date) =>
  entries.reduce((total, entry) => total + liveDurationSeconds(time, entry), 0);

export const formattedDuration = (totalTime: number) =>
  timerFormat(intervalToDuration({ start: 0, end: totalTime * 1000 }));
