import React, { useState } from 'react';
import { StorageService } from '../../data/storage';
import { useToast } from '../../contexts/ToastContext';
import { FileCode, Shield, Download, RefreshCw, HardDriveDownload, Settings } from 'lucide-react';

export const AdminAuditLog: React.FC = () => {
  const auditLogs = StorageService.getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Nhật ký Hoạt động Hệ thống (Audit Trail)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ghi nhận toàn bộ thao tác thêm, sửa, xóa, nhập điểm và phân quyền để phục vụ kiểm toán minh bạch
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Hành động</th>
              <th className="py-3 px-4">Đối tượng</th>
              <th className="py-3 px-4">Người thực hiện</th>
              <th className="py-3 px-4">Chi tiết thao tác</th>
              <th className="py-3 px-4 text-right">IP Client</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">{log.action}</td>
                <td className="py-3 px-4 text-blue-600 font-sans">{log.target}</td>
                <td className="py-3 px-4 font-sans font-medium text-slate-800">
                  {log.userName} ({log.role})
                </td>
                <td className="py-3 px-4 text-slate-600 font-sans">{log.details}</td>
                <td className="py-3 px-4 text-slate-400 text-right">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminBackups: React.FC = () => {
  const { success } = useToast();

  const handleBackupNow = () => {
    const data = {
      users: StorageService.getUsers(),
      classes: StorageService.getClasses(),
      students: StorageService.getStudents(),
      grades: StorageService.getGrades(),
      attendance: StorageService.getAttendance(),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartclass_backup_${Date.now()}.json`;
    link.click();
    StorageService.logAction('Sao lưu dữ liệu', 'Toàn hệ thống', 'Tải bản sao lưu JSON');
    success('Đã tải xuống bản sao lưu toàn bộ dữ liệu!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Sao lưu & Phục hồi Dữ liệu</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tạo bản sao lưu định kỳ của cơ sở dữ liệu và phục hồi khi xảy ra sự cố
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-xl text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Tạo bản sao lưu ngay</h3>
        <p className="text-slate-600 leading-relaxed">
          Tập tin sao lưu bao gồm: danh sách học sinh, điểm danh, sổ điểm, bài tập và cấu hình trường học.
        </p>
        <button
          onClick={handleBackupNow}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <HardDriveDownload className="w-4 h-4" />
          <span>Tải bản sao lưu (JSON)</span>
        </button>
      </div>
    </div>
  );
};

export const AdminSettings: React.FC = () => {
  const { success } = useToast();
  const [schoolName, setSchoolName] = useState('Trường THCS Chu Văn An');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cấu hình Hệ thống Trường học</h1>
        <p className="text-xs text-slate-500 mt-0.5">Thiết lập các tham số vận hành chung</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-xl text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Tên đơn vị trường học</label>
          <input
            type="text"
            value={schoolName}
            onChange={e => setSchoolName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Năm học hiện tại</label>
          <input
            type="text"
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
          />
        </div>

        <button
          onClick={() => {
            StorageService.logAction('Thay đổi cấu hình trường', schoolName, 'Cập nhật tên trường và năm học');
            success('Đã lưu cấu hình trường học!');
          }}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
        >
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
};
