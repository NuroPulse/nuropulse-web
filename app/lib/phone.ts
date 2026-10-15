// Phone numbers are stored in international format without spaces ("+6281234567890").
// Indonesian numbers are grouped for reading ("+62 812 3456 7890"); others are left as is.
export function formatPhoneNumber(phone: string): string {
  const match = phone.match(/^\+62(\d{3})(\d{4})(\d+)$/);
  if (!match) return phone;
  const [, operator, middle, rest] = match;
  return `+62 ${operator} ${middle} ${rest}`;
}
