import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { GradeRecord } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Save,
  Search,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { success, warning } = useToast();

  const [currentClassId, setCurrentClassId] = useState(selectedClassId || 'c_6a1');
  const [search, setSearch] = useState('');
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const students = StorageService.getStudents(currentClassId);
  const rawGrades = StorageService.getGrades(currentClassId);

  // Local state grid of grades for editing
  const [gradesMap, setGradesMap] = useState<Record<string, Partial<GradeRecord>>>(() => {
    const map: Record<string, Partial<GradeRecord>> = {};
    students.forEach(s => {
      const match = rawGrades.find(g => g.studentId === s.id);
      map[s.id] = match
        ? { ...match }
        : {
            studentId: s.id,
            studentName: s.name,
            studentCode: s.studentCode,
            classId: currentClassId,
            tx1: undefined,
            tx2: undefined,
            tx3: undefined,
            tx4: undefined,
            gk: undefined,
            ck: undefined,
            average: undefined
          };
    });
    return map;
  });

  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleCellChange = (studentId: string, field: keyof GradeRecord, valStr: string) => {
    const num = valStr === '' ? undefined : parseFloat(valStr);

    if (num !== undefined && (isNaN(num) || num < 0 || num > 10)) {
      warning('Điểm số phải từ 0.0 đến 10.0');
      return;
    }

    setGradesMap(prev => {
      const current = prev[studentId] || {};
      const updated = { ...current, [field]: num };

      // Compute average
      const tx = [updated.tx1, updated.tx2, updated.tx3, updated.tx4].filter(
        v => v !== undefined && v !== null
      ) as number[];
      const txAvg = tx.length > 0 ? tx.reduce((a, b) => a + b, 0) / tx.length : null;
      const gk = updated.gk ?? null;
      const ck = updated.ck ?? null;

      if (txAvg !== null && gk !== null && ck !== null) {
        updated.average = Number(((txAvg * 1 + gk * 2 + ck * 3) / 6).toFixed(1));
      } else if (txAvg !== null) {
        updated.average = Number(txAvg.toFixed(1));
      }

      // Persist to storage
      if (num !== undefined) {
        StorageService.updateGrade(studentId, field, num);
      }
      return { ...prev, [studentId]: updated };
    });

    setHasUnsaved(true);
  };

  const handleSaveAll = () => {
    setHasUnsaved(false);
    success('Đã lưu và đồng bộ toàn bộ sổ điểm!');
  };

  const handleExportExcel = () => {
    const headers = ['Mã HS,Họ và tên,TX 1,TX 2,TX 3,TX 4,Giữa kỳ (GK),Cuối kỳ (CK),Điểm TB'];
    const rows = filteredStudents.map(s => {
      const g = gradesMap[s.id] || {};
      return `"${s.studentCode}","${s.name}","${g.tx1 ?? ''}","${g.tx2 ?? ''}","${g.tx3 ?? ''}","${g.tx4 ?? ''}","${g.gk ?? ''}","${g.ck ?? ''}","${g.average ?? ''}"`;
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_Diem_Lop_${currentClassId}.csv`;
    link.click();
    success('Đã xuất file bảng điểm thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sổ điểm điện tử (Spreadsheet)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhập điểm trực tiếp trên ô lưới với phím Tab/Enter, tự động tính điểm trung bình môn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất file Excel</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu sổ điểm</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, mã HS..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={currentClassId}
            onChange={e => {
              setCurrentClassId(e.target.value);
              setSelectedClassId(e.target.value);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.subject} ({c.totalStudents} HS)
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Tự động tính: (TX + GK×2 + CK×3) ÷ 6</span>
        </div>
      </div>

      {/* SPREADSHEET TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-24">Mã HS</th>
                <th className="py-2.5 px-4 border-r border-slate-200 min-w-[160px]">Họ và tên</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-20 text-center bg-blue-50/50">TX 1</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-20 text-center bg-blue-50/50">TX 2</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-20 text-center bg-blue-50/50">TX 3</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-20 text-center bg-blue-50/50">TX 4</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-24 text-center bg-purple-50 text-purple-900">
                  GK (x2)
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-24 text-center bg-indigo-50 text-indigo-900">
                  CK (x3)
                </th>
                <th className="py-2.5 px-4 text-center bg-slate-200 text-slate-900 w-24 font-mono font-bold">
                  ĐTB
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((s, idx) => {
                const g = gradesMap[s.id] || {};
                return (
                  <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-semibold text-slate-700">
                      {s.studentCode}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-medium text-slate-900">
                      {s.name}
                    </td>

                    {/* TX1 */}
                    <td className="p-0 border-r border-slate-200">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={g.tx1 !== undefined ? g.tx1 : ''}
                        onChange={e => handleCellChange(s.id, 'tx1', e.target.value)}
                        className="w-full h-full py-2 text-center font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* TX2 */}
                    <td className="p-0 border-r border-slate-200">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={g.tx2 !== undefined ? g.tx2 : ''}
                        onChange={e => handleCellChange(s.id, 'tx2', e.target.value)}
                        className="w-full h-full py-2 text-center font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* TX3 */}
                    <td className="p-0 border-r border-slate-200">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={g.tx3 !== undefined ? g.tx3 : ''}
                        onChange={e => handleCellChange(s.id, 'tx3', e.target.value)}
                        className="w-full h-full py-2 text-center font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* TX4 */}
                    <td className="p-0 border-r border-slate-200">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={g.tx4 !== undefined ? g.tx4 : ''}
                        onChange={e => handleCellChange(s.id, 'tx4', e.target.value)}
                        className="w-full h-full py-2 text-center font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* GK */}
                    <td className="p-0 border-r border-slate-200 bg-purple-50/30">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={g.gk !== undefined ? g.gk : ''}
                        onChange={e => handleCellChange(s.id, 'gk', e.target.value)}
                        className="w-full h-full py-2 text-center font-mono font-bold text-purple-700 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </td>

                    {/* CK */}
                    <td className="p-0 border-r border-slate-200 bg-indigo-50/30">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={g.ck !== undefined ? g.ck : ''}
                        onChange={e => handleCellChange(s.id, 'ck', e.target.value)}
                        className="w-full h-full py-2 text-center font-mono font-bold text-indigo-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>

                    {/* AVERAGE TB */}
                    <td className="py-2 px-4 text-center font-mono font-bold text-sm bg-slate-50 text-slate-900">
                      {g.average !== undefined ? (
                        <span className={g.average >= 8 ? 'text-blue-600' : g.average < 6.5 ? 'text-amber-600' : 'text-slate-800'}>
                          {g.average}
                        </span>
                      ) : (
                        '—'
                      )}
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
