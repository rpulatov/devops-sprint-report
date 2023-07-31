import { isSameDay, differenceInHours, differenceInBusinessDays } from 'date-fns';

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

/**
 * @returns YYYY-MM-DD
 */
function dateToFormat(date: Date) {
  const offset = date.getTimezoneOffset();
  const updatedDate = new Date(date.getTime() - offset * 60 * 1000);
  return updatedDate.toISOString().split('T')[0];
}

function addDays(date: Date, days: number) {
  const tzone = date.getTimezoneOffset();
  const dateAdded = new Date(date.valueOf() + days * 24 * 60 * 60000);
  const diff = tzone - dateAdded.getTimezoneOffset();
  if (diff != 0) {
    return new Date(dateAdded.valueOf() - diff * 60000);
  }
  return dateAdded;
}

export function getDatesArray(
  startDate: Date | string,
  stopDate: Date | string
) {
  const dateArray = new Array<Date>();
  let currentDate = new Date(startDate);
  const stop = new Date(stopDate);
  while (currentDate <= stop) {
    dateArray.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dateArray;
}

export function isDayInRange(
  range: Array<{ start: Date | string; end: Date | string }>,
  date: Date
) {
  let inRange = false;
  const dateFormatted = dateToFormat(date);
  range.forEach((rangeItem) => {
    getDatesArray(rangeItem.start, rangeItem.end).forEach((dateInRange) => {
      if (dateFormatted === dateToFormat(dateInRange)) inRange = true;
    });
  });

  return inRange;
}

export function getNameOfDay(date: Date | string) {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const d = new Date(date);
  return days[d.getDay()];
}

export function removeTime(date = new Date()) {
  return new Date(date.toDateString());
}

export function differenceInBusinnessHours(start: Date, end: Date, avgWorkdayStartHour: number, avgWorkdayEndHour: number) {
  if (isSameDay(start, end)) {
    return end >= start ? differenceInHours(end, start) : 0;
  } else {
    const bdDiff = differenceInBusinessDays(end, start) - 1;
    const hoursMiddle = bdDiff * (avgWorkdayEndHour - avgWorkdayStartHour);
    let hoursLeft = avgWorkdayEndHour - start.getHours();
    if (hoursLeft < 0) hoursLeft = 0;
    let hoursRight = end.getHours() - avgWorkdayStartHour;
    if (hoursRight < 0) hoursRight = 0;
    return hoursLeft + hoursRight + hoursMiddle;
  }
}

export function truncateMessage(message: string, maxLength: number) {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength - 3) + '...';
}

export const getEnumKeys = <T extends object>(enumToDeconstruct: T): Array<keyof typeof enumToDeconstruct> => {
  return Object.keys(enumToDeconstruct) as Array<keyof typeof enumToDeconstruct>;
};