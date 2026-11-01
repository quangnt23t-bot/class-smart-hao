import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { canUserEditClass } from '../../data/storage';
import { EditClassNameModal } from '../classes/EditClassNameModal';
import { ScheduleItemModal } from './ScheduleItemModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Pencil, 
  Plus, 
  Trash2, 
  Sparkles,
  ArrowRight,
  BookOpen,
  User as UserIcon,
  Sun,
  Sunset
} from 'lucide-react';
import { ScheduleItem } from '../../types';

interface ClassicTimetableProps {
  onSwitchToInteractive?: () => void;
}

export const ClassicTimetable: React.FC<ClassicTimetableProps> = ({ onSwitchToInteractive }) => {
  const { user } = useAuth();
  const { 
    classes, 
    selectedClassId, 
    setSelectedClassId, 
    schedule, 
    addScheduleItem, 
    updateScheduleItem, 
    deleteScheduleItem,
    periodConfigs
  } = useClass();

  const [activeClassId, setActiveClassId] = useState<string>(selectedClassId || classes[0]?.id || 'c_6a1');
  const [editingClass, setEditingClass] = useState<{ id: string; name: string } | null>(null);
  
  // Modal State for adding/editing items in classic view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Partial<ScheduleItem> | undefined>(undefined);
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  const days = [
    { day: 2, name: 'Thứ Hai', shortName: 'T2' },
    { day: 3, name: 'Thứ Ba', shortName: 'T3' },
    { day: 4, name: 'Thứ Tư', shortName: 'T4' },
    { day: 5, name: 'Thứ Năm', shortName: 'T5' },
    { day: 6, name: 'Thứ Sáu', shortName: 'T6' },
    { day: 7, name: 'Thứ Bảy', shortName: 'T7' }
  ];

  const currentClass = classes.find(c => c.id === activeClassId) || classes[0];
  const currentClassName = currentClass?.name || 'Lớp 6A1';

  // Filter schedule for this class
  const classSchedule = schedule.filter(s => s.classId === activeClassId);

  const handleOpenAdd = (day: number) => {
    setModalMode('add');
    setEditingItem({
      dayOfWeek: day,
      period: 1,
      shift: selectedShiftFilter === 'afternoon' ? 'afternoon' : 'morning',
      subject: '',
      teacherName: currentClass?.teacherName || 'Cô Nguyễn Thị Lan',
      room: currentClass?.room || 'Phòng 204 - Nhà A'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ScheduleItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner indicating Classic View with option to upgrade */}
      <div className="p-4 bg-slate-100/90 border border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Giao diện Thời khóa biểu truyền thống (Cũ)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                Chế độ thẻ ngày
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hiển thị danh sách các tiết học theo từng thẻ ngày trong tuần.
            </p>
          </div>
        </div>

        {onSwitchToInteractive && (
          <button
            type="button"
            onClick={onSwitchToInteractive}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Mở Lưới tương tác trực tiếp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Control bar: Class dropdown, Shift filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Chọn lớp:</span>
            <select
              value={activeClassId}
              onChange={e => {
                setActiveClassId(e.target.value);
                setSelectedClassId(e.target.value);
              }}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Shift filter tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setSelectedShiftFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedShiftFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ca
            </button>
            <button
              type="button"
              onClick={() => setSelectedShiftFilter('morning')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                selectedShiftFilter === 'morning'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>☀️ Ca sáng</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedShiftFilter('afternoon')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                selectedShiftFilter === 'afternoon'
                  ? 'bg-white text-orange-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🌇 Ca chiều</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleOpenAdd(2)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm tiết học</span>
          </button>
        </div>
      </div>

      {/* Grid of Day Cards (Bố cục giao diện cũ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(d => {
          let items = classSchedule
            .filter(s => s.dayOfWeek === d.day);

          if (selectedShiftFilter === 'morning') {
            items = items.filter(s => (s.shift || 'morning') === 'morning');
          } else if (selectedShiftFilter === 'afternoon') {
            items = items.filter(s => s.shift === 'afternoon');
          }

          items.sort((a, b) => {
            const sA = (a.shift || 'morning') === 'morning' ? 0 : 1;
            const sB = (b.shift || 'morning') === 'morning' ? 0 : 1;
            if (sA !== sB) return sA - sB;
            return a.period - b.period;
          });

          const isToday = d.day === 2; // Monday demo

          return (
            <div
              key={d.day}
              className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3 transition-all ${
                isToday ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200'
              }`}
            >
              {/* Day Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {items.length} tiết
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isToday && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mr-1">
                      Hôm nay
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenAdd(d.day)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title={`Thêm tiết vào ${d.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lesson Items */}
              {items.length > 0 ? (
                <div className="space-y-2.5">
                  {items.map(it => {
                    const canEdit = canUserEditClass(user, it);
                    const isAfternoon = it.shift === 'afternoon';
                    return (
                      <div
                        key={it.id}
                        onClick={() => handleOpenEdit(it)}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-xs space-y-1.5 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span>Tiết {it.period}</span>
                            <span className="text-[11px] font-medium text-slate-400">({it.time})</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                isAfternoon
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {isAfternoon ? 'Chiều' : 'Sáng'}
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-600 font-semibold">{it.className}</span>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingClass({ id: it.classId, name: it.className });
                                }}
                                className="p-1 -my-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer group/pencil shrink-0"
                                title="Chỉnh sửa tên lớp"
                                aria-label={`Chỉnh sửa tên lớp ${it.className}`}
                              >
                                <Pencil className="w-3 h-3 group-hover/pencil:scale-110 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-slate-800 font-bold flex items-center justify-between">
                          <span>{it.subject}</span>
                          <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                            Bấm để sửa →
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/50">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{it.room}</span>
                          </span>
                          <span className="truncate text-slate-600 font-medium">{it.teacherName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <BookOpen className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                  <span>Chưa có tiết dạy trong {d.name}.</span>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAdd(d.day)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      + Thêm tiết ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Class Name Modal */}
      {editingClass && (
        <EditClassNameModal
          isOpen={!!editingClass}
          onClose={() => setEditingClass(null)}
          classId={editingClass.id}
          currentName={editingClass.name}
        />
      )}

      {/* Schedule Item Modal */}
      {isModalOpen && (
        <ScheduleItemModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(undefined);
          }}
          mode={modalMode}
          initialItem={editingItem}
          currentClassId={activeClassId}
          currentClassName={currentClassName}
          onSave={(data, id) => {
            if (modalMode === 'add') {
              addScheduleItem({
                ...data,
                classId: activeClassId,
                className: currentClassName
              });
            } else if (id) {
              updateScheduleItem(id, data);
            }
            setIsModalOpen(false);
          }}
          onDelete={(id) => {
            deleteScheduleItem(id);
            setIsModalOpen(false);
          }}
          availablePeriods={periodConfigs}
        />
      )}
    </div>
  );
};
