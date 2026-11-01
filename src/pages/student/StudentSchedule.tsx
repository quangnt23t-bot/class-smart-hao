import React from 'react';
import { StorageService } from '../../data/storage';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const StudentSchedule: React.FC = () => {
  const schedule = StorageService.getSchedule();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Thời khóa biểu Học sinh</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lịch học tuần này của lớp 6A1
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {[2, 3, 4, 5, 6].map(day => {
          const items = schedule.filter(s => s.dayOfWeek === day);
          const dayName = `Thứ ${day}`;

          return (
            <div key={day} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>{dayName}</span>
                {day === 2 && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Hôm nay
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {items.map(it => (
                  <div key={it.id} className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                    <div className="font-bold text-slate-800">Tiết {it.period}: {it.subject}</div>
                    <div className="text-[11px] text-slate-400">{it.time} · {it.room}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
