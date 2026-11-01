import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  User as UserIcon, 
  Calendar, 
  BookOpen, 
  Users, 
  Clock, 
  GripVertical,
  CheckCircle2, 
  Info,
  Pencil,
  FileText,
  Sun,
  Sunset,
  Trash2,
  AlertTriangle,
  X,
  Layers,
  ChevronDown,
  Save,
  RotateCcw,
  Check,
  Undo2,
  Redo2
} from 'lucide-react';
import { ScheduleItem, PeriodConfig } from '../../types';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { ScheduleItemModal } from './ScheduleItemModal';
import { SwapConflictModal } from './SwapConflictModal';

export interface HistoryAction {
  type: 'DELETE_ROW' | 'DELETE_COLUMN' | 'DELETE_CELL';
  description: string;
  data: {
    shift?: 'morning' | 'afternoon';
    periodConfig?: PeriodConfig;
    deletedItems?: ScheduleItem[];
    day?: number;
    dayConfig?: { day: number; name: string; shortName: string };
    item?: ScheduleItem;
  };
}

interface InteractiveTimetableProps {
  initialClassId?: string;
  hideClassSelector?: boolean;
  onSwitchToClassic?: () => void;
}

export const ALL_DAYS = [
  { day: 2, name: 'Thứ Hai', shortName: 'T2' },
  { day: 3, name: 'Thứ Ba', shortName: 'T3' },
  { day: 4, name: 'Thứ Tư', shortName: 'T4' },
  { day: 5, name: 'Thứ Năm', shortName: 'T5' },
  { day: 6, name: 'Thứ Sáu', shortName: 'T6' },
  { day: 7, name: 'Thứ Bảy', shortName: 'T7' }
];

const MORNING_PERIODS = [
  { period: 1, time: '07:15 - 08:00', label: 'Tiết 1' },
  { period: 2, time: '08:05 - 08:50', label: 'Tiết 2' },
  { period: 3, time: '09:10 - 09:55', label: 'Tiết 3' },
  { period: 4, time: '10:05 - 10:50', label: 'Tiết 4' },
  { period: 5, time: '10:55 - 11:40', label: 'Tiết 5' }
];

const AFTERNOON_PERIODS = [
  { period: 1, time: '13:00 - 13:45', label: 'Tiết 1 (Chiều)' },
  { period: 2, time: '13:50 - 14:35', label: 'Tiết 2 (Chiều)' },
  { period: 3, time: '14:50 - 15:35', label: 'Tiết 3 (Chiều)' },
  { period: 4, time: '15:40 - 16:25', label: 'Tiết 4 (Chiều)' },
  { period: 5, time: '16:30 - 17:15', label: 'Tiết 5 (Chiều)' }
];

// Helper to determine gentle pastel styling per subject
export const getSubjectPastel = (subject: string) => {
  const s = (subject || '').toLowerCase();

  if (s.includes('toán')) {
    return {
      card: 'bg-blue-50/95 hover:bg-blue-100/90 border-blue-200/90 text-blue-950',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      accent: 'border-l-blue-500',
      tag: 'Toán'
    };
  }
  if (s.includes('văn')) {
    return {
      card: 'bg-amber-50/95 hover:bg-amber-100/90 border-amber-200/90 text-amber-950',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      accent: 'border-l-amber-500',
      tag: 'Ngữ văn'
    };
  }
  if (s.includes('anh') || s.includes('english')) {
    return {
      card: 'bg-purple-50/95 hover:bg-purple-100/90 border-purple-200/90 text-purple-950',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      accent: 'border-l-purple-500',
      tag: 'Tiếng Anh'
    };
  }
  if (s.includes('khtn') || s.includes('vật lý') || s.includes('lý')) {
    return {
      card: 'bg-sky-50/95 hover:bg-sky-100/90 border-sky-200/90 text-sky-950',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      accent: 'border-l-sky-500',
      tag: 'KHTN'
    };
  }
  if (s.includes('hóa') || s.includes('sinh')) {
    return {
      card: 'bg-emerald-50/95 hover:bg-emerald-100/90 border-emerald-200/90 text-emerald-950',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accent: 'border-l-emerald-500',
      tag: 'Sinh/Hóa'
    };
  }
  if (s.includes('tin') || s.includes('scratch') || s.includes('stem') || s.includes('robot')) {
    return {
      card: 'bg-indigo-50/95 hover:bg-indigo-100/90 border-indigo-200/90 text-indigo-950',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      accent: 'border-l-indigo-500',
      tag: 'Tin học'
    };
  }
  if (s.includes('sử') || s.includes('địa')) {
    return {
      card: 'bg-yellow-50/95 hover:bg-yellow-100/90 border-yellow-200/90 text-yellow-950',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accent: 'border-l-yellow-500',
      tag: 'Lịch sử & Địa lý'
    };
  }
  if (s.includes('thể dục') || s.includes('thể chất') || s.includes('bóng') || s.includes('cầu lông')) {
    return {
      card: 'bg-rose-50/95 hover:bg-rose-100/90 border-rose-200/90 text-rose-950',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      accent: 'border-l-rose-500',
      tag: 'Thể dục'
    };
  }
  if (s.includes('nhạc') || s.includes('mỹ thuật') || s.includes('thuật') || s.includes('vẽ')) {
    return {
      card: 'bg-fuchsia-50/95 hover:bg-fuchsia-100/90 border-fuchsia-200/90 text-fuchsia-950',
      badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      accent: 'border-l-fuchsia-500',
      tag: 'Nghệ thuật'
    };
  }
  if (s.includes('gdcd') || s.includes('trải nghiệm') || s.includes('công nghệ') || s.includes('kỹ năng') || s.includes('đội')) {
    return {
      card: 'bg-teal-50/95 hover:bg-teal-100/90 border-teal-200/90 text-teal-950',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      accent: 'border-l-teal-500',
      tag: 'GDCD'
    };
  }
  if (s.includes('chào cờ') || s.includes('sinh hoạt') || s.includes('shcn') || s.includes('shdc')) {
    return {
      card: 'bg-slate-100/95 hover:bg-slate-200/90 border-slate-300/90 text-slate-900',
      badge: 'bg-slate-200 text-slate-800 border-slate-300',
      accent: 'border-l-slate-500',
      tag: 'Sinh hoạt'
    };
  }

  return {
    card: 'bg-blue-50/95 hover:bg-blue-100/90 border-blue-200/90 text-blue-950',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    accent: 'border-l-blue-400',
    tag: subject
  };
};

