import { describe, it, expect } from "vitest";
import { formatDate } from "./formDate";

const TODAY = new Date(2026, 9, 21);

describe("formDate", () => {
  it("omite o ano quando a data é do ano atual", () => {
    expect(formatDate("2026-10-19", TODAY)).toBe("19 de out.");
  });

  it("mostra dia, mês e ano quando a data é de outro ano", () => {
    expect(formatDate("2024-10-19", TODAY)).toBe("19 de out. de 2024");
  });

  it("não usa o dia anterior por causa do parse UTC", () => {
    expect(formatDate("2026-01-01", TODAY)).toBe("1 de jan.");
    expect(formatDate("2026-12-31", TODAY)).toBe("31 de dez.");
  });

  it("não enche o dia de zeros quando o mês é escrito", () => {
    expect(formatDate("2026-03-01", TODAY)).toBe("1 de mar.");
  });
});
