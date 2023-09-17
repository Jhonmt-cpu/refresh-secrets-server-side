interface IDateProvider {
  addDays(days: number): Date;
  addSeconds(seconds: number): Date;
  subtractDays(days: number): Date;
  diffSeconds(date: Date): number;
  dateNow(): Date;
  isBeforeNow(date: Date): boolean;
}

export { IDateProvider };
