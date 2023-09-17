import dayjs from 'dayjs';
import { IDateProvider } from '../IDateProvider';

class DayJsDateProvider implements IDateProvider {
  addDays(days: number): Date {
    return dayjs().add(days, 'days').toDate();
  }

  subtractDays(days: number): Date {
    return dayjs().subtract(days, 'days').toDate();
  }

  diffSeconds(date: Date): number {
    return dayjs(date).diff(dayjs(), 'second');
  }

  dateNow(): Date {
    return dayjs().toDate();
  }

  addSeconds(seconds: number): Date {
    return dayjs().add(seconds, 'second').toDate();
  }

  isBeforeNow(date: Date): boolean {
    return dayjs(date).isBefore(dayjs());
  }
}

export { DayJsDateProvider };
