import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { Student, AttendanceStatus, AttendanceRecord } from '../../types';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Save, RotateCcw, Calendar, Check } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId } = useClass();
  const { success } = useToast();
  const [searchParams] = useSearchParams();

  const classIdFromUrl = searchParams.get('classId');
  const [currentClassId, setCurrentClassId] = useState(classIdFromUrl || selectedClassId || 'c_6a1');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('Buổi sáng - Tiết 1');

  const students = StorageService.getStudents(currentClassId);
  const existingRecords = StorageService.getAttendance(currentClassId, currentDate);

  // Local state map for attendance statuses & notes
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize or load existing records
  useEffect(() => {
    const sMap: Record<string, AttendanceStatus> = {};
    const nMap: Record<string, string> = {};

    students.forEach(s => {
      const match = existingRecords.find(r => r.studentId === s.id);
      sMap[s.id] = match ? match.status : 'present'; // default present
      nMap[s.id] = match?.note || '';
    });

    setStatusMap(sMap);
    setNoteMap(nMap);
    setIsDirty(false);
  }, [currentClassId, currentDate, students.length]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      updated[s.id] = 'present';
    });
    setStatusMap(updated);
    setIsDirty(true);
    success('Đã đánh dấu tất cả có mặt. Bạn có thể chỉnh các học sinh vắng/trễ.');
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatusMap(prev => ({ ...prev, [studentId]: status }));
    setIsDirty(true);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNoteMap(prev => ({ ...prev, [studentId]: note }));
    setIsDirty(true);
  };

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = students.map(s => ({
      id: `att_${s.id}_${currentDate}`,
      classId: currentClassId,
      studentId: s.id,
      studentName: s.name,
      date: currentDate,
      period,
      status: statusMap[s.id] || 'present',
      note: noteMap[s.id] || undefined,
      recordedBy: 'Cô Nguyễn Thị Lan',
      recordedAt: new Date().toLocaleString('vi-VN')
    }));

    StorageService.recordAttendanceBulk(newRecords);
    setIsDirty(false);
    success(`Đã lưu điểm danh lớp cho ngày ${currentDate}!`);
  };

  const handleReset = () => {
    const sMap: Record<string, AttendanceStatus> = {};
    const nMap: Record<string, string> = {};
    students.forEach(s => {
      const match = existingRecords.find(r => r.studentId === s.id);
      sMap[s.id] = match ? match.status : 'present';
      nMap[s.id] = match?.note || '';
    });
    setStatusMap(sMap);
    setNoteMap(nMap);
    setIsDirty(false);
  };

  // Status stats
  const presentCount = Object.values(statusMap).filter(s => s === 'present').length;
  const lateCount = Object.values(statusMap).filter(s => s === 'late').length;
  const excusedCount = Object.values(statusMap).filter(s => s === 'excused').length;
  const unexcusedCount = Object.values(statusMap).filter(s => s === 'unexcused').length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Context selectors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Điểm danh Lớp học</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Giao diện tối ưu điểm danh nhanh, chính xác cho lớp học
            </p>
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Đánh dấu tất cả có mặt</span>
          </button>
        </div>

        {/* 3 Selectors (Class, Date, Period) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Lớp học</label>
            <select
              value={currentClassId}
              onChange={e => {
                setCurrentClassId(e.target.value);
                setSelectedClassId(e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.subject} ({c.totalStudents} HS)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ngày điểm danh</label>
            <input
              type="date"
              value={currentDate}
              onChange={e => setCurrentDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tiết / Buổi học</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800"
            >
              <option value="Buổi sáng - Tiết 1">Buổi sáng - Tiết 1 (07:30 - 08:15)</option>
              <option value="Buổi sáng - Tiết 2">Buổi sáng - Tiết 2 (08:25 - 09:10)</option>
              <option value="Buổi sáng - Tiết 3">Buổi sáng - Tiết 3 (09:15 - 10:00)</option>
              <option value="Buổi sáng - Tiết 4">Buổi sáng - Tiết 4 (10:05 - 10:50)</option>
              <option value="Buổi chiều - Tiết 1">Buổi chiều - Tiết 1 (13:30 - 14:15)</option>
            </select>
          </div>
        </div>

        {/* Live Counts Bar */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
            <span className="block text-[10px] text-emerald-600 font-medium">Có mặt</span>
            <strong className="text-base font-bold">{presentCount}</strong>
          </div>
          <div className="p-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
            <span className="block text-[10px] text-blue-600 font-medium">Có phép</span>
            <strong className="text-base font-bold">{excusedCount}</strong>
          </div>
          <div className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            <span className="block text-[10px] text-amber-600 font-medium">Đi trễ</span>
            <strong className="text-base font-bold">{lateCount}</strong>
          </div>
          <div className="p-2 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
            <span className="block text-[10px] text-rose-600 font-medium">Không phép</span>
            <strong className="text-base font-bold">{unexcusedCount}</strong>
          </div>
        </div>
      </div>

      {/* Student Attendance List (Mobile First Cards / Desktop Row) */}
      <div className="space-y-3">
        {students.map((student, index) => {
          const currentStatus = statusMap[student.id] || 'present';
          const currentNote = noteMap[student.id] || '';

          return (
            <div
              key={student.id}
              className={`p-4 bg-white rounded-xl border transition-all shadow-2xs ${
                currentStatus !== 'present'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <span className="w-6 text-slate-400 font-mono text-xs">{index + 1}.</span>
                  <img
                    src={student.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                    <div className="text-[11px] text-slate-400">
                      Mã: {student.studentCode} · Tổ {student.groupNumber || 1}
                    </div>
                  </div>
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Có mặt
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      currentStatus === 'excused'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Có phép
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      currentStatus === 'late'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Đi trễ
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'unexcused')}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      currentStatus === 'unexcused'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Không phép
                  </button>
                </div>
              </div>

              {/* Note input if absent or late */}
              {currentStatus !== 'present' && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  <input
                    type="text"
                    value={currentNote}
                    onChange={e => handleNoteChange(student.id, e.target.value)}
                    placeholder="Ghi chú lý do nghỉ / số phút đi muộn (VD: Ốm có giấy phép, hỏng xe...)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Save Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 sm:px-8 z-40 shadow-xl flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xs text-slate-600 flex items-center gap-2">
          {isDirty ? (
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Chưa lưu thay đổi điểm danh</span>
            </span>
          ) : (
            <span className="text-slate-400">Đã đồng bộ với hệ thống</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>LƯU ĐIỂM DANH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
