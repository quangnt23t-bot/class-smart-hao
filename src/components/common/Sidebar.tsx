import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CheckSquare,
  Calendar,
  FileText,
  HelpCircle,
  Database,
  FolderOpen,
  Sparkles,
  BarChart2,
  Clock,
  HeartHandshake,
  Award,
  AlertTriangle,
  Gamepad2,
  Bell,
  TrendingUp,
  Settings,
  BookOpen,
  MessageSquare,
  Shield,
  FileCode,
  HardDriveDownload,
  School,
  Contact,
  Library,
  ClipboardList,
  ClipboardCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { classes, selectedClassId, setSelectedClassId } = useClass();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SC
            </div>
            <span className="font-bold text-slate-900 text-sm">SMART CLASS</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teacher Class Switcher (Quick context) */}
        {role === 'teacher' && (
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Lớp đang chọn
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.subject}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation scrollable container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
          {/* TEACHER ROLE SIDEBAR */}
          {role === 'teacher' && (
            <>
              <div className="space-y-1">
                <NavLink to="/teacher/dashboard" onClick={onClose} className={navLinkClass}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Tổng quan</span>
                </NavLink>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
                  Lớp học
                </span>
                <div className="space-y-0.5">
                  <NavLink to="/teacher/classes" onClick={onClose} className={navLinkClass}>
                    <School className="w-4 h-4 shrink-0" />
                    <span>Lớp của tôi</span>
                  </NavLink>
                  <NavLink to="/teacher/students" onClick={onClose} className={navLinkClass}>
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Học sinh</span>
                  </NavLink>
                  <NavLink to="/teacher/parents" onClick={onClose} className={navLinkClass}>
                    <Contact className="w-4 h-4 shrink-0" />
                    <span>Ba mẹ học sinh</span>
                  </NavLink>
                  <NavLink to="/teacher/attendance" onClick={onClose} className={navLinkClass}>
                    <CheckSquare className="w-4 h-4 shrink-0" />
                    <span>Điểm danh</span>
                  </NavLink>
                  <NavLink to="/teacher/schedule" onClick={onClose} className={navLinkClass}>
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Thời khóa biểu</span>
                  </NavLink>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
                  Dạy & Học
                </span>
                <div className="space-y-0.5">
                  <NavLink to="/teacher/question-bank" onClick={onClose} className={navLinkClass}>
                    <Library className="w-4 h-4 shrink-0" />
                    <span>Ngân hàng câu hỏi</span>
                  </NavLink>
                  <NavLink to="/teacher/assignments" onClick={onClose} className={navLinkClass}>
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    <span>Giao bài tập</span>
                  </NavLink>
                  <NavLink to="/teacher/quizzes" onClick={onClose} className={navLinkClass}>
                    <ClipboardCheck className="w-4 h-4 shrink-0" />
                    <span>Chấm bài tự động</span>
                  </NavLink>
                  <NavLink to="/teacher/resources" onClick={onClose} className={navLinkClass}>
                    <FolderOpen className="w-4 h-4 shrink-0" />
                    <span>Tài liệu số</span>
                  </NavLink>
                  <NavLink to="/teacher/ai" onClick={onClose} className={navLinkClass}>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>AI HỖ TRỢ</span>
                  </NavLink>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
                  Theo dõi & Đánh giá
                </span>
                <div className="space-y-0.5">
                  <NavLink to="/teacher/grades" onClick={onClose} className={navLinkClass}>
                    <BarChart2 className="w-4 h-4 shrink-0" />
                    <span>Sổ điểm</span>
                  </NavLink>
                  <NavLink to="/teacher/attendance-report" onClick={onClose} className={navLinkClass}>
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Chuyên cần</span>
                  </NavLink>
                  <NavLink to="/teacher/behavior" onClick={onClose} className={navLinkClass}>
                    <HeartHandshake className="w-4 h-4 shrink-0" />
                    <span>Hành vi nề nếp</span>
                  </NavLink>
                  <NavLink to="/teacher/rewards" onClick={onClose} className={navLinkClass}>
                    <Award className="w-4 h-4 shrink-0" />
                    <span>Thi đua & Huy hiệu</span>
                  </NavLink>
                  <NavLink to="/teacher/alerts" onClick={onClose} className={navLinkClass}>
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Cảnh báo thông minh</span>
                  </NavLink>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
                  Tương tác & Quản lý
                </span>
                <div className="space-y-0.5">
                  <NavLink to="/teacher/tools" onClick={onClose} className={navLinkClass}>
                    <Gamepad2 className="w-4 h-4 shrink-0" />
                    <span>Công cụ lớp học</span>
                  </NavLink>
                  <NavLink to="/teacher/announcements" onClick={onClose} className={navLinkClass}>
                    <Bell className="w-4 h-4 shrink-0" />
                    <span>Thông báo</span>
                  </NavLink>
                  <NavLink to="/teacher/reports" onClick={onClose} className={navLinkClass}>
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>Báo cáo tổng hợp</span>
                  </NavLink>
                </div>
              </div>
            </>
          )}

          {/* STUDENT ROLE SIDEBAR */}
          {role === 'student' && (
            <div className="space-y-1">
              <NavLink to="/student/dashboard" onClick={onClose} className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Trang chủ</span>
              </NavLink>
              <NavLink to="/student/schedule" onClick={onClose} className={navLinkClass}>
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Lịch học</span>
              </NavLink>
              <NavLink to="/student/assignments" onClick={onClose} className={navLinkClass}>
                <FileText className="w-4 h-4 shrink-0" />
                <span>Bài tập của tôi</span>
              </NavLink>
              <NavLink to="/student/quizzes" onClick={onClose} className={navLinkClass}>
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Kiểm tra & Quiz</span>
              </NavLink>
              <NavLink to="/student/resources" onClick={onClose} className={navLinkClass}>
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span>Học liệu tự học</span>
              </NavLink>
              <NavLink to="/student/grades" onClick={onClose} className={navLinkClass}>
                <BarChart2 className="w-4 h-4 shrink-0" />
                <span>Bảng điểm</span>
              </NavLink>
              <NavLink to="/student/attendance" onClick={onClose} className={navLinkClass}>
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span>Chuyên cần</span>
              </NavLink>
              <NavLink to="/student/achievements" onClick={onClose} className={navLinkClass}>
                <Award className="w-4 h-4 shrink-0" />
                <span>Huy hiệu & Thành tích</span>
              </NavLink>
              <NavLink to="/student/notifications" onClick={onClose} className={navLinkClass}>
                <Bell className="w-4 h-4 shrink-0" />
                <span>Thông báo lớp</span>
              </NavLink>
              <NavLink to="/student/profile" onClick={onClose} className={navLinkClass}>
                <Users className="w-4 h-4 shrink-0" />
                <span>Hồ sơ cá nhân</span>
              </NavLink>
            </div>
          )}

          {/* PARENT ROLE SIDEBAR */}
          {role === 'parent' && (
            <div className="space-y-1">
              <NavLink to="/parent/dashboard" onClick={onClose} className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Tổng quan</span>
              </NavLink>
              <NavLink to="/parent/children" onClick={onClose} className={navLinkClass}>
                <Users className="w-4 h-4 shrink-0" />
                <span>Con của tôi</span>
              </NavLink>
              <NavLink to="/parent/grades" onClick={onClose} className={navLinkClass}>
                <BarChart2 className="w-4 h-4 shrink-0" />
                <span>Bảng điểm học tập</span>
              </NavLink>
              <NavLink to="/parent/attendance" onClick={onClose} className={navLinkClass}>
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span>Chuyên cần & Điểm danh</span>
              </NavLink>
              <NavLink to="/parent/assignments" onClick={onClose} className={navLinkClass}>
                <FileText className="w-4 h-4 shrink-0" />
                <span>Bài tập & Tiến độ</span>
              </NavLink>
              <NavLink to="/parent/achievements" onClick={onClose} className={navLinkClass}>
                <Award className="w-4 h-4 shrink-0" />
                <span>Khen thưởng & Nề nếp</span>
              </NavLink>
              <NavLink to="/parent/schedule" onClick={onClose} className={navLinkClass}>
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Lịch học của con</span>
              </NavLink>
              <NavLink to="/parent/notifications" onClick={onClose} className={navLinkClass}>
                <Bell className="w-4 h-4 shrink-0" />
                <span>Thông báo từ trường</span>
              </NavLink>
              <NavLink to="/parent/messages" onClick={onClose} className={navLinkClass}>
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Trao đổi với giáo viên</span>
              </NavLink>
            </div>
          )}

          {/* ADMIN ROLE SIDEBAR */}
          {role === 'admin' && (
            <>
              <div className="space-y-1">
                <NavLink to="/admin/dashboard" onClick={onClose} className={navLinkClass}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Tổng quan hệ thống</span>
                </NavLink>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
                  Quản lý trường
                </span>
                <div className="space-y-0.5">
                  <NavLink to="/admin/schools" onClick={onClose} className={navLinkClass}>
                    <School className="w-4 h-4 shrink-0" />
                    <span>Trường & Cơ sở</span>
                  </NavLink>
                  <NavLink to="/admin/classes" onClick={onClose} className={navLinkClass}>
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Lớp học</span>
                  </NavLink>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
                  Người dùng & Phân quyền
                </span>
                <div className="space-y-0.5">
                  <NavLink to="/admin/users" onClick={onClose} className={navLinkClass}>
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Danh sách người dùng</span>
                  </NavLink>
                  <NavLink to="/admin/roles" onClick={onClose} className={navLinkClass}>
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Phân quyền Role</span>
                  </NavLink>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
                  Hệ thống & Dữ liệu
                </span>
                <div className="space-y-0.5">
                  <NavLink to="/admin/audit-log" onClick={onClose} className={navLinkClass}>
                    <FileCode className="w-4 h-4 shrink-0" />
                    <span>Nhật ký hoạt động (Audit)</span>
                  </NavLink>
                  <NavLink to="/admin/backups" onClick={onClose} className={navLinkClass}>
                    <HardDriveDownload className="w-4 h-4 shrink-0" />
                    <span>Sao lưu & Khôi phục</span>
                  </NavLink>
                  <NavLink to="/admin/settings" onClick={onClose} className={navLinkClass}>
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Cấu hình chung</span>
                  </NavLink>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-medium">
            <span>Phiên bản v2.6 PRO</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Năm học 2025 - 2026</div>
        </div>
      </aside>
    </>
  );
};
