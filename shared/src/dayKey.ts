// O dia é um conceito de calendário decidido pelo fuso da aplicação, não pelo
// fuso do processo (Node) nem pelo do navegador. Back e front usam esta mesma
// regra para que "hoje" signifique exatamente a mesma data nos dois lados.
export const dayKeyFrom = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(instant);
