import { format, type Duration } from 'date-fns/fp';

export const dateFormat = (date?: Date) => (date ? format('h:mm:ss aa', date) : '');

const zeroPad = (num: number = 0) => String(num).padStart(2, '0');
export const timerFormat = (duration?: Duration) =>
	[duration?.hours, duration?.minutes, duration?.seconds].map(zeroPad).join(':');
