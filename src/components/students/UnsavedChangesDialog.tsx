import React from 'react';
import { AlertCircle } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onContinueEditing: () => void;
  onConfirmClose: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onContinueEditing,
  onConfirmClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        aria-describedby="unsaved-desc"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="unsaved-title" className="text-sm font-bold text-slate-900">
              Bạn có muốn đóng không?
            </h3>
            <p id="unsaved-desc" className="text-xs text-slate-500 mt-0.5">
              Dữ liệu bạn vừa nhập chưa được lưu và sẽ bị mất.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onConfirmClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            Đóng và bỏ thay đổi
          </button>
          <button
            type="button"
            onClick={onContinueEditing}
            autoFocus
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Tiếp tục nhập
          </button>
        </div>
      </div>
    </div>
  );
};
