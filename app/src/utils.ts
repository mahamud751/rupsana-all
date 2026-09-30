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
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDay = (iso: string) => {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(iso)}, ${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};

// Bangladeshi mobile numbers: 01[3-9] followed by 8 digits.
export const isValidPhone = (phone: string) =>
  /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''));

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const newId = (prefix: string) =>
  `${prefix}${Date.now().toString(36).toUpperCase()}${Math.floor(
    Math.random() * 1000,
  )
    .toString()
    .padStart(3, '0')}`;
