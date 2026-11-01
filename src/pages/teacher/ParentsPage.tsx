import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { ParentGuardian, ParentRelationship, Student } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Contact,
  Search,
  Plus,
  Download,
  Printer,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck,
  Users,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
  PhoneCall,
  FileSpreadsheet
} from 'lucide-react';

export const ParentsPage: React.FC = () => {
  const { classes, selectedClassId, allStudents, guardians, addGuardian, updateGuardian, deleteGuardian } = useClass();
  const { success, error, info } = useToast();
  const [searchParams] = useSearchParams();

  // Search & Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [classFilter, setClassFilter] = useState<string>(searchParams.get('classId') || 'all');
  const [relationFilter, setRelationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'student-asc' | 'student-desc' | 'class-asc' | 'parent-asc' | 'newest'>('student-asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Dialogs
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<ParentGuardian | null>(null);
  const [viewingGuardian, setViewingGuardian] = useState<ParentGuardian | null>(null);
  const [guardianToDelete, setGuardianToDelete] = useState<ParentGuardian | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Form State
  const [formClassId, setFormClassId] = useState<string>('');
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formName, setFormName] = useState('');
  const [formRelationship, setFormRelationship] = useState<ParentRelationship>('Bố');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formJob, setFormJob] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(true);

  // Filtered & Sorted Guardians
  const filteredGuardians = useMemo(() => {
    let result = [...guardians];

    // Filter by class
    if (classFilter !== 'all') {
      result = result.filter(g => g.classId === classFilter);
    }

    // Filter by relationship
    if (relationFilter !== 'all') {
      result = result.filter(g => g.relationship === relationFilter);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        g =>
          g.studentName.toLowerCase().includes(q) ||
          g.studentCode.toLowerCase().includes(q) ||
          g.name.toLowerCase().includes(q) ||
          g.phone.toLowerCase().includes(q) ||
          (g.email && g.email.toLowerCase().includes(q)) ||
          g.className.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'student-asc':
          return a.studentName.localeCompare(b.studentName, 'vi');
        case 'student-desc':
          return b.studentName.localeCompare(a.studentName, 'vi');
        case 'class-asc':
          return a.className.localeCompare(b.className, 'vi');
        case 'parent-asc':
          return a.name.localeCompare(b.name, 'vi');
        case 'newest':
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        default:
          return 0;
      }
    });

    return result;
  }, [guardians, classFilter, relationFilter, search, sortBy]);

  // Pagination calculation
  const totalItems = filteredGuardians.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedGuardians = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredGuardians.slice(startIndex, startIndex + pageSize);
  }, [filteredGuardians, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = guardians.length;
    const uniqueStudents = new Set(guardians.map(g => g.studentId)).size;
    const totalSchoolStudents = allStudents.length;
    const coveragePercent = totalSchoolStudents > 0 ? Math.round((uniqueStudents / totalSchoolStudents) * 100) : 0;
    const fathers = guardians.filter(g => g.relationship === 'Bố').length;
    const mothers = guardians.filter(g => g.relationship === 'Mẹ').length;
    const others = guardians.filter(g => !['Bố', 'Mẹ'].includes(g.relationship)).length;

    return { total, uniqueStudents, coveragePercent, fathers, mothers, others };
  }, [guardians, allStudents]);

  // Students eligible for form based on selected class
  const classStudents = useMemo(() => {
    if (!formClassId) return allStudents;
    return allStudents.filter(s => s.classId === formClassId);
  }, [allStudents, formClassId]);

  // Check existing guardians of currently chosen student in form
  const existingStudentGuardians = useMemo(() => {
    if (!formStudentId) return [];
    return guardians.filter(g => g.studentId === formStudentId && (!editingGuardian || g.id !== editingGuardian.id));
  }, [guardians, formStudentId, editingGuardian]);

  // Open Add Modal
  const handleOpenAddModal = (prefillStudent?: Student) => {
    setEditingGuardian(null);
    const targetClass = prefillStudent?.classId || (classFilter !== 'all' ? classFilter : selectedClassId || classes[0]?.id || '');
    setFormClassId(targetClass);

    if (prefillStudent) {
      setFormStudentId(prefillStudent.id);
      setFormAddress(prefillStudent.address || '');
    } else {
      const firstStudent = allStudents.find(s => s.classId === targetClass);
      setFormStudentId(firstStudent?.id || '');
      setFormAddress(firstStudent?.address || '');
    }

    setFormName('');
    setFormRelationship('Bố');
    setFormPhone('');
    setFormEmail('');
    setFormJob('');
    setFormNote('');
    setFormIsPrimary(true);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (guardian: ParentGuardian) => {
    setEditingGuardian(guardian);
    setFormClassId(guardian.classId);
    setFormStudentId(guardian.studentId);
    setFormName(guardian.name);
    setFormRelationship(guardian.relationship);
    setFormPhone(guardian.phone);
    setFormEmail(guardian.email || '');
    setFormAddress(guardian.address || '');
    setFormJob(guardian.job || '');
    setFormNote(guardian.note || '');
    setFormIsPrimary(guardian.isPrimary ?? false);
    setIsAddEditModalOpen(true);
  };

  // Handle Class Change in Form
  const handleFormClassChange = (newClassId: string) => {
    setFormClassId(newClassId);
    const firstStudent = allStudents.find(s => s.classId === newClassId);
    if (firstStudent) {
      setFormStudentId(firstStudent.id);
      setFormAddress(firstStudent.address || '');
    } else {
      setFormStudentId('');
    }
  };

  // Handle Student Change in Form
  const handleFormStudentChange = (newStudentId: string) => {
    setFormStudentId(newStudentId);
    const st = allStudents.find(s => s.id === newStudentId);
    if (st && !formAddress) {
      setFormAddress(st.address || '');
    }
  };

  // Save Add/Edit
  const handleSaveGuardian = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      error('Vui lòng nhập họ và tên ba/mẹ/người giám hộ');
      return;
    }

    if (!formPhone.trim()) {
      error('Vui lòng nhập số điện thoại liên hệ');
      return;
    }

    // Phone validation
    const cleanPhone = formPhone.replace(/[\s.-]/g, '');
    if (!/^[0-9]{9,11}$/.test(cleanPhone)) {
      error('Số điện thoại không hợp lệ (cần từ 9 đến 11 số)');
      return;
    }

    // Email validation if provided
    if (formEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      error('Địa chỉ email không đúng định dạng');
      return;
    }

    const targetStudent = allStudents.find(s => s.id === formStudentId);
    if (!targetStudent) {
      error('Vui lòng chọn học sinh liên kết');
      return;
    }

    const targetClass = classes.find(c => c.id === targetStudent.classId);

    if (editingGuardian) {
      // Update
      const res = updateGuardian(editingGuardian.id, {
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        studentCode: targetStudent.studentCode,
        classId: targetStudent.classId,
        className: targetClass?.name || targetStudent.className,
        name: formName.trim(),
        relationship: formRelationship,
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        address: formAddress.trim() || undefined,
        job: formJob.trim() || undefined,
        note: formNote.trim() || undefined,
        isPrimary: formIsPrimary
      });

      if (res) {
        success(`Đã cập nhật thông tin phụ huynh ${res.name} thành công!`);
        setIsAddEditModalOpen(false);
      } else {
        error('Có lỗi xảy ra khi cập nhật.');
      }
    } else {
      // Add
      const created = addGuardian({
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        studentCode: targetStudent.studentCode,
        classId: targetStudent.classId,
        className: targetClass?.name || targetStudent.className,
        name: formName.trim(),
        relationship: formRelationship,
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        address: formAddress.trim() || undefined,
        job: formJob.trim() || undefined,
        note: formNote.trim() || undefined,
        isPrimary: formIsPrimary
      });

      success(`Đã thêm phụ huynh ${created.name} cho học sinh ${targetStudent.name}!`);
      setIsAddEditModalOpen(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!guardianToDelete) return;
    const name = guardianToDelete.name;
    const studentName = guardianToDelete.studentName;
    const res = deleteGuardian(guardianToDelete.id);
    if (res) {
      success(`Đã xóa thông tin phụ huynh ${name}. Hồ sơ học sinh ${studentName} vẫn được bảo toàn.`);
    } else {
      error('Không thể xóa bản ghi phụ huynh.');
    }
    setGuardianToDelete(null);
  };

  // Copy Phone Number
  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    info(`Đã sao chép SĐT: ${phone}`);
    setTimeout(() => {
      setCopiedPhoneId(null);
    }, 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredGuardians.length === 0) {
      error('Không có dữ liệu phụ huynh để xuất');
      return;
    }

    const headers = [
      'STT,Mã HS,Họ tên học sinh,Lớp,Họ tên ba mẹ/người giám hộ,Mối quan hệ,Số điện thoại,Email,Địa chỉ,Nghề nghiệp,Liên hệ chính,Ghi chú'
    ];

    const rows = filteredGuardians.map((g, idx) => {
      return `"${idx + 1}","${g.studentCode}","${g.studentName}","${g.className}","${g.name}","${g.relationship}","${g.phone}","${g.email || ''}","${(g.address || '').replace(/"/g, '""')}","${g.job || ''}","${g.isPrimary ? 'Có' : 'Không'}","${(g.note || '').replace(/"/g, '""')}"`;
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Ba_Me_Hoc_Sinh_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success(`Đã xuất thành công ${filteredGuardians.length} thông tin phụ huynh ra file CSV!`);
  };

  // Print contact list
  const handlePrint = () => {
    window.print();
  };

  // Badge Color for Relationship
  const getRelationshipBadge = (rel: ParentRelationship) => {
    switch (rel) {
      case 'Bố':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Mẹ':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Người giám hộ':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ông/Bà':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Contact className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ba mẹ học sinh</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 font-semibold text-blue-700 border border-blue-200">
                {stats.total} hồ sơ liên hệ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý danh bạ liên lạc phụ huynh, người giám hộ và sổ liên lạc gia đình học sinh
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrint}
            title="In sổ liên lạc"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">In danh bạ</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Xuất danh sách ra file Excel / CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-xs hover:shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm ba mẹ</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Tổng phụ huynh</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Học sinh có liên hệ</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {stats.uniqueStudents}/{allStudents.length}{' '}
              <span className="text-xs font-normal text-emerald-600">({stats.coveragePercent}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <Contact className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Bố & Mẹ học sinh</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              <span className="text-blue-600">{stats.fathers} Bố</span> / <span className="text-rose-600">{stats.mothers} Mẹ</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Người giám hộ khác</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{stats.others} người</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, mã HS, tên phụ huynh, SĐT, email..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Lớp:</span>
            <select
              value={classFilter}
              onChange={e => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Tất cả các lớp ({classes.length} lớp)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.totalStudents} HS)
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Quan hệ:</span>
            <select
              value={relationFilter}
              onChange={e => {
                setRelationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Tất cả quan hệ</option>
              <option value="Bố">Bố</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Người giám hộ">Người giám hộ</option>
              <option value="Ông/Bà">Ông/Bà</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="student-asc">Tên học sinh (A → Z)</option>
              <option value="student-desc">Tên học sinh (Z → A)</option>
              <option value="class-asc">Theo Lớp học</option>
              <option value="parent-asc">Tên phụ huynh (A → Z)</option>
              <option value="newest">Mới cập nhật</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Strip */}
        {(search || classFilter !== 'all' || relationFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs flex-wrap">
            <span className="text-slate-500 font-medium">Đang lọc:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Tìm: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-blue-900">
                  ×
                </button>
              </span>
            )}
            {classFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Lớp: {classes.find(c => c.id === classFilter)?.name || classFilter}
                <button onClick={() => setClassFilter('all')} className="hover:text-blue-900">
                  ×
                </button>
              </span>
            )}
            {relationFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Quan hệ: {relationFilter}
                <button onClick={() => setRelationFilter('all')} className="hover:text-blue-900">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setClassFilter('all');
                setRelationFilter('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold ml-auto"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table on Desktop, Cards on Mobile */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 select-none uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Họ tên học sinh</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Họ tên ba/mẹ/người giám hộ</th>
                <th className="py-3.5 px-4">Quan hệ</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedGuardians.length > 0 ? (
                paginatedGuardians.map((g, index) => {
                  const stt = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={g.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setViewingGuardian(g)}
                    >
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400">{stt}</td>

                      {/* Student Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {g.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {g.studentName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tracking-wider">{g.studentCode}</div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {g.className}
                        </span>
                      </td>

                      {/* Parent Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{g.name}</span>
                          {g.isPrimary && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold" title="Người liên hệ chính">
                              Chính
                            </span>
                          )}
                        </div>
                        {g.job && <div className="text-[11px] text-slate-400 mt-0.5">{g.job}</div>}
                      </td>

                      {/* Relationship */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRelationshipBadge(
                            g.relationship
                          )}`}
                        >
                          {g.relationship}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono font-medium" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${g.phone}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold"
                            title="Bấm để gọi điện thoại"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-500" />
                            <span>{g.phone}</span>
                          </a>
                          <button
                            onClick={e => handleCopyPhone(g.id, g.phone, e)}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Sao chép số điện thoại"
                          >
                            {copiedPhoneId === g.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600" onClick={e => e.stopPropagation()}>
                        {g.email ? (
                          <a
                            href={`mailto:${g.email}`}
                            className="hover:text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                            title={g.email}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{g.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingGuardian(g)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(g)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setGuardianToDelete(g)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa phụ huynh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Không tìm thấy thông tin ba mẹ học sinh</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search || classFilter !== 'all' || relationFilter !== 'all'
                          ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn.'
                          : 'Chưa có thông tin ba mẹ nào được thêm vào hệ thống.'}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        {(search || classFilter !== 'all' || relationFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearch('');
                              setClassFilter('all');
                              setRelationFilter('all');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenAddModal()}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm phụ huynh mới
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedGuardians.length > 0 ? (
            paginatedGuardians.map((g, index) => {
              const stt = (currentPage - 1) * pageSize + index + 1;
              return (
                <div
                  key={g.id}
                  className="p-4 hover:bg-slate-50 transition-colors space-y-3"
                  onClick={() => setViewingGuardian(g)}
                >
                  {/* Top card row: Student name, class and STT */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                        {stt}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{g.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{g.studentCode}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {g.className}
                    </span>
                  </div>

                  {/* Guardian Info */}
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{g.name}</span>
                        {g.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            Chính
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRelationshipBadge(
                          g.relationship
                        )}`}
                      >
                        {g.relationship}
                      </span>
                    </div>

                    {/* Quick Call Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${g.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Gọi {g.phone}</span>
                      </a>
                      {g.email && (
                        <a
                          href={`mailto:${g.email}`}
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600"
                          title="Gửi email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={e => handleCopyPhone(g.id, g.phone, e)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                        title="Sao chép SĐT"
                      >
                        {copiedPhoneId === g.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-end gap-2 pt-1 text-xs" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setViewingGuardian(g)}
                      className="px-2.5 py-1 text-slate-600 hover:text-blue-600 font-medium"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(g)}
                      className="px-2.5 py-1 text-amber-600 hover:text-amber-800 font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setGuardianToDelete(g)}
                      className="px-2.5 py-1 text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-700">Không tìm thấy thông tin ba mẹ</p>
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mới
              </button>
            </div>
          )}
        </div>

        {/* PAGINATION BAR */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>trên tổng số {totalItems} phụ huynh</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Only show current, first, last, and neighbors
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          page === currentPage
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Trang tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT GUARDIAN MODAL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingGuardian ? 'Chỉnh sửa thông tin ba mẹ/người giám hộ' : 'Thêm mới ba mẹ/người giám hộ'}
        subtitle="Thông tin sẽ được liên kết chặt chẽ với hồ sơ học sinh và lớp học trong hệ thống."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveGuardian} className="space-y-4 p-1">
          {/* Section 1: Choose Class & Student */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>1. Chọn lớp & học sinh liên kết</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lớp học <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formClassId}
                  onChange={e => handleFormClassChange(e.target.value)}
                  disabled={!!editingGuardian}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Học sinh <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formStudentId}
                  onChange={e => handleFormStudentChange(e.target.value)}
                  disabled={!!editingGuardian}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hint if student already has guardians */}
            {existingStudentGuardians.length > 0 && (
              <div className="text-[11px] p-2.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80 flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Học sinh đã có {existingStudentGuardians.length} người giám hộ: </span>
                  {existingStudentGuardians.map(g => `${g.relationship} ${g.name} (${g.phone})`).join(', ')}.
                  <span className="block text-blue-600 mt-0.5">
                    Hệ thống cho phép lưu cả Bố, Mẹ và Người giám hộ cho cùng 1 học sinh mà không bị trùng lặp.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Guardian Information */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Contact className="w-4 h-4 text-blue-600" />
              <span>2. Thông tin người giám hộ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên ba/mẹ/người giám hộ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  required
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mối quan hệ với học sinh <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formRelationship}
                  onChange={e => setFormRelationship(e.target.value as ParentRelationship)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Bố">Bố</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Người giám hộ">Người giám hộ</option>
                  <option value="Ông/Bà">Ông/Bà</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại liên hệ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0912 345 678"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Ví dụ: hung.nguyen@gmail.com"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nghề nghiệp / Cơ quan</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Kỹ sư xây dựng, Giáo viên..."
                    value={formJob}
                    onChange={e => setFormJob(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ liên hệ</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: 12 Cầu Giấy, Hà Nội"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
              <textarea
                rows={2}
                placeholder="Ghi chú về thời gian thuận tiện gọi điện, vai trò ban phụ huynh, dặn dò của gia đình..."
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPrimaryCheckbox"
                checked={formIsPrimary}
                onChange={e => setFormIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isPrimaryCheckbox" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                Đặt làm <span className="font-semibold text-blue-700">Người liên hệ chính</span> của học sinh (nhận tin nhắn khẩn và liên lạc ưu tiên)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs"
            >
              {editingGuardian ? 'Lưu thay đổi' : 'Thêm người giám hộ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* VIEW GUARDIAN DETAIL MODAL */}
      {/* ========================================================= */}
      {viewingGuardian && (
        <Modal
          isOpen={!!viewingGuardian}
          onClose={() => setViewingGuardian(null)}
          title="Thông tin chi tiết phụ huynh học sinh"
          subtitle={`Học sinh: ${viewingGuardian.studentName} (${viewingGuardian.className})`}
          maxWidth="md"
        >
          <div className="space-y-4 p-1">
            {/* Header Profile Badge */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-tr from-slate-50 to-blue-50/50 border border-slate-200/80">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/20">
                {viewingGuardian.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{viewingGuardian.name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRelationshipBadge(
                      viewingGuardian.relationship
                    )}`}
                  >
                    {viewingGuardian.relationship}
                  </span>
                  {viewingGuardian.isPrimary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Liên hệ chính
                    </span>
                  )}
                </div>
                {viewingGuardian.job && (
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewingGuardian.job}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${viewingGuardian.phone}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi {viewingGuardian.phone}</span>
              </a>
              {viewingGuardian.email ? (
                <a
                  href={`mailto:${viewingGuardian.email}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span>Gửi thư điện tử</span>
                </a>
              ) : (
                <button
                  onClick={e => handleCopyPhone(viewingGuardian.id, viewingGuardian.phone, e)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Sao chép SĐT</span>
                </button>
              )}
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 text-xs">
              <div className="p-3 flex items-start justify-between">
                <span className="text-slate-500 font-medium">Số điện thoại:</span>
                <span className="font-mono font-bold text-slate-900">{viewingGuardian.phone}</span>
              </div>
              <div className="p-3 flex items-start justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-medium text-slate-900">{viewingGuardian.email || 'Chưa cập nhật'}</span>
              </div>
              <div className="p-3 flex items-start justify-between">
                <span className="text-slate-500 font-medium">Địa chỉ:</span>
                <span className="font-medium text-slate-900 text-right max-w-[240px]">
                  {viewingGuardian.address || 'Chưa cập nhật'}
                </span>
              </div>
              {viewingGuardian.note && (
                <div className="p-3">
                  <span className="text-slate-500 font-medium block mb-1">Ghi chú:</span>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded-lg italic">{viewingGuardian.note}</p>
                </div>
              )}
            </div>

            {/* Linked Student Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Học sinh liên kết</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{viewingGuardian.studentName}</div>
                  <div className="text-xs text-slate-500 font-mono">Mã HS: {viewingGuardian.studentCode}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700">
                  Lớp {viewingGuardian.className}
                </span>
              </div>
            </div>

            {/* Other Guardians for this Student */}
            {(() => {
              const otherGuardians = guardians.filter(
                g => g.studentId === viewingGuardian.studentId && g.id !== viewingGuardian.id
              );
              if (otherGuardians.length === 0) return null;
              return (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Người giám hộ khác của học sinh này ({otherGuardians.length})
                  </div>
                  <div className="space-y-1.5">
                    {otherGuardians.map(og => (
                      <div
                        key={og.id}
                        onClick={() => setViewingGuardian(og)}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{og.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                              {og.relationship}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{og.phone}</div>
                        </div>
                        <span className="text-xs text-blue-600 font-semibold">Xem →</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setGuardianToDelete(viewingGuardian);
                  setViewingGuardian(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa phụ huynh
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(viewingGuardian);
                    setViewingGuardian(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Sửa thông tin
                </button>
                <button
                  type="button"
                  onClick={() => setViewingGuardian(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRM DIALOG */}
      {/* ========================================================= */}
      <ConfirmDialog
        isOpen={!!guardianToDelete}
        onClose={() => setGuardianToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa thông tin phụ huynh / người giám hộ"
        message={`Bạn có chắc chắn muốn xóa thông tin phụ huynh "${guardianToDelete?.name}" (${guardianToDelete?.relationship} của học sinh ${guardianToDelete?.studentName})? Thao tác này chỉ xóa bản ghi phụ huynh, hồ sơ học sinh trong lớp vẫn được giữ nguyên toàn vẹn.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
      />
    </div>
  );
};
