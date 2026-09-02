/**
 * Shamsi (Jalali) Calendar Utilities
 * Accurate astronomical algorithms for Jalali date calculations, formatting, and matrix rendering.
 */

const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const JALALI_WEEKDAY_NAMES = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

const JALALI_WEEKDAY_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function toPersianDigits(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

export function toEnglishDigits(str: string): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(persianDigits[i], 'g'), String(i));
    res = res.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }
  return res;
}

export interface JalaliDateObj {
  jy: number;
  jm: number;
  jd: number;
}

/**
 * Converts Gregorian date to Jalali date.
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDateObj {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Converts Jalali date to Gregorian Date.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let jy_adj = jy + 1595;
  let days =
    -355668 +
    365 * jy_adj +
    Math.floor(jy_adj / 33) * 8 +
    Math.floor(((jy_adj % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && gd > sal_a[gm]) {
    gd -= sal_a[gm];
    gm++;
  }
  return { gy, gm, gd };
}

export function isJalaliLeapYear(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let jp = breaks[0];
  let jm: number;
  let jump: number;
  let n: number;
  if (jy < jp || jy >= breaks[breaks.length - 1]) {
    return false;
  }
  for (let i = 1; i < breaks.length; i++) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) {
      n = jy - jp;
      return (n % 33) % 4 === 0;
    }
    jp = jm;
  }
  return false;
}

export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

export function getJalaliNow(): JalaliDateObj & { hour: number; minute: number; weekdayIndex: number } {
  const d = new Date();
  const j = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  // Jalali weekday: Saturday is 0, Sunday is 1, ..., Friday is 6
  // JS getDay(): Sunday=0, Monday=1, ..., Saturday=6
  const jsDay = d.getDay();
  const weekdayIndex = (jsDay + 1) % 7;
  return {
    ...j,
    hour: d.getHours(),
    minute: d.getMinutes(),
    weekdayIndex,
  };
}

export function formatJalaliDate(timestamp: number | Date | null | undefined, formatType: 'full' | 'short' | 'time' | 'dateOnly' | 'dayOfWeek' = 'full'): string {
  if (!timestamp) return '';
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  if (isNaN(d.getTime())) return '';
  const { jy, jm, jd } = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const jsDay = d.getDay();
  const weekday = JALALI_WEEKDAY_NAMES[(jsDay + 1) % 7];
  const monthName = JALALI_MONTH_NAMES[jm - 1];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  switch (formatType) {
    case 'time':
      return toPersianDigits(`${hours}:${minutes}`);
    case 'dateOnly':
      return toPersianDigits(`${jd} ${monthName} ${jy}`);
    case 'dayOfWeek':
      return `${weekday}، ${toPersianDigits(jd)} ${monthName}`;
    case 'short':
      return toPersianDigits(`${jd} ${monthName}`);
    case 'full':
    default:
      return `${weekday} ${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)} ساعت ${toPersianDigits(`${hours}:${minutes}`)}`;
  }
}

/**
 * Returns human-readable relative time in Persian:
 * e.g., "۳ ساعت مانده", "۲ روز گذشته", "امروز ساعت ۱۸:۳۰", "فردا", "دیروز"
 */
