const DAY_FORMAT = "en-CA";

const resolveTimeZone = (raw: string): string => {
  try {
    return new Intl.DateTimeFormat(DAY_FORMAT, {
      timeZone: raw,
    }).resolvedOptions().timeZone;
  } catch {
    throw new Error(`APP_TIMEZONE is not a valid IANA time zone: "${raw}"`);
  }
};

export const resolveAppTimeZone = (raw: string | undefined): string => {
  if (!raw) {
    throw new Error(
      "APP_TIMEZONE is missing. Set it to an IANA time zone, e.g. APP_TIMEZONE=America/Argentina/Buenos_Aires",
    );
  }

  return resolveTimeZone(raw);
};

export const APP_TIMEZONE = resolveAppTimeZone(process.env.APP_TIMEZONE);