export const InteractiveTimetable: React.FC<InteractiveTimetableProps> = ({
  initialClassId,
  hideClassSelector = false,
  onSwitchToClassic
}) => {
  const { 
    classes, 
    selectedClassId, 
    setSelectedClassId, 
    schedule, 
    periodConfigs,
    activeDays,
    removeDayColumn,
    restoreDayColumn,
    restorePeriodConfig,
    addScheduleItem, 
    updateScheduleItem, 
    deleteScheduleItem, 
    swapScheduleItems, 
    moveScheduleItem,
    addPeriodToShift,
    removePeriodFromShift,
    saveAllSchedule,
    refreshData
  } = useClass();
  const { showToast, success, warning, error } = useToast();

  const [activeClassId, setActiveClassId] = useState<string>(initialClassId || selectedClassId || classes[0]?.id || 'c_6a1');
  
  // Edit mode & Unsaved Changes Tracking
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showUnsavedPromptModal, setShowUnsavedPromptModal] = useState<boolean>(false);
  
  // Morning / Afternoon Shift Selector State: 'morning' | 'afternoon'
  const [activeShift, setActiveShift] = useState<'morning' | 'afternoon'>('morning');

  // Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ScheduleItem> | undefined>(undefined);

  // Quick Add Period modal / popover state
  const [showAddPeriodModal, setShowAddPeriodModal] = useState<boolean>(false);
  const [customPeriodNumber, setCustomPeriodNumber] = useState<string>('');
  const [customPeriodTime, setCustomPeriodTime] = useState<string>('');

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ day: number; period: number } | null>(null);

  // Swap modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapSource, setSwapSource] = useState<ScheduleItem | null>(null);
  const [swapTarget, setSwapTarget] = useState<ScheduleItem | null>(null);

  const currentClass = classes.find(c => c.id === activeClassId) || classes[0];
  const currentClassTitle = currentClass ? currentClass.name : 'Lớp 6A1';

  // Visible days of the timetable (hỗ trợ xóa cột dọc)
  const visibleDays = useMemo(() => {
    const currentActive = activeDays && activeDays.length > 0 ? activeDays : [2, 3, 4, 5, 6];
    return ALL_DAYS.filter(d => currentActive.includes(d.day));
  }, [activeDays]);

  // Filter schedule for the selected class
  const allClassSchedule = useMemo(() => {
    return schedule.filter(s => s.classId === activeClassId);
  }, [schedule, activeClassId]);

  const morningItems = useMemo(() => {
    return allClassSchedule.filter(s => (s.shift || 'morning') === 'morning');
  }, [allClassSchedule]);

  const afternoonItems = useMemo(() => {
    return allClassSchedule.filter(s => s.shift === 'afternoon');
  }, [allClassSchedule]);

  // Current shift schedule displayed on the grid
  const currentShiftSchedule = useMemo(() => {
    return activeShift === 'morning' ? morningItems : afternoonItems;
  }, [activeShift, morningItems, afternoonItems]);

  // Dynamic Periods based on activeShift and stored configurations (hỗ trợ xóa hàng ngang)
  const currentPeriods = useMemo(() => {
    const shiftConfigs = (periodConfigs || []).filter(c => c.shift === activeShift);
    const sorted = [...shiftConfigs].sort((a, b) => a.period - b.period);

    // Also include any period that currently has a schedule item in this shift
    const existing = new Set(sorted.map(c => c.period));
    currentShiftSchedule.forEach(item => {
      if (!existing.has(item.period)) {
        sorted.push({
          period: item.period,
          time: item.time || StorageService.calculateDefaultPeriodTime(activeShift, item.period),
          label: activeShift === 'morning' ? `Tiết ${item.period}` : `Tiết ${item.period} (Chiều)`,
          shift: activeShift
        });
        existing.add(item.period);
      }
    });
    sorted.sort((a, b) => a.period - b.period);
    return sorted;
  }, [periodConfigs, activeShift, currentShiftSchedule]);

  // Statistics calculation for the active shift
  const stats = useMemo(() => {
    const totalPeriods = currentShiftSchedule.length;
    const uniqueSubjects = new Set(currentShiftSchedule.map(s => s.subject.trim())).size;
    const uniqueTeachers = new Set(
      currentShiftSchedule
        .map(s => s.teacherName.trim())
        .filter(Boolean)
    ).size;

    return {
      totalPeriods,
      uniqueSubjects,
      uniqueTeachers,
      morningCount: morningItems.length,
      afternoonCount: afternoonItems.length,
      allTotal: allClassSchedule.length
    };
  }, [currentShiftSchedule, morningItems.length, afternoonItems.length, allClassSchedule.length]);

  // Find item for specific day and period in current active shift
  const getItemForSlot = (day: number, period: number) => {
    return currentShiftSchedule.find(s => s.dayOfWeek === day && s.period === period);
  };

  // Delete mode state (Chế độ xóa trực tiếp: nhấp ô xóa ô, nhấp tiêu đề hàng xóa hàng, nhấp tiêu đề cột xóa cột)
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [hoveredDeleteTarget, setHoveredDeleteTarget] = useState<{
    type: 'row' | 'col' | 'cell';
    id?: string;
    day?: number;
    period?: number;
  } | null>(null);

  // Undo / Redo history stacks (Hoàn tác và làm lại)
  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);

  // Toggle delete mode
  const handleToggleDeleteMode = () => {
    setIsDeleteMode(prev => {
      const next = !prev;
      if (!next) {
        setHoveredDeleteTarget(null);
      }
      return next;
    });
  };

  const handleExitDeleteMode = () => {
    setIsDeleteMode(false);
    setHoveredDeleteTarget(null);
  };

  // 1. XÓA HÀNG NGANG (Thực hiện ngay, không hộp thoại)
  const handleDeleteRow = (periodNumber: number) => {
    if (!isDeleteMode) return;

    const targetConfig = currentPeriods.find(p => p.period === periodNumber);
    if (!targetConfig) return;

    if (currentPeriods.length <= 1) {
      warning('Không thể xóa hàng cuối cùng. Thời khóa biểu cần giữ lại ít nhất 1 tiết.');
      return;
    }

    // Lấy toàn bộ môn học thuộc hàng đó của lớp và buổi hiện tại
    const deletedItems = schedule.filter(
      s => s.classId === activeClassId && (s.shift || 'morning') === activeShift && s.period === periodNumber
    );

    // Cập nhật lại cấu trúc bảng: xóa hàng khỏi cấu hình tiết
    removePeriodFromShift(activeShift, periodNumber);

    // Xóa các tiết học thuộc hàng đó
    const updatedSchedule = schedule.filter(
      s => !(s.classId === activeClassId && (s.shift || 'morning') === activeShift && s.period === periodNumber)
    );
    saveAllSchedule(updatedSchedule);

    // Ghi nhận vào lịch sử để Hoàn tác / Làm lại
    const action: HistoryAction = {
      type: 'DELETE_ROW',
      description: `Xóa hàng ${targetConfig.label}`,
      data: {
        shift: activeShift,
        periodConfig: targetConfig,
        deletedItems
      }
    };
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
    setHasUnsavedChanges(true);

    success(`Đã xóa toàn bộ hàng "${targetConfig.label}" (${deletedItems.length} môn học)`);
  };

  // 2. XÓA CỘT DỌC (Thực hiện ngay, không hộp thoại)
  const handleDeleteColumn = (dayNumber: number) => {
    if (!isDeleteMode) return;

    const dayConfig = ALL_DAYS.find(d => d.day === dayNumber);
    if (!dayConfig) return;

    if (visibleDays.length <= 1) {
      warning('Không thể xóa cột cuối cùng. Thời khóa biểu cần giữ lại ít nhất 1 ngày.');
      return;
    }

    // Lấy toàn bộ môn học thuộc cột đó của lớp hiện tại
    const deletedItems = schedule.filter(
      s => s.classId === activeClassId && s.dayOfWeek === dayNumber
    );

    // Cập nhật lại cấu trúc bảng: xóa ngày khỏi danh sách cột hoạt động
    removeDayColumn(dayNumber);

    // Xóa các tiết học thuộc cột đó
    const updatedSchedule = schedule.filter(
      s => !(s.classId === activeClassId && s.dayOfWeek === dayNumber)
    );
    saveAllSchedule(updatedSchedule);

    // Ghi nhận vào lịch sử để Hoàn tác / Làm lại
    const action: HistoryAction = {
      type: 'DELETE_COLUMN',
      description: `Xóa cột ${dayConfig.name}`,
      data: {
        day: dayNumber,
        dayConfig,
        deletedItems
      }
    };
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
    setHasUnsavedChanges(true);

    success(`Đã xóa toàn bộ cột "${dayConfig.name}" (${deletedItems.length} môn học)`);
  };

  // 3. XÓA MỘT Ô ĐƠN LẺ (Thực hiện ngay, không hộp thoại)
  const handleDeleteSingleCell = (item: ScheduleItem) => {
    if (!isDeleteMode) return;

    deleteScheduleItem(item.id);

    const action: HistoryAction = {
      type: 'DELETE_CELL',
      description: `Xóa môn ${item.subject}`,
      data: {
        item
      }
    };
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
    setHasUnsavedChanges(true);

    success(`Đã xóa môn "${item.subject}" (Tiết ${item.period}, Thứ ${item.dayOfWeek})`);
  };

  // 4. HOÀN TÁC (UNDO)
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);

    if (action.type === 'DELETE_ROW' && action.data.periodConfig && action.data.shift) {
      restorePeriodConfig(action.data.periodConfig);
      if (action.data.deletedItems && action.data.deletedItems.length > 0) {
        const currentSched = StorageService.getSchedule();
        const existingIds = new Set(currentSched.map(s => s.id));
        const itemsToRestore = action.data.deletedItems.filter(i => !existingIds.has(i.id));
        saveAllSchedule([...currentSched, ...itemsToRestore]);
      }
      success(`Đã hoàn tác: Khôi phục hàng ${action.data.periodConfig.label} và ${action.data.deletedItems?.length || 0} môn học`);
    } else if (action.type === 'DELETE_COLUMN' && action.data.day !== undefined && action.data.dayConfig) {
      restoreDayColumn(action.data.day);
      if (action.data.deletedItems && action.data.deletedItems.length > 0) {
        const currentSched = StorageService.getSchedule();
        const existingIds = new Set(currentSched.map(s => s.id));
        const itemsToRestore = action.data.deletedItems.filter(i => !existingIds.has(i.id));
        saveAllSchedule([...currentSched, ...itemsToRestore]);
      }
      success(`Đã hoàn tác: Khôi phục cột ${action.data.dayConfig.name} và ${action.data.deletedItems?.length || 0} môn học`);
    } else if (action.type === 'DELETE_CELL' && action.data.item) {
      const currentSched = StorageService.getSchedule();
      if (!currentSched.some(s => s.id === action.data.item!.id)) {
        saveAllSchedule([...currentSched, action.data.item]);
      }
      success(`Đã hoàn tác: Khôi phục môn "${action.data.item.subject}"`);
    }
  };

  // 5. LÀM LẠI (REDO)
  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);

    if (action.type === 'DELETE_ROW' && action.data.periodConfig && action.data.shift) {
      removePeriodFromShift(action.data.shift, action.data.periodConfig.period);
      const currentSched = StorageService.getSchedule();
      const idsToDelete = new Set((action.data.deletedItems || []).map(i => i.id));
      saveAllSchedule(currentSched.filter(s => !idsToDelete.has(s.id)));
      success(`Đã làm lại: Xóa lại hàng ${action.data.periodConfig.label}`);
    } else if (action.type === 'DELETE_COLUMN' && action.data.day !== undefined && action.data.dayConfig) {
      removeDayColumn(action.data.day);
      const currentSched = StorageService.getSchedule();
      const idsToDelete = new Set((action.data.deletedItems || []).map(i => i.id));
      saveAllSchedule(currentSched.filter(s => !idsToDelete.has(s.id)));
      success(`Đã làm lại: Xóa lại cột ${action.data.dayConfig.name}`);
    } else if (action.type === 'DELETE_CELL' && action.data.item) {
      deleteScheduleItem(action.data.item.id);
      success(`Đã làm lại: Xóa môn "${action.data.item.subject}"`);
    }
  };

  // Lắng nghe phím tắt Ctrl+Z (Undo) và Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  // Thêm hàng tiết tiếp theo tự động (ví dụ tiết 6, 7, 8...)
  const handleAddNextPeriod = () => {
    try {
      const shiftConfigs = (periodConfigs || []).filter(c => c.shift === activeShift);
      const schedulePeriods = currentShiftSchedule.map(s => s.period);
      const maxExisting = Math.max(
        5,
        ...shiftConfigs.map(c => c.period),
        ...schedulePeriods
      );
      const nextPeriod = maxExisting + 1;
      const created = addPeriodToShift(activeShift, nextPeriod);
      success(`Đã thêm ${created.label} (${created.time}) vào thời khóa biểu ${activeShift === 'morning' ? 'buổi sáng' : 'buổi chiều'}.`);
    } catch (err) {
      console.error(err);
      error('Không thể thêm tiết học mới');
    }
  };

  // Thêm tiết cụ thể từ hộp thoại (nếu giáo viên nhập số tiết hoặc thời gian tùy chỉnh)
  const handleAddCustomPeriodSubmit = () => {
    try {
      const pNum = customPeriodNumber ? parseInt(customPeriodNumber.trim(), 10) : undefined;
      if (pNum && (isNaN(pNum) || pNum <= 0)) {
        error('Số tiết học phải là một số nguyên dương.');
        return;
      }

      // Check if period already exists in this shift
      if (pNum && currentPeriods.some(p => p.period === pNum)) {
        warning(`Tiết ${pNum} đã có trong lịch ${activeShift === 'morning' ? 'sáng' : 'chiều'}.`);
        setShowAddPeriodModal(false);
        return;
      }

      const created = addPeriodToShift(activeShift, pNum, customPeriodTime.trim() || undefined);
      success(`Đã thêm ${created.label} (${created.time}) thành công!`);
      setShowAddPeriodModal(false);
      setCustomPeriodNumber('');
      setCustomPeriodTime('');
    } catch (err) {
      console.error(err);
      error('Lỗi khi thêm tiết học');
    }
  };

  // Open modal to add a lesson to empty slot (hoặc bỏ qua nếu đang ở delete mode)
  const handleSlotClick = (day: number, period: number) => {
    const existing = getItemForSlot(day, period);
    if (isDeleteMode) {
      // Trong chế độ xóa: bấm vào ô đã có tiết để xóa ô đó ngay lập tức (không hiển thị popup)
      if (existing) {
        handleDeleteSingleCell(existing);
      }
      return;
    }

    if (existing) {
      setModalMode('edit');
      setEditingItem(existing);
      setIsModalOpen(true);
    } else {
      setModalMode('add');
      setEditingItem({
        dayOfWeek: day,
        period: period,
        shift: activeShift,
        subject: '',
        teacherName: currentClass?.teacherName || 'Cô Nguyễn Thị Lan',
        room: currentClass?.room || 'Phòng 204 - Nhà A'
      });
      setIsModalOpen(true);
    }
  };

  // Lưu toàn bộ thời khóa biểu vào hệ thống dữ liệu hiện có
  const handleSaveAllSchedule = async () => {
    try {
      setIsSaving(true);
      // Ensure current schedule is explicitly stored
      const current = StorageService.getSchedule();
      const ok = saveAllSchedule(current);
      if (ok) {
        setHasUnsavedChanges(false);
        success('Đã lưu toàn bộ thay đổi của thời khóa biểu vào hệ thống thành công!');
      } else {
        error('Lưu thời khóa biểu thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      error('Lỗi khi lưu dữ liệu thời khóa biểu');
    } finally {
      setIsSaving(false);
    }
  };

  // Yêu cầu quay lại giao diện cũ (hiển thị cảnh báo nếu có thay đổi chưa lưu)
  const handleRequestReturnToClassic = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedPromptModal(true);
    } else if (onSwitchToClassic) {
      onSwitchToClassic();
    }
  };

  // Lựa chọn: Lưu và quay lại
  const handleConfirmSaveAndReturn = () => {
    handleSaveAllSchedule();
    setShowUnsavedPromptModal(false);
    if (onSwitchToClassic) {
      onSwitchToClassic();
    }
  };

  // Lựa chọn: Bỏ thay đổi và quay lại
  const handleDiscardAndReturn = () => {
    // Revert local changes by reloading from storage
    refreshData();
    setHasUnsavedChanges(false);
    setShowUnsavedPromptModal(false);
    if (onSwitchToClassic) {
      onSwitchToClassic();
    }
  };

  // Save or update schedule item
  const handleSaveItem = (itemData: Omit<ScheduleItem, 'id'>, id?: string) => {
    try {
      const targetShift = itemData.shift || activeShift;
      if (modalMode === 'add') {
        addScheduleItem({
          ...itemData,
          shift: targetShift,
          classId: activeClassId,
          className: currentClassTitle
        });
        const shiftLabel = targetShift === 'morning' ? 'sáng' : 'chiều';
        success(`Đã thêm tiết ${itemData.period} (${shiftLabel}) môn "${itemData.subject}" vào Thứ ${itemData.dayOfWeek}`);
      } else if (modalMode === 'edit' && id) {
        updateScheduleItem(id, itemData);
        success(`Đã cập nhật tiết học "${itemData.subject}"`);
      }
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error(err);
      error('Có lỗi xảy ra khi lưu tiết học');
    }
  };

  // Delete schedule item
  const handleDeleteItem = (id: string) => {
    try {
      const target = allClassSchedule.find(s => s.id === id);
      deleteScheduleItem(id);
      setHasUnsavedChanges(true);
      success(`Đã xóa tiết học ${target ? `"${target.subject}"` : ''} khỏi thời khóa biểu`);
    } catch (err) {
      console.error(err);
      error('Có lỗi xảy ra khi xóa tiết học');
    }
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, item: ScheduleItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverCell(null);
  };

  const handleDragOver = (e: React.DragEvent, day: number, period: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverCell || dragOverCell.day !== day || dragOverCell.period !== period) {
      setDragOverCell({ day, period });
    }
  };

  const handleDragLeave = (e: React.DragEvent, day: number, period: number) => {
    if (dragOverCell?.day === day && dragOverCell?.period === period) {
      setDragOverCell(null);
    }
  };

  const handleDrop = (e: React.DragEvent, day: number, period: number) => {
    e.preventDefault();
    setDragOverCell(null);

    if (!draggedItem) return;

    // Dropped onto the same slot with same shift -> no action needed
    if (
      draggedItem.dayOfWeek === day && 
      draggedItem.period === period && 
      (draggedItem.shift || 'morning') === activeShift
    ) {
      return;
    }

    const targetItem = getItemForSlot(day, period);

    if (targetItem) {
      // Slot already occupied: prompt user to swap!
      setSwapSource(draggedItem);
      setSwapTarget(targetItem);
      setSwapModalOpen(true);
    } else {
      // Check conflict with other classes/teachers in same school & same shift
      const conflictCheck = StorageService.checkScheduleConflict({
        id: draggedItem.id,
        classId: draggedItem.classId,
        dayOfWeek: day,
        period: period,
        shift: activeShift,
        teacherName: draggedItem.teacherName,
        room: draggedItem.room
      });

      if (conflictCheck.hasConflict) {
        const warningMsg = conflictCheck.conflicts.map(c => c.message).join('; ');
        warning(`Cảnh báo trùng lịch: ${warningMsg}`);
      }

      // Move into empty slot with activeShift
      moveScheduleItem(draggedItem.id, day, period, activeShift);
      setHasUnsavedChanges(true);
      const shiftLabel = activeShift === 'morning' ? 'Sáng' : 'Chiều';
      success(`Đã chuyển môn "${draggedItem.subject}" sang Thứ ${day}, Tiết ${period} (${shiftLabel})`);
    }
  };

  const handleConfirmSwap = () => {
    if (swapSource && swapTarget) {
      swapScheduleItems(swapSource.id, swapTarget.id);
      setHasUnsavedChanges(true);
      success(`Đã hoán đổi lịch học giữa "${swapSource.subject}" và "${swapTarget.subject}"`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Thời khóa biểu tương tác trực tiếp
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>
                Nhấp trực tiếp vào bất kỳ môn học nào để chỉnh sửa hoặc xóa nhanh; nhấp vào ô trống (+) để gắn môn học mới.
              </span>
            </p>
          </div>

          {/* Action buttons: Quay lại giao diện cũ, Chế độ chỉnh sửa, Nút Lưu, Thùng rác, Thêm tiết */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            {/* Nút Quay lại giao diện cũ */}
            {onSwitchToClassic && (
              <button
                type="button"
                onClick={handleRequestReturnToClassic}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Quay lại giao diện thời khóa biểu thẻ ngày trước đây"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Quay lại giao diện cũ</span>
              </button>
            )}

            {!hideClassSelector && classes.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Lớp:</span>
                <select
                  value={activeClassId}
                  onChange={e => {
                    setActiveClassId(e.target.value);
                    setSelectedClassId(e.target.value);
                  }}
                  className="bg-transparent border-0 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nút Bật/Tắt Chế độ chỉnh sửa */}
            <button
              type="button"
              onClick={() => {
                const next = !isEditMode;
                setIsEditMode(next);
                if (!next) {
                  // If exiting edit mode without saving, keep flag
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isEditMode
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 ring-2 ring-amber-300/60'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Bật/Tắt chế độ chỉnh sửa thời khóa biểu"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEditMode ? 'Đang Chỉnh sửa' : 'Chỉnh sửa'}</span>
            </button>

            {/* Nút Lưu (Khi bật chế độ chỉnh sửa hoặc khi có thay đổi chưa lưu) */}
            {(isEditMode || hasUnsavedChanges) && (
              <button
                type="button"
                onClick={handleSaveAllSchedule}
                disabled={isSaving}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  hasUnsavedChanges
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400 ring-offset-1 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Lưu toàn bộ thay đổi của thời khóa biểu vào hệ thống"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu'}</span>
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                )}
              </button>
            )}

            {/* Nút Hoàn tác (Undo) */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                undoStack.length > 0
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
              }`}
              title={
                undoStack.length > 0
                  ? `Hoàn tác (Ctrl+Z): ${undoStack[undoStack.length - 1].description}`
                  : 'Không có thao tác để hoàn tác'
              }
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hoàn tác</span>
              {undoStack.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-black">
                  {undoStack.length}
                </span>
              )}
            </button>

            {/* Nút Làm lại (Redo) */}
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                redoStack.length > 0
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
              }`}
              title={
                redoStack.length > 0
                  ? `Làm lại (Ctrl+Y): ${redoStack[redoStack.length - 1].description}`
                  : 'Không có thao tác để làm lại'
              }
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm lại</span>
              {redoStack.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700 font-black">
                  {redoStack.length}
                </span>
              )}
            </button>

            {/* Nút Thùng rác (Bật/Tắt Chế độ xóa trực tiếp) */}
            <button
              type="button"
              onClick={handleToggleDeleteMode}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isDeleteMode
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400 ring-offset-1 animate-pulse'
                  : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200 hover:border-rose-200'
              }`}
              title={
                isDeleteMode
                  ? 'Đang bật chế độ xóa. Nhấp lại để tắt.'
                  : 'Bật chế độ xóa: xóa ô, xóa hàng ngang, xóa cột dọc'
              }
            >
              <Trash2 className={`w-4 h-4 ${isDeleteMode ? 'text-white' : 'text-slate-500'}`} />
              <span>{isDeleteMode ? 'Đang bật Xóa' : 'Xóa'}</span>
            </button>

            {/* Nút Thêm tiết (Hàng tiết mới: Tiết 6, Tiết 7, Tiết 8...) */}
            <div className="inline-flex rounded-xl shadow-xs">
              <button
                type="button"
                onClick={handleAddNextPeriod}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-l-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={`Bấm để thêm một hàng tiết mới (Tiết ${currentPeriods.length + 1}) vào ca ${activeShift === 'morning' ? 'sáng' : 'chiều'}`}
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm tiết</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomPeriodNumber((currentPeriods.length + 1).toString());
                  setCustomPeriodTime(StorageService.calculateDefaultPeriodTime(activeShift, currentPeriods.length + 1));
                  setShowAddPeriodModal(true);
                }}
                className="px-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-emerald-100 rounded-r-xl border-l border-emerald-600 text-xs flex items-center justify-center transition-colors cursor-pointer"
                title="Tùy chọn số tiết hoặc khung giờ thêm"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Nút Thêm tiết học */}
            <button
              type="button"
              onClick={() => {
                if (isDeleteMode) setIsDeleteMode(false);
                setModalMode('add');
                setEditingItem({
                  dayOfWeek: 2,
                  period: 1,
                  shift: activeShift,
                  subject: '',
                  teacherName: currentClass?.teacherName || 'Cô Nguyễn Thị Lan',
                  room: currentClass?.room || 'Phòng 204 - Nhà A'
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Gán môn học</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards for Active Shift */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Card 1: Tổng số tiết */}
          <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-xl border border-blue-100/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Tổng số tiết</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/80 px-1.5 py-0.2 rounded">
                  {activeShift === 'morning' ? 'Ca sáng' : 'Ca chiều'}
                </span>
              </div>
              <div className="text-2xl font-black text-blue-950 mt-0.5">
                {stats.totalPeriods} <span className="text-xs font-medium text-slate-500">tiết / tuần</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Cả 2 ca: {stats.allTotal} tiết (Sáng {stats.morningCount} · Chiều {stats.afternoonCount})
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Số môn */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-xl border border-emerald-100/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Số môn học</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  {activeShift === 'morning' ? 'Ca sáng' : 'Ca chiều'}
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-0.5">
                {stats.uniqueSubjects} <span className="text-xs font-medium text-slate-500">môn</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Được phân bổ trong tuần
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Số giáo viên */}
          <div className="p-3.5 bg-gradient-to-br from-purple-50 to-pink-50/40 rounded-xl border border-purple-100/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Số giáo viên</span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-1.5 py-0.2 rounded">
                  {activeShift === 'morning' ? 'Ca sáng' : 'Ca chiều'}
                </span>
              </div>
              <div className="text-2xl font-black text-purple-950 mt-0.5">
                {stats.uniqueTeachers} <span className="text-xs font-medium text-slate-500">giáo viên</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Tham gia giảng dạy ca này
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SHIFT TOGGLE SWITCH BAR (LỊCH BUỔI SÁNG & LỊCH BUỔI CHIỀU) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Toggle buttons */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-2xs">
            {/* Nút 1: Lịch buổi sáng */}
            <button
              type="button"
              onClick={() => setActiveShift('morning')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeShift === 'morning'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200/80 ring-1 ring-blue-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="text-base leading-none">☀️</span>
              <span>Lịch buổi sáng</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeShift === 'morning' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {stats.morningCount} tiết
              </span>
            </button>

            {/* Nút 2: Lịch buổi chiều */}
            <button
              type="button"
              onClick={() => setActiveShift('afternoon')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeShift === 'afternoon'
                  ? 'bg-white text-orange-700 shadow-xs border border-orange-200/80 ring-1 ring-orange-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="text-base leading-none">🌇</span>
              <span>Lịch buổi chiều</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeShift === 'afternoon' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {stats.afternoonCount} tiết
              </span>
            </button>
          </div>
        </div>

        {/* Shift Period Summary Information & Quick + Thêm tiết button */}
        <div className="flex items-center gap-3 text-xs text-slate-500 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              <strong className="text-slate-700">
                {activeShift === 'morning' ? 'Khung giờ sáng:' : 'Khung giờ chiều:'}
              </strong>{' '}
              {currentPeriods[0]?.time.split(' - ')[0] || (activeShift === 'morning' ? '07:15' : '13:00')} -{' '}
              {currentPeriods[currentPeriods.length - 1]?.time.split(' - ')[1] || (activeShift === 'morning' ? '11:40' : '17:15')}{' '}
              <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {currentPeriods.length} tiết
              </span>
            </span>
          </div>

          <span className="hidden md:inline text-slate-300">·</span>
          <span className="hidden md:inline font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {currentClassTitle}
          </span>

          <button
            type="button"
            onClick={handleAddNextPeriod}
            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            title={`Bấm để thêm Tiết ${currentPeriods.length + 1}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tiết {currentPeriods.length + 1}</span>
          </button>
        </div>
      </div>

      {/* BANNER HƯỚNG DẪN KHI ĐANG BẬT CHẾ ĐỘ XÓA */}
      {isDeleteMode && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 animate-pulse">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-950 flex items-center gap-2">
                <span>Chế độ Xóa trực tiếp đang hoạt động</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[11px] font-black">
                  Xóa ngay lập tức (không popup)
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                • <strong>Nhấp tiêu đề hàng / số tiết:</strong> xóa toàn bộ hàng ngang · • <strong>Nhấp tiêu đề cột:</strong> xóa toàn bộ cột dọc · • <strong>Nhấp ô môn học:</strong> xóa ô đó.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {/* Quick undo/redo in banner */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                undoStack.length > 0
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                  : 'bg-rose-100/60 text-rose-400 border border-rose-200 cursor-not-allowed'
              }`}
              title="Hoàn tác thao tác xóa vừa thực hiện"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Hoàn tác ({undoStack.length})</span>
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                redoStack.length > 0
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                  : 'bg-rose-100/60 text-rose-400 border border-rose-200 cursor-not-allowed'
              }`}
              title="Làm lại thao tác xóa"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>Làm lại ({redoStack.length})</span>
            </button>
            <button
              type="button"
              onClick={handleExitDeleteMode}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-700 hover:bg-rose-100 border border-rose-300 transition-colors cursor-pointer shadow-2xs"
            >
              Đóng chế độ xóa
            </button>
          </div>
        </div>
      )}

      {/* Timetable Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {/* Table wrapper with scroll support for smaller screens */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full border-collapse text-left table-fixed min-w-[760px]">
            {/* Columns Header */}
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-xs">
                {/* Column 0: Tiết & Thời gian */}
                <th className="w-32 py-3 px-3.5 text-center font-bold text-slate-600 border-r border-slate-200 uppercase tracking-wider text-[11px] select-none">
                  Tiết / Giờ
                </th>

                {/* Columns: Visible Days (Hỗ trợ xóa cột dọc) */}
                {visibleDays.map(d => {
                  const isMonday = d.day === 2;
                  const isHoveredCol = isDeleteMode && hoveredDeleteTarget?.type === 'col' && hoveredDeleteTarget.day === d.day;

                  return (
                    <th
                      key={d.day}
                      onMouseEnter={() => isDeleteMode && setHoveredDeleteTarget({ type: 'col', day: d.day })}
                      onMouseLeave={() => isDeleteMode && setHoveredDeleteTarget(null)}
                      onClick={() => isDeleteMode && handleDeleteColumn(d.day)}
                      className={`py-3 px-4 font-bold border-r border-slate-200 last:border-r-0 transition-all select-none relative group/col ${
                        isDeleteMode
                          ? isHoveredCol
                            ? 'bg-rose-200 text-rose-950 ring-2 ring-rose-500 ring-inset cursor-pointer shadow-inner'
                            : 'bg-rose-50/80 hover:bg-rose-100/90 text-rose-900 cursor-pointer border-b-2 border-b-rose-400'
                          : 'text-slate-800'
                      }`}
                      title={
                        isDeleteMode
                          ? `Nhấp vào đây để XÓA TOÀN BỘ CỘT ${d.name}`
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isDeleteMode && (
                            <Trash2 className={`w-3.5 h-3.5 ${isHoveredCol ? 'text-rose-700 animate-bounce' : 'text-rose-500'}`} />
                          )}
                          <span className={`text-sm font-bold ${isDeleteMode ? 'text-rose-950' : 'text-slate-900'}`}>
                            {d.name}
                          </span>
                        </div>
                        {isDeleteMode ? (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors ${
                            isHoveredCol
                              ? 'bg-rose-600 text-white border-rose-700'
                              : 'bg-rose-200 text-rose-800 border-rose-300'
                          }`}>
                            {isHoveredCol ? 'Xóa cột!' : 'Xóa cột'}
                          </span>
                        ) : isMonday ? (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            Hôm nay
                          </span>
                        ) : null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Rows: Periods for Active Shift (Hỗ trợ xóa hàng ngang) */}
            <tbody className="divide-y divide-slate-200">
              {currentPeriods.map(p => {
                const isHoveredRow = isDeleteMode && hoveredDeleteTarget?.type === 'row' && hoveredDeleteTarget.period === p.period;

                return (
                  <tr key={`${activeShift}_${p.period}`} className="hover:bg-slate-50/30 transition-colors">
                    {/* Period Time Header Cell (Nhấp để xóa toàn bộ hàng khi ở chế độ xóa) */}
                    <td
                      onMouseEnter={() => isDeleteMode && setHoveredDeleteTarget({ type: 'row', period: p.period })}
                      onMouseLeave={() => isDeleteMode && setHoveredDeleteTarget(null)}
                      onClick={() => isDeleteMode && handleDeleteRow(p.period)}
                      className={`p-3 border-r border-slate-200 text-center align-top select-none relative group/period transition-all ${
                        isDeleteMode
                          ? isHoveredRow
                            ? 'bg-rose-200 text-rose-950 ring-2 ring-rose-500 ring-inset cursor-pointer shadow-inner'
                            : 'bg-rose-50/80 hover:bg-rose-100 text-rose-900 cursor-pointer border-r-2 border-r-rose-400'
                          : 'bg-slate-50/60'
                      }`}
                      title={
                        isDeleteMode
                          ? `Nhấp vào đây để XÓA TOÀN BỘ HÀNG ${p.label}`
                          : undefined
                      }
                    >
                      <div className="font-bold text-xs flex items-center justify-center gap-1.5">
                        {isDeleteMode && (
                          <Trash2 className={`w-3.5 h-3.5 ${isHoveredRow ? 'text-rose-700 animate-bounce' : 'text-rose-500'}`} />
                        )}
                        <span className={isDeleteMode ? 'text-rose-950 font-black' : 'text-slate-900'}>
                          {p.label}
                        </span>
                      </div>
                      {isDeleteMode ? (
                        <div className={`text-[10px] font-bold mt-1 py-0.5 px-1.5 rounded border inline-block transition-colors ${
                          isHoveredRow
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-rose-200 text-rose-800 border-rose-300'
                        }`}>
                          {isHoveredRow ? 'Xóa hàng!' : 'Xóa hàng'}
                        </div>
                      ) : (
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{p.time}</span>
                        </div>
                      )}
                    </td>

                    {/* Day Cells */}
                    {visibleDays.map(d => {
                      const item = getItemForSlot(d.day, p.period);
                      const isDragOver = dragOverCell?.day === d.day && dragOverCell?.period === p.period;
                      const isRowTargeted = isDeleteMode && hoveredDeleteTarget?.type === 'row' && hoveredDeleteTarget.period === p.period;
                      const isColTargeted = isDeleteMode && hoveredDeleteTarget?.type === 'col' && hoveredDeleteTarget.day === d.day;
                      const isCellTargeted = isDeleteMode && hoveredDeleteTarget?.type === 'cell' && hoveredDeleteTarget.day === d.day && hoveredDeleteTarget.period === p.period;
                      const isHighlightedForDelete = isRowTargeted || isColTargeted || isCellTargeted;

                      return (
                        <td
                          key={`${d.day}_${p.period}`}
                          onDragOver={e => handleDragOver(e, d.day, p.period)}
                          onDragLeave={e => handleDragLeave(e, d.day, p.period)}
                          onDrop={e => handleDrop(e, d.day, p.period)}
                          onMouseEnter={() => {
                            if (isDeleteMode && !hoveredDeleteTarget?.type) {
                              setHoveredDeleteTarget({ type: 'cell', id: item?.id, day: d.day, period: p.period });
                            }
                          }}
                          onMouseLeave={() => {
                            if (isDeleteMode && hoveredDeleteTarget?.type === 'cell') {
                              setHoveredDeleteTarget(null);
                            }
                          }}
                          className={`p-2.5 border-r border-slate-200 last:border-r-0 align-top transition-all duration-150 min-h-[110px] h-32 relative ${
                            isHighlightedForDelete
                              ? 'bg-rose-100/70 border-rose-300 ring-2 ring-rose-400/80 ring-inset'
                              : isDragOver
                              ? 'bg-blue-50/80 ring-2 ring-blue-500/50 ring-inset rounded-lg'
                              : ''
                          }`}
                        >
                          {item ? (
                            // OCCUPIED SLOT: Pastel card
                            (() => {
                              const pastel = getSubjectPastel(item.subject);
                              const isBeingDragged = draggedItem?.id === item.id;

                              return (
                                <div
                                  draggable={!isDeleteMode}
                                  onDragStart={e => !isDeleteMode && handleDragStart(e, item)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => handleSlotClick(d.day, p.period)}
                                  className={`group h-full rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-150 select-none shadow-2xs border-l-4 relative ${
                                    isDeleteMode
                                      ? isHighlightedForDelete
                                        ? 'border-rose-500 bg-rose-100/90 border-l-rose-600 ring-2 ring-rose-500 cursor-pointer shadow-sm scale-[0.98]'
                                        : 'hover:border-rose-400 hover:ring-2 hover:ring-rose-400 cursor-pointer opacity-90'
                                      : 'cursor-grab active:cursor-grabbing hover:shadow-xs'
                                  } ${!isDeleteMode ? `${pastel.card} ${pastel.accent}` : ''} ${
                                    isBeingDragged ? 'opacity-40 scale-95 border-dashed' : ''
                                  }`}
                                  title={
                                    isDeleteMode
                                      ? isRowTargeted
                                        ? `Hàng này sẽ bị xóa khi nhấp vào tiêu đề hàng Tiết ${p.period}`
                                        : isColTargeted
                                        ? `Cột này sẽ bị xóa khi nhấp vào tiêu đề cột ${d.name}`
                                        : 'Nhấp để XÓA MÔN NÀY ngay lập tức'
                                      : 'Kéo để đổi lịch hoặc nhấn để sửa/xóa'
                                  }
                                >
                                  {/* Delete Indicator Badge in Delete Mode */}
                                  {isDeleteMode && (
                                    <div className="absolute -top-1.5 -right-1.5 z-10">
                                      <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white">
                                        <Trash2 className="w-3 h-3" />
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-1">
                                    {/* Subject Title and Edit Icon */}
                                    <div className="flex items-start justify-between gap-1">
                                      <span className={`font-bold text-xs leading-snug break-words ${
                                        isDeleteMode && isHighlightedForDelete ? 'text-rose-950 font-black' : ''
                                      }`}>
                                        {item.subject}
                                      </span>
                                      {!isDeleteMode && (
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                          <span
                                            className="p-1 rounded-md bg-white/80 hover:bg-white text-slate-600 shadow-2xs cursor-pointer"
                                            title="Chỉnh sửa tiết học"
                                          >
                                            <Pencil className="w-3 h-3 text-blue-600" />
                                          </span>
                                          <span
                                            className="p-1 rounded-md bg-white/80 hover:bg-white text-slate-400 cursor-grab"
                                            title="Kéo thả di chuyển"
                                          >
                                            <GripVertical className="w-3 h-3 text-slate-400" />
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Teacher */}
                                    <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium truncate">
                                      <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{item.teacherName}</span>
                                    </div>
                                  </div>

                                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-black/5 mt-1">
                                    {/* Room */}
                                    <span className="flex items-center gap-1 truncate font-medium">
                                      <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                      <span className="truncate">{item.room}</span>
                                    </span>

                                    {/* Note indicator if available */}
                                    {item.note && (
                                      <span
                                        className="p-0.5 rounded text-blue-600 bg-white/60"
                                        title={item.note}
                                      >
                                        <FileText className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            // EMPTY SLOT: Dotted or clear cell with "+" on hover/click (Vô hiệu khi đang ở chế độ xóa)
                            <div
                              onClick={() => !isDeleteMode && handleSlotClick(d.day, p.period)}
                              className={`group h-full min-h-[96px] rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 transition-all p-2 select-none ${
                                isDeleteMode
                                  ? isHighlightedForDelete
                                    ? 'border-rose-300 bg-rose-50/60 text-rose-400 cursor-default'
                                    : 'border-slate-200 bg-slate-50/40 opacity-40 cursor-default'
                                  : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-400 hover:text-blue-600 cursor-pointer'
                              }`}
                              title={
                                isDeleteMode
                                  ? isRowTargeted
                                    ? `Hàng này sẽ bị xóa khi nhấp vào tiêu đề hàng Tiết ${p.period}`
                                    : isColTargeted
                                    ? `Cột này sẽ bị xóa khi nhấp vào tiêu đề cột ${d.name}`
                                    : 'Ô trống không có nội dung'
                                  : `Nhấn để thêm tiết học vào Thứ ${d.day}, Tiết ${p.period} (${activeShift === 'morning' ? 'Sáng' : 'Chiều'})`
                              }
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-2xs ${
                                isDeleteMode
                                  ? 'bg-slate-200/60 text-slate-400'
                                  : 'bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:scale-110'
                              }`}>
                                <Plus className="w-4 h-4 transition-transform" />
                              </div>
                              <span className={`text-[10px] font-semibold transition-colors ${
                                isDeleteMode
                                  ? 'text-slate-400 opacity-60'
                                  : 'text-slate-400 group-hover:text-blue-700 opacity-70 group-hover:opacity-100'
                              }`}>
                                {isDeleteMode ? 'Ô trống' : `+ Thêm tiết ca ${activeShift === 'morning' ? 'sáng' : 'chiều'}`}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend / Guide Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-slate-700">Màu môn học:</span>
            <div className="flex items-center gap-3 flex-wrap text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300" />
                <span>Toán</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
                <span>Ngữ văn</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-300" />
                <span>Tiếng Anh</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-sky-100 border border-sky-300" />
                <span>KHTN</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-100 border border-indigo-300" />
                <span>Tin học / STEM</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300" />
                <span>Thể dục / CLB</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1 text-slate-600">
              {activeShift === 'morning' ? (
                <>
                  <span className="text-amber-500">☀️</span> Đang xem: Buổi sáng
                </>
              ) : (
                <>
                  <span className="text-orange-500">🌇</span> Đang xem: Buổi chiều
                </>
              )}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kéo & thả đổi tiết mượt mà</span>
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit Lesson Modal */}
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
          currentClassName={currentClassTitle}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          availablePeriods={currentPeriods}
        />
      )}

      {/* Collision / Swap Modal */}
      {swapModalOpen && (
        <SwapConflictModal
          isOpen={swapModalOpen}
          onClose={() => {
            setSwapModalOpen(false);
            setSwapSource(null);
            setSwapTarget(null);
          }}
          sourceItem={swapSource}
          targetItem={swapTarget}
          onConfirmSwap={handleConfirmSwap}
        />
      )}


      {/* MODAL TÙY CHỌN THÊM TIẾT HỌC MỚI (ADD PERIOD MODAL) */}
      {showAddPeriodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Thêm hàng tiết mới</h3>
                  <p className="text-[11px] text-slate-500">
                    {activeShift === 'morning' ? 'Buổi sáng ☀️' : 'Buổi chiều 🌇'} · Lớp {currentClassTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPeriodModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Số thứ tự tiết học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={customPeriodNumber}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomPeriodNumber(val);
                    if (val && !isNaN(parseInt(val, 10))) {
                      setCustomPeriodTime(StorageService.calculateDefaultPeriodTime(activeShift, parseInt(val, 10)));
                    }
                  }}
                  placeholder="VD: 6, 7, 8..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Tự động tăng tiếp theo tiết cuối cùng hiện có ({currentPeriods.length + 1}).
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Khung thời gian (tùy chọn)
                </label>
                <input
                  type="text"
                  value={customPeriodTime}
                  onChange={e => setCustomPeriodTime(e.target.value)}
                  placeholder="VD: 11:45 - 12:30 hoặc 17:20 - 18:05"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 leading-relaxed">
                Sau khi thêm, hàng tiết mới sẽ xuất hiện trên lưới thời khóa biểu từ Thứ Hai đến Thứ Sáu để giáo viên có thể nhấp trực tiếp vào bất kỳ ô nào để phân bổ môn học.
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPeriodModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddCustomPeriodSubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm tiết ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẢNH BÁO THAY ĐỔI CHƯA LƯU KHI QUAY LẠI GIAO DIỆN CŨ */}
      {showUnsavedPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start gap-3.5 bg-amber-50/70">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Bạn có thay đổi chưa lưu!
                </h3>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  Thời khóa biểu đã có các thay đổi chưa được ghi vào hệ thống dữ liệu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUnsavedPromptModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Bạn đang yêu cầu quay lại <strong>giao diện cũ</strong>. Bạn muốn lưu lại các thay đổi vừa thực hiện trên lưới thời khóa biểu hay hủy bỏ chúng?
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Lưu và quay lại:</span>
                </div>
                <p className="text-slate-500 text-[11px] pl-4">
                  Lưu vĩnh viễn toàn bộ môn học, vị trí tiết vào hệ thống, sau đó chuyển sang giao diện cũ.
                </p>
                <div className="flex items-center gap-2 font-bold text-slate-800 pt-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Bỏ thay đổi và quay lại:</span>
                </div>
                <p className="text-slate-500 text-[11px] pl-4">
                  Khôi phục lại dữ liệu đã lưu trước đó và quay về giao diện cũ mà không ghi đè.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowUnsavedPromptModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Hủy (ở lại chỉnh sửa)
              </button>
              <button
                type="button"
                onClick={handleDiscardAndReturn}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                Bỏ thay đổi và quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveAndReturn}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu và quay lại</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
