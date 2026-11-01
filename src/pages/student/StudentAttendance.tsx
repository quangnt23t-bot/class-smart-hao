import React from 'react';
import { StorageService } from '../../data/storage';
import { CheckCircle2, Award, User, Clock } from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const student = StorageService.getStudentById('s_1')!;
  const attendanceRecords = StorageService.getAttendance().filter(a => a.studentId === student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Chuyên cần của tôi</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tỷ lệ chuyên cần đạt <strong>{student.attendanceRate}%</strong>. Chúc mừng em đã duy trì đi học đầy đủ và đúng giờ.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Lịch sử điểm danh chi tiết</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {attendanceRecords.map(a => (
            <div key={a.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-500">{a.date}</span>
                <span className="text-slate-800 font-medium ml-3">{a.period}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Có mặt
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StudentAchievements: React.FC = () => {
  const student = StorageService.getStudentById('s_1')!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Huy hiệu & Thành tích Thi đua</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tổng điểm thi đua hiện tại: <strong>{student.rewardPoints} điểm</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {student.badges.map((badge, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mb-3">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{badge}</h3>
            <p className="text-xs text-slate-400 mt-1">Đạt danh hiệu tuần 3 và 4</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StudentProfile: React.FC = () => {
  const student = StorageService.getStudentById('s_1')!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hồ sơ cá nhân Học sinh</h1>
        <p className="text-xs text-slate-500 mt-0.5">Thông tin định danh và tài khoản học sinh</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-lg text-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <img src={student.avatar} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
            <p className="text-slate-400 font-mono">Mã HS: {student.studentCode} · Lớp {student.className}</p>
          </div>
        </div>

        <div className="space-y-2 text-slate-700">
          <div>Giới tính: <strong>{student.gender}</strong></div>
          <div>Ngày sinh: <strong>{student.birthDate}</strong></div>
          <div>Phụ huynh: <strong>{student.parentName}</strong> ({student.parentPhone})</div>
          <div>Địa chỉ: <strong>{student.address || 'Hà Nội'}</strong></div>
        </div>
      </div>
    </div>
  );
};
