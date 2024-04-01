import { format, parse, type Duration } from 'date-fns/fp';
import Result, { ok, err } from 'true-myth/result';

export const dateFormat = (date?: Date) => (date ? format('h:mm:ss aa', date) : '');

const zeroPad = (num: number = 0) => String(num).padStart(2, '0');
export const timerFormat = (duration?: Duration) =>
  [duration?.hours, duration?.minutes, duration?.seconds].map(zeroPad).join(':');

/**
 * From: https://stackoverflow.com/a/1353711
 */
const isValidDate = (d: unknown) => {
  if (Object.prototype.toString.call(d) === '[object Date]') {
    // it is a date
    if (isNaN(d as number)) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

export const parseTime = (referenceDate: Date, time: string): Result<Date, { message: string; error: unknown }> => {
  try {
    const r = parse(referenceDate, 'h:mm:ss aa', time);

    if (!isValidDate(r)) throw new Error('Invalid Date');

    return ok(r);
  } catch (e) {
    return err({ message: 'Unabled to parse.', error: e });
  }
};
