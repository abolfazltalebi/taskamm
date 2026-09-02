import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RotateCcw, X } from 'lucide-react';

export const UndoToast: React.FC = () => {
  const { undoAction, triggerUndo, setUndoAction } = useAppStore();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!undoAction) {
      setProgress(100);
      return;
    }

    const duration = 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          setUndoAction(null);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [undoAction, setUndoAction]);

  if (!undoAction) return null;

  return (
    <div 
      id="undo-action-toast"
      className="fixed bottom-20 md:bottom-8 start-4 end-4 md:start-auto md:end-8 md:w-96 z-50 overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 text-white p-3.5 transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
          {undoAction.message}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="undo-confirm-btn"
            onClick={triggerUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازگردانی (Undo)</span>
          </button>
          <button
            id="undo-dismiss-btn"
            onClick={() => setUndoAction(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Progress countdown line */}
      <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
