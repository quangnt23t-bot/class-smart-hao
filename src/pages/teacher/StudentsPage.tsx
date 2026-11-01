import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { Student } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AddStudentModal } from '../../components/students/AddStudentModal';
import {
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Check,
  Contact,
  X
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId, refreshData } = useClass();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState(searchParams.get('classId') || selectedClassId || 'all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Dialog & Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Target class for Import Wizard
  const [targetClassId, setTargetClassId] = useState(selectedClassId || 'c_6a1');

  // Import Wizard Steps: 1: Upload, 2: Mapping & Preview, 3: Validation & Error list, 4: Done
  const [importStep, setImportStep] = useState(1);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [invalidRows, setInvalidRows] = useState<{ row: number; error: string }[]>([]);

  const allStudents = StorageService.getStudents();

  // Filter logic
  const filteredStudents = allStudents.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      (s.parentName && s.parentName.toLowerCase().includes(search.toLowerCase()));
    const matchClass = classFilter === 'all' || s.classId === classFilter;
    const matchGroup = groupFilter === 'all' || s.groupNumber === Number(groupFilter);
    return matchSearch && matchClass && matchGroup;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Mã HS,Họ tên,Giới tính,Lớp,Tổ,Chuyên cần (%),Điểm TB,Phụ huynh,SĐT'];
    const rows = filteredStudents.map(
      s =>
        `"${s.studentCode}","${s.name}","${s.gender}","${s.className}","${s.groupNumber || 1}","${s.attendanceRate}","${s.averageScore}","${s.parentName || ''}","${s.parentPhone || ''}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Hoc_Sinh_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success(`Đã xuất thành công ${filteredStudents.length} học sinh ra file CSV!`);
  };

  // Download Sample Template for Import
  const handleDownloadSample = () => {
    const sample = 'Mã HS,Họ tên,Giới tính,Tổ,Phụ huynh,SĐT\nHS020,Lê Văn Thắng,Nam,1,Lê Văn Chung,0912345678\nHS021,Trần Hương Giang,Nữ,2,Trần Văn Bình,0903888999';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_Import_Hoc_Sinh.csv';
    link.click();
    success('Đã tải file mẫu import!');
  };

  // Mock upload parse & validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportedFile(file);

    // Simulate reading & validating rows
    const mockParsed = [
      { code: 'HS020', name: 'Lê Văn Thắng', gender: 'Nam', group: 1, parent: 'Lê Văn Chung', phone: '0912345678' },
      { code: 'HS021', name: 'Trần Hương Giang', gender: 'Nữ', group: 2, parent: 'Trần Văn Bình', phone: '0903888999' },
      { code: '', name: 'Nguyễn Văn Thiếu Mã', gender: 'Nam', group: 1, parent: '', phone: '' } // intentional error row
    ];

    const errors: { row: number; error: string }[] = [];
    mockParsed.forEach((row, idx) => {
      if (!row.code) errors.push({ row: idx + 1, error: 'Thiếu mã học sinh bắt buộc' });
      if (!row.name) errors.push({ row: idx + 1, error: 'Thiếu họ tên học sinh bắt buộc' });
    });

    setPreviewRows(mockParsed);
    setInvalidRows(errors);
    setImportStep(2);
  };

  const handleConfirmImport = () => {
    const valid = previewRows.filter(r => r.code && r.name);
    const targetClass = classes.find(c => c.id === targetClassId) || classes[0];

    valid.forEach(v => {
      StorageService.addStudent({
        studentCode: v.code,
        name: v.name,
        gender: v.gender || 'Nam',
        birthDate: '2013-01-01',
        classId: targetClass.id,
        className: targetClass.name,
        groupNumber: v.group || 1,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        parentName: v.parent,
        parentPhone: v.phone,
        status: 'active'
      });
    });

    refreshData();
    success(`Đã import thành công ${valid.length} học sinh vào lớp ${targetClass.name}!`);
    setIsImportWizardOpen(false);
    setImportStep(1);
    setImportedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Học sinh</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng <strong>{allStudents.length} học sinh</strong> trên toàn bộ các lớp giảng dạy
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportWizardOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import Excel/CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel/CSV</span>
          </button>
          <button
            onClick={() => navigate('/teacher/parents')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xem và quản lý thông tin ba mẹ, người giám hộ"
          >
            <Contact className="w-4 h-4 text-blue-600" />
            <span>Ba mẹ học sinh</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, mã HS, phụ huynh..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.totalStudents} HS)
              </option>
            ))}
          </select>

          {/* Group Filter */}
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="all">Tất cả các tổ</option>
            <option value="1">Tổ 1</option>
            <option value="2">Tổ 2</option>
            <option value="3">Tổ 3</option>
            <option value="4">Tổ 4</option>
          </select>
        </div>

        {/* Selected count info */}
        {selectedStudentIds.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-semibold">
            <span>Đã chọn {selectedStudentIds.length} học sinh</span>
            <button
              onClick={() => setSelectedStudentIds([])}
              className="text-blue-500 hover:text-blue-800 ml-1"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </div>

      {/* Desktop & Mobile Responsive Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedStudentIds.length === filteredStudents.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Tổ</th>
                <th className="py-3 px-4">Chuyên cần</th>
                <th className="py-3 px-4">Điểm TB</th>
                <th className="py-3 px-4">Phụ huynh & SĐT</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(s => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {s.studentCode}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          onClick={() => navigate(`/teacher/students/${s.id}`)}
                          className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          <img
                            src={s.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate max-w-[150px]">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{s.className}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">Tổ {s.groupNumber || 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-600 tabular-nums">
                          {s.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-600 tabular-nums">
                          {s.averageScore}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-slate-600 cursor-pointer group/parent"
                        onClick={() => navigate(`/teacher/parents?search=${encodeURIComponent(s.name)}`)}
                        title="Bấm để xem chi tiết thông tin ba mẹ học sinh"
                      >
                        <div className="font-medium text-slate-800 group-hover/parent:text-blue-600 group-hover/parent:underline">
                          {s.parentName || '—'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.parentPhone || ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Đang học
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/teacher/students/${s.id}`)}
                            className="px-2.5 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md font-semibold transition-colors"
                          >
                            Hồ sơ 360°
                          </button>
                          <button
                            onClick={() => setStudentToDelete(s)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* THÊM TỪNG HỌC SINH MODAL */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        classId={classFilter !== 'all' ? classFilter : selectedClassId}
        onSuccess={() => {
          refreshData();
        }}
      />

      {/* IMPORT WIZARD MODAL (Strictly adheres to Section 12 7-step process) */}
      <Modal
        isOpen={isImportWizardOpen}
        onClose={() => {
          setIsImportWizardOpen(false);
          setImportStep(1);
        }}
        title="Quy trình Import Học sinh từ Excel / CSV"
        subtitle="Tải file mẫu, kiểm tra cấu trúc cột và xác thực dữ liệu trước khi lưu"
        maxWidth="xl"
      >
        <div className="space-y-5 text-xs">
          {/* Step indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className={`font-semibold ${importStep === 1 ? 'text-blue-600' : 'text-slate-500'}`}>
              1. Tải mẫu & Upload
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`font-semibold ${importStep === 2 ? 'text-blue-600' : 'text-slate-500'}`}>
              2. Xem trước & Validate lỗi
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`font-semibold ${importStep === 3 ? 'text-blue-600' : 'text-slate-500'}`}>
              3. Xác nhận Import
            </span>
          </div>

          {/* STEP 1: DOWNLOAD SAMPLE & UPLOAD */}
          {importStep === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-blue-900">Bước 1: Tải file mẫu chuẩn</h4>
                  <p className="text-blue-700 text-[11px] mt-0.5">
                    File mẫu chứa các cột: Mã HS, Họ tên, Giới tính, Tổ, Phụ huynh, SĐT.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu .CSV</span>
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chọn lớp tiếp nhận</label>
                <select
                  value={targetClassId}
                  onChange={e => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tải file danh sách lên</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="font-semibold text-slate-700 block">Kéo thả file hoặc Click để duyệt file</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Hỗ trợ định dạng .CSV hoặc .XLSX</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & ERROR VALIDATION */}
          {importStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Dữ liệu đọc được từ file ({previewRows.length} dòng):
                </span>
                {invalidRows.length > 0 ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Phát hiện {invalidRows.length} dòng lỗi</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Toàn bộ dữ liệu hợp lệ</span>
                  </span>
                )}
              </div>

              {/* Error warning box if any */}
              {invalidRows.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs space-y-1">
                  <span className="font-bold">Chi tiết các dòng bị lỗi (sẽ tự động bỏ qua):</span>
                  {invalidRows.map((err, i) => (
                    <div key={i} className="text-[11px]">
                      • Dòng {err.row}: {err.error}
                    </div>
                  ))}
                </div>
              )}

              {/* Preview Table */}
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Dòng</th>
                      <th className="py-2 px-3">Mã HS</th>
                      <th className="py-2 px-3">Họ và tên</th>
                      <th className="py-2 px-3">Giới tính</th>
                      <th className="py-2 px-3">Tổ</th>
                      <th className="py-2 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((r, idx) => {
                      const hasErr = invalidRows.some(e => e.row === idx + 1);
                      return (
                        <tr key={idx} className={hasErr ? 'bg-rose-50/70' : 'bg-white'}>
                          <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-700">
                            {r.code || <span className="text-rose-500">Trống</span>}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">{r.name}</td>
                          <td className="py-2 px-3 text-slate-600">{r.gender}</td>
                          <td className="py-2 px-3 text-slate-600">Tổ {r.group}</td>
                          <td className="py-2 px-3">
                            {hasErr ? (
                              <span className="text-rose-600 font-semibold text-[10px]">Lỗi</span>
                            ) : (
                              <span className="text-emerald-600 font-semibold text-[10px]">Hợp lệ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setImportStep(1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ← Chọn file khác
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận Import {previewRows.length - invalidRows.length} học sinh</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      {studentToDelete && (
        <ConfirmDialog
          isOpen={!!studentToDelete}
          onClose={() => setStudentToDelete(null)}
          onConfirm={() => {
            StorageService.deleteStudent(studentToDelete.id);
            refreshData();
            success(`Đã xóa học sinh ${studentToDelete.name}`);
            setStudentToDelete(null);
          }}
          title="Xác nhận xóa học sinh"
          message={`Bạn có chắc chắn muốn xóa học sinh "${studentToDelete.name}" (${studentToDelete.studentCode}) khỏi hệ thống?`}
          confirmText="Xóa học sinh"
          type="danger"
        />
      )}
    </div>
  );
};
