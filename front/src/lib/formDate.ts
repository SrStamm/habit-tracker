const LOCALE = "pt-BR";

const dayKeyToLocalDate = (dayKey: string): Date => {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const FORMAT_CURRENT_YEAR = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
});

const FORMAT_WITH_YEAR = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (
  dayKey: string,
  today: Date = new Date(),
): string => {
  const date = dayKeyToLocalDate(dayKey);
  const sameYear = date.getFullYear() === today.getFullYear();

  return (sameYear ? FORMAT_CURRENT_YEAR : FORMAT_WITH_YEAR).format(date);
};
