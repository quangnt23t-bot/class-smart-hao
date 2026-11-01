import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../data/storage';
import {
  Users,
  CheckCircle2,
  FileText,
  TrendingUp,
  Award,
  MessageSquare,
  Clock,
  ArrowRight,
  Send,
  Calendar
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user, selectedChildId, setSelectedChildId } = useAuth();
  const navigate = useNavigate();

  // Parent has 2 linked children: s_1 (Trần Đức Anh - 6A1) & s_4 (Trần Mai Trang - 7A1)
  const linkedStudentIds = user?.linkedStudentIds || ['s_1', 's_4'];
  const allStudents = StorageService.getStudents();
  const linkedStudents = allStudents.filter(s => linkedStudentIds.includes(s.id));

  // Current active child based on Child Switcher!
  const currentChild = linkedStudents.find(s => s.id === selectedChildId) || linkedStudents[0] || allStudents[0];

  const childGrades = StorageService.getGrades().find(g => g.studentId === currentChild.id);
  const childAssignments = StorageService.getAssignments(currentChild.classId);
  const childAttendance = StorageService.getAttendance().filter(a => a.studentId === currentChild.id);
  const childSubmissions = StorageService.getSubmissions(undefined, currentChild.id);
  const announcements = StorageService.getAnnouncements();

  return (
    <div className="space-y-6">
      {/* Child Switcher Banner (Crucial Requirement from Section 29) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Cổng thông tin Phụ huynh học sinh
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Sổ liên lạc điện tử gia đình
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tình hình rèn luyện và kết quả học tập của con em tại trường
          </p>
        </div>

        {/* CHILD SWITCHER PILL TABS */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          {linkedStudents.map(child => {
            const isSelected = child.id === currentChild.id;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <img
                  src={child.avatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span>{child.name} ({child.className})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Child Overview Highlight Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentChild.avatar}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{currentChild.name}</h2>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
                {currentChild.studentCode}
              </span>
            </div>
            <p className="text-xs text-indigo-100 mt-0.5">
              Học sinh lớp <strong>{currentChild.className}</strong> · Giáo viên chủ nhiệm: <strong>Cô Lan</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/parent/messages')}
          className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Trao đổi với cô giáo</span>
        </button>
      </div>

      {/* 4 KPIs for Selected Child */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div
          onClick={() => navigate('/parent/grades')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Điểm TB học tập</span>
          <div className="text-2xl font-bold text-blue-600 font-mono mt-1">
            {currentChild.averageScore} / 10
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Chi tiết bảng điểm</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/parent/attendance')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Chuyên cần</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {currentChild.attendanceRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Đi học đúng giờ</div>
        </div>

        <div
          onClick={() => navigate('/parent/assignments')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Bài tập hoàn thành</span>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">
            {currentChild.completedAssignments} / {currentChild.totalAssignments || 15}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tiến độ tốt</div>
        </div>

        <div
          onClick={() => navigate('/parent/achievements')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Điểm thi đua rèn luyện</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {currentChild.rewardPoints} đ
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{currentChild.badges.length} huy hiệu biểu dương</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Left 2 Cols: Academic Summary & Attendance Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Teacher Feedback */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Lời nhận xét học tập của cô giáo</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
              "{childGrades?.note || 'Cháu chăm chỉ, phát biểu hăng hái và có tiến bộ rõ rệt trong các bài kiểm tra gần đây. Gia đình tiếp tục động viên cháu giữ vững phong độ.'}"
            </div>
            <div className="text-[11px] text-slate-400 text-right">Cô Nguyễn Thị Lan · Giáo viên chủ nhiệm</div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tình hình chuyên cần gần đây</span>
              </h3>
              <button
                onClick={() => navigate('/parent/attendance')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {childAttendance.slice(0, 3).map(a => (
                <div key={a.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-slate-500">{a.date}</span>
                    <span className="text-slate-800 font-medium ml-3">{a.period}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Có mặt
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Announcements for Parents */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Thông báo từ nhà trường</h3>
            <div className="space-y-2">
              {announcements.slice(0, 2).map(a => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <div className="font-bold text-slate-900 line-clamp-1">{a.title}</div>
                  <p className="text-slate-500 text-[11px] line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
