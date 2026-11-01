import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, BookOpen, Trash2, AlertTriangle, Check, FileText } from 'lucide-react';
import { ScheduleItem, PeriodConfig } from '../../types';
import { StorageService } from '../../data/storage';

interface ScheduleItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialItem?: Partial<ScheduleItem>;
  currentClassId: string;
  currentClassName: string;
  onSave: (item: Omit<ScheduleItem, 'id'>, id?: string) => void;
  onDelete?: (id: string) => void;
  availablePeriods?: PeriodConfig[];
}

const DEFAULT_SUBJECTS = [
  'Toán',
  'Ngữ văn',
  'Tiếng Anh',
  'KHTN (Vật lý)',
  'KHTN (Hóa học)',
  'KHTN (Sinh học)',
  'Tin học',
  'Lịch sử & Địa lý',
  'GDCD',
  'Thể dục',
  'Âm nhạc & Mỹ thuật',
  'Chào cờ & SHDC',
  'Sinh hoạt lớp (SHCN)'
];

const DEFAULT_TEACHERS = [
  'Cô Nguyễn Thị Lan',
  'Thầy Trần Minh Tuấn',
  'Cô Jennifer Vũ',
  'Thầy Hoàng Quốc Việt',
  'Cô Phạm Thu Hà',
  'Thầy Lê Hoàng Nam',
  'Cô Đặng Thanh Mai',
  'Thầy Nguyễn Văn Hưng',
  'Cô Bùi Thùy Linh',
  'Cô Đỗ Mai Phương'
];

const DEFAULT_ROOMS = [
  'Phòng 204 - Nhà A',
  'Phòng 205 - Nhà A',
  'Phòng 301 - Nhà B',
  'Phòng 302 - Nhà B',
  'Lab Tin học 1 - Nhà C',
  'Lab Thực hành KHTN',
  'Sân thể thao đa năng',
  'Phòng Âm nhạc & Nghệ thuật',
  'Sân trường chính'
];

const SHIFT_PERIOD_TIMES: Record<'morning' | 'afternoon', Record<number, string>> = {
  morning: {
    1: '07:15 - 08:00',
    2: '08:05 - 08:50',
    3: '09:10 - 09:55',
    4: '10:05 - 10:50',
    5: '10:55 - 11:40'
  },
  afternoon: {
    1: '13:00 - 13:45',
    2: '13:50 - 14:35',
    3: '14:50 - 15:35',
    4: '15:40 - 16:25',
    5: '16:30 - 17:15'
  }
};

const DAY_OPTIONS = [
  { value: 2, label: 'Thứ Hai' },
  { value: 3, label: 'Thứ Ba' },
  { value: 4, label: 'Thứ Tư' },
  { value: 5, label: 'Thứ Năm' },
  { value: 6, label: 'Thứ Sáu' }
];

