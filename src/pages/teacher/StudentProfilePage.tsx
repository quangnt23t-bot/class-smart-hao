import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../../data/storage';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  HeartHandshake,
  MessageSquare,
  TrendingUp,
  Plus,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const student = StorageService.getStudentById(id || 's_1');
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'assignments' | 'behavior' | 'rewards' | 'feedback' | 'alerts' | 'parent'>('overview');

  // Quick Action Modal states
  const [isBehaviorModalOpen, setIsBehaviorModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [behaviorType, setBehaviorType] = useState<'positive' | 'reminder'>('positive');
  const [behaviorCategory, setBehaviorCategory] = useState('Phát biểu xây dựng bài');
  const [behaviorPoints, setBehaviorPoints] = useState(5);
  const [behaviorNote, setBehaviorNote] = useState('');

  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không tìm thấy hồ sơ học sinh.
        <button onClick={() => navigate('/teacher/students')} className="text-blue-600 underline ml-2">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Linked records
  const grades = StorageService.getGrades().find(g => g.studentId === student.id);
  const attendanceRecords = StorageService.getAttendance().filter(a => a.studentId === student.id);
  const submissions = StorageService.getSubmissions(undefined, student.id);
  const behaviors = StorageService.getBehaviors(undefined, student.id);
  const alerts = StorageService.getAlerts().filter(a => a.studentId === student.id);
  const studentGuardians = StorageService.getGuardians(undefined, student.id);

  const handleAddBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addBehavior({
      classId: student.classId,
      studentId: student.id,
      studentName: student.name,
      type: behaviorType,
      category: behaviorCategory,
      points: behaviorType === 'positive' ? Math.abs(behaviorPoints) : -Math.abs(behaviorPoints),
      date: new Date().toLocaleString('vi-VN'),
      teacherId: 'u_teacher_1',
      teacherName: 'Cô Nguyễn Thị Lan',
      note: behaviorNote
    });
    success(`Đã ghi nhận ${behaviorType === 'positive' ? 'điểm cộng' : 'nhắc nhở'} cho ${student.name}`);
    setIsBehaviorModalOpen(false);
    setBehaviorNote('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTitle.trim() || !messageContent.trim()) {
      error('Vui lòng điền đủ thông tin');
      return;
    }
    StorageService.addAnnouncement({
      title: `[Gửi PH ${student.name}] ${messageTitle.trim()}`,
      content: messageContent.trim(),
      senderName: 'Cô Nguyễn Thị Lan',
      senderRole: 'Giáo viên chủ nhiệm',
      target: 'parents',
      priority: 'important'
    });
    success(`Đã gửi thông báo riêng đến phụ huynh của ${student.name}!`);
    setIsMessageModalOpen(false);
    setMessageTitle('');
    setMessageContent('');
  };

  const tabs = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'grades', label: 'Bảng điểm' },
    { key: 'attendance', label: `Chuyên cần (${attendanceRecords.length})` },
    { key: 'assignments', label: `Bài tập (${submissions.length})` },
    { key: 'behavior', label: `Hành vi (${behaviors.length})` },
    { key: 'rewards', label: 'Thi đua & Huy hiệu' },
    { key: 'feedback', label: 'Nhận xét' },
    { key: 'alerts', label: `Cảnh báo (${alerts.length})` },
    { key: 'parent', label: 'Phụ huynh' }
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/teacher/students')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại danh sách học sinh</span>
      </button>

      {/* 360° Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{student.name}</h1>
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                  {student.studentCode}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Đang học
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                <span>Lớp: <strong className="text-slate-800">{student.className}</strong> (Tổ {student.groupNumber || 1})</span>
                <span>·</span>
                <span>Giới tính: <strong>{student.gender}</strong></span>
                <span>·</span>
                <span>Sinh ngày: <strong>{student.birthDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBehaviorModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi nhận hành vi</span>
            </button>
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-blue-600" />
              <span>Nhắn tin phụ huynh</span>
            </button>
          </div>
        </div>

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">Điểm trung bình</span>
            <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">{student.averageScore} / 10</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">Tỷ lệ chuyên cần</span>
            <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">{student.attendanceRate}%</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">Bài tập hoàn thành</span>
            <div className="text-xl font-bold text-indigo-600 font-mono mt-0.5">
              {student.completedAssignments} / {student.totalAssignments || 15}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">Điểm thi đua cá nhân</span>
            <div className="text-xl font-bold text-amber-600 font-mono mt-0.5">{student.rewardPoints} đ</div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-200 overflow-x-auto text-xs font-medium">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-3.5 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="md:col-span-2 space-y-6">
            {/* Badges collection */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Huy hiệu thành tích đạt được</h3>
              <div className="flex flex-wrap gap-2">
                {student.badges.map((b, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recent activity timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Dòng sự kiện hoạt động gần đây</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Điểm danh có mặt buổi sáng</div>
                    <div className="text-[11px] text-slate-400">Hôm nay 07:35 · Ghi nhận bởi Cô Lan</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Đạt 9.5 điểm Bài tập số 04</div>
                    <div className="text-[11px] text-slate-400">02/10/2026 · Nhận xét: Trình bày sạch đẹp và logic</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Nhận +5 điểm thi đua phát biểu bài</div>
                    <div className="text-[11px] text-slate-400">01/10/2026 · Xung phong giải bài tập khó</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick info card */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Thông tin liên hệ</h3>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{student.phone || 'Chưa có số riêng'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{student.email || 'ducanh@smartclass.edu.vn'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{student.address || 'Hà Nội'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GRADES */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Chi tiết điểm số học kỳ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500">TX 1</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{grades?.tx1 ?? '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500">TX 2</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{grades?.tx2 ?? '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500">TX 3</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{grades?.tx3 ?? '—'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500">TX 4</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{grades?.tx4 ?? '—'}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[11px] text-blue-700 font-semibold">Giữa kỳ (GK)</span>
              <div className="text-lg font-bold text-blue-700 mt-1">{grades?.gk ?? '—'}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[11px] text-purple-700 font-semibold">Cuối kỳ (CK)</span>
              <div className="text-lg font-bold text-purple-700 mt-1">{grades?.ck ?? '—'}</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
            <strong>Ghi chú giáo viên:</strong> {grades?.note || 'Học sinh tiếp thu tốt, cần duy trì phong độ.'}
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-xs">
            Lịch sử điểm danh chi tiết
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {attendanceRecords.length > 0 ? (
              attendanceRecords.map(a => (
                <div key={a.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{a.date}</span>
                    <span className="text-slate-800 font-medium">{a.period}</span>
                    {a.note && <span className="text-slate-400">({a.note})</span>}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded font-semibold text-[11px] ${
                      a.status === 'present'
                        ? 'bg-emerald-50 text-emerald-700'
                        : a.status === 'late'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {a.status === 'present' ? 'Có mặt' : a.status === 'late' ? 'Đi trễ' : 'Nghỉ học'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">Chưa có lịch sử vắng hoặc trễ.</div>
            )}
          </div>
        </div>
      )}

      {/* 4. ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-xs">
            Bài tập đã nộp & Điểm số
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {submissions.map(sub => (
              <div key={sub.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{sub.studentName} - Bài nộp</span>
                  <span className="font-bold text-emerald-600">{sub.score ? `${sub.score} / 10 điểm` : 'Chưa chấm'}</span>
                </div>
                <p className="text-slate-500 text-[11px]">{sub.content}</p>
                {sub.feedback && (
                  <div className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded">
                    <strong>Nhận xét:</strong> {sub.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BEHAVIOR */}
      {activeTab === 'behavior' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Sổ ghi nhận nề nếp & hành vi</h3>
            <button
              onClick={() => setIsBehaviorModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi nhận mới</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {behaviors.map(b => (
              <div
                key={b.id}
                className={`p-3 rounded-xl border flex items-start justify-between ${
                  b.type === 'positive' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">{b.category}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.note}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{b.date} · Ghi nhận: {b.teacherName}</div>
                </div>
                <span
                  className={`font-mono font-bold text-sm ${
                    b.points > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {b.points > 0 ? `+${b.points}` : b.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PARENT INFO */}
      {activeTab === 'parent' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs text-xs space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Ba mẹ & Người giám hộ ({studentGuardians.length})
            </h3>
            <button
              onClick={() => navigate('/teacher/parents')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              <span>Quản lý toàn bộ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {studentGuardians.length > 0 ? (
              studentGuardians.map(g => (
                <div key={g.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{g.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {g.relationship}
                      </span>
                      {g.isPrimary && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Liên hệ chính
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 font-mono text-blue-600 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${g.phone}`} className="hover:underline">
                        {g.phone}
                      </a>
                    </div>
                    {g.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${g.email}`} className="hover:underline truncate">
                          {g.email}
                        </a>
                      </div>
                    )}
                    {g.job && (
                      <div className="text-slate-500">
                        <strong>Nghề nghiệp:</strong> {g.job}
                      </div>
                    )}
                    {g.address && (
                      <div className="text-slate-500">
                        <strong>Địa chỉ:</strong> {g.address}
                      </div>
                    )}
                  </div>

                  {g.note && (
                    <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60 italic">
                      Ghi chú: {g.note}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                <p>Học sinh này chưa có thông tin ba mẹ trong hệ thống.</p>
                <button
                  onClick={() => navigate('/teacher/parents')}
                  className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm phụ huynh
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMessageModalOpen(true)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Gửi thông báo riêng đến phụ huynh</span>
          </button>
        </div>
      )}

      {/* QUICK MODAL: GHI NHẬN HÀNH VI */}
      <Modal
        isOpen={isBehaviorModalOpen}
        onClose={() => setIsBehaviorModalOpen(false)}
        title={`Ghi nhận hành vi cho ${student.name}`}
      >
        <form onSubmit={handleAddBehavior} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Loại ghi nhận</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBehaviorType('positive');
                  setBehaviorCategory('Phát biểu xây dựng bài');
                  setBehaviorPoints(5);
                }}
                className={`py-2 rounded-lg font-semibold border ${
                  behaviorType === 'positive'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                + Tích cực / Khen thưởng
              </button>
              <button
                type="button"
                onClick={() => {
                  setBehaviorType('reminder');
                  setBehaviorCategory('Nói chuyện riêng');
                  setBehaviorPoints(2);
                }}
                className={`py-2 rounded-lg font-semibold border ${
                  behaviorType === 'reminder'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                - Cần nhắc nhở
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Hành vi cụ thể</label>
            <select
              value={behaviorCategory}
              onChange={e => setBehaviorCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {behaviorType === 'positive' ? (
                <>
                  <option value="Phát biểu xây dựng bài">Phát biểu xây dựng bài (+5đ)</option>
                  <option value="Giúp bạn vượt khó">Giúp bạn vượt khó (+5đ)</option>
                  <option value="Bài tập điểm 10">Bài tập đạt điểm tuyệt đối (+10đ)</option>
                  <option value="Tiến bộ vượt bậc">Tiến bộ vượt bậc tuần này (+5đ)</option>
                </>
              ) : (
                <>
                  <option value="Nói chuyện riêng">Nói chuyện riêng trong giờ (-2đ)</option>
                  <option value="Quên mang bài tập">Quên mang bài tập về nhà (-3đ)</option>
                  <option value="Không tập trung">Không chú ý lắng nghe giảng bài (-2đ)</option>
                  <option value="Đi trễ không phép">Đi trễ không phép (-3đ)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ghi chú chi tiết</label>
            <textarea
              rows={3}
              value={behaviorNote}
              onChange={e => setBehaviorNote(e.target.value)}
              placeholder="Nhập tình huống xảy ra..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBehaviorModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Lưu ghi nhận
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL: SEND MESSAGE TO PARENT */}
      <Modal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        title={`Gửi tin nhắn đến Phụ huynh của ${student.name}`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tiêu đề tin nhắn *</label>
            <input
              type="text"
              required
              placeholder="VD: Thông báo tình hình học tập tuần này..."
              value={messageTitle}
              onChange={e => setMessageTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nội dung trao đổi *</label>
            <textarea
              rows={4}
              required
              placeholder="Kính gửi quý phụ huynh, cô xin trao đổi về..."
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMessageModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Gửi tin nhắn ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
