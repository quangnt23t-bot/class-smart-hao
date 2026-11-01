import {
  User,
  ClassRoom,
  Student,
  AttendanceRecord,
  ScheduleItem,
  Assignment,
  Submission,
  Quiz,
  QuizQuestion,
  GradeRecord,
  BehaviorRecord,
  Alert,
  ResourceItem,
  Announcement,
  AuditLogItem,
  PeriodConfig,
  ScheduleShift,
  ParentGuardian
} from '../types';
import {
  DEMO_USERS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_SCHEDULE,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_BEHAVIORS,
  INITIAL_ALERTS,
  INITIAL_QUESTIONS,
  INITIAL_QUIZZES,
  INITIAL_RESOURCES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GUARDIANS
} from './mockData';
import { FirestoreService } from '../firebase/firestoreSync';

const KEYS = {
  USERS: 'smartclass_users',
  CURRENT_USER: 'smartclass_current_user',
  CLASSES: 'smartclass_classes',
  STUDENTS: 'smartclass_students',
  SCHEDULE: 'smartclass_schedule',
  ASSIGNMENTS: 'smartclass_assignments',
  SUBMISSIONS: 'smartclass_submissions',
  GRADES: 'smartclass_grades',
  ATTENDANCE: 'smartclass_attendance',
  BEHAVIORS: 'smartclass_behaviors',
  ALERTS: 'smartclass_alerts',
  QUESTIONS: 'smartclass_questions',
  QUIZZES: 'smartclass_quizzes',
  RESOURCES: 'smartclass_resources',
  ANNOUNCEMENTS: 'smartclass_announcements',
  AUDIT_LOGS: 'smartclass_audit_logs',
  SELECTED_CHILD_ID: 'smartclass_selected_child_id',
  PERIOD_CONFIGS: 'smartclass_period_configs',
  ACTIVE_DAYS: 'smartclass_active_days',
  TIMETABLE_VIEW_MODE: 'smartclass_timetable_view_mode', // 'interactive' (giao diện mới tương tác trực tiếp) | 'classic' (giao diện cũ)
  GUARDIANS: 'smartclass_guardians'
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const StorageService = {
  // Reset all to demo seed
  resetToDemo(): void {
    localStorage.clear();
    setStored(KEYS.USERS, DEMO_USERS);
    setStored(KEYS.CURRENT_USER, DEMO_USERS[0]); // default teacher
    setStored(KEYS.CLASSES, INITIAL_CLASSES);
    setStored(KEYS.STUDENTS, INITIAL_STUDENTS);
    setStored(KEYS.SCHEDULE, INITIAL_SCHEDULE);
    setStored(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    setStored(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    setStored(KEYS.GRADES, INITIAL_GRADES);
    setStored(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    setStored(KEYS.BEHAVIORS, INITIAL_BEHAVIORS);
    setStored(KEYS.ALERTS, INITIAL_ALERTS);
    setStored(KEYS.QUESTIONS, INITIAL_QUESTIONS);
    setStored(KEYS.QUIZZES, INITIAL_QUIZZES);
    setStored(KEYS.RESOURCES, INITIAL_RESOURCES);
    setStored(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setStored(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setStored(KEYS.SELECTED_CHILD_ID, 's_1');
    setStored(KEYS.GUARDIANS, INITIAL_GUARDIANS);
  },

  // Initialize if empty or merge missing demo classes
  init(): void {
    if (!localStorage.getItem(KEYS.CLASSES)) {
      this.resetToDemo();
    } else {
      const currentClasses = this.getClasses();
      const missing = INITIAL_CLASSES.filter(ic => !currentClasses.some(c => c.id === ic.id));
      if (missing.length > 0) {
        this.saveClasses([...missing, ...currentClasses]);
      }
      if (!localStorage.getItem(KEYS.GUARDIANS)) {
        setStored(KEYS.GUARDIANS, INITIAL_GUARDIANS);
      }
    }
  },

  // User & Auth
  getUsers(): User[] {
    return getStored<User[]>(KEYS.USERS, DEMO_USERS);
  },
  getCurrentUser(): User {
    return getStored<User>(KEYS.CURRENT_USER, DEMO_USERS[0]);
  },
  setCurrentUser(user: User): void {
    setStored(KEYS.CURRENT_USER, user);
  },

  // Classes
  getClasses(): ClassRoom[] {
    return getStored<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
  },
  saveClasses(classes: ClassRoom[]): void {
    setStored(KEYS.CLASSES, classes);
  },
  getClassById(id: string): ClassRoom | undefined {
    return this.getClasses().find(c => c.id === id);
  },
  addClass(newClass: Omit<ClassRoom, 'id' | 'createdAt'>): ClassRoom {
    const classes = this.getClasses();
    const created: ClassRoom = {
      ...newClass,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    classes.unshift(created);
    this.saveClasses(classes);
    this.logAction('Tạo lớp học mới', created.name, `Tạo lớp ${created.name} (${created.subject})`);
    return created;
  },
  updateClass(id: string, updates: Partial<ClassRoom>): ClassRoom | null {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === id);
    if (index === -1) return null;
    const oldName = classes[index].name;
    const newName = updates.name ? updates.name.trim() : undefined;

    classes[index] = {
      ...classes[index],
      ...updates,
      ...(newName ? { name: newName } : {})
    };
    this.saveClasses(classes);

    // If class name changed, cascade update to schedule, students, assignments, quizzes
    if (newName && newName !== oldName) {
      // 1. Cascade to Schedule
      const schedule = this.getSchedule();
      let scheduleChanged = false;
      const updatedSchedule = schedule.map(s => {
        if (s.classId === id) {
          scheduleChanged = true;
          return { ...s, className: newName };
        }
        return s;
      });
      if (scheduleChanged) {
        this.saveSchedule(updatedSchedule);
      }

      // 2. Cascade to Students
      const students = this.getStudents();
      let studentsChanged = false;
      const updatedStudents = students.map(st => {
        if (st.classId === id) {
          studentsChanged = true;
          return { ...st, className: newName };
        }
        return st;
      });
      if (studentsChanged) {
        this.saveStudents(updatedStudents);
      }

      // 3. Cascade to Assignments
      const assignments = this.getAssignments();
      let assignmentsChanged = false;
      const updatedAssignments = assignments.map(a => {
        if (a.classId === id) {
          assignmentsChanged = true;
          return { ...a, className: newName };
        }
        return a;
      });
      if (assignmentsChanged) {
        this.saveAssignments(updatedAssignments);
      }

      // 4. Cascade to Quizzes
      const quizzes = this.getQuizzes();
      let quizzesChanged = false;
      const updatedQuizzes = quizzes.map(q => {
        if (q.classId === id) {
          quizzesChanged = true;
          return { ...q, className: newName };
        }
        return q;
      });
      if (quizzesChanged) {
        setStored(KEYS.QUIZZES, updatedQuizzes);
      }

      this.logAction('Đổi tên lớp học', newName, `Đổi tên từ "${oldName}" sang "${newName}"`);
    } else {
      this.logAction('Cập nhật thông tin lớp', classes[index].name, 'Cập nhật cài đặt lớp học');
    }

    return classes[index];
  },
  updateClassName(
    id: string,
    newName: string,
    currentUser?: User | null
  ): { success: boolean; error?: string; updatedClass?: ClassRoom } {
    const trimmed = (newName || '').trim();
    if (!trimmed) {
      return { success: false, error: 'Tên lớp học không được để trống hoặc chỉ chứa khoảng trắng.' };
    }
    if (trimmed.length > 50) {
      return { success: false, error: 'Tên lớp học không được vượt quá 50 ký tự.' };
    }

    if (currentUser) {
      if (currentUser.role === 'student' || currentUser.role === 'parent') {
        return { success: false, error: 'Chỉ giáo viên phụ trách hoặc quản trị viên mới có quyền đổi tên lớp học.' };
      }
    }

    const currentClass = this.getClassById(id);
    if (!currentClass) {
      return { success: false, error: 'Không tìm thấy lớp học trong hệ thống.' };
    }

    // Check duplicate name within the same academic year
    const classes = this.getClasses();
    const duplicate = classes.find(
      c => c.id !== id && c.academicYear === currentClass.academicYear && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: `Tên "${trimmed}" đã tồn tại trong năm học ${currentClass.academicYear}.` };
    }

    const updated = this.updateClass(id, { name: trimmed });
    if (!updated) {
      return { success: false, error: 'Có lỗi xảy ra khi cập nhật tên lớp học. Vui lòng thử lại.' };
    }

    return { success: true, updatedClass: updated };
  },
  archiveClass(id: string): boolean {
    const c = this.getClassById(id);
    if (!c) return false;
    this.updateClass(id, { status: c.status === 'archived' ? 'active' : 'archived' });
    return true;
  },
  deleteClass(id: string): boolean {
    const classes = this.getClasses().filter(c => c.id !== id);
    this.saveClasses(classes);
    this.logAction('Xóa lớp học', id, 'Xóa lớp khỏi hệ thống');
    return true;
  },

  // Students
  getStudents(classId?: string): Student[] {
    const list = getStored<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    if (!classId) return list;
    return list.filter(s => s.classId === classId);
  },
  saveStudents(students: Student[]): void {
    setStored(KEYS.STUDENTS, students);
  },
  getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  },
  addStudent(studentData: Omit<Student, 'id' | 'averageScore' | 'attendanceRate' | 'completedAssignments' | 'totalAssignments' | 'rewardPoints' | 'badges' | 'alertCount'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...studentData,
      id: `s_${Date.now()}`,
      averageScore: 8.0,
      attendanceRate: 100,
      completedAssignments: 0,
      totalAssignments: 0,
      rewardPoints: 10,
      badges: ['Thành viên mới'],
      alertCount: 0
    };
    students.push(newStudent);
    this.saveStudents(students);
    this.updateClassStudentCount(newStudent.classId);
    this.logAction('Thêm học sinh mới', newStudent.name, `Thêm ${newStudent.name} (${newStudent.studentCode})`);
    return newStudent;
  },
  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return null;
    students[index] = { ...students[index], ...updates };
    this.saveStudents(students);

    // Cascade student info update to guardians
    if (updates.name || updates.className || updates.classId || updates.studentCode) {
      const guardians = getStored<ParentGuardian[]>(KEYS.GUARDIANS, []);
      let gChanged = false;
      const updatedGuardians = guardians.map(g => {
        if (g.studentId === id) {
          gChanged = true;
          return {
            ...g,
            studentName: updates.name || g.studentName,
            className: updates.className || g.className,
            classId: updates.classId || g.classId,
            studentCode: updates.studentCode || g.studentCode
          };
        }
        return g;
      });
      if (gChanged) {
        setStored(KEYS.GUARDIANS, updatedGuardians);
      }
    }

    this.logAction('Cập nhật hồ sơ học sinh', students[index].name, 'Cập nhật thông tin');
    return students[index];
  },
  deleteStudent(id: string): boolean {
    const student = this.getStudentById(id);
    if (!student) return false;
    const students = this.getStudents().filter(s => s.id !== id);
    this.saveStudents(students);
    this.updateClassStudentCount(student.classId);
    this.logAction('Xóa học sinh', student.name, `Xóa học sinh ${student.name}`);
    return true;
  },
  updateClassStudentCount(classId: string): void {
    const count = this.getStudents(classId).length;
    this.updateClass(classId, { totalStudents: count });
  },

  // Parent & Guardians (Ba mẹ / Người giám hộ học sinh)
  getGuardians(classId?: string, studentId?: string): ParentGuardian[] {
    let list = getStored<ParentGuardian[]>(KEYS.GUARDIANS, []);
    if (!list || list.length === 0) {
      list = [...INITIAL_GUARDIANS];
      setStored(KEYS.GUARDIANS, list);
    }

    // Keep student and class metadata in sync with latest student data
    const allStudents = this.getStudents();
    const studentMap = new Map(allStudents.map(s => [s.id, s]));
    let hasChanges = false;

    const synced = list.map(g => {
      const student = studentMap.get(g.studentId);
      if (student) {
        if (
          g.studentName !== student.name ||
          g.className !== student.className ||
          g.classId !== student.classId ||
          g.studentCode !== student.studentCode
        ) {
          hasChanges = true;
          return {
            ...g,
            studentName: student.name,
            className: student.className,
            classId: student.classId,
            studentCode: student.studentCode
          };
        }
      }
      return g;
    });

    if (hasChanges) {
      list = synced;
      setStored(KEYS.GUARDIANS, synced);
    }

    if (classId && classId !== 'all') {
      list = list.filter(g => g.classId === classId);
    }
    if (studentId) {
      list = list.filter(g => g.studentId === studentId);
    }

    return list;
  },

  saveGuardians(guardians: ParentGuardian[]): void {
    setStored(KEYS.GUARDIANS, guardians);
  },

  getGuardianById(id: string): ParentGuardian | undefined {
    return this.getGuardians().find(g => g.id === id);
  },

  addGuardian(data: Omit<ParentGuardian, 'id' | 'createdAt' | 'updatedAt'>): ParentGuardian {
    const guardians = this.getGuardians();
    const newGuardian: ParentGuardian = {
      ...data,
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    guardians.unshift(newGuardian);
    this.saveGuardians(guardians);

    // Sync to student record if student has no parent info or if isPrimary
    const student = this.getStudentById(data.studentId);
    if (student) {
      if (!student.parentName || data.isPrimary) {
        this.updateStudent(student.id, {
          parentName: data.name,
          parentPhone: data.phone,
          parentEmail: data.email || student.parentEmail
        });
      }
    }

    this.logAction(
      'Thêm ba mẹ/người giám hộ',
      newGuardian.name,
      `Thêm ${newGuardian.relationship} ${newGuardian.name} cho học sinh ${newGuardian.studentName} (${newGuardian.className})`
    );
    return newGuardian;
  },

  updateGuardian(id: string, updates: Partial<ParentGuardian>): ParentGuardian | null {
    const guardians = this.getGuardians();
    const index = guardians.findIndex(g => g.id === id);
    if (index === -1) return null;

    const old = guardians[index];
    const updated: ParentGuardian = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    guardians[index] = updated;
    this.saveGuardians(guardians);

    // If primary or student had old parent name, sync to student
    if (updated.isPrimary || updates.name || updates.phone || updates.email) {
      const student = this.getStudentById(updated.studentId);
      if (student && (updated.isPrimary || student.parentName === old.name)) {
        this.updateStudent(student.id, {
          parentName: updated.name,
          parentPhone: updated.phone,
          parentEmail: updated.email || student.parentEmail
        });
      }
    }

    this.logAction(
      'Cập nhật thông tin phụ huynh',
      updated.name,
      `Cập nhật phụ huynh ${updated.name} của học sinh ${updated.studentName}`
    );
    return updated;
  },

  deleteGuardian(id: string): boolean {
    const guardian = this.getGuardianById(id);
    if (!guardian) return false;

    const guardians = this.getGuardians().filter(g => g.id !== id);
    this.saveGuardians(guardians);

    this.logAction(
      'Xóa thông tin phụ huynh',
      guardian.name,
      `Xóa phụ huynh ${guardian.name} (${guardian.relationship} của HS ${guardian.studentName})`
    );
    return true;
  },

  // Attendance
  getAttendance(classId?: string, date?: string): AttendanceRecord[] {
    let list = getStored<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    if (classId) list = list.filter(a => a.classId === classId);
    if (date) list = list.filter(a => a.date === date);
    return list;
  },
  saveAttendance(records: AttendanceRecord[]): void {
    setStored(KEYS.ATTENDANCE, records);
  },
  recordAttendanceBulk(newRecords: AttendanceRecord[]): void {
    let all = getStored<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    // Replace records for the same student on same date
    const recordMap = new Map(all.map(r => [`${r.studentId}_${r.date}`, r]));
    newRecords.forEach(r => {
      recordMap.set(`${r.studentId}_${r.date}`, r);
    });
    const updated = Array.from(recordMap.values());
    this.saveAttendance(updated);
    this.logAction('Lưu điểm danh', newRecords[0]?.classId || '', `Điểm danh ${newRecords.length} học sinh`);
  },

  // Period Configurations (Cấu hình danh sách tiết học theo buổi, hỗ trợ tiết 6, 7, 8...)
  getDefaultPeriodConfigs(): PeriodConfig[] {
    return [
      // Sáng (Tiết 1 - 5 mặc định)
      { period: 1, time: '07:15 - 08:00', label: 'Tiết 1', shift: 'morning' },
      { period: 2, time: '08:05 - 08:50', label: 'Tiết 2', shift: 'morning' },
      { period: 3, time: '09:10 - 09:55', label: 'Tiết 3', shift: 'morning' },
      { period: 4, time: '10:05 - 10:50', label: 'Tiết 4', shift: 'morning' },
      { period: 5, time: '10:55 - 11:40', label: 'Tiết 5', shift: 'morning' },
      // Chiều (Tiết 1 - 5 mặc định)
      { period: 1, time: '13:00 - 13:45', label: 'Tiết 1 (Chiều)', shift: 'afternoon' },
      { period: 2, time: '13:50 - 14:35', label: 'Tiết 2 (Chiều)', shift: 'afternoon' },
      { period: 3, time: '14:50 - 15:35', label: 'Tiết 3 (Chiều)', shift: 'afternoon' },
      { period: 4, time: '15:40 - 16:25', label: 'Tiết 4 (Chiều)', shift: 'afternoon' },
      { period: 5, time: '16:30 - 17:15', label: 'Tiết 5 (Chiều)', shift: 'afternoon' }
    ];
  },

  calculateDefaultPeriodTime(shift: ScheduleShift, period: number): string {
    const defaultTimes: Record<ScheduleShift, Record<number, string>> = {
      morning: {
        1: '07:15 - 08:00',
        2: '08:05 - 08:50',
        3: '09:10 - 09:55',
        4: '10:05 - 10:50',
        5: '10:55 - 11:40',
        6: '11:45 - 12:30',
        7: '12:35 - 13:20',
        8: '13:25 - 14:10'
      },
      afternoon: {
        1: '13:00 - 13:45',
        2: '13:50 - 14:35',
        3: '14:50 - 15:35',
        4: '15:40 - 16:25',
        5: '16:30 - 17:15',
        6: '17:20 - 18:05',
        7: '18:10 - 18:55',
        8: '19:00 - 19:45',
        9: '19:50 - 20:35',
        10: '20:40 - 21:25'
      }
    };

    if (defaultTimes[shift]?.[period]) {
      return defaultTimes[shift][period];
    }

    // Heuristic generator for any period >= 6
    if (shift === 'afternoon') {
      const baseHour = 13 + Math.floor((period - 1) * 50 / 60);
      const baseMin = ((period - 1) * 50) % 60;
      const endMin = (baseMin + 45) % 60;
      const endHour = baseHour + Math.floor((baseMin + 45) / 60);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(baseHour)}:${pad(baseMin)} - ${pad(endHour)}:${pad(endMin)}`;
    } else {
      const baseHour = 7 + Math.floor((period - 1) * 50 / 60);
      const baseMin = (15 + (period - 1) * 50) % 60;
      const endMin = (baseMin + 45) % 60;
      const endHour = baseHour + Math.floor((baseMin + 45) / 60);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(baseHour)}:${pad(baseMin)} - ${pad(endHour)}:${pad(endMin)}`;
    }
  },

  getPeriodConfigs(): PeriodConfig[] {
    const stored = getStored<PeriodConfig[]>(KEYS.PERIOD_CONFIGS, []);
    if (!stored || stored.length === 0) {
      const defaults = this.getDefaultPeriodConfigs();
      this.savePeriodConfigs(defaults);
      return defaults;
    }
    return stored;
  },

  savePeriodConfigs(configs: PeriodConfig[]): void {
    setStored(KEYS.PERIOD_CONFIGS, configs);
  },

  addPeriodToShift(shift: ScheduleShift, specificPeriod?: number, customTime?: string): PeriodConfig {
    const configs = this.getPeriodConfigs();
    const currentShiftConfigs = configs.filter(c => c.shift === shift);
    
    let nextPeriodNumber = specificPeriod;
    if (!nextPeriodNumber || nextPeriodNumber <= 0) {
      const maxExisting = currentShiftConfigs.reduce((max, c) => Math.max(max, c.period), 0);
      nextPeriodNumber = maxExisting + 1;
    }

    // Check if period already exists in this shift
    const existing = currentShiftConfigs.find(c => c.period === nextPeriodNumber);
    if (existing) {
      return existing;
    }

    const time = customTime || this.calculateDefaultPeriodTime(shift, nextPeriodNumber);
    const label = shift === 'morning' 
      ? `Tiết ${nextPeriodNumber}` 
      : `Tiết ${nextPeriodNumber} (Chiều)`;

    const newConfig: PeriodConfig = {
      period: nextPeriodNumber,
      time,
      label,
      shift
    };

    configs.push(newConfig);
    // Sort by shift, then period number
    configs.sort((a, b) => {
      if (a.shift !== b.shift) return a.shift === 'morning' ? -1 : 1;
      return a.period - b.period;
    });

    this.savePeriodConfigs(configs);
    this.logAction(
      'Thêm tiết học mới vào lịch', 
      shift === 'morning' ? 'Ca sáng' : 'Ca chiều', 
      `Thêm Tiết ${nextPeriodNumber} (${time}) vào lịch ${shift === 'morning' ? 'sáng' : 'chiều'}`
    );
    return newConfig;
  },

  removePeriodFromShift(shift: ScheduleShift, periodNumber: number): boolean {
    const configs = this.getPeriodConfigs();
    const currentShiftConfigs = configs.filter(c => c.shift === shift);
    // Keep at least 1 period in shift
    if (currentShiftConfigs.length <= 1) return false;

    const filtered = configs.filter(c => !(c.shift === shift && c.period === periodNumber));
    if (filtered.length === configs.length) return false;

    // Also remove any schedule items allocated to this removed period
    const schedule = this.getSchedule();
    const updatedSchedule = schedule.filter(s => !(s.shift === shift && s.period === periodNumber));
    this.saveSchedule(updatedSchedule);

    this.savePeriodConfigs(filtered);
    this.logAction('Xóa hàng tiết học', shift === 'morning' ? 'Ca sáng' : 'Ca chiều', `Đã xóa Tiết ${periodNumber}`);
    return true;
  },

  restorePeriodConfig(config: PeriodConfig): void {
    const configs = this.getPeriodConfigs();
    if (!configs.some(c => c.shift === config.shift && c.period === config.period)) {
      configs.push(config);
      configs.sort((a, b) => {
        if (a.shift !== b.shift) return a.shift === 'morning' ? -1 : 1;
        return a.period - b.period;
      });
      this.savePeriodConfigs(configs);
      this.logAction('Khôi phục hàng tiết học', config.shift === 'morning' ? 'Ca sáng' : 'Ca chiều', `Khôi phục ${config.label}`);
    }
  },

  // Active Days for Timetable (Thứ 2 đến Thứ 6/7)
  getActiveDays(): number[] {
    return getStored<number[]>(KEYS.ACTIVE_DAYS, [2, 3, 4, 5, 6]);
  },

  saveActiveDays(days: number[]): void {
    setStored(KEYS.ACTIVE_DAYS, days);
  },

  removeActiveDay(day: number): boolean {
    const current = this.getActiveDays();
    if (current.length <= 1) return false;
    const updated = current.filter(d => d !== day);
    this.saveActiveDays(updated);
    this.logAction('Xóa cột ngày học', `Thứ ${day}`, `Đã xóa toàn bộ cột Thứ ${day}`);
    return true;
  },

  restoreActiveDay(day: number): void {
    const current = this.getActiveDays();
    if (!current.includes(day)) {
      current.push(day);
      current.sort((a, b) => a - b);
      this.saveActiveDays(current);
      this.logAction('Khôi phục cột ngày học', `Thứ ${day}`, `Khôi phục cột Thứ ${day}`);
    }
  },

  // Timetable Interface View Mode: 'interactive' (Giao diện nâng cấp) | 'classic' (Giao diện cũ)
  getTimetableViewMode(): 'interactive' | 'classic' {
    return getStored<'interactive' | 'classic'>(KEYS.TIMETABLE_VIEW_MODE, 'interactive');
  },
  setTimetableViewMode(mode: 'interactive' | 'classic'): void {
    setStored(KEYS.TIMETABLE_VIEW_MODE, mode);
  },

  // Schedule
  getSchedule(classId?: string): ScheduleItem[] {
    const list = getStored<ScheduleItem[]>(KEYS.SCHEDULE, INITIAL_SCHEDULE);
    if (!classId) return list;
    return list.filter(s => s.classId === classId);
  },
  saveSchedule(schedule: ScheduleItem[]): void {
    setStored(KEYS.SCHEDULE, schedule);
  },
  addScheduleItem(item: Omit<ScheduleItem, 'id'>): ScheduleItem {
    const all = this.getSchedule();
    const shift = item.shift || 'morning';
    
    // Ensure period config exists for this period if >= 6
    const configs = this.getPeriodConfigs();
    const hasConfig = configs.some(c => c.shift === shift && c.period === item.period);
    if (!hasConfig) {
      this.addPeriodToShift(shift, item.period);
    }

    const defaultTime = this.calculateDefaultPeriodTime(shift, item.period);
    const newItem: ScheduleItem = {
      ...item,
      shift,
      id: `sch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time: item.time || defaultTime
    };
    all.push(newItem);
    this.saveSchedule(all);
    const shiftLabel = shift === 'morning' ? 'sáng' : 'chiều';
    this.logAction('Thêm tiết học', item.classId, `Thêm tiết ${item.period} ca ${shiftLabel} môn ${item.subject} (Thứ ${item.dayOfWeek})`);
    return newItem;
  },
  updateScheduleItem(id: string, updates: Partial<ScheduleItem>): ScheduleItem | null {
    const all = this.getSchedule();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const old = all[idx];
    const shift = updates.shift || old.shift || 'morning';
    const newPeriod = updates.period || old.period;
    
    // Ensure period config exists if period >= 6
    const configs = this.getPeriodConfigs();
    if (!configs.some(c => c.shift === shift && c.period === newPeriod)) {
      this.addPeriodToShift(shift, newPeriod);
    }

    const defaultTime = this.calculateDefaultPeriodTime(shift, newPeriod);
    const updated: ScheduleItem = {
      ...old,
      ...updates,
      shift,
      time: (updates.period || updates.shift) && !updates.time ? defaultTime : (updates.time || old.time)
    };
    all[idx] = updated;
    this.saveSchedule(all);
    this.logAction('Cập nhật tiết học', updated.classId, `Cập nhật tiết ${updated.period} môn ${updated.subject}`);
    return updated;
  },
  deleteScheduleItem(id: string): boolean {
    const all = this.getSchedule();
    const item = all.find(s => s.id === id);
    if (!item) return false;
    const filtered = all.filter(s => s.id !== id);
    this.saveSchedule(filtered);
    this.logAction('Xóa tiết học', item.classId, `Xóa tiết ${item.period} môn ${item.subject} (Thứ ${item.dayOfWeek})`);
    return true;
  },
  swapScheduleItems(sourceId: string, targetId: string): boolean {
    const all = this.getSchedule();
    const srcIdx = all.findIndex(s => s.id === sourceId);
    const tgtIdx = all.findIndex(s => s.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return false;
    const src = all[srcIdx];
    const tgt = all[tgtIdx];

    const srcDay = src.dayOfWeek;
    const srcPeriod = src.period;
    const srcShift = src.shift || 'morning';
    const srcTime = src.time;

    all[srcIdx] = {
      ...src,
      dayOfWeek: tgt.dayOfWeek,
      period: tgt.period,
      shift: tgt.shift || 'morning',
      time: tgt.time
    };

    all[tgtIdx] = {
      ...tgt,
      dayOfWeek: srcDay,
      period: srcPeriod,
      shift: srcShift,
      time: srcTime
    };

    this.saveSchedule(all);
    this.logAction('Hoán đổi tiết học', src.classId, `Hoán đổi tiết ${src.subject} và ${tgt.subject}`);
    return true;
  },
  moveScheduleItem(id: string, targetDay: number, targetPeriod: number, targetShift?: 'morning' | 'afternoon'): boolean {
    const all = this.getSchedule();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return false;
    const item = all[idx];
    const shift = targetShift || item.shift || 'morning';
    
    // Ensure period config exists
    const configs = this.getPeriodConfigs();
    if (!configs.some(c => c.shift === shift && c.period === targetPeriod)) {
      this.addPeriodToShift(shift, targetPeriod);
    }

    const defaultTime = this.calculateDefaultPeriodTime(shift, targetPeriod);
    all[idx] = {
      ...item,
      dayOfWeek: targetDay,
      period: targetPeriod,
      shift,
      time: defaultTime || item.time
    };
    this.saveSchedule(all);
    const shiftLabel = shift === 'morning' ? 'sáng' : 'chiều';
    this.logAction('Di chuyển tiết học', item.classId, `Di chuyển tiết ${item.subject} sang Thứ ${targetDay}, Tiết ${targetPeriod} (${shiftLabel})`);
    return true;
  },
  checkScheduleConflict(item: {
    id?: string;
    classId: string;
    dayOfWeek: number;
    period: number;
    shift?: 'morning' | 'afternoon';
    teacherName?: string;
    room?: string;
  }): {
    hasConflict: boolean;
    conflicts: Array<{ type: 'teacher' | 'room' | 'class'; message: string; conflictingItem: ScheduleItem }>;
  } {
    const all = this.getSchedule();
    const conflicts: Array<{ type: 'teacher' | 'room' | 'class'; message: string; conflictingItem: ScheduleItem }> = [];
    const itemShift = item.shift || 'morning';
    const shiftLabel = itemShift === 'morning' ? 'buổi sáng' : 'buổi chiều';

    all.forEach(s => {
      if (s.id === item.id) return;
      const sShift = s.shift || 'morning';
      // If shifts don't match, they don't collide in time
      if (sShift !== itemShift) return;
      if (s.dayOfWeek !== item.dayOfWeek || s.period !== item.period) return;

      // Check same class conflict
      if (s.classId === item.classId) {
        conflicts.push({
          type: 'class',
          message: `Lớp ${s.className} đã có môn "${s.subject}" vào Thứ ${s.dayOfWeek}, Tiết ${s.period} (${shiftLabel})`,
          conflictingItem: s
        });
      }

      // Check teacher conflict (across all classes)
      if (
        item.teacherName &&
        s.teacherName &&
        s.teacherName.trim().toLowerCase() === item.teacherName.trim().toLowerCase() &&
        s.classId !== item.classId
      ) {
        conflicts.push({
          type: 'teacher',
          message: `Giáo viên "${s.teacherName}" đã có tiết dạy ở ${s.className} (${s.subject}) tại Thứ ${s.dayOfWeek}, Tiết ${s.period} (${shiftLabel})`,
          conflictingItem: s
        });
      }

      // Check room conflict (across all classes)
      if (
        item.room &&
        s.room &&
        s.room.trim().toLowerCase() === item.room.trim().toLowerCase() &&
        s.classId !== item.classId
      ) {
        conflicts.push({
          type: 'room',
          message: `Phòng học "${s.room}" đã được phân bổ cho ${s.className} (${s.subject}) tại Thứ ${s.dayOfWeek}, Tiết ${s.period} (${shiftLabel})`,
          conflictingItem: s
        });
      }
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  },

  // Assignments
  getAssignments(classId?: string): Assignment[] {
    const list = getStored<Assignment[]>(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    if (!classId) return list;
    return list.filter(a => a.classId === classId);
  },
  saveAssignments(assignments: Assignment[]): void {
    setStored(KEYS.ASSIGNMENTS, assignments);
  },
  addAssignment(data: Omit<Assignment, 'id' | 'totalSubmissions' | 'gradedCount' | 'pendingCount'>): Assignment {
    const assignments = this.getAssignments();
    const created: Assignment = {
      ...data,
      id: `asg_${Date.now()}`,
      totalSubmissions: 0,
      gradedCount: 0,
      pendingCount: 0
    };
    assignments.unshift(created);
    this.saveAssignments(assignments);
    this.logAction('Giao bài tập', created.title, `Giao bài tập cho ${created.className}`);
    return created;
  },

  // Submissions
  getSubmissions(assignmentId?: string, studentId?: string): Submission[] {
    let list = getStored<Submission[]>(KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    if (assignmentId) list = list.filter(s => s.assignmentId === assignmentId);
    if (studentId) list = list.filter(s => s.studentId === studentId);
    return list;
  },
  saveSubmissions(submissions: Submission[]): void {
    setStored(KEYS.SUBMISSIONS, submissions);
  },
  gradeSubmission(submissionId: string, score: number, feedback: string): void {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      submissions[index].score = score;
      submissions[index].feedback = feedback;
      submissions[index].status = 'graded';
      this.saveSubmissions(submissions);
      this.logAction('Chấm bài tập', submissions[index].studentName, `Chấm điểm: ${score}`);
    }
  },
  submitAssignment(assignmentId: string, student: Student, content: string): Submission {
    const submissions = this.getSubmissions();
    const created: Submission = {
      id: `sub_${Date.now()}`,
      assignmentId,
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      submittedAt: new Date().toISOString(),
      isLate: false,
      status: 'submitted',
      content
    };
    submissions.unshift(created);
    this.saveSubmissions(submissions);
    return created;
  },

  // Grades
  getGrades(classId?: string): GradeRecord[] {
    const list = getStored<GradeRecord[]>(KEYS.GRADES, INITIAL_GRADES);
    if (!classId) return list;
    return list.filter(g => g.classId === classId);
  },
  saveGrades(grades: GradeRecord[]): void {
    setStored(KEYS.GRADES, grades);
  },
  updateGrade(studentId: string, field: keyof GradeRecord, value: number): void {
    const grades = this.getGrades();
    let record = grades.find(g => g.studentId === studentId);
    if (!record) {
      const student = this.getStudentById(studentId);
      if (!student) return;
      record = {
        id: `gr_${Date.now()}`,
        classId: student.classId,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode,
        [field]: value
      };
      grades.push(record);
    } else {
      (record as any)[field] = value;
      // Recompute average
      const tx = [record.tx1, record.tx2, record.tx3, record.tx4].filter(v => v !== undefined && v !== null) as number[];
      const txAvg = tx.length > 0 ? tx.reduce((a, b) => a + b, 0) / tx.length : null;
      const gk = record.gk ?? null;
      const ck = record.ck ?? null;

      if (txAvg !== null && gk !== null && ck !== null) {
        // Weighted formula: (TX * 1 + GK * 2 + CK * 3) / 6
        record.average = Number(((txAvg * 1 + gk * 2 + ck * 3) / 6).toFixed(1));
      } else if (txAvg !== null) {
        record.average = Number(txAvg.toFixed(1));
      }
      record.lastUpdatedAt = new Date().toLocaleString('vi-VN');
    }
    this.saveGrades(grades);
  },

  // Behaviors
  getBehaviors(classId?: string, studentId?: string): BehaviorRecord[] {
    let list = getStored<BehaviorRecord[]>(KEYS.BEHAVIORS, INITIAL_BEHAVIORS);
    if (classId) list = list.filter(b => b.classId === classId);
    if (studentId) list = list.filter(b => b.studentId === studentId);
    return list;
  },
  addBehavior(record: Omit<BehaviorRecord, 'id'>): BehaviorRecord {
    const list = this.getBehaviors();
    const created: BehaviorRecord = {
      ...record,
      id: `beh_${Date.now()}`
    };
    list.unshift(created);
    setStored(KEYS.BEHAVIORS, list);

    // Update student reward points
    const student = this.getStudentById(record.studentId);
    if (student) {
      this.updateStudent(student.id, {
        rewardPoints: Math.max(0, (student.rewardPoints || 0) + record.points)
      });
    }
    return created;
  },

  // Alerts
  getAlerts(classId?: string): Alert[] {
    const list = getStored<Alert[]>(KEYS.ALERTS, INITIAL_ALERTS);
    if (!classId) return list;
    return list.filter(a => a.classId === classId);
  },
  updateAlertStatus(id: string, status: Alert['status'], actionTaken?: string): void {
    const alerts = this.getAlerts();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index].status = status;
      if (actionTaken) alerts[index].actionTaken = actionTaken;
      setStored(KEYS.ALERTS, alerts);
    }
  },

  // Questions & Quizzes
  getQuestions(): QuizQuestion[] {
    return getStored<QuizQuestion[]>(KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },
  saveQuestions(q: QuizQuestion[]): void {
    setStored(KEYS.QUESTIONS, q);
  },
  addQuestion(question: Omit<QuizQuestion, 'id'>): QuizQuestion {
    const questions = this.getQuestions();
    const created: QuizQuestion = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: question.createdAt || new Date().toISOString()
    };
    questions.unshift(created);
    this.saveQuestions(questions);
    this.logAction('Thêm câu hỏi mới', created.question.slice(0, 30), `Môn ${created.subject} (${created.grade})`);
    FirestoreService.saveQuestion(created).catch(e => console.warn('Firestore question save notice:', e));
    return created;
  },
  addQuestionsBulk(newQuestions: Omit<QuizQuestion, 'id'>[]): QuizQuestion[] {
    const questions = this.getQuestions();
    const createdList: QuizQuestion[] = newQuestions.map((q, idx) => ({
      ...q,
      id: `q_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
      createdAt: q.createdAt || new Date().toISOString()
    }));
    const combined = [...createdList, ...questions];
    this.saveQuestions(combined);
    this.logAction('Nhập hàng loạt câu hỏi', `${createdList.length} câu hỏi`, `Nhập vào ngân hàng câu hỏi`);
    FirestoreService.saveQuestionsBulk(createdList).catch(e => console.warn('Firestore bulk questions save notice:', e));
    return createdList;
  },
  updateQuestion(id: string, updates: Partial<QuizQuestion>): QuizQuestion | null {
    const questions = this.getQuestions();
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return null;
    questions[index] = {
      ...questions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveQuestions(questions);
    this.logAction('Cập nhật câu hỏi', questions[index].question.slice(0, 30), `ID: ${id}`);
    FirestoreService.saveQuestion(questions[index]).catch(e => console.warn('Firestore question update notice:', e));
    return questions[index];
  },
  deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const target = questions.find(q => q.id === id);
    if (!target) return false;
    const filtered = questions.filter(q => q.id !== id);
    this.saveQuestions(filtered);
    this.logAction('Xóa câu hỏi', target.question.slice(0, 30), `Xóa khỏi ngân hàng`);
    FirestoreService.deleteQuestion(id).catch(e => console.warn('Firestore question delete notice:', e));
    return true;
  },
  deleteQuestionsBulk(ids: string[]): boolean {
    const idSet = new Set(ids);
    const questions = this.getQuestions();
    const filtered = questions.filter(q => !idSet.has(q.id));
    this.saveQuestions(filtered);
    this.logAction('Xóa hàng loạt câu hỏi', `${ids.length} câu hỏi`, `Xóa khỏi ngân hàng`);
    ids.forEach(id => FirestoreService.deleteQuestion(id).catch(e => console.warn('Firestore question delete notice:', e)));
    return true;
  },
  getQuizzes(classId?: string): Quiz[] {
    const list = getStored<Quiz[]>(KEYS.QUIZZES, INITIAL_QUIZZES);
    if (!classId) return list;
    return list.filter(q => q.classId === classId);
  },
  addQuiz(quiz: Omit<Quiz, 'id'>): Quiz {
    const quizzes = this.getQuizzes();
    const created: Quiz = {
      ...quiz,
      id: `quiz_${Date.now()}`
    };
    quizzes.unshift(created);
    setStored(KEYS.QUIZZES, quizzes);
    return created;
  },

  // Resources
  getResources(): ResourceItem[] {
    return getStored<ResourceItem[]>(KEYS.RESOURCES, INITIAL_RESOURCES);
  },
  addResource(item: Omit<ResourceItem, 'id' | 'downloadsCount'>): ResourceItem {
    const list = this.getResources();
    const created: ResourceItem = {
      ...item,
      id: `res_${Date.now()}`,
      downloadsCount: 0
    };
    list.unshift(created);
    setStored(KEYS.RESOURCES, list);
    return created;
  },
  toggleFavoriteResource(id: string): void {
    const list = this.getResources();
    const item = list.find(r => r.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      setStored(KEYS.RESOURCES, list);
    }
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    return getStored<Announcement[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },
  addAnnouncement(ann: Omit<Announcement, 'id' | 'viewsCount' | 'createdAt'>): Announcement {
    const list = this.getAnnouncements();
    const created: Announcement = {
      ...ann,
      id: `anc_${Date.now()}`,
      viewsCount: 1,
      createdAt: new Date().toLocaleString('vi-VN')
    };
    list.unshift(created);
    setStored(KEYS.ANNOUNCEMENTS, list);
    this.logAction('Tạo thông báo mới', created.title, `Thông báo: ${created.title}`);
    return created;
  },

  // Audit Logs
  getAuditLogs(): AuditLogItem[] {
    return getStored<AuditLogItem[]>(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  logAction(action: string, target: string, details: string): void {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const item: AuditLogItem = {
      id: `log_${Date.now()}`,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Hệ thống',
      role: currentUser?.role || 'teacher',
      action,
      target,
      details,
      ip: '127.0.0.1',
      timestamp: new Date().toLocaleString('vi-VN')
    };
    logs.unshift(item);
    setStored(KEYS.AUDIT_LOGS, logs.slice(0, 100)); // keep last 100
  },

  // Parent Multi-Child Selection
  getSelectedChildId(): string {
    return getStored<string>(KEYS.SELECTED_CHILD_ID, 's_1');
  },
  setSelectedChildId(id: string): void {
    setStored(KEYS.SELECTED_CHILD_ID, id);
  }
};

// Initialize immediately
StorageService.init();

export function canUserEditClass(
  user: User | null | undefined,
  classItem?: { id?: string; classId?: string; teacherId?: string; teacherName?: string } | null
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;
  if (!classItem) return true;

  const targetId = classItem.id || classItem.classId;
  if (targetId) {
    const targetClass = StorageService.getClassById(targetId);
    if (targetClass) {
      if (targetClass.teacherId && (targetClass.teacherId === user.id || targetClass.teacherId === user.teacherId)) {
        return true;
      }
      if (targetClass.teacherName && targetClass.teacherName === user.name) {
        return true;
      }
      // Demo teacher has rights over all teacher classes in demo
      if (user.id === 'u_teacher_1' || user.teacherId === 'GV001') {
        return true;
      }
    }
  }

  if (classItem.teacherName && classItem.teacherName === user.name) return true;
  if (user.id === 'u_teacher_1' || user.teacherId === 'GV001') return true;
  return false;
}
