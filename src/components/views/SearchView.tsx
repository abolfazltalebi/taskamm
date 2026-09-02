import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TaskCard } from '../task/TaskCard';
import { Search, X, Tag, Layers, Filter } from 'lucide-react';
import { toPersianDigits } from '../../lib/jalali';

export const SearchView: React.FC = () => {
  const { tasks, boards } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  const results = tasks.filter((task) => {
    if (task.deletedAt) return false;

    // Board filter
    if (selectedBoardFilter !== 'all' && task.boardId !== selectedBoardFilter) {
      return false;
    }

    // Priority filter
    if (selectedPriorityFilter !== 'all' && task.priority !== selectedPriorityFilter) {
      return false;
    }

    if (!cleanQuery) return true;

    const matchesTitle = task.title.toLowerCase().includes(cleanQuery);
    const matchesDesc = task.description?.toLowerCase().includes(cleanQuery);
    const matchesTags = task.tags?.some((t) => t.toLowerCase().includes(cleanQuery));

    return matchesTitle || matchesDesc || matchesTags;
  });

  return (
    <div id="search-view-container" className="space-y-6 max-w-4xl mx-auto">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در عنوان تسک‌ها، توضیحات، یا برچسب‌ها (#کاری، گزارش، و...)"
          className="w-full bg-slate-900/90 border border-slate-700 rounded-3xl ps-12 pe-12 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xl transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 end-0 pe-4 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Board Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedBoardFilter}
            onChange={(e) => setSelectedBoardFilter(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            <option value="all" className="bg-slate-900">همه بردها</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900">
                {b.emoji} {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            <option value="all" className="bg-slate-900">همه اولویت‌ها</option>
            <option value="urgent" className="bg-slate-900">فوری 🚨</option>
            <option value="high" className="bg-slate-900">مهم</option>
            <option value="medium" className="bg-slate-900">متوسط</option>
            <option value="low" className="bg-slate-900">پایین</option>
          </select>
        </div>

        <span className="ms-auto text-xs text-slate-400">
          {toPersianDigits(results.length)} نتیجه یافت شد
        </span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 text-xs bg-slate-900/30 rounded-3xl border border-slate-800/50">
          <span>موردی متناسب با عبارت جستجوی شما پیدا نشد.</span>
        </div>
      )}
    </div>
  );
};
