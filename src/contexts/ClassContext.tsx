import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClassRoom, Student, ScheduleItem, PeriodConfig, ParentGuardian } from '../types';
import { StorageService } from '../data/storage';

interface ClassContextType {
  classes: ClassRoom[];
  selectedClassId: string;
  selectedClass: ClassRoom | undefined;
  setSelectedClassId: (id: string) => void;
  students: Student[];
  allStudents: Student[];
  guardians: ParentGuardian[];
  schedule: ScheduleItem[];
  periodConfigs: PeriodConfig[];
  refreshData: () => void;
  addClass: (data: Omit<ClassRoom, 'id' | 'createdAt'>) => ClassRoom;
  updateClass: (id: string, updates: Partial<ClassRoom>) => void;
  updateClassName: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  deleteClass: (id: string) => void;
  archiveClass: (id: string) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => ScheduleItem | null;
  deleteScheduleItem: (id: string) => boolean;
  swapScheduleItems: (sourceId: string, targetId: string) => boolean;
  moveScheduleItem: (id: string, targetDay: number, targetPeriod: number, targetShift?: 'morning' | 'afternoon') => boolean;
  addPeriodToShift: (shift: 'morning' | 'afternoon', specificPeriod?: number, customTime?: string) => PeriodConfig;
  removePeriodFromShift: (shift: 'morning' | 'afternoon', periodNumber: number) => boolean;
  restorePeriodConfig: (config: PeriodConfig) => void;
  activeDays: number[];
  saveActiveDays: (days: number[]) => void;
  removeDayColumn: (day: number) => boolean;
  restoreDayColumn: (day: number) => void;
  saveAllSchedule: (newSchedule: ScheduleItem[]) => boolean;
  addGuardian: (data: Omit<ParentGuardian, 'id' | 'createdAt' | 'updatedAt'>) => ParentGuardian;
  updateGuardian: (id: string, updates: Partial<ParentGuardian>) => ParentGuardian | null;
  deleteGuardian: (id: string) => boolean;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('c_6a1');
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);
  const [activeDays, setActiveDays] = useState<number[]>([2, 3, 4, 5, 6]);
  const [guardians, setGuardians] = useState<ParentGuardian[]>([]);

  const refreshData = useCallback(() => {
    const cls = StorageService.getClasses();
    setClasses(cls);
    const allSt = StorageService.getStudents();
    setAllStudents(allSt);
    const sched = StorageService.getSchedule();
    setSchedule(sched);
    const pConfigs = StorageService.getPeriodConfigs();
    setPeriodConfigs(pConfigs);
    const aDays = StorageService.getActiveDays();
    setActiveDays(aDays);
    const gList = StorageService.getGuardians();
    setGuardians(gList);

    // If selectedClassId doesn't exist, pick first
    const activeClassId = cls.some(c => c.id === selectedClassId) ? selectedClassId : cls[0]?.id || '';
    setSelectedClassId(activeClassId);
    setStudents(StorageService.getStudents(activeClassId));
  }, [selectedClassId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (selectedClassId) {
      setStudents(StorageService.getStudents(selectedClassId));
    }
  }, [selectedClassId]);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const addClass = (data: Omit<ClassRoom, 'id' | 'createdAt'>) => {
    const created = StorageService.addClass(data);
    refreshData();
    setSelectedClassId(created.id);
    return created;
  };

  const updateClass = (id: string, updates: Partial<ClassRoom>) => {
    StorageService.updateClass(id, updates);
    refreshData();
  };

  const updateClassName = async (id: string, newName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate network verification and processing
      await new Promise(resolve => setTimeout(resolve, 350));
      const currentUser = StorageService.getCurrentUser();
      const res = StorageService.updateClassName(id, newName, currentUser);
      if (res.success) {
        refreshData();
        return { success: true };
      }
      return { success: false, error: res.error || 'Cập nhật thất bại' };
    } catch (err: unknown) {
      console.error('Lỗi khi cập nhật tên lớp:', err);
      return { success: false, error: 'Lỗi mạng hoặc không thể lưu dữ liệu. Vui lòng thử lại.' };
    }
  };

  const deleteClass = (id: string) => {
    StorageService.deleteClass(id);
    refreshData();
  };

  const archiveClass = (id: string) => {
    StorageService.archiveClass(id);
    refreshData();
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const res = StorageService.addScheduleItem(item);
    refreshData();
    return res;
  };

  const updateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
    const res = StorageService.updateScheduleItem(id, updates);
    refreshData();
    return res;
  };

  const deleteScheduleItem = (id: string) => {
    const res = StorageService.deleteScheduleItem(id);
    refreshData();
    return res;
  };

  const swapScheduleItems = (sourceId: string, targetId: string) => {
    const res = StorageService.swapScheduleItems(sourceId, targetId);
    refreshData();
    return res;
  };

  const moveScheduleItem = (id: string, targetDay: number, targetPeriod: number, targetShift?: 'morning' | 'afternoon') => {
    const res = StorageService.moveScheduleItem(id, targetDay, targetPeriod, targetShift);
    refreshData();
    return res;
  };

  const addPeriodToShift = (shift: 'morning' | 'afternoon', specificPeriod?: number, customTime?: string) => {
    const res = StorageService.addPeriodToShift(shift, specificPeriod, customTime);
    refreshData();
    return res;
  };

  const removePeriodFromShift = (shift: 'morning' | 'afternoon', periodNumber: number) => {
    const res = StorageService.removePeriodFromShift(shift, periodNumber);
    refreshData();
    return res;
  };

  const restorePeriodConfig = (config: PeriodConfig) => {
    StorageService.restorePeriodConfig(config);
    refreshData();
  };

  const saveActiveDays = (days: number[]) => {
    StorageService.saveActiveDays(days);
    refreshData();
  };

  const removeDayColumn = (day: number) => {
    const res = StorageService.removeActiveDay(day);
    refreshData();
    return res;
  };

  const restoreDayColumn = (day: number) => {
    StorageService.restoreActiveDay(day);
    refreshData();
  };

  const saveAllSchedule = (newSchedule: ScheduleItem[]) => {
    StorageService.saveSchedule(newSchedule);
    refreshData();
    return true;
  };

  const addGuardian = (data: Omit<ParentGuardian, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = StorageService.addGuardian(data);
    refreshData();
    return created;
  };

  const updateGuardian = (id: string, updates: Partial<ParentGuardian>) => {
    const updated = StorageService.updateGuardian(id, updates);
    refreshData();
    return updated;
  };

  const deleteGuardian = (id: string) => {
    const success = StorageService.deleteGuardian(id);
    refreshData();
    return success;
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        selectedClassId,
        selectedClass,
        setSelectedClassId,
        students,
        allStudents,
        guardians,
        schedule,
        periodConfigs,
        activeDays,
        saveActiveDays,
        removeDayColumn,
        restoreDayColumn,
        refreshData,
        addClass,
        updateClass,
        updateClassName,
        deleteClass,
        archiveClass,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        swapScheduleItems,
        moveScheduleItem,
        addPeriodToShift,
        removePeriodFromShift,
        restorePeriodConfig,
        saveAllSchedule,
        addGuardian,
        updateGuardian,
        deleteGuardian
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) throw new Error('useClass must be used within ClassProvider');
  return context;
};
