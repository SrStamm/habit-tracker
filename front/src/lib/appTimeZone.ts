let appTimeZone: string | undefined;

export const setAppTimeZone = (timeZone?: string) => {
  appTimeZone = timeZone;
};

// Sin config cargada cae a la zona del navegador: el app no se bloquea,
// pero "hoy" puede divergir del servidor.
export const getAppTimeZone = (): string =>
  appTimeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
