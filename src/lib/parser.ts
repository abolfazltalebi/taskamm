import { type NaturalParsedResult, type TaskPriority } from '../types';
import { toEnglishDigits } from './jalali';

export function parseNaturalPersianTask(inputText: string): NaturalParsedResult {
  let text = inputText.trim();
  if (!text) {
    return {
      title: '',
      dueAt: null,
      estimateMinutes: 0,
      priority: 'none',
      tags: [],
      confidence: 0,
      extractedText: {},
    };
  }

  // Normalize numbers to english for regex parsing
  const normText = toEnglishDigits(text);
  const extractedText: NaturalParsedResult['extractedText'] = {};
  let confidenceScore = 0;
  let habitDaysTotal: number | null = null;
  let recurrence: 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly' | 'custom' | undefined = undefined;

  // 0. Extract Habit / Multi-Day Challenge (e.g. چالش ۴۰ روزه, ۴۰ روز, ۳۰ روزه, ۲۱ روز, هر روز)
  const habitMatch = normText.match(/(?:چالش|عادت|دوره|برنامه)?\s*(\d+)\s*(?:روزه|روز)\s*(?:متوالی|پیاپی|هر\s*روز)?/i)
    || normText.match(/هر\s*روز\s*(?:برای)?\s*(\d+)\s*روز/i);

  if (habitMatch) {
    const days = parseInt(habitMatch[1], 10);
    if (days > 1 && days <= 365) {
      habitDaysTotal = days;
      recurrence = 'daily';
      text = text.replace(habitMatch[0], '');
      extractedText.habitStr = `چالش ${days} روزه`;
      confidenceScore += 35;
    }
  } else if (/هر\s*روز|روزانه|daily/i.test(normText)) {
    recurrence = 'daily';
    text = text.replace(/هر\s*روز|روزانه|daily/gi, '');
    extractedText.habitStr = 'تکرار روزانه';
    confidenceScore += 20;
  }

  // 1. Extract Tags (e.g. #کاری #شخصی #توسعه)
  const tags: string[] = [];
  const tagMatches = normText.match(/#([\p{L}\p{N}_]+)/gu);
  if (tagMatches) {
    tagMatches.forEach((t) => {
      const cleanTag = t.substring(1).trim();
      if (cleanTag && !tags.includes(cleanTag)) {
        tags.push(cleanTag);
      }
      text = text.replace(t, '');
    });
    extractedText.tagStr = tags.join('، ');
    confidenceScore += 10;
  }

  // 2. Extract Priority (e.g. !فوری, !مهم, !عاجل, !کم, !متوسط, !urgent, !high)
  let priority: TaskPriority = 'none';
  if (/!(فوری|اورژانسی|urgent|خیلی مهم)/i.test(normText)) {
    priority = 'urgent';
    text = text.replace(/!(فوری|اورژانسی|urgent|خیلی مهم)/gi, '');
    extractedText.priorityStr = 'فوری (بسیار بالا)';
    confidenceScore += 20;
  } else if (/!(مهم|high|بالا)/i.test(normText)) {
    priority = 'high';
    text = text.replace(/!(مهم|high|بالا)/gi, '');
    extractedText.priorityStr = 'مهم (بالا)';
    confidenceScore += 20;
  } else if (/!(متوسط|medium|معمولی)/i.test(normText)) {
    priority = 'medium';
    text = text.replace(/!(متوسط|medium|معمولی)/gi, '');
    extractedText.priorityStr = 'متوسط';
    confidenceScore += 20;
  } else if (/!(کم|low|پایین)/i.test(normText)) {
    priority = 'low';
    text = text.replace(/!(کم|low|پایین)/gi, '');
    extractedText.priorityStr = 'کم';
    confidenceScore += 20;
  }

  // 3. Extract Duration / Estimate (e.g. ۳ ساعت, ۴۵ دقیقه, ۳۰د, ۱س, 2h, 45m)
  let estimateMinutes = 0;
  // Match e.g. "3 ساعت" or "2.5 ساعت"
  const hourMatch = normText.match(/(\d+(?:\.\d+)?)\s*(?:ساعت|س|h|hour|hours)/i);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1]);
    estimateMinutes += Math.round(hours * 60);
    text = text.replace(new RegExp(`${hourMatch[1]}\\s*(?:ساعت|س|h|hour|hours)`, 'i'), '');
    extractedText.estimateStr = `${hourMatch[1]} ساعت`;
    confidenceScore += 25;
  }

  // Match e.g. "45 دقیقه" or "30د" or "30m"
  const minMatch = normText.match(/(\d+)\s*(?:دقیقه|د|m|min|mins)/i);
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10);
    estimateMinutes += mins;
    text = text.replace(new RegExp(`${minMatch[1]}\\s*(?:دقیقه|د|m|min|mins)`, 'i'), '');
    extractedText.estimateStr = extractedText.estimateStr ? `${extractedText.estimateStr} و ${minMatch[1]} دقیقه` : `${minMatch[1]} دقیقه`;
    confidenceScore += 25;
  }

  // 4. Extract Date & Time
  let targetDate: Date | null = null;
  const now = new Date();

  // Time extraction: e.g. "ساعت 18:30" or "ساعت 6 عصر" or "18:00"
  let parsedHour = 18; // default to 18:00 if only date specified
  let parsedMinute = 0;
  let hasExplicitTime = false;

  const timeMatch24 = normText.match(/ساعت\s*(\d{1,2}):(\d{2})/i) || normText.match(/(\d{1,2}):(\d{2})/);
  const timeMatchSimple = normText.match(/ساعت\s*(\d{1,2})/i);

  if (timeMatch24) {
    let h = parseInt(timeMatch24[1], 10);
    const m = parseInt(timeMatch24[2], 10);
    if (/عصر|شب|بعدازظهر/i.test(normText) && h < 12) h += 12;
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      parsedHour = h;
      parsedMinute = m;
      hasExplicitTime = true;
      text = text.replace(timeMatch24[0], '');
      extractedText.timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      confidenceScore += 30;
    }
  } else if (timeMatchSimple) {
    let h = parseInt(timeMatchSimple[1], 10);
    if (/عصر|شب|بعدازظهر/i.test(normText) && h < 12) h += 12;
    if (h >= 0 && h < 24) {
      parsedHour = h;
      parsedMinute = 0;
      hasExplicitTime = true;
      text = text.replace(timeMatchSimple[0], '');
      extractedText.timeStr = `${String(h).padStart(2, '0')}:00`;
      confidenceScore += 25;
    }
  }

  // Date relative keyword matching
  if (/(پس\s*فردا|پس‌فردا)/i.test(normText)) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 2);
    text = text.replace(/(پس\s*فردا|پس‌فردا)/gi, '');
    extractedText.dateStr = 'پس‌فردا';
    confidenceScore += 35;
  } else if (/فردا/i.test(normText)) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 1);
    text = text.replace(/فردا/gi, '');
    extractedText.dateStr = 'فردا';
    confidenceScore += 35;
  } else if (/امروز/i.test(normText)) {
    targetDate = new Date(now);
    text = text.replace(/امروز/gi, '');
    extractedText.dateStr = 'امروز';
    confidenceScore += 35;
  } else if (/هفته\s*بعد|هفته\s*آینده/i.test(normText)) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 7);
    text = text.replace(/هفته\s*بعد|هفته\s*آینده/gi, '');
    extractedText.dateStr = 'هفته آینده';
    confidenceScore += 30;
  } else {
    // Weekday match: شنبه، یکشنبه، دوشنبه، سه‌شنبه، چهارشنبه، پنج‌شنبه، جمعه
    const weekdays = [
      { name: 'شنبه', dayOffset: 6 }, // in JS Sunday is 0, Sat is 6
      { name: 'یکشنبه', dayOffset: 0 },
      { name: 'دوشنبه', dayOffset: 1 },
      { name: 'سه‌شنبه', dayOffset: 2 },
      { name: 'سه شنبه', dayOffset: 2 },
      { name: 'چهارشنبه', dayOffset: 3 },
      { name: 'پنج‌شنبه', dayOffset: 4 },
      { name: 'پنج شنبه', dayOffset: 4 },
      { name: 'جمعه', dayOffset: 5 },
    ];

    for (const w of weekdays) {
      const regex = new RegExp(`(?:این|برای|روز)?\\s*${w.name}`, 'i');
      if (regex.test(normText)) {
        targetDate = new Date(now);
        const currentJsDay = now.getDay();
        let daysUntil = (w.dayOffset - currentJsDay + 7) % 7;
        if (daysUntil === 0 && !hasExplicitTime) daysUntil = 7; // next week's day
        targetDate.setDate(now.getDate() + daysUntil);
        text = text.replace(regex, '');
        extractedText.dateStr = w.name;
        confidenceScore += 30;
        break;
      }
    }
  }

  let dueAt: number | null = null;
  if (targetDate) {
    targetDate.setHours(parsedHour, parsedMinute, 0, 0);
    dueAt = targetDate.getTime();
  }

  // Clean remaining title
  const cleanTitle = text
    .replace(/[!#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Habit Time of Day string format
  const habitTimeOfDay = hasExplicitTime 
    ? `${String(parsedHour).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')}`
    : (habitDaysTotal ? '18:00' : null);

  return {
    title: cleanTitle || inputText,
    dueAt,
    estimateMinutes,
    priority,
    tags,
    confidence: Math.min(100, confidenceScore),
    habitDaysTotal: habitDaysTotal ?? (recurrence === 'daily' ? null : undefined),
    habitTimeOfDay,
    recurrence: recurrence || (habitDaysTotal ? 'daily' : 'none'),
    reminderMinutesBefore: hasExplicitTime || habitDaysTotal ? 15 : null,
    extractedText,
  };
}
