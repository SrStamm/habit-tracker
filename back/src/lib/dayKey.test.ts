import { describe, it, expect } from "vitest";
import { dayKeyFrom } from "./dayKey";

// O dia de um Entry NAO vem do Date: vem do dayKey, e o dayKey sai daqui.
// upsertEntry usa este valor para montar o filtro do unique index
// { userId, habitId, dayKey }. Entao um fuso errado nao gera erro nenhum:
// o entry simplesmente cai no dia errado e o heatmap mente em silencio.
//
// CUIDADO: o fuso vem de APP_TIMEZONE (back/src/config/timeZone.ts), que
// hoje vem do .env. O mesmo codigo produz dias diferentes em dev e em
// producao. E o mesmo instante produz dias diferentes em fusos diferentes.
describe("dayKeyFrom", () => {
  // "Europe/England/London" NAO existe: e um RangeError na hora de formatar.
  // O nome IANA correto e "Europe/London". Como o fuso so era usado por
  // nenhum teste, o erro ficava escondido aqui.
  const timezone0 = "Europe/London"; // GMT+0 em janeiro
  const timezone1 = "Europe/Lisbon"; // GMT+0 em janeiro: mesmo offset que timezone0
  const timezoneMenos3 = "America/Argentina/Buenos_Aires"; // GMT-3 o ano inteiro

  it("formata um instante como YYYY-MM-DD", () => {
    // O locale "en-CA" e o que produz YYYY-MM-DD. Trocar por "en-US" daria
    // "3/15/2026" — e isso nao quebraria nenhuma linha de codigo, so os
    // dados: o dayKey faz parte do unique index { userId, habitId, dayKey },
    // entao mudar o formato orfa todos os entries ja gravados.
    const result = dayKeyFrom(new Date("2026-03-15T12:00:00Z"), timezone0);

    expect(result).toBe("2026-03-15");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // 2026-01-01T02:00:00Z e 2025-12-31 em Buenos Aires (UTC-3), mas e
  // 2026-01-01 em UTC. Mesmo instante, dayKey diferente.
  it("devolve o dia anterior quando o fuso local ja passou da meia-noite", () => {
    const result = dayKeyFrom(new Date("2026-01-01T02:00:00Z"), timezoneMenos3);
    expect(result).toBe("2025-12-31");
  });

  it("devolve o mesmo dia para o mesmo instante em fusos com o mesmo offset", () => {
    const instant = new Date("2026-01-01T02:00:00Z");

    // London e Lisbon sao os dois GMT+0 em janeiro.
    expect(dayKeyFrom(instant, timezone0)).toBe("2026-01-01");
    expect(dayKeyFrom(instant, timezone1)).toBe("2026-01-01");

    // Controle: o MESMO instante com offset negativo cai no dia anterior.
    // Sem esta linha o teste passaria mesmo se o fuso fosse ignorado.
    expect(dayKeyFrom(instant, timezoneMenos3)).toBe("2025-12-31");
  });

  it("formata o dia bissexto e a virada de ano sem errar o mes", () => {
    // 29 de fevereiro so existe em ano bissexto: 2024 % 4 == 0.
    expect(dayKeyFrom(new Date("2024-02-29T12:00:00Z"), timezone0)).toBe(
      "2024-02-29",
    );

    // Virada de ano: o ano UTC ja e 2026, mas o dia local ainda e 2025.
    // Dois fusos, mesmo instante, anos diferentes no dayKey.
    expect(dayKeyFrom(new Date("2026-01-01T00:30:00Z"), timezoneMenos3)).toBe(
      "2025-12-31",
    );
    expect(dayKeyFrom(new Date("2026-01-01T00:30:00Z"), timezone0)).toBe(
      "2026-01-01",
    );
  });

  // Fixa o comportamento ATUAL: nao existe validacao de fuso, entao um typo
  // em APP_TIMEZONE estoura um RangeError no meio de um request. Se um dia
  // alguem validar o fuso na config, este teste muda — de proposito.
  it("lanca RangeError quando o fuso nao e valido", () => {
    expect(() =>
      dayKeyFrom(new Date("2026-01-01T02:00:00Z"), "Europe/England/London"),
    ).toThrow(RangeError);
  });
});
