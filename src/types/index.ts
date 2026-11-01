export type Role = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  phone?: string;
  gender?: 'Nam' | 'Nữ';
  birthDate?: string;
  address?: string;
  schoolId?: string;
  // Role specific IDs
  teacherId?: string;
  studentId?: string;
  parentId?: string;
  linkedStudentIds?: string[]; // for parent
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. 2025-2026
  isCurrent: boolean;
}

export interface ClassRoom {
  id: string;
  name: string; // 6A1, 6A2, 7A1
  grade: string; // Khối 6, Khối 7
  subject: string; // Toán, Ngữ văn, Tiếng Anh, Chủ nhiệm
  academicYear: string;
  room: string;
  description: string;
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  joinCode: string;
  themeColor: string;
  status: 'active' | 'archived';
  attendanceRate: number; // percentage
  pendingAssignmentsCount: number;
  alertCount: number;
  createdAt: string;
}

export interface Student {
  id: string;
  studentCode: string; // HS001
  name: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string;
  classId: string;
  className: string;
  groupNumber?: number; // Tổ 1, Tổ 2
  avatar: string;
  phone?: string;
  email?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentId?: string;
  status: 'active' | 'transferred' | 'suspended';
  // Computed statistics
  attendanceRate: number;
  averageScore: number;
  completedAssignments: number;
  totalAssignments: number;
  rewardPoints: number;
  badges: string[];
  alertCount: number;
}

export type ParentRelationship = 'Bố' | 'Mẹ' | 'Người giám hộ' | 'Ông/Bà' | 'Khác';

export interface ParentGuardian {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  name: string; // Họ và tên ba/mẹ/người giám hộ
  relationship: ParentRelationship; // Bố, Mẹ, Người giám hộ, Ông/Bà, Khác
  phone: string;
  email?: string;
  address?: string;
  job?: string;
  note?: string;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late' | 'early_leave';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  period: string; // Sáng - Tiết 1, Chiều, etc.
  status: AttendanceStatus;
  note?: string;
  recordedBy: string;
  recordedAt: string;
}

export type ScheduleShift = 'morning' | 'afternoon';

export interface PeriodConfig {
  period: number; // 1, 2, 3, 4, 5, 6, 7, 8, ...
  time: string; // e.g. "07:15 - 08:00"
  label: string; // e.g. "Tiết 1", "Tiết 6 (Chiều)"
  shift: ScheduleShift;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 2 to 7 (Thứ 2 - Thứ 7)
  shift?: ScheduleShift; // 'morning' (Buổi sáng) | 'afternoon' (Buổi chiều)
  period: number; // 1 to 10+ (Không giới hạn ở tiết 5)
  time: string; // 07:15 - 08:00 hoặc 13:00 - 13:45 hoặc giờ tùy chỉnh
  classId: string;
  className: string;
  subject: string;
  room: string;
  teacherName: string;
  teacherId?: string;
  note?: string; // Ghi chú hoặc nội dung bài học
  isToday?: boolean;
}

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  maxScore: number;
  status: 'published' | 'draft' | 'closed';
  targetType: 'all' | 'group' | 'student';
  targetIds?: string[];
  attachments?: { name: string; url: string; size: string }[];
  totalSubmissions: number;
  gradedCount: number;
  pendingCount: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  isLate: boolean;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'pending';
  attachments?: { name: string; url: string }[];
  content?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  question: string;
  options?: string[]; // For single/multiple/true_false
  correctAnswer: string | string[] | boolean;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'; // easy: Nhận biết, medium: Thông hiểu, hard: Vận dụng, expert: Vận dụng cao
  grade: string;
  subject: string;
  topic?: string;
  tags?: string[];
  sourceType?: 'manual' | 'ai' | 'file';
  needsReview?: boolean; // Anti-hallucination review flag
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  autoGrade: boolean;
  questions: QuizQuestion[];
  status: 'published' | 'draft' | 'closed';
  totalQuestions: number;
  totalPoints: number;
}

export interface GradeRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  tx1?: number; // Thường xuyên 1
  tx2?: number; // Thường xuyên 2
  tx3?: number; // Thường xuyên 3
  tx4?: number; // Thường xuyên 4
  gk?: number;  // Giữa kỳ
  ck?: number;  // Cuối kỳ
  average?: number;
  note?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface GradeHistory {
  id: string;
  gradeRecordId: string;
  studentId: string;
  field: string;
  oldValue: number | null;
  newValue: number;
  updatedBy: string;
  updatedAt: string;
}

export interface BehaviorRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  type: 'positive' | 'reminder';
  category: string; // Phát biểu, Giúp bạn, Quên bài, Nói chuyện...
  points: number; // +5, -3, etc.
  date: string;
  teacherId: string;
  teacherName: string;
  note: string;
}

export interface RewardBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'effort' | 'academic' | 'attendance' | 'leadership';
}

export interface Alert {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  type: 'attendance_drop' | 'missing_homework' | 'low_score' | 'behavior';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  status: 'new' | 'viewed' | 'in_progress' | 'resolved';
  createdAt: string;
  actionTaken?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  chapter: string;
  lesson: string;
  type: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'link';
  fileUrl: string;
  fileSize?: string;
  isFavorite: boolean;
  uploadedBy: string;
  uploadedAt: string;
  downloadsCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: string;
  target: 'all' | 'class' | 'students' | 'parents';
  targetClassId?: string;
  targetClassName?: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  viewsCount: number;
  attachments?: { name: string; url: string; size: string }[];
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  target: string;
  details: string;
  ip: string;
  timestamp: string;
}
