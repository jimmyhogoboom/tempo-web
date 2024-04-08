import { interval, intervalToDuration, differenceInSeconds } from 'date-fns/fp';
import { timerFormat } from '$lib/utils/dateUtils';
import type { NewTimeEntry, TimeEntryUpdate } from '$lib/Entries';

export const formattedInterval = (start?: Date, end?: Date) =>
  timerFormat(end && start && intervalToDuration(interval(end, start)));

export const liveFormattedInterval = (time: Date, start?: Date, end?: Date) => formattedInterval(start, end ?? time);

export const formatEntryDuration = (time: Date, entry?: TimeEntry | NewTimeEntry | TimeEntryUpdate) => {
  return liveFormattedInterval(time, entry?.startTime, entry?.endTime);
};

const entryTotal = (rates: ProjectRates, entry: TimeEntry) => {
  const ratePerHour = entry.projectId ? rates[entry.projectId] : 0;
  const seconds = entry.endTime ? differenceInSeconds(entry.startTime, entry.endTime) : 0;
  return (seconds / 60 / 60) * ratePerHour;
};

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
