export const dayKeyFrom = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(instant);
