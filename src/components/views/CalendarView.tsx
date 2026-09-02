import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TaskCard } from '../task/TaskCard';
import { 
  getJalaliNow, 
  toPersianDigits, 
  formatJalaliDate, 
  gregorianToJalali, 
  jalaliToGregorian 
} from '../../lib/jalali';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles 
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks, addTask, boards, lists } = useAppStore();
  const nowJalali = getJalaliNow();

  const [currentYear, setCurrentYear] = useState(nowJalali.jy);
  const [currentMonth, setCurrentMonth] = useState(nowJalali.jm); // 1 to 12
  const [selectedDay, setSelectedDay] = useState<number>(nowJalali.jd);
  const [quickDayTaskTitle, setQuickDayTaskTitle] = useState('');

  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد',
    'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر',
    'دی', 'بهمن', 'اسفند'
  ];

  const weekDayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  // Days in selected Jalali month
  const getDaysInMonth = (year: number, month: number) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Esfand leap year calculation
    const r = (year - 474) % 2820;
    const isLeap = (((r >= 0 ? r : r + 2820) + 474 + 38) * 682) % 2816 < 682;
    return isLeap ? 30 : 29;
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);

  // Find weekday of the 1st day of this Shamsi month
  const firstDayGregorian = jalaliToGregorian(currentYear, currentMonth, 1);
  const firstDayDate = new Date(firstDayGregorian.gy, firstDayGregorian.gm - 1, firstDayGregorian.gd);
  // In JS: 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // In Iranian week: 0 is Saturday, 1 is Sunday, ..., 6 is Friday
  const startDayOffset = (firstDayDate.getDay() + 1) % 7;

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Convert selected Jalali day to Gregorian timestamp for filtering tasks
  const selectedGregorian = jalaliToGregorian(currentYear, currentMonth, selectedDay);
  const selectedDateObj = new Date(selectedGregorian.gy, selectedGregorian.gm - 1, selectedGregorian.gd);
  const selectedDateStr = selectedDateObj.toDateString();

  const selectedDayTasks = tasks.filter((t) => {
    if (!t.dueAt || t.deletedAt) return false;
    const taskDate = new Date(t.dueAt);
    return taskDate.toDateString() === selectedDateStr;
  });

  const handleQuickAddForSelectedDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDayTaskTitle.trim()) return;

    selectedDateObj.setHours(18, 0, 0, 0);

    await addTask({
      title: quickDayTaskTitle.trim(),
      boardId: boards[0]?.id,
      listId: lists[0]?.id,
      dueAt: selectedDateObj.getTime(),
    });

    setQuickDayTaskTitle('');
  };

  return (
    <div id="calendar-view-container" className="space-y-6">
      {/* Calendar Navigation & Month Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900/70 p-4 sm:p-5 rounded-3xl border border-gray-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              {monthNames[currentMonth - 1]} {toPersianDigits(currentYear)}
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">تقویم هجری شمسی</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setCurrentYear(nowJalali.jy);
              setCurrentMonth(nowJalali.jm);
              setSelectedDay(nowJalali.jd);
            }}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 font-semibold dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            امروز
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
            title="ماه قبل"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
            title="ماه بعد"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Matrix */}
      <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-gray-200/90 dark:border-slate-800 p-3 sm:p-5 shadow-2xs">
        {/* Week Day Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-500 dark:text-slate-400 pb-3 border-b border-gray-100 dark:border-slate-800 mb-2">
          {weekDayNames.map((dayName, idx) => (
            <div key={idx} className={idx === 6 ? 'text-rose-600 dark:text-rose-400' : ''}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty offset slots */}
          {Array.from({ length: startDayOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-14 sm:h-20 rounded-2xl bg-gray-50/50 dark:bg-slate-950/20" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const isToday =
              currentYear === nowJalali.jy &&
              currentMonth === nowJalali.jm &&
              dayNum === nowJalali.jd;
            const isSelected = dayNum === selectedDay;

            // Find tasks on this day
            const gDate = jalaliToGregorian(currentYear, currentMonth, dayNum);
            const dStr = new Date(gDate.gy, gDate.gm - 1, gDate.gd).toDateString();
            const dayTasks = tasks.filter((t) => {
              if (!t.dueAt || t.deletedAt) return false;
              return new Date(t.dueAt).toDateString() === dStr;
            });

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-14 sm:h-20 rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between items-start transition-all cursor-pointer border text-start relative ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-600 dark:bg-indigo-600/30 dark:border-indigo-500 shadow-2xs'
                    : isToday
                    ? 'bg-indigo-50/40 border-indigo-300 dark:bg-slate-800/90 dark:border-indigo-500/50 hover:border-indigo-400'
                    : 'bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200 dark:bg-slate-950/50 dark:hover:bg-slate-800/60 dark:border-slate-800/80'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      isSelected
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : isToday
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-gray-800 dark:text-slate-300'
                    }`}
                  >
                    {toPersianDigits(dayNum)}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </div>

                {/* Task dots */}
                {dayTasks.length > 0 && (
                  <div className="w-full flex items-center gap-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'done'
                            ? 'bg-emerald-500'
                            : t.priority === 'urgent'
                            ? 'bg-rose-500'
                            : 'bg-indigo-600'
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-gray-400 dark:text-slate-400">+{toPersianDigits(dayTasks.length - 3)}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task Drawer / Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-gray-200/90 dark:border-slate-800 p-4 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              کارهای {toPersianDigits(selectedDay)} {monthNames[currentMonth - 1]}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              ({toPersianDigits(selectedDayTasks.length)} تسک)
            </span>
          </div>
        </div>

        {/* Quick Add For This Day */}
        <form onSubmit={handleQuickAddForSelectedDay} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`افزودن تسک برای ${toPersianDigits(selectedDay)} ${monthNames[currentMonth - 1]}...`}
            value={quickDayTaskTitle}
            onChange={(e) => setQuickDayTaskTitle(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!quickDayTaskTitle.trim()}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت</span>
          </button>
        </form>

        {/* Selected Day Tasks List */}
        {selectedDayTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {selectedDayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 dark:text-slate-500 text-xs">
            <span>هیچ تسکی برای این روز ثبت نشده است.</span>
          </div>
        )}
      </div>
    </div>
  );
};
