import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import {
  TrendingUp,
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Users,
  Award,
  FileText
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { success } = useToast();

  const [reportType, setReportType] = useState<'academic' | 'attendance' | 'assignments' | 'competition'>('academic');
  const [currentClassId, setCurrentClassId] = useState(selectedClassId || 'c_6a1');
  const [semester, setSemester] = useState('Học kỳ 1 (2025-2026)');

  const students = StorageService.getStudents(currentClassId);
  const grades = StorageService.getGrades(currentClassId);
  const curClass = classes.find(c => c.id === currentClassId);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    success(`Đã xuất báo cáo ${format.toUpperCase()} cho lớp ${curClass?.name} - ${semester}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Báo cáo & Thống kê Tổng hợp</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu kết quả học tập, chuyên cần và nề nếp phục vụ sơ kết, họp phụ huynh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In báo cáo</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Report Hub Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        {/* Type tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs overflow-x-auto">
          {[
            { key: 'academic', label: 'Báo cáo Học tập & Điểm số', icon: BarChart3 },
            { key: 'attendance', label: 'Báo cáo Chuyên cần', icon: CheckCircle2 },
            { key: 'assignments', label: 'Báo cáo Bài tập về nhà', icon: FileText },
            { key: 'competition', label: 'Báo cáo Thi đua & Nề nếp', icon: Award }
          ].map(t => {
            const Icon = t.icon;
            const isActive = reportType === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setReportType(t.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Lớp học</label>
            <select
              value={currentClassId}
              onChange={e => setCurrentClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kỳ báo cáo</label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium"
            >
              <option value="Học kỳ 1 (2025-2026)">Học kỳ 1 (2025 - 2026)</option>
              <option value="Học kỳ 2 (2025-2026)">Học kỳ 2 (2025 - 2026)</option>
              <option value="Cả năm (2025-2026)">Cả năm (2025 - 2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content Container (Clean for print & export) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4 text-center">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            TRƯỜNG THCS CHU VĂN AN · NĂM HỌC 2025 - 2026
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            BÁO CÁO TỔNG HỢP {reportType.toUpperCase()} - {curClass?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thời điểm trích xuất: {new Date().toLocaleDateString('vi-VN')} · Giáo viên: {curClass?.teacherName}
          </p>
        </div>

        {/* High level metrics breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[11px]">Sĩ số</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{students.length} HS</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[11px]">Điểm TB chung</span>
            <div className="text-xl font-bold text-blue-600 mt-0.5">8.4 / 10</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[11px]">Tỷ lệ Giỏi/Xuất sắc</span>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">72%</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[11px]">Chuyên cần bình quân</span>
            <div className="text-xl font-bold text-indigo-600 mt-0.5">{curClass?.attendanceRate}%</div>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-4">Họ và tên</th>
                <th className="py-2.5 px-3 text-center">TX (TB)</th>
                <th className="py-2.5 px-3 text-center">GK</th>
                <th className="py-2.5 px-3 text-center">CK</th>
                <th className="py-2.5 px-3 text-center font-bold">ĐTB Môn</th>
                <th className="py-2.5 px-3">Xếp loại</th>
                <th className="py-2.5 px-4">Nhận xét khái quát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, idx) => {
                const g = grades.find(x => x.studentId === s.id);
                const avg = g?.average || s.averageScore;
                const rank = avg >= 9.0 ? 'Xuất sắc' : avg >= 8.0 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : 'Đạt';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-700">{s.studentCode}</td>
                    <td className="py-2 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-2 px-3 text-center font-mono">{g?.tx1 ?? 8.5}</td>
                    <td className="py-2 px-3 text-center font-mono">{g?.gk ?? 8.8}</td>
                    <td className="py-2 px-3 text-center font-mono">{g?.ck ?? 9.0}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-blue-600">{avg}</td>
                    <td className="py-2 px-3 font-semibold text-emerald-700">{rank}</td>
                    <td className="py-2 px-4 text-slate-600 text-[11px] truncate max-w-[200px]">
                      {g?.note || 'Học tập chăm chỉ, tư duy tốt'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
