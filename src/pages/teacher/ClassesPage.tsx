import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { ClassRoom } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Modal } from '../../components/common/Modal';
import { AddStudentModal } from '../../components/students/AddStudentModal';
import {
  Home,
  ChevronRight,
  Plus,
  Search,
  MoreVertical,
  Users,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Archive,
  Trash2,
  Edit2,
  Download,
  School,
  ExternalLink,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  X,
  Check
} from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, archiveClass, setSelectedClassId } = useClass();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusTab, setStatusTab] = useState<'active' | 'archived'>('active');

  // Modals & Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);
  const [classToEdit, setClassToEdit] = useState<ClassRoom | null>(null);
  const [classForAddStudent, setClassForAddStudent] = useState<ClassRoom | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Class Form State
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Khối 10');
  const [subject, setSubject] = useState('Toán học');
  const [room, setRoom] = useState('Phòng 101 - Nhà A');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [description, setDescription] = useState('');
  const [isHomeroom, setIsHomeroom] = useState(false);

  // Extract available grades dynamically
  const gradeOptions = ['all', 'Khối 10', 'Khối 11', 'Khối 12', 'Khối 6', 'Khối 7'];

  // Filtered classes
  const filtered = classes.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.room.toLowerCase().includes(search.toLowerCase()) ||
      c.joinCode.toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter === 'all' || c.grade === gradeFilter;
    const matchStatus = c.status === statusTab;
    return matchSearch && matchGrade && matchStatus;
  });

  const activeCount = classes.filter(c => c.status === 'active').length;
  const archivedCount = classes.filter(c => c.status === 'archived').length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Vui lòng nhập tên lớp học');
      return;
    }

    const fullSubject = isHomeroom ? `${subject.trim()} (Chủ nhiệm)` : subject.trim();
    const created = addClass({
      name: name.trim(),
      grade,
      subject: fullSubject,
      academicYear,
      room,
      description: description.trim() || `Lớp học bộ môn ${fullSubject} - ${name.trim()}`,
      teacherId: 'u_teacher_1',
      teacherName: 'Cô Nguyễn Thị Lan',
      totalStudents: 35,
      joinCode: `SMART-${name.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
      themeColor: 'blue',
      status: 'active',
      attendanceRate: 100,
      pendingAssignmentsCount: 0,
      alertCount: 0
    });

    success(`Đã tạo thành công ${created.name}!`);
    setIsCreateOpen(false);
    setName('');
    setDescription('');
    setSelectedClassId(created.id);
    navigate(`/teacher/classes/${created.id}`);
  };

  const handleDuplicate = (c: ClassRoom) => {
    const dup = addClass({
      ...c,
      name: `${c.name} (Bản sao)`,
      joinCode: `SMART-${Date.now().toString().slice(-4)}`
    });
    success(`Đã nhân bản lớp ${c.name}!`);
    setActiveMenuId(null);
  };

  const handleExportRoster = (c: ClassRoom) => {
    const csvContent = `Mã lớp,Tên lớp,Khối,Môn học,Phòng,Năm học,Sĩ số,Chuyên cần\n"${c.id}","${c.name}","${c.grade}","${c.subject}","${c.room}","${c.academicYear}","${c.totalStudents}","${c.attendanceRate}%"`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_${c.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    success(`Đã xuất danh sách lớp ${c.name}!`);
    setActiveMenuId(null);
  };

  const handleOpenWorkspace = (classId: string) => {
    setSelectedClassId(classId);
    navigate(`/teacher/classes/${classId}`);
  };

  return (
    <div className="space-y-5" onClick={() => setActiveMenuId(null)}>
      {/* 4. BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-400 py-0.5">
        <Link
          to="/teacher/dashboard"
          className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
          title="Trang chủ"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-500">Lớp học</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="font-semibold text-slate-700">Lớp của tôi</span>
      </nav>

      {/* 5. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Quản lý Lớp học
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Toàn bộ danh sách các lớp phụ trách giảng dạy và chủ nhiệm trong năm học
          </p>
        </div>

        {/* Primary Action [+ Thêm mới lớp] in Header */}
        <button
          onClick={e => {
            e.stopPropagation();
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm mới lớp</span>
        </button>
      </div>

      {/* TAB ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Active Tab: Lớp của tôi [count] */}
          <button
            onClick={() => setStatusTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              statusTab === 'active'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Lớp của tôi</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                statusTab === 'active' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {activeCount}
            </span>
          </button>

          {/* Archived Tab */}
          <button
            onClick={() => setStatusTab('archived')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              statusTab === 'archived'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span>Đã lưu trữ</span>
            {archivedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                {archivedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp học, môn học, phòng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grade Segmented Control: Tất cả khối | Khối 10 | Khối 11 | Khối 12 | ... */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {gradeOptions.map(g => {
            const isSelected = gradeFilter === g;
            const label = g === 'all' ? 'Tất cả khối' : g;
            return (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CLASS CARDS GRID (3 Columns Desktop, 2 Columns Tablet, 1 Column Mobile) */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => {
            const isHomeroomClass = c.subject.toLowerCase().includes('chủ nhiệm');

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Accent top line */}
                <div
                  className={`h-1.5 w-full ${
                    isHomeroomClass
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
                      : 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500'
                  }`}
                />

                <div className="p-5 flex-1 flex flex-col">
                  {/* Card Header: Title, Badge & Menu */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          onClick={() => handleOpenWorkspace(c.id)}
                          className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors cursor-pointer truncate tracking-tight"
                        >
                          {c.name}
                        </h3>

                        {isHomeroomClass ? (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                            Chủ nhiệm
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            Bộ môn
                          </span>
                        )}

                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          {c.grade}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                        {c.subject}
                      </div>
                    </div>

                    {/* Menu Button (⋮) */}
                    <div className="relative shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === c.id ? null : c.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Tùy chọn lớp"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === c.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              handleOpenWorkspace(c.id);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                          >
                            <School className="w-3.5 h-3.5 text-blue-600" />
                            <span>Mở workspace lớp</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setClassForAddStudent(c);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                            <span>Thêm học sinh</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/teacher/attendance?classId=${c.id}`);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Điểm danh hôm nay</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setClassToEdit(c);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Sửa thông tin</span>
                          </button>

                          <button
                            onClick={() => handleDuplicate(c)}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Sao chép lớp</span>
                          </button>

                          <button
                            onClick={() => handleExportRoster(c)}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>Xuất danh sách (CSV)</span>
                          </button>

                          <button
                            onClick={() => {
                              archiveClass(c.id);
                              success(`Đã ${c.status === 'archived' ? 'mở lại' : 'lưu trữ'} ${c.name}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                          >
                            <Archive className="w-3.5 h-3.5 text-slate-500" />
                            <span>{c.status === 'archived' ? 'Bỏ lưu trữ' : 'Lưu trữ lớp'}</span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setClassToDelete(c);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa lớp học</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room & Academic Year */}
                  <div className="flex items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.room}</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <span>Mã:</span>
                      <strong className="text-slate-700">{c.joinCode}</strong>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {c.description}
                  </p>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-100 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Sĩ số</span>
                      <strong className="text-xs font-bold text-slate-900 mt-0.5 block font-mono">
                        {c.totalStudents} HS
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Chuyên cần</span>
                      <strong className="text-xs font-bold text-emerald-600 mt-0.5 block font-mono">
                        {c.attendanceRate}%
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Bài chưa nộp</span>
                      <strong className="text-xs font-bold text-amber-600 mt-0.5 block font-mono">
                        {c.pendingAssignmentsCount}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Cảnh báo</span>
                      <strong
                        className={`text-xs font-bold mt-0.5 block font-mono ${
                          c.alertCount > 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {c.alertCount}
                      </strong>
                    </div>
                  </div>

                  {/* Card Footer: [ Mở workspace ] */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenWorkspace(c.id)}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 group-hover:bg-blue-600 shadow-xs cursor-pointer"
                    >
                      <span>Mở workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <School className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy lớp học nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Không có lớp nào phù hợp với từ khóa "{search}" hoặc bộ lọc {gradeFilter !== 'all' ? gradeFilter : ''}.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSearch('');
                setGradeFilter('all');
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Thêm mới lớp
            </button>
          </div>
        </div>
      )}

      {/* MODAL: THÊM MỚI LỚP */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm mới lớp học"
        subtitle="Khởi tạo thông tin cơ bản cho lớp học mới trong năm học"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tên lớp học *</label>
            <input
              type="text"
              required
              placeholder="VD: Lớp 10A1, 10A2, 11B1, 12A3..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Khối lớp</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800"
              >
                <option value="Khối 10">Khối 10</option>
                <option value="Khối 11">Khối 11</option>
                <option value="Khối 12">Khối 12</option>
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
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Toán học, Vật lý..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phòng học</label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="Phòng 101 - Nhà A"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Năm học</label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                placeholder="2025 - 2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={isHomeroom}
                onChange={e => setIsHomeroom(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="font-semibold text-slate-700">Đây là lớp chủ nhiệm của tôi</span>
            </label>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mô tả lớp học</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Giới thiệu ban chuyên, mục tiêu học tập của lớp..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Tạo lớp ngay
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SỬA THÔNG TIN LỚP */}
      {classToEdit && (
        <Modal
          isOpen={!!classToEdit}
          onClose={() => setClassToEdit(null)}
          title={`Sửa thông tin: ${classToEdit.name}`}
          subtitle="Cập nhật tên, phòng học hoặc mô tả"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên lớp</label>
              <input
                type="text"
                value={classToEdit.name}
                onChange={e => setClassToEdit({ ...classToEdit, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Môn học</label>
                <input
                  type="text"
                  value={classToEdit.subject}
                  onChange={e => setClassToEdit({ ...classToEdit, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phòng học</label>
                <input
                  type="text"
                  value={classToEdit.room}
                  onChange={e => setClassToEdit({ ...classToEdit, room: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mô tả</label>
              <textarea
                rows={3}
                value={classToEdit.description}
                onChange={e => setClassToEdit({ ...classToEdit, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setClassToEdit(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  updateClass(classToEdit.id, classToEdit);
                  success(`Đã cập nhật thông tin lớp ${classToEdit.name}!`);
                  setClassToEdit(null);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {classToDelete && (
        <ConfirmDialog
          isOpen={!!classToDelete}
          onClose={() => setClassToDelete(null)}
          onConfirm={() => {
            deleteClass(classToDelete.id);
            success(`Đã xóa ${classToDelete.name}`);
            setClassToDelete(null);
          }}
          title="Xác nhận xóa lớp học"
          message={`Bạn có chắc chắn muốn xóa lớp "${classToDelete.name}"? Thao tác này sẽ gỡ bỏ thông tin lớp khỏi danh sách phụ trách.`}
          confirmText="Xóa lớp học"
          type="danger"
        />
      )}

      {/* THÊM TỪNG HỌC SINH MODAL */}
      <AddStudentModal
        isOpen={!!classForAddStudent}
        onClose={() => setClassForAddStudent(null)}
        classId={classForAddStudent?.id}
        className={classForAddStudent?.name}
      />
    </div>
  );
};
