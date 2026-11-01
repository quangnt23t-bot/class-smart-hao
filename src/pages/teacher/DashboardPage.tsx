import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { StorageService, canUserEditClass } from '../../data/storage';
import { EditClassNameModal } from '../../components/classes/EditClassNameModal';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Calendar,
  AlertTriangle,
  FileText,
  Plus,
  Gamepad2,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Pencil
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { classes, selectedClassId, setSelectedClassId, schedule } = useClass();
  const navigate = useNavigate();
  const [editingClass, setEditingClass] = useState<{ id: string; name: string } | null>(null);

  const students = StorageService.getStudents();
  const attendanceToday = StorageService.getAttendance();
  const assignments = StorageService.getAssignments();
  const alerts = StorageService.getAlerts();

  // Metrics calculations
  const totalStudents = students.length;
  const presentCount = attendanceToday.filter(a => a.status === 'present').length || 28;
  const absentCount = attendanceToday.filter(a => a.status === 'unexcused' || a.status === 'excused').length || 1;
  const lateCount = attendanceToday.filter(a => a.status === 'late').length || 1;

  const pendingAssignments = assignments.reduce((acc, a) => acc + (a.pendingCount || 0), 0);
  const activeAlerts = alerts.filter(a => a.status === 'new' || a.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
            Không gian làm việc giáo viên
          </span>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            Xin chào, {user?.name || 'Cô Nguyễn Thị Lan'} 👋
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
            Hôm nay bạn có <strong>3 tiết dạy</strong> tại các lớp 6A1 và 6A2. Có <strong>{pendingAssignments} bài tập</strong> đang chờ chấm và <strong>{activeAlerts.length} cảnh báo</strong> học tập cần theo dõi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Điểm danh ngay</span>
          </button>
          <button
            onClick={() => navigate('/teacher/tools')}
            className="px-4 py-2 bg-blue-800/80 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs transition-all border border-blue-400/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Công cụ lớp học</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Clickable to jump to corresponding views) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/teacher/students')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng học sinh</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">{totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Trên 3 lớp giảng dạy</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/teacher/attendance')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Có mặt hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono tabular-nums">{presentCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Tỷ lệ 97.2% chuyên cần</div>
        </div>

        <div
          onClick={() => navigate('/teacher/attendance')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nghỉ học hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-mono tabular-nums">{absentCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">1 có phép · 0 không phép</div>
        </div>

        <div
          onClick={() => navigate('/teacher/attendance')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đi trễ hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono tabular-nums">{lateCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đã cập nhật vào sổ nề nếp</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Schedule & Actionable Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Lịch dạy hôm nay (Thứ 2)</h3>
              </div>
              <button
                onClick={() => navigate('/teacher/schedule')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Xem cả tuần</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {schedule.filter(s => s.dayOfWeek === 2 || s.isToday).length > 0 ? (
                schedule
                  .filter(s => s.dayOfWeek === 2 || s.isToday)
                  .sort((a, b) => {
                    const sA = (a.shift || 'morning') === 'morning' ? 0 : 1;
                    const sB = (b.shift || 'morning') === 'morning' ? 0 : 1;
                    if (sA !== sB) return sA - sB;
                    return a.period - b.period;
                  })
                  .map(item => {
                const canEdit = canUserEditClass(user, item);
                const isAfternoon = item.shift === 'afternoon';
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg font-bold text-xs flex flex-col items-center justify-center shrink-0 ${
                        isAfternoon ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <span>T{item.period}</span>
                        <span className="text-[9px] font-normal">{item.time.split(' - ')[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs" title={item.className}>
                            {item.className}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isAfternoon ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isAfternoon ? 'Chiều' : 'Sáng'}
                          </span>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClass({ id: item.classId, name: item.className });
                              }}
                              className="p-1 -my-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex items-center justify-center cursor-pointer group/pencil shrink-0"
                              title="Chỉnh sửa tên lớp"
                              aria-label={`Chỉnh sửa tên lớp ${item.className}`}
                            >
                              <Pencil className="w-3.5 h-3.5 group-hover/pencil:scale-110 transition-transform" />
                            </button>
                          )}
                          <span className="text-[10px] text-slate-400">·</span>
                          <span className="text-xs text-slate-600">{item.room}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-700 mt-0.5">{item.subject}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => navigate(`/teacher/attendance?classId=${item.classId}`)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Điểm danh
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/classes/${item.classId}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white transition-colors shadow-2xs"
                      >
                        Vào lớp
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Hôm nay không có tiết dạy nào được xếp lịch.
              </div>
            )}
            </div>
          </div>

          {/* Pending Tasks & Action Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Việc cần xử lý ngay</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                onClick={() => navigate('/teacher/assignments')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{pendingAssignments} bài tập chưa chấm</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Lớp 6A1 và 6A2 đã nộp bài đầy đủ</div>
                </div>
              </div>

              <div
                onClick={() => navigate('/teacher/alerts')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-400 bg-white hover:bg-rose-50/30 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{activeAlerts.length} cảnh báo cần can thiệp</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Lê Hoàng Minh có nguy cơ tụt hạng</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions & Class Progress */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => navigate(`/teacher/attendance?classId=${selectedClassId}`)}
                className="p-3 text-left border border-slate-200 hover:border-blue-400 rounded-xl hover:bg-blue-50/40 transition-all group"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                <div className="font-semibold text-slate-800">Điểm danh</div>
                <div className="text-[10px] text-slate-400">Ghi nhận tiết học</div>
              </button>

              <button
                onClick={() => navigate('/teacher/assignments')}
                className="p-3 text-left border border-slate-200 hover:border-blue-400 rounded-xl hover:bg-blue-50/40 transition-all group"
              >
                <FileText className="w-4 h-4 text-blue-600 mb-1" />
                <div className="font-semibold text-slate-800">Giao bài tập</div>
                <div className="text-[10px] text-slate-400">Tạo đề và hạn nộp</div>
              </button>

              <button
                onClick={() => navigate('/teacher/grades')}
                className="p-3 text-left border border-slate-200 hover:border-blue-400 rounded-xl hover:bg-blue-50/40 transition-all group"
              >
                <TrendingUp className="w-4 h-4 text-purple-600 mb-1" />
                <div className="font-semibold text-slate-800">Nhập điểm</div>
                <div className="text-[10px] text-slate-400">Sổ điểm điện tử</div>
              </button>

              <button
                onClick={() => navigate('/teacher/tools/wheel')}
                className="p-3 text-left border border-slate-200 hover:border-blue-400 rounded-xl hover:bg-blue-50/40 transition-all group"
              >
                <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
                <div className="font-semibold text-slate-800">Gọi học sinh</div>
                <div className="text-[10px] text-slate-400">Vòng quay & ngẫu nhiên</div>
              </button>
            </div>
          </div>

          {/* Class overview card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Tiến độ lớp chủ nhiệm (6A1)</h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Xuất sắc
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Chuyên cần trung bình:</span>
                  <span className="font-bold text-slate-900">97.4%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '97.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Điểm kiểm tra TB:</span>
                  <span className="font-bold text-slate-900">8.4 / 10</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Hoàn thành bài tập:</span>
                  <span className="font-bold text-slate-900">92%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP CHỈNH SỬA TÊN LỚP HỌC */}
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
