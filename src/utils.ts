export function diffInDays(date1: string | Date, date2: string | Date) {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);

  if (isNaN(Number(dateObj1)) || isNaN(Number(dateObj2))) return null;

  const startDate = Number(dateObj1) > Number(dateObj2) ? dateObj2 : dateObj1;
  const endDate = Number(dateObj1) > Number(dateObj2) ? dateObj1 : dateObj2;
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const diffTime = Math.abs(Number(endDate) - Number(startDate));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
