import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, Loader2, AlertCircle, Info, School, Check } from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';

interface EditClassNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  currentName: string;
  onSuccess?: (newName: string) => void;
}

export const EditClassNameModal: React.FC<EditClassNameModalProps> = ({
  isOpen,
  onClose,
  classId,
  currentName,
  onSuccess
}) => {
  const { updateClassName } = useClass();
  const toast = useToast();
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find class details for informational context
  const classRoom = StorageService.getClassById(classId);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
      setIsSaving(false);
      // Auto focus and select input text
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, currentName]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const trimmed = name.trim();

    // Validation 1: Empty or whitespace only
    if (!trimmed) {
      setError('Tên lớp học không được để trống hoặc chỉ chứa khoảng trắng.');
      inputRef.current?.focus();
      return;
    }

    // Validation 2: Max length
    if (trimmed.length > 50) {
      setError('Tên lớp học không được vượt quá 50 ký tự.');
      inputRef.current?.focus();
      return;
    }

    // Validation 3: No changes made
    if (trimmed === currentName.trim()) {
      onClose();
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const res = await updateClassName(classId, trimmed);
      if (res.success) {
        toast.success(`Đã đổi tên lớp thành "${trimmed}" thành công!`, 'Cập nhật hoàn tất');
        if (onSuccess) onSuccess(trimmed);
        onClose();
      } else {
        const errorMsg = res.error || 'Không thể lưu tên lớp học. Vui lòng thử lại.';
        setError(errorMsg);
        toast.error(errorMsg, 'Lỗi cập nhật');
      }
    } catch (err: unknown) {
      const fallbackErr = 'Lỗi kết nối hoặc hệ thống bận. Vui lòng thử lại sau.';
      setError(fallbackErr);
      toast.error(fallbackErr, 'Lỗi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!isSaving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-class-name-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 id="edit-class-name-title" className="text-base font-bold text-slate-900 leading-tight">
                Chỉnh sửa tên lớp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tên hiển thị trên thời khóa biểu và toàn bộ hệ thống
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Đóng popup"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="classNameInput" className="text-xs font-bold text-slate-700">
                Tên lớp học <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${name.length > 50 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {name.length}/50
              </span>
            </div>

            <div className="relative">
              <input
                id="classNameInput"
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSaving}
                placeholder="Ví dụ: Lớp 6A1, Lớp 10A1..."
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  error
                    ? 'border-rose-400 ring-2 ring-rose-500/10 focus:border-rose-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
                } disabled:bg-slate-50 disabled:text-slate-400`}
                maxLength={60}
              />
              {name.trim() !== currentName.trim() && name.trim().length > 0 && !error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Context Card: Preserved details */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <School className="w-3.5 h-3.5 text-slate-500" />
              <span>Thông tin lớp học liên quan</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400">Mã lớp:</span>{' '}
                <span className="font-mono font-medium text-slate-800">{classRoom?.joinCode || classId}</span>
              </div>
              <div>
                <span className="text-slate-400">Phòng học:</span>{' '}
                <span className="font-medium text-slate-800">{classRoom?.room || 'Phòng 204'}</span>
              </div>
              <div>
                <span className="text-slate-400">Môn học:</span>{' '}
                <span className="font-medium text-slate-800">{classRoom?.subject || 'Toán học'}</span>
              </div>
              <div>
                <span className="text-slate-400">Sĩ số:</span>{' '}
                <span className="font-medium text-slate-800">{classRoom?.totalStudents || 32} học sinh</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Mã lớp, danh sách học sinh, điểm danh, bài tập và lịch dạy sẽ được <strong>giữ nguyên hoàn toàn</strong>.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue-500/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
