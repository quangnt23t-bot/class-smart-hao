import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { Student } from '../../types';
import { UserCheck, RefreshCw, History, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RandomPicker: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId, students } = useClass();

  const [pickCount, setPickCount] = useState(1);
  const [avoidRepeats, setAvoidRepeats] = useState(true);
  const [pickedHistory, setPickedHistory] = useState<Student[]>([]);
  const [currentPicked, setCurrentPicked] = useState<Student[]>([]);

  const handlePick = () => {
    let pool = students;
    if (avoidRepeats && pickedHistory.length > 0) {
      pool = students.filter(s => !pickedHistory.some(p => p.id === s.id));
      if (pool.length < pickCount) {
        // Pool exhausted, reset pool
        pool = students;
      }
    }

    if (pool.length === 0) return;

    // Shuffle and slice pickCount
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(pickCount, pool.length));

    setCurrentPicked(selected);
    setPickedHistory(prev => [...selected, ...prev]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleReset = () => {
    setPickedHistory([]);
    setCurrentPicked([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🎯 Chọn học sinh ngẫu nhiên</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bốc thăm 1 hoặc nhiều học sinh bất kỳ với thuật toán xáo trộn công bằng
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        </div>
      </div>

      {/* Configuration bar */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Số lượng chọn:</span>
            <select
              value={pickCount}
              onChange={e => setPickCount(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1 font-semibold text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>
                  {n} học sinh
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={avoidRepeats}
              onChange={e => setAvoidRepeats(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600">Tránh gọi lại học sinh đã gọi</span>
          </label>
        </div>

        <button
          onClick={handlePick}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>CHỌN NGẪU NHIÊN</span>
        </button>
      </div>

      {/* Result Display */}
      {currentPicked.length > 0 ? (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Kết quả lượt chọn này ({currentPicked.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentPicked.map(s => (
              <div
                key={s.id}
                className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3 animate-in zoom-in-95 duration-150"
              >
                <img src={s.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-400" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{s.name}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mã: {s.studentCode} · {s.className}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
          Nhấn "CHỌN NGẪU NHIÊN" để bốc thăm học sinh
        </div>
      )}

      {/* History Log */}
      {pickedHistory.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
            <History className="w-4 h-4 text-slate-400" />
            <span>Lịch sử các học sinh đã được gọi ({pickedHistory.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pickedHistory.map((s, idx) => (
              <span
                key={`${s.id}_${idx}`}
                className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 text-xs font-medium"
              >
                {s.name} ({s.studentCode})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
