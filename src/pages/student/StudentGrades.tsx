import React from 'react';
import { StorageService } from '../../data/storage';
import { TrendingUp, Award, BookOpen } from 'lucide-react';

export const StudentGrades: React.FC = () => {
  const student = StorageService.getStudentById('s_1')!;
  const grade = StorageService.getGrades().find(g => g.studentId === student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bảng điểm Cá nhân</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi các đầu điểm thường xuyên, giữa kỳ và điểm trung bình môn học
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400">Môn học chính</span>
            <h2 className="text-lg font-bold text-slate-900">Toán học 6 (SGK Kết nối tri thức)</h2>
            <p className="text-xs text-slate-500">Giáo viên phụ trách: Cô Nguyễn Thị Lan</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center sm:text-right">
            <span className="text-[11px] text-blue-700 font-medium">Điểm trung bình môn:</span>
            <div className="text-2xl font-bold text-blue-600 font-mono mt-0.5">
              {grade?.average || 8.8} / 10
            </div>
          </div>
        </div>

        {/* Grade Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">TX 1 (15p)</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">{grade?.tx1 ?? 9.0}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">TX 2 (Miệng)</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">{grade?.tx2 ?? 8.5}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">TX 3 (15p)</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">{grade?.tx3 ?? 9.0}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">TX 4 (BTVN)</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">{grade?.tx4 ?? 8.0}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-purple-700 font-semibold">Giữa kỳ (GK)</span>
            <div className="text-lg font-bold font-mono text-purple-700 mt-1">{grade?.gk ?? 8.8}</div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
            <span className="text-indigo-700 font-semibold">Cuối kỳ (CK)</span>
            <div className="text-lg font-bold font-mono text-indigo-700 mt-1">{grade?.ck ?? 9.0}</div>
          </div>
        </div>

        {grade?.note && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <strong>Lời nhận xét của cô Lan:</strong> {grade.note}
          </div>
        )}
      </div>
    </div>
  );
};
