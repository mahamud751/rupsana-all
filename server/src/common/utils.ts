/**
 * Normalises Bangladeshi mobile numbers to the local 11-digit form
 * (e.g. "+880 1712-345678" -> "01712345678").
 */
export const normalizePhone = (phone: string) => {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.startsWith('880') ? digits.slice(2) : digits;
};

/** "RS-000123" style order reference. */
export const orderRef = (n: number) => `RS-${String(n).padStart(6, '0')}`;

/** Parses "YYYY-MM-DD" as a UTC calendar date (matches @db.Date columns). */
export const parseDateOnly = (value: string) =>
  new Date(`${value}T00:00:00.000Z`);

export const todayDateOnly = () =>
  parseDateOnly(new Date().toISOString().slice(0, 10));

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** "Sat, 3 Oct" for a date-only value. */
export const friendlyDay = (d: Date) =>
  `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
