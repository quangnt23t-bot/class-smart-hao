import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../data/storage';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Find student profile linked to this user (Trần Đức Anh - s_1)
  const student = StorageService.getStudentById('s_1')!;
  const assignments = StorageService.getAssignments(student.classId);
  const mySubmissions = StorageService.getSubmissions(undefined, student.id);
  const myGrades = StorageService.getGrades().find(g => g.studentId === student.id);
  const announcements = StorageService.getAnnouncements();

  const dueAssignments = assignments.filter(
    a => !mySubmissions.some(s => s.assignmentId === a.id)
  );

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Cổng học tập học sinh · Lớp {student.className}
          </span>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            Chào {student.name}! ✨
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl leading-relaxed">
            Hôm nay bạn có <strong>{dueAssignments.length} bài tập</strong> cần hoàn thành và đạt <strong>{student.rewardPoints} điểm thi đua</strong>. Hãy tiếp tục giữ vững phong độ nhé!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/assignments')}
            className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            Làm bài tập ngay
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div
          onClick={() => navigate('/student/grades')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Điểm TB học tập</span>
          <div className="text-2xl font-bold text-blue-600 font-mono mt-1">{student.averageScore} / 10</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Xếp loại: Xuất sắc</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/student/attendance')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Chuyên cần</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{student.attendanceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Đầy đủ các buổi học</div>
        </div>

        <div
          onClick={() => navigate('/student/assignments')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Bài tập cần nộp</span>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">{dueAssignments.length} bài</div>
          <div className="text-[11px] text-slate-400 mt-1">Hạn nộp tuần này</div>
        </div>

        <div
          onClick={() => navigate('/student/achievements')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Điểm thi đua cá nhân</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{student.rewardPoints} đ</div>
          <div className="text-[11px] text-slate-400 mt-1">{student.badges.length} huy hiệu đạt được</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Homework & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Due Assignments */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Bài tập cần làm ({dueAssignments.length})</span>
              </h3>
              <button
                onClick={() => navigate('/student/assignments')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>

            <div className="space-y-3">
              {dueAssignments.map(asg => (
                <div
                  key={asg.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{asg.title}</h4>
                    <p className="text-slate-500 mt-0.5 line-clamp-1">{asg.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hạn chót: {new Date(asg.dueDate).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/student/assignments')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shrink-0 shadow-xs"
                  >
                    Nộp bài
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Lịch học hôm nay</span>
              </h3>
              <button
                onClick={() => navigate('/student/schedule')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Thời khóa biểu tuần →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Tiết 1 - 2: Toán học</span>
                  <div className="text-slate-500">07:30 - 09:10 · Phòng 204 (Cô Lan)</div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Đã hoàn thành
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Tiết 3: Ngữ văn</span>
                  <div className="text-slate-500">09:15 - 10:00 · Phòng 204 (Thầy Bình)</div>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Sắp diễn ra
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Badges & Announcements */}
        <div className="space-y-6">
          {/* My Badges */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Huy hiệu của bạn</span>
            </h3>

            <div className="flex flex-wrap gap-2 text-xs">
              {student.badges.map((b, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{b}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Thông báo lớp học</h3>
            <div className="space-y-2 text-xs">
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
