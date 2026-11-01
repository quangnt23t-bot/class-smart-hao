import React from 'react';
import { useClass } from '../../contexts/ClassContext';
import { StorageService } from '../../data/storage';
import { Award, Trophy, Star, Sparkles, Medal, ShieldCheck } from 'lucide-react';

export const RewardsPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const students = StorageService.getStudents(selectedClassId || 'c_6a1');

  // Sort students by reward points
  const sortedStudents = [...students].sort((a, b) => (b.rewardPoints || 0) - (a.rewardPoints || 0));

  // Compute team points
  const groupPoints: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  students.forEach(s => {
    const grp = s.groupNumber || 1;
    groupPoints[grp] = (groupPoints[grp] || 0) + (s.rewardPoints || 0);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Thi đua & Khen thưởng Học sinh</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Khích lệ thành tích, tinh thần tự giác và sự nỗ lực tiến bộ của từng cá nhân và các tổ
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedStudents.slice(0, 3).map((s, idx) => {
          const colors = [
            'from-amber-400 to-amber-600 border-amber-300',
            'from-slate-300 to-slate-500 border-slate-300',
            'from-amber-600 to-amber-800 border-amber-400'
          ][idx];

          const rankLabels = ['Hạng Nhất · Ngôi sao tuần', 'Hạng Nhì · Xuất sắc', 'Hạng Ba · Tiến bộ'][idx];

          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs text-center flex flex-col items-center relative overflow-hidden"
            >
              <div className={`w-full py-1 bg-gradient-to-r ${colors} text-white font-bold text-[10px] uppercase tracking-wider absolute top-0 left-0 right-0`}>
                {rankLabels}
              </div>

              <div className="mt-4 relative">
                <img src={s.avatar} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-100" />
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center absolute -bottom-1 -right-1 shadow-sm">
                  {idx + 1}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3">{s.name}</h3>
              <p className="text-[11px] text-slate-400">Mã: {s.studentCode} · Tổ {s.groupNumber || 1}</p>
              <div className="text-xl font-bold text-blue-600 font-mono mt-2">{s.rewardPoints} điểm</div>

              <div className="flex flex-wrap gap-1 justify-center mt-3">
                {s.badges.map((b, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded-md font-semibold border border-amber-200">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Team / Group Competition Leaderboard */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Bảng điểm thi đua các Tổ học tập</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[1, 2, 3, 4].map(g => (
            <div key={g} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block">TỔ {g}</span>
              <div className="text-2xl font-bold text-blue-600 font-mono mt-1">
                {groupPoints[g]} đ
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {students.filter(s => (s.groupNumber || 1) === g).length} thành viên
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-xs">
          Bảng xếp hạng cá nhân toàn lớp
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {sortedStudents.map((s, idx) => (
            <div key={s.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono font-bold text-slate-400 text-center">{idx + 1}</span>
                <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Mã: {s.studentCode} · Huy hiệu: {s.badges.join(', ')}
                  </div>
                </div>
              </div>

              <div className="font-mono font-bold text-blue-600 text-sm">
                {s.rewardPoints} điểm
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
