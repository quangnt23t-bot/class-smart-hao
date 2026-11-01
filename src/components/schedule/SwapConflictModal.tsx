import React from 'react';
import { ArrowLeftRight, AlertCircle, X, Check } from 'lucide-react';
import { ScheduleItem } from '../../types';

interface SwapConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceItem: ScheduleItem | null;
  targetItem: ScheduleItem | null;
  onConfirmSwap: () => void;
}

export const SwapConflictModal: React.FC<SwapConflictModalProps> = ({
  isOpen,
  onClose,
  sourceItem,
  targetItem,
  onConfirmSwap
}) => {
  if (!isOpen || !sourceItem || !targetItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Vị trí đích đã có tiết học</h3>
              <p className="text-[11px] text-slate-500">Xử lý hoán đổi lịch học</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-slate-700">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Bạn đang kéo tiết học vào một ô đã có tiết giảng dạy. Bạn có muốn <strong>hoán đổi vị trí</strong> (Swap) giữa hai tiết học này không?
            </p>
          </div>

          <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="text-slate-500 font-medium">Tiết nguồn được kéo:</div>
              <div className="font-bold text-blue-700">
                {sourceItem.subject} (Thứ {sourceItem.dayOfWeek}, Tiết {sourceItem.period} · {sourceItem.shift === 'afternoon' ? 'Ca chiều' : 'Ca sáng'})
              </div>
            </div>

            <div className="flex items-center justify-center py-0.5 text-slate-400">
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-slate-500 font-medium">Tiết đích hiện tại:</div>
              <div className="font-bold text-amber-700">
                {targetItem.subject} (Thứ {targetItem.dayOfWeek}, Tiết {targetItem.period} · {targetItem.shift === 'afternoon' ? 'Ca chiều' : 'Ca sáng'})
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Hủy thao tác
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmSwap();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Hoán đổi hai tiết</span>
          </button>
        </div>
      </div>
    </div>
  );
};
