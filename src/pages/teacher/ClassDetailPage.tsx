import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService, canUserEditClass } from '../../data/storage';
import { Modal } from '../../components/common/Modal';
import { AddStudentModal } from '../../components/students/AddStudentModal';
import { EditClassNameModal } from '../../components/classes/EditClassNameModal';
import { InteractiveTimetable } from '../../components/schedule/InteractiveTimetable';
import {
  Users,
  CheckCircle2,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  BarChart2,
  Plus,
  Settings,
  Copy,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Search,
  Clock,
  Sparkles,
  Pencil
} from 'lucide-react';

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes, refreshData } = useClass();
  const { success, error } = useToast();

  const classRoom = classes.find(c => c.id === id) || classes[0];
  const activeTab = searchParams.get('tab') || 'overview';

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);

  const students = classRoom ? StorageService.getStudents(classRoom.id) : [];
  const assignments = classRoom ? StorageService.getAssignments(classRoom.id) : [];
  const attendance = classRoom ? StorageService.getAttendance(classRoom.id) : [];
  const grades = classRoom ? StorageService.getGrades(classRoom.id) : [];
  const schedule = classRoom ? StorageService.getSchedule(classRoom.id) : [];

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  const handleCopyCode = () => {
    if (classRoom?.joinCode) {
      navigator.clipboard.writeText(classRoom.joinCode);
      success(`Đã sao chép mã lớp: ${classRoom.joinCode}`);
    }
  };

  if (!classRoom) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không tìm thấy lớp học.
        <Link to="/teacher/classes" className="text-blue-600 underline ml-2">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Tổng quan', icon: BarChart2 },
    { key: 'students', label: `Học sinh (${students.length})`, icon: Users },
    { key: 'attendance', label: 'Điểm danh', icon: CheckCircle2 },
    { key: 'assignments', label: `Bài tập (${assignments.length})`, icon: FileText },
    { key: 'grades', label: 'Sổ điểm', icon: TrendingUp },
    { key: 'rewards', label: 'Thi đua', icon: Award },
    { key: 'schedule', label: 'Thời khóa biểu', icon: Calendar },
    { key: 'reports', label: 'Báo cáo', icon: BarChart2 }
  ];

  return (
    <div className="space-y-6">
      {/* Class Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{classRoom.grade}</span>
              <span>·</span>
              <span>Năm học {classRoom.academicYear}</span>
              <span>·</span>
              <span className="font-semibold text-blue-600">{classRoom.subject}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{classRoom.name}</h1>
                {canUserEditClass(user, classRoom) && (
                  <button
                    type="button"
                    onClick={() => setIsEditNameOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa tên lớp"
                    aria-label={`Chỉnh sửa tên lớp ${classRoom.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-slate-200">
                <span>Mã: {classRoom.joinCode}</span>
                <button onClick={handleCopyCode} className="hover:text-blue-600 transition-colors" title="Sao chép">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {classRoom.description} · Phòng: <strong>{classRoom.room}</strong> · Giáo viên:{' '}
              <strong>{classRoom.teacherName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh</span>
            </button>
            <button
              onClick={() => navigate(`/teacher/attendance?classId=${classRoom.id}`)}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Điểm danh</span>
            </button>
          </div>
        </div>

        {/* 8 Workspace Tabs */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-200 overflow-x-auto text-xs font-medium">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Chỉ số nổi bật của lớp {classRoom.name}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Sĩ số lớp</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{students.length} HS</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Chuyên cần trung bình</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{classRoom.attendanceRate}%</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Điểm TB toàn lớp</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">8.5</div>
                </div>
              </div>
            </div>

            {/* Quick Students preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Danh sách học sinh tiêu biểu</h3>
                <button
                  onClick={() => handleTabChange('students')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Xem tất cả {students.length} học sinh →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {students.slice(0, 4).map(s => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/teacher/students/${s.id}`)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={s.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">Mã: {s.studentCode} · Điểm TB: {s.averageScore}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar of Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Thao tác lớp học</h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => navigate(`/teacher/attendance?classId=${classRoom.id}`)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>Điểm danh tiết này</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => navigate(`/teacher/assignments?classId=${classRoom.id}`)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>Giao bài tập cho lớp</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => navigate(`/teacher/grades?classId=${classRoom.id}`)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>Mở sổ điểm điện tử</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => navigate(`/teacher/tools/wheel?classId=${classRoom.id}`)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>Vòng quay gọi học sinh</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="font-bold text-slate-900 text-sm">
              Danh sách học sinh lớp {classRoom.name} ({students.length})
            </div>
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm học sinh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã HS</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Tổ</th>
                  <th className="py-3 px-4">Chuyên cần</th>
                  <th className="py-3 px-4">Điểm TB</th>
                  <th className="py-3 px-4">Phụ huynh</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{s.studentCode}</td>
                    <td className="py-3 px-4">
                      <div
                        onClick={() => navigate(`/teacher/students/${s.id}`)}
                        className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                      >
                        <img src={s.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">Tổ {s.groupNumber || 1}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{s.attendanceRate}%</td>
                    <td className="py-3 px-4 font-bold text-blue-600">{s.averageScore}</td>
                    <td className="py-3 px-4 text-slate-500">{s.parentName || 'Chưa cập nhật'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/teacher/students/${s.id}`)}
                        className="px-2.5 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md font-semibold transition-colors"
                      >
                        Hồ sơ 360°
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance shortcut */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Điểm danh lớp {classRoom.name}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Giao diện điểm danh được tối ưu cho cả điện thoại di động và máy tính với các trạng thái Có mặt, Có phép, Không phép, Đi trễ.
          </p>
          <button
            onClick={() => navigate(`/teacher/attendance?classId=${classRoom.id}`)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Mở sổ điểm danh lớp {classRoom.name}
          </button>
        </div>
      )}

      {/* Tab 4: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Danh sách bài tập lớp {classRoom.name}</h3>
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Giao bài mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs text-xs space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{a.title}</h4>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Thang {a.maxScore}đ
                  </span>
                </div>
                <p className="text-slate-500 line-clamp-2">{a.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-400 text-[11px]">
                  <span>Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</span>
                  <span className="font-semibold text-slate-700">Đã nộp: {a.totalSubmissions}/{students.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Grades shortcut */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-center">
          <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Bảng điểm lớp {classRoom.name}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Sổ điểm điện tử dạng spreadsheet với các cột TX1, TX2, GK, CK, tự động tính điểm trung bình và hỗ trợ nhập trực tiếp bằng phím Enter / Tab.
          </p>
          <button
            onClick={() => navigate(`/teacher/grades?classId=${classRoom.id}`)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Mở sổ điểm spreadsheet
          </button>
        </div>
      )}

      {/* Tab 6: Rewards */}
      {activeTab === 'rewards' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Bảng xếp hạng thi đua lớp {classRoom.name}</h3>
          <div className="space-y-2">
            {students.slice(0, 5).map((s, idx) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <div className="text-[10px] text-slate-400">{s.badges.join(' · ')}</div>
                  </div>
                </div>
                <span className="font-bold text-blue-600">{s.rewardPoints} điểm</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Schedule */}
      {activeTab === 'schedule' && (
        <InteractiveTimetable initialClassId={classRoom.id} hideClassSelector={true} />
      )}

      {/* Tab 8: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-center">
          <BarChart2 className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Báo cáo tổng hợp lớp {classRoom.name}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Xuất báo cáo PDF, Excel với biểu đồ học lực, chuyên cần và nhận xét cho buổi họp phụ huynh.
          </p>
          <button
            onClick={() => navigate(`/teacher/reports?classId=${classRoom.id}`)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Xem báo cáo chi tiết
          </button>
        </div>
      )}

      {/* Modal Thêm từng học sinh */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        classId={classRoom.id}
        className={classRoom.name}
        onSuccess={() => refreshData()}
      />

      {/* Modal Chỉnh sửa tên lớp */}
      {isEditNameOpen && (
        <EditClassNameModal
          isOpen={isEditNameOpen}
          onClose={() => setIsEditNameOpen(false)}
          classId={classRoom.id}
          currentName={classRoom.name}
          onSuccess={() => refreshData()}
        />
      )}
    </div>
  );
};
