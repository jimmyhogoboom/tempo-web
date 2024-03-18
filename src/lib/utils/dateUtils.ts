import { format, interval, intervalToDuration, type Duration } from 'date-fns/fp';

export const dateFormat = (date?: Date) => (date ? format('h:m:s aa', date) : '');

const zeroPad = (num: number = 0) => String(num).padStart(2, '0');
export const timerFormat = (duration: Duration) =>
	`${zeroPad(duration.hours)}:${zeroPad(duration.minutes)}:${zeroPad(duration.seconds)}`;
