import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { Student } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Users, Shuffle, Copy, Check } from 'lucide-react';

export const GroupMaker: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId, students } = useClass();
  const { success } = useToast();

  const [mode, setMode] = useState<'by_groups' | 'by_members'>('by_groups');
  const [value, setValue] = useState(4); // 4 groups or 4 members per group
  const [groups, setGroups] = useState<{ id: number; name: string; members: Student[] }[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerateGroups = () => {
    if (students.length === 0) return;

    // Shuffle students
    const shuffled = [...students].sort(() => Math.random() - 0.5);

    let numGroups = 4;
    if (mode === 'by_groups') {
      numGroups = Math.max(1, Math.min(value, students.length));
    } else {
      const perGroup = Math.max(1, value);
      numGroups = Math.ceil(students.length / perGroup);
    }

    const created: { id: number; name: string; members: Student[] }[] = Array.from(
      { length: numGroups },
      (_, i) => ({
        id: i + 1,
        name: `Nhóm ${i + 1}`,
        members: []
      })
    );

    // Distribute round-robin for equal balance
    shuffled.forEach((student, index) => {
      const groupIdx = index % numGroups;
      created[groupIdx].members.push(student);
    });

    setGroups(created);
  };

  const handleCopyGroups = () => {
    if (groups.length === 0) return;
    const text = groups
      .map(
        g =>
          `📌 ${g.name} (${g.members.length} thành viên):\n` +
          g.members.map((m, i) => `  ${i + 1}. ${m.name} (${m.studentCode})`).join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Đã sao chép danh sách nhóm vào clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>👥 Chia nhóm học tập tự động</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ đều số lượng học sinh vào từng nhóm để làm việc nhóm, thuyết trình, thảo luận
          </p>
        </div>

        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
        >
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.totalStudents} HS)
            </option>
          ))}
        </select>
      </div>

      {/* Configuration bar */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Cách chia:</span>
            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setMode('by_groups')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  mode === 'by_groups' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Số lượng nhóm
              </button>
              <button
                type="button"
                onClick={() => setMode('by_members')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  mode === 'by_members' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Số người / nhóm
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              {mode === 'by_groups' ? 'Số nhóm cần tạo:' : 'Số học sinh mỗi nhóm:'}
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={value}
              onChange={e => setValue(Number(e.target.value))}
              className="w-16 bg-white border border-slate-300 rounded-md px-2 py-1 text-center font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {groups.length > 0 && (
            <button
              onClick={handleCopyGroups}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép nhóm'}</span>
            </button>
          )}

          <button
            onClick={handleGenerateGroups}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>CHIA NHÓM NGAY</span>
          </button>
        </div>
      </div>

      {/* Groups Display */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groups.map(g => (
            <div key={g.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-xs">{g.name}</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {g.members.length} HS
                </span>
              </div>
              <ul className="space-y-1.5 flex-1">
                {g.members.map((m, idx) => (
                  <li key={m.id} className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="w-4 text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                    <img src={m.avatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    <span className="truncate font-medium">{m.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
          Chọn số lượng nhóm và nhấn "CHIA NHÓM NGAY"
        </div>
      )}
    </div>
  );
};