export const ScheduleItemModal: React.FC<ScheduleItemModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialItem,
  currentClassId,
  currentClassName,
  onSave,
  onDelete,
  availablePeriods
}) => {
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [room, setRoom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(2);
  const [shift, setShift] = useState<'morning' | 'afternoon'>('morning');
  const [period, setPeriod] = useState<number>(1);
  const [time, setTime] = useState('07:15 - 08:00');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Helper to compute time for a given shift and period
  const getTimeForPeriod = (s: 'morning' | 'afternoon', p: number): string => {
    // Check availablePeriods first
    const fromProps = availablePeriods?.find(c => c.shift === s && c.period === p);
    if (fromProps) return fromProps.time;
    if (SHIFT_PERIOD_TIMES[s]?.[p]) return SHIFT_PERIOD_TIMES[s][p];
    return StorageService.calculateDefaultPeriodTime(s, p);
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setShowDeleteConfirm(false);
      setConflictWarning(null);

      const d = initialItem?.dayOfWeek || 2;
      const s = initialItem?.shift || 'morning';
      const p = initialItem?.period || 1;
      setDayOfWeek(d);
      setShift(s);
      setPeriod(p);
      setTime(initialItem?.time || getTimeForPeriod(s, p));
      setSubject(initialItem?.subject || '');
      setTeacherName(initialItem?.teacherName || 'Cô Nguyễn Thị Lan');
      setRoom(initialItem?.room || 'Phòng 204 - Nhà A');
      setNote(initialItem?.note || '');
    }
  }, [isOpen, initialItem]);

  if (!isOpen) return null;

  // Determine period options for current shift
  const shiftPeriodOptions = (() => {
    const list: Array<{ period: number; label: string; time: string }> = [];
    const fromConfig = (availablePeriods || []).filter(c => c.shift === shift);
    
    // Always include at least 1..5
    const allPeriodNumbers = new Set<number>([1, 2, 3, 4, 5]);
    fromConfig.forEach(c => allPeriodNumbers.add(c.period));
    if (initialItem?.period) allPeriodNumbers.add(initialItem.period);
    if (period) allPeriodNumbers.add(period);

    const sortedNumbers = Array.from(allPeriodNumbers).sort((a, b) => a - b);
    return sortedNumbers.map(pNum => {
      const cfg = fromConfig.find(c => c.period === pNum);
      const pTime = cfg ? cfg.time : getTimeForPeriod(shift, pNum);
      const pLabel = cfg ? cfg.label : `Tiết ${pNum}${shift === 'afternoon' ? ' (Chiều)' : ''}`;
      return {
        period: pNum,
        label: pLabel,
        time: pTime
      };
    });
  })();

  const handleShiftChange = (newShift: 'morning' | 'afternoon') => {
    setShift(newShift);
    setTime(getTimeForPeriod(newShift, period));
    setConflictWarning(null);
  };

  const handlePeriodChange = (newPeriod: number) => {
    setPeriod(newPeriod);
    setTime(getTimeForPeriod(shift, newPeriod));
  };

  const handleValidateAndSubmit = (ignoreConflict = false) => {
    const trimmedSubject = subject.trim();
    const trimmedTeacher = teacherName.trim();
    const trimmedRoom = room.trim();

    if (!trimmedSubject) {
      setError('Vui lòng chọn hoặc nhập tên môn học.');
      return;
    }
    if (!trimmedTeacher) {
      setError('Vui lòng nhập tên giáo viên giảng dạy.');
      return;
    }
    if (!trimmedRoom) {
      setError('Vui lòng nhập phòng học.');
      return;
    }

    // Conflict check
    if (!ignoreConflict) {
      const conflictCheck = StorageService.checkScheduleConflict({
        id: initialItem?.id,
        classId: currentClassId,
        dayOfWeek,
        period,
        shift,
        teacherName: trimmedTeacher,
        room: trimmedRoom
      });

      if (conflictCheck.hasConflict) {
        const msgs = conflictCheck.conflicts.map(c => c.message).join('\n• ');
        setConflictWarning(`Phát hiện xung đột lịch:\n• ${msgs}`);
        return;
      }
    }

    onSave(
      {
        classId: currentClassId,
        className: currentClassName,
        subject: trimmedSubject,
        teacherName: trimmedTeacher,
        room: trimmedRoom,
        dayOfWeek,
        period,
        shift,
        time,
        note: note.trim()
      },
      initialItem?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {mode === 'add' ? 'Thêm tiết học mới' : 'Chỉnh sửa tiết học'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentClassName} · Thứ {dayOfWeek === 7 ? '7' : dayOfWeek}, Tiết {period} ({shift === 'morning' ? 'Ca sáng' : 'Ca chiều'} · {time})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {conflictWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="whitespace-pre-line font-medium leading-relaxed">{conflictWarning}</div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setConflictWarning(null)}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 rounded-md"
                >
                  Điều chỉnh lại
                </button>
                <button
                  type="button"
                  onClick={() => handleValidateAndSubmit(true)}
                  className="px-3 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-xs"
                >
                  Vẫn tiếp tục lưu
                </button>
              </div>
            </div>
          )}

          {/* Chọn Buổi Học: Sáng hoặc Chiều */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Buổi học <span className="text-rose-500">*</span></span>
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {shift === 'morning' ? 'Ca sáng: 07:15 - 11:40' : 'Ca chiều: 13:00 - 17:15'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleShiftChange('morning')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  shift === 'morning'
                    ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 ring-1 ring-blue-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="text-amber-500 text-sm">☀️</span>
                <span>Lịch buổi sáng</span>
              </button>
              <button
                type="button"
                onClick={() => handleShiftChange('afternoon')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  shift === 'afternoon'
                    ? 'bg-white text-orange-700 shadow-2xs border border-orange-200/80 ring-1 ring-orange-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="text-orange-500 text-sm">🌇</span>
                <span>Lịch buổi chiều</span>
              </button>
            </div>
          </div>

          {/* Môn học */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Môn học <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => {
                setSubject(e.target.value);
                setError(null);
                setConflictWarning(null);
              }}
              placeholder="VD: Toán, Ngữ văn, Tiếng Anh..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            {/* Subject Quick Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Chọn nhanh:</span>
              {DEFAULT_SUBJECTS.slice(0, 7).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    subject === s
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Thứ & Tiết */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Thứ trong tuần <span className="text-rose-500">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={e => {
                  setDayOfWeek(Number(e.target.value));
                  setConflictWarning(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {DAY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tiết học ({shift === 'morning' ? 'Sáng' : 'Chiều'}) <span className="text-rose-500">*</span>
              </label>
              <select
                value={period}
                onChange={e => handlePeriodChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {shiftPeriodOptions.map(opt => (
                  <option key={opt.period} value={opt.period}>
                    {opt.label} ({opt.time})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Giáo viên & Phòng học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Giáo viên giảng dạy <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                list="teachers-list"
                value={teacherName}
                onChange={e => {
                  setTeacherName(e.target.value);
                  setConflictWarning(null);
                }}
                placeholder="Chọn hoặc nhập tên GV..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <datalist id="teachers-list">
                {DEFAULT_TEACHERS.map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Phòng học <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                list="rooms-list"
                value={room}
                onChange={e => {
                  setRoom(e.target.value);
                  setConflictWarning(null);
                }}
                placeholder="Chọn hoặc nhập phòng..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <datalist id="rooms-list">
                {DEFAULT_ROOMS.map(r => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Khung giờ hiển thị */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Khung thời gian tiết</span>
            </label>
            <input
              type="text"
              value={time}
              onChange={e => setTime(e.target.value)}
              placeholder="07:15 - 08:00"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Ghi chú hoặc nội dung bài học */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Ghi chú / Nội dung bài học (tùy chọn)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Nhập ghi chú tiết dạy, bài kiểm tra, đồ dùng cần chuẩn bị..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Delete confirmation alert box */}
          {showDeleteConfirm && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Xác nhận xóa tiết học này?</span>
              </div>
              <p className="text-xs text-rose-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa môn <strong>{subject}</strong> (Thứ {dayOfWeek}, Tiết {period})? Sau khi xóa, ô này sẽ trở thành ô trống.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (initialItem?.id && onDelete) {
                      onDelete(initialItem.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác nhận xóa</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            {mode === 'edit' && onDelete && initialItem?.id && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tiết học</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleValidateAndSubmit(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{mode === 'add' ? 'Lưu tiết học' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
