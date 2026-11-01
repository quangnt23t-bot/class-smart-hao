import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Modal } from '../components/common/Modal';
import { useClass } from '../contexts/ClassContext';
import { useToast } from '../contexts/ToastContext';
import { StorageService } from '../data/storage';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<'class' | 'student' | 'assignment' | 'announcement' | null>(null);

  const { addClass, refreshData, selectedClassId } = useClass();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Quick form states
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('Khối 6');
  const [newClassSubject, setNewClassSubject] = useState('Toán học');
  const [newClassRoom, setNewClassRoom] = useState('Phòng 204');
  const [newClassDesc, setNewClassDesc] = useState('');

  const [studentCode, setStudentCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGender, setStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgMaxScore, setAsgMaxScore] = useState(10);

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      error('Vui lòng nhập tên lớp học');
      return;
    }
    const created = addClass({
      name: newClassName.trim(),
      grade: newClassGrade,
      subject: newClassSubject,
      academicYear: '2025 - 2026',
      room: newClassRoom,
      description: newClassDesc || `Lớp môn ${newClassSubject} - ${newClassName}`,
      teacherId: 'u_teacher_1',
      teacherName: 'Cô Nguyễn Thị Lan',
      totalStudents: 0,
      joinCode: `SMART-${newClassName.toUpperCase().replace(/\s+/g, '')}`,
      themeColor: 'blue',
      status: 'active',
      attendanceRate: 100,
      pendingAssignmentsCount: 0,
      alertCount: 0
    });
    success(`Đã tạo thành công lớp ${created.name}!`);
    setQuickCreateType(null);
    setNewClassName('');
    setNewClassDesc('');
    navigate(`/teacher/classes/${created.id}`);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentCode.trim()) {
      error('Vui lòng nhập họ tên và mã học sinh');
      return;
    }
    const curClass = StorageService.getClassById(selectedClassId);
    StorageService.addStudent({
      studentCode: studentCode.trim().toUpperCase(),
      name: studentName.trim(),
      gender: studentGender,
      birthDate: '2013-05-15',
      classId: selectedClassId,
      className: curClass ? curClass.name : '6A1',
      groupNumber: 1,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
      phone: studentPhone,
      parentName: parentName,
      parentPhone: parentPhone,
      status: 'active'
    });
    refreshData();
    success(`Đã thêm học sinh ${studentName} vào lớp ${curClass?.name || ''}`);
    setQuickCreateType(null);
    setStudentName('');
    setStudentCode('');
    setStudentPhone('');
    setParentName('');
    setParentPhone('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgDueDate) {
      error('Vui lòng nhập tiêu đề bài tập và hạn nộp');
      return;
    }
    const curClass = StorageService.getClassById(selectedClassId);
    StorageService.addAssignment({
      classId: selectedClassId,
      className: curClass?.name || '6A1',
      title: asgTitle.trim(),
      description: asgDesc,
      dueDate: asgDueDate,
      assignedDate: new Date().toISOString(),
      maxScore: Number(asgMaxScore) || 10,
      status: 'published',
      targetType: 'all'
    });
    refreshData();
    success(`Đã giao bài tập thành công cho lớp ${curClass?.name}!`);
    setQuickCreateType(null);
    setAsgTitle('');
    setAsgDesc('');
    navigate('/teacher/assignments');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      error('Vui lòng nhập tiêu đề và nội dung thông báo');
      return;
    }
    StorageService.addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      senderName: 'Cô Nguyễn Thị Lan',
      senderRole: 'Giáo viên',
      target: 'class',
      targetClassId: selectedClassId,
      priority: annPriority
    });
    success('Đã gửi thông báo thành công!');
    setQuickCreateType(null);
    setAnnTitle('');
    setAnnContent('');
    navigate('/teacher/announcements');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenQuickCreate={type => setQuickCreateType(type)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-4 flex-1">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>

      {/* QUICK MODAL: CREATE CLASS */}
      <Modal
        isOpen={quickCreateType === 'class'}
        onClose={() => setQuickCreateType(null)}
        title="Tạo lớp học mới"
        subtitle="Thiết lập phòng học, khối lớp và môn giảng dạy"
      >
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tên lớp học *</label>
            <input
              type="text"
              required
              placeholder="VD: 6A3, 7A2, 8A1..."
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Khối lớp</label>
              <select
                value={newClassGrade}
                onChange={e => setNewClassGrade(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-white text-slate-800"
              >
                <option value="Khối 6">Khối 6</option>
                <option value="Khối 7">Khối 7</option>
                <option value="Khối 8">Khối 8</option>
                <option value="Khối 9">Khối 9</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Môn học</label>
              <input
                type="text"
                value={newClassSubject}
                onChange={e => setNewClassSubject(e.target.value)}
                placeholder="Toán, Ngữ văn, Anh..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Phòng học</label>
            <input
              type="text"
              value={newClassRoom}
              onChange={e => setNewClassRoom(e.target.value)}
              placeholder="Phòng 204 - Nhà A"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mô tả lớp</label>
            <textarea
              rows={2}
              value={newClassDesc}
              onChange={e => setNewClassDesc(e.target.value)}
              placeholder="Nhập thông tin giới thiệu ngắn về lớp..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuickCreateType(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-xs"
            >
              Tạo lớp ngay
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL: ADD STUDENT */}
      <Modal
        isOpen={quickCreateType === 'student'}
        onClose={() => setQuickCreateType(null)}
        title="Thêm học sinh mới"
        subtitle="Hồ sơ học sinh sẽ được lưu vào danh sách lớp hiện tại"
      >
        <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mã học sinh *</label>
              <input
                type="text"
                required
                placeholder="VD: HS011"
                value={studentCode}
                onChange={e => setStudentCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Giới tính</label>
              <select
                value={studentGender}
                onChange={e => setStudentGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Họ và tên học sinh *</label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Họ tên phụ huynh</label>
              <input
                type="text"
                placeholder="Nguyễn Văn B"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SĐT liên hệ</label>
              <input
                type="text"
                placeholder="0912 345 678"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuickCreateType(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Lưu học sinh
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL: CREATE ASSIGNMENT */}
      <Modal
        isOpen={quickCreateType === 'assignment'}
        onClose={() => setQuickCreateType(null)}
        title="Giao bài tập mới"
        subtitle="Học sinh sẽ nhận được thông báo nộp bài qua cổng cá nhân"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tiêu đề bài tập *</label>
            <input
              type="text"
              required
              placeholder="VD: Bài tập số học 05..."
              value={asgTitle}
              onChange={e => setAsgTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hạn nộp bài *</label>
              <input
                type="datetime-local"
                required
                value={asgDueDate}
                onChange={e => setAsgDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Thang điểm tối đa</label>
              <input
                type="number"
                min={1}
                max={100}
                value={asgMaxScore}
                onChange={e => setAsgMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Yêu cầu & Nội dung</label>
            <textarea
              rows={3}
              placeholder="Ghi rõ hướng dẫn làm bài, số trang SGK hoặc lưu ý nộp..."
              value={asgDesc}
              onChange={e => setAsgDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuickCreateType(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Giao bài ngay
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL: SEND ANNOUNCEMENT */}
      <Modal
        isOpen={quickCreateType === 'announcement'}
        onClose={() => setQuickCreateType(null)}
        title="Gửi thông báo lớp học"
        subtitle="Gửi thông báo đến học sinh và phụ huynh"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              placeholder="VD: Lịch thi giữa kỳ, Nhắc nhở nộp bài..."
              value={annTitle}
              onChange={e => setAnnTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mức độ ưu tiên</label>
            <select
              value={annPriority}
              onChange={e => setAnnPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="normal">Bình thường</option>
              <option value="important">Quan trọng</option>
              <option value="urgent">Khẩn cấp</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nội dung thông báo *</label>
            <textarea
              rows={4}
              required
              placeholder="Nhập chi tiết nội dung cần thông báo..."
              value={annContent}
              onChange={e => setAnnContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuickCreateType(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Phát thông báo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