export function formatRelativeDueDate(dueTimestamp: number | null | undefined): { text: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean; colorClass: string } {
  if (!dueTimestamp) {
    return { text: 'بدون مهلت', isOverdue: false, isToday: false, isTomorrow: false, colorClass: 'text-slate-400' };
  }

  const now = new Date();
  const dueDate = new Date(dueTimestamp);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isTodayDate = now.toDateString() === dueDate.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrowDate = tomorrow.toDateString() === dueDate.toDateString();

  const timeStr = toPersianDigits(`${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`);

  if (diffMs < 0) {
    // Overdue
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absHours < 1) {
      return { text: `چند دقیقه پیش (${timeStr})`, isOverdue: true, isToday: isTodayDate, isTomorrow: false, colorClass: 'text-rose-400' };
    }
    if (absHours < 24 && isTodayDate) {
      return { text: `${toPersianDigits(absHours)} ساعت دیر شده`, isOverdue: true, isToday: true, isTomorrow: false, colorClass: 'text-rose-400' };
    }
    if (absDays <= 1) {
      return { text: `دیروز (${timeStr})`, isOverdue: true, isToday: false, isTomorrow: false, colorClass: 'text-rose-400' };
    }
    return { text: `${toPersianDigits(absDays)} روز عقب‌افتاده`, isOverdue: true, isToday: false, isTomorrow: false, colorClass: 'text-rose-400' };
  }

  // Future
  if (diffMinutes < 60) {
    return { text: `${toPersianDigits(diffMinutes)} دقیقه مانده`, isOverdue: false, isToday: true, isTomorrow: false, colorClass: 'text-amber-400' };
  }
  if (isTodayDate) {
    return { text: `امروز ساعت ${timeStr}`, isOverdue: false, isToday: true, isTomorrow: false, colorClass: 'text-sky-400' };
  }
  if (isTomorrowDate) {
    return { text: `فردا ساعت ${timeStr}`, isOverdue: false, isToday: false, isTomorrow: true, colorClass: 'text-indigo-400' };
  }
  if (diffDays <= 7) {
    const jsDay = dueDate.getDay();
    const weekday = JALALI_WEEKDAY_NAMES[(jsDay + 1) % 7];
    return { text: `${weekday} ساعت ${timeStr}`, isOverdue: false, isToday: false, isTomorrow: false, colorClass: 'text-slate-300' };
  }

  const { jm, jd } = gregorianToJalali(dueDate.getFullYear(), dueDate.getMonth() + 1, dueDate.getDate());
  return { text: `${toPersianDigits(jd)} ${JALALI_MONTH_NAMES[jm - 1]}`, isOverdue: false, isToday: false, isTomorrow: false, colorClass: 'text-slate-400' };
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '۰ دقیقه';
  if (minutes < 60) {
    return `${toPersianDigits(minutes)} دقیقه`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (remMinutes === 0) {
    return `${toPersianDigits(hours)} ساعت`;
  }
  return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(remMinutes)} دقیقه`;
}

/**
 * Generates month matrix for calendar view.
 */
export function getJalaliMonthMatrix(jy: number, jm: number) {
  const totalDays = getJalaliMonthDays(jy, jm);
  // Get Gregorian date of 1st day of this Jalali month
  const g1 = jalaliToGregorian(jy, jm, 1);
  const d1 = new Date(g1.gy, g1.gm - 1, g1.gd);
  const jsDay = d1.getDay();
  // Saturday is index 0 in Jalali
  const startWeekday = (jsDay + 1) % 7;

  const days: Array<{
    dayNumber: number;
    isCurrentMonth: boolean;
    timestamp: number;
    isToday: boolean;
  }> = [];

  const now = new Date();
  const currentJ = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // Fill preceding empty/prev month slots
  for (let i = 0; i < startWeekday; i++) {
    days.push({
      dayNumber: 0,
      isCurrentMonth: false,
      timestamp: 0,
      isToday: false,
    });
  }

  // Fill current month days
  for (let d = 1; d <= totalDays; d++) {
    const g = jalaliToGregorian(jy, jm, d);
    const dateObj = new Date(g.gy, g.gm - 1, g.gd);
    const isToday = currentJ.jy === jy && currentJ.jm === jm && currentJ.jd === d;
    days.push({
      dayNumber: d,
      isCurrentMonth: true,
      timestamp: dateObj.getTime(),
      isToday,
    });
  }

  return {
    monthName: JALALI_MONTH_NAMES[jm - 1],
    year: jy,
    days,
    weekdays: JALALI_WEEKDAY_SHORT,
  };
}

/**
 * Returns current week range in Jalali (Saturday 00:00:00 to Friday 23:59:59)
 */
export function getCurrentJalaliWeekRange(): { startTimestamp: number; endTimestamp: number; weekLabel: string } {
  const now = new Date();
  const jsDay = now.getDay();
  const daySinceSaturday = (jsDay + 1) % 7;

  const startDate = new Date(now);
  startDate.setDate(now.getDate() - daySinceSaturday);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  const jStart = gregorianToJalali(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
  const jEnd = gregorianToJalali(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate());

  const weekLabel = `${toPersianDigits(jStart.jd)} ${JALALI_MONTH_NAMES[jStart.jm - 1]} تا ${toPersianDigits(jEnd.jd)} ${JALALI_MONTH_NAMES[jEnd.jm - 1]} ${toPersianDigits(jStart.jy)}`;

  return {
    startTimestamp: startDate.getTime(),
    endTimestamp: endDate.getTime(),
    weekLabel,
  };
}
