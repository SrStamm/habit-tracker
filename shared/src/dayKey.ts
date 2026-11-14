// O dia é um conceito de calendário decidido pelo fuso da aplicação, não pelo
// fuso do processo (Node) nem pelo do navegador. Back e front usam esta mesma
// regra para que "hoje" signifique exatamente a mesma data nos dois lados.
export const dayKeyFrom = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(instant);

// Aritmética de calendário pura: o dia é uma data, não um instante. O shift
// não pode depender do fuso de ninguém (nem do processo, nem do navegador),
// senão a meia-noite de um fuso cai no dia anterior de outro. UTC aqui é só
// um calendário neutro; não representa o fuso da aplicação.
export const shiftDayKey = (dayKey: string, days: number): string => {
  const [year, month, day] = dayKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
};
