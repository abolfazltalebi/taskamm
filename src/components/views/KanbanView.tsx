import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TaskCard } from '../task/TaskCard';
import { 
  Plus, 
  Layers, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  FolderPlus, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toPersianDigits } from '../../lib/jalali';
import { type TaskStatus } from '../../types';

export const KanbanView: React.FC = () => {
  const { 
    boards, 
    activeBoardId, 
    setActiveBoardId, 
    lists, 
    tasks, 
    addBoard, 
    addList, 
    deleteList,
    deleteBoard,
    moveTask,
    addTask 
  } = useAppStore();

  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardEmoji, setNewBoardEmoji] = useState('📁');
  const [newColName, setNewColName] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [quickColTaskId, setQuickColTaskId] = useState<string | null>(null);
  const [quickColTitle, setQuickColTitle] = useState('');

  const currentBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const currentLists = lists
    .filter((l) => l.boardId === currentBoard?.id)
    .sort((a, b) => a.order - b.order);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      await addBoard({
        name: newBoardName.trim(),
        emoji: newBoardEmoji || '📁',
      });
      setNewBoardName('');
      setIsNewBoardModalOpen(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newColName.trim() && currentBoard) {
      await addList({
        boardId: currentBoard.id,
        name: newColName.trim(),
      });
      setNewColName('');
      setIsAddingCol(false);
    }
  };

  const handleQuickAddInColumn = async (listId: string) => {
    if (quickColTitle.trim() && currentBoard) {
      await addTask({
        title: quickColTitle.trim(),
        boardId: currentBoard.id,
        listId,
      });
      setQuickColTitle('');
      setQuickColTaskId(null);
    }
  };

  return (
    <div id="kanban-view-container" className="space-y-5">
      {/* Board Selector & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-3xl border border-gray-200/90 dark:border-slate-800 shadow-2xs">
        {/* Board Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {boards.map((b) => {
            const isSelected = b.id === currentBoard?.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBoardId(b.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100/90 dark:bg-slate-800/80 text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <span>{b.emoji}</span>
                <span>{b.name}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsNewBoardModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-medium border border-dashed border-gray-300 dark:border-slate-700 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>برد جدید</span>
          </button>
        </div>

        {/* Delete Board option if multiple */}
        {boards.length > 1 && currentBoard && (
          <button
            onClick={() => {
              if (confirm(`آیا از حذف برد «${currentBoard.name}» مطمئن هستید؟`)) {
                deleteBoard(currentBoard.id);
              }
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition text-xs flex items-center gap-1 cursor-pointer"
            title="حذف این برد"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">حذف برد</span>
          </button>
        )}
      </div>

      {/* Kanban Columns (Horizontal Scroll Container on Mobile) */}
      <div 
        id="kanban-columns-scroll-container"
        className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x snap-mandatory scroll-smooth items-start min-h-[calc(100vh-280px)]"
      >
        {currentLists.map((col) => {
          const colTasks = tasks
            .filter((t) => t.listId === col.id && !t.deletedAt)
            .sort((a, b) => a.order - b.order);

          const isWipExceeded = col.wipLimit && colTasks.length > col.wipLimit;

          return (
            <div
              key={col.id}
              className="w-[85vw] sm:w-80 shrink-0 snap-center rounded-3xl bg-gray-50/90 dark:bg-slate-900/80 border border-gray-200/90 dark:border-slate-800 p-4 flex flex-col max-h-[75vh] shadow-2xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{col.name}</h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isWipExceeded
                        ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                        : 'bg-gray-200/80 text-gray-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {toPersianDigits(colTasks.length)}
                    {col.wipLimit ? ` / ${toPersianDigits(col.wipLimit)}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuickColTaskId(col.id)}
                    className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer"
                    title="افزودن تسک در این ستون"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {currentLists.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`آیا ستون «${col.name}» حذف شود؟`)) {
                          deleteList(col.id);
                        }
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer"
                      title="حذف ستون"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Column Quick Add Input Form */}
              {quickColTaskId === col.id && (
                <div className="mb-3 p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-indigo-200 dark:border-indigo-500/40 space-y-2 shadow-2xs">
                  <input
                    type="text"
                    autoFocus
                    placeholder="عنوان تسک جدید..."
                    value={quickColTitle}
                    onChange={(e) => setQuickColTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAddInColumn(col.id);
                      if (e.key === 'Escape') setQuickColTaskId(null);
                    }}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickColTaskId(null)}
                      className="px-2.5 py-1 rounded-lg text-xs text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddInColumn(col.id)}
                      disabled={!quickColTitle.trim()}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
                    >
                      ثبت
                    </button>
                  </div>
                </div>
              )}

              {/* Task Cards in Column */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pe-1">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div key={task.id} className="relative group/card">
                      <TaskCard task={task} compact />
                      
                      {/* Move to another column quick triggers on hover/touch */}
                      <div className="absolute top-2 end-2 opacity-0 group-hover/card:opacity-100 transition flex items-center gap-1 bg-white/95 dark:bg-slate-950/90 rounded-lg p-1 border border-gray-200 dark:border-slate-700 shadow-xs">
                        {currentLists.map((otherCol) => {
                          if (otherCol.id === col.id) return null;
                          return (
                            <button
                              key={otherCol.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTask(task.id, otherCol.id);
                              }}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                              title={`انتقال به ${otherCol.name}`}
                            >
                              {otherCol.name.slice(0, 8)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 dark:text-slate-500 text-xs border-2 border-dashed border-gray-200 dark:border-slate-800/80 rounded-2xl">
                    <span>ستون خالی است</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Column Button */}
        <div className="w-[85vw] sm:w-80 shrink-0 snap-center">
          {isAddingCol ? (
            <form onSubmit={handleCreateList} className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-gray-200/90 dark:border-slate-800 space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">نام ستون جدید</h4>
              <input
                type="text"
                autoFocus
                placeholder="مثال: در انتظار تایید..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCol(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!newColName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
                >
                  افزودن ستون
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCol(true)}
              className="w-full h-36 rounded-3xl bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 border-2 border-dashed border-gray-300 dark:border-slate-800 hover:border-indigo-400 text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white flex flex-col items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-semibold">+ افزودن ستون جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* New Board Modal */}
      {isNewBoardModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsNewBoardModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl p-5 text-[#1E293B] dark:text-slate-100 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white">ایجاد برد جدید</h3>
            
            <form onSubmit={handleCreateBoard} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">نام برد</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="مثال: بازاریابی، پروژه‌های دانشگاه..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">انتخاب آیکون / اموجی</label>
                <div className="flex items-center gap-2">
                  {['📁', '🎯', '💼', '🚀', '📚', '⚡', '💡', '🎨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewBoardEmoji(emoji)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition cursor-pointer ${
                        newBoardEmoji === emoji ? 'bg-indigo-600 text-white scale-110 shadow-xs' : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBoardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!newBoardName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
                >
                  ایجاد برد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
