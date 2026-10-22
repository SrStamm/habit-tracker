const LOCALE = "pt-BR";

const dayKeyToLocalDate = (dayKey: string): Date => {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Regra do KAN-42: ano atual oculta o ano. O formato foi definido na revisão
// visual (22/10 era só números demais). Mantém-se Intl + pt-BR por contrato do
// ticket. Não usar `dateStyle`: short/medium/long levam o ano sempre e
// quebrariam a regra acima. `day: "numeric"` e não "2-digit": com o mês
// escrito o português não usa zero à esquerda ("1 de out.", não "01 de out.").
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
