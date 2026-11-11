import { Entry } from "@habits/shared/entry";

// Une las entries que Home ya tiene (ventana de 90 días) con las que
// HabitDetail fetchea para el rango seleccionado. Deduplica por _id: la
// misma entry puede llegar de ambas fuentes; gana la copia fetcheada, que
// se refresca en cada guardado vía refetch. Orden por dayKey para que el
// resultado sea determinista.
export const mergeEntries = (base: Entry[], fetched: Entry[]): Entry[] => {
  const byId = new Map<string, Entry>();

  for (const entry of base) byId.set(entry._id, entry);
  for (const entry of fetched) byId.set(entry._id, entry);

  return Array.from(byId.values()).sort((a, b) =>
    a.dayKey.localeCompare(b.dayKey),
  );
};
