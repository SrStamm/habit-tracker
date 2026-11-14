import { afterEach, describe, expect, it } from "vitest";
import { fmtDayKey } from "./fmtDayKey";
import { setAppTimeZone } from "./appTimeZone";

// El mismo instante cae en días distintos según la zona de la aplicación:
// por eso el test fija la zona por módulo y no depende de la TZ del proceso.
describe("fmtDayKey", () => {
  afterEach(() => setAppTimeZone(undefined));

  it("usa la zona de la aplicación cuando está adelantada", () => {
    setAppTimeZone("Pacific/Kiritimati"); // UTC+14

    expect(fmtDayKey(new Date("2026-03-15T23:30:00Z"))).toBe("2026-03-16");
  });

  it("usa la zona de la aplicación cuando está atrasada", () => {
    setAppTimeZone("America/Argentina/Buenos_Aires"); // UTC-3

    expect(fmtDayKey(new Date("2026-03-15T23:30:00Z"))).toBe("2026-03-15");
  });
});
