const DEFAULT_BOOKING_TIME_ZONE = 'Australia/Sydney';

export const BOOKING_TIME_ZONE =
  process.env.BOOKING_TIME_ZONE && process.env.BOOKING_TIME_ZONE.trim()
    ? process.env.BOOKING_TIME_ZONE.trim()
    : DEFAULT_BOOKING_TIME_ZONE;

export const addMinutesToDate = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60000);

const getTimeZoneParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
};

const getTimeZoneOffsetMinutes = (date: Date, timeZone: string) => {
  const parts = getTimeZoneParts(date, timeZone);
  const utcTime = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return (utcTime - date.getTime()) / 60000;
};

export const buildDateTime = (date: string, time: string, timeZone = BOOKING_TIME_ZONE) => {
  const dateParts = date.split('-').map(Number);
  const timeParts = time.split(':').map(Number);

  const year = dateParts[0]!;
  const month = dateParts[1]!;
  const day = dateParts[2]!;
  const hour = timeParts[0]!;
  const minute = timeParts[1]!;

  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getTimeZoneOffsetMinutes(utcDate, timeZone);
  return new Date(utcDate.getTime() - offset * 60000);
};

export const addDaysToDateString = (date: string, days: number) => {
  const parts = date.split('-').map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() + days);
  const nextYear = utcDate.getUTCFullYear();
  const nextMonth = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

export const getLocalDateString = (date: Date, timeZone = BOOKING_TIME_ZONE) => {
  const parts = getTimeZoneParts(date, timeZone);
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${parts.year}-${month}-${day}`;
};

export const getDateRangeForDate = (date: string, timeZone = BOOKING_TIME_ZONE) => {
  const start = buildDateTime(date, '00:00', timeZone);
  const nextDate = addDaysToDateString(date, 1);
  const end = new Date(buildDateTime(nextDate, '00:00', timeZone).getTime() - 1);
  return { start, end };
};

export const getDateRangeFromToday = (days: number, timeZone = BOOKING_TIME_ZONE) => {
  const todayDate = getLocalDateString(new Date(), timeZone);
  const start = buildDateTime(todayDate, '00:00', timeZone);
  const endDate = addDaysToDateString(todayDate, days);
  const end = new Date(buildDateTime(endDate, '00:00', timeZone).getTime() - 1);
  return { start, end };
};

export const getDayOfWeekFromDateString = (date: string) => {
  const parts = date.split('-').map(Number);
  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2]!;
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = utcDate.getUTCDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
};
