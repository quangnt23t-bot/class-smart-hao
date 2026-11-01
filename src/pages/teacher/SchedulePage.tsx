import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { canUserEditClass, StorageService } from '../../data/storage';
import { EditClassNameModal } from '../../components/classes/EditClassNameModal';
import { InteractiveTimetable } from '../../components/schedule/InteractiveTimetable';
import { ClassicTimetable } from '../../components/schedule/ClassicTimetable';
import { MapPin, Pencil, LayoutGrid, CalendarDays, RotateCcw, Sparkles } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const { schedule } = useClass();
  
  // View mode persistence: 'interactive' (Lưới trực tiếp) vs 'cards' (Giao diện cũ)
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>(() => {
    const saved = StorageService.getTimetableViewMode();
    return saved === 'classic' ? 'cards' : 'grid';
  });
  const [editingClass, setEditingClass] = useState<{ id: string; name: string } | null>(null);

  const handleSetViewMode = (mode: 'grid' | 'cards') => {
    setViewMode(mode);
    StorageService.setTimetableViewMode(mode === 'grid' ? 'interactive' : 'classic');
  };

  const days = [
    { day: 2, name: 'Thứ Hai' },
    { day: 3, name: 'Thứ Ba' },
    { day: 4, name: 'Thứ Tư' },
    { day: 5, name: 'Thứ Năm' },
    { day: 6, name: 'Thứ Sáu' },
    { day: 7, name: 'Thứ Bảy' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Toggle Switch Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Thời khóa biểu</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem, phân bổ môn học và xếp lịch giảng dạy học kỳ 1 năm học 2025 - 2026
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleSetViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới tương tác trực tiếp</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Giao diện cũ (Thẻ ngày)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Grid vs Classic Cards */}
      {viewMode === 'grid' ? (
        <InteractiveTimetable onSwitchToClassic={() => handleSetViewMode('cards')} />
      ) : (
        <ClassicTimetable onSwitchToInteractive={() => handleSetViewMode('grid')} />
      )}

      {/* Popup chỉnh sửa tên lớp */}
      {editingClass && (
        <EditClassNameModal
          isOpen={!!editingClass}
          onClose={() => setEditingClass(null)}
          classId={editingClass.id}
          currentName={editingClass.name}
        />
      )}
    </div>
  );
};
