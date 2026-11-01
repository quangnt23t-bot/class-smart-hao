import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../data/storage';
import {
  School,
  Users,
  Shield,
  FileCode,
  HardDriveDownload,
  Settings,
  ArrowRight,
  TrendingUp,
  Server,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const users = StorageService.getUsers();
  const classes = StorageService.getClasses();
  const students = StorageService.getStudents();
  const auditLogs = StorageService.getAuditLogs();

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Bảng điều khiển Quản trị viên Hệ thống
          </span>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            Trường THCS Chu Văn An
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Hệ thống đang phục vụ <strong>{classes.length} lớp học</strong>, <strong>{students.length} học sinh</strong> và <strong>{users.length} tài khoản người dùng</strong>. Tình trạng máy chủ: Bình thường, thời gian phản hồi: 45ms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
          >
            Quản lý tài khoản
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Tổng người dùng</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{users.length} tài khoản</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Giáo viên, HS, Phụ huynh</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/classes')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Lớp học hoạt động</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{classes.length} lớp</div>
          <div className="text-[11px] text-slate-400 mt-1">Năm học 2025 - 2026</div>
        </div>

        <div
          onClick={() => navigate('/admin/audit-log')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Nhật ký Audit Log</span>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">{auditLogs.length} sự kiện</div>
          <div className="text-[11px] text-slate-400 mt-1">Ghi nhận minh bạch</div>
        </div>

        <div
          onClick={() => navigate('/admin/backups')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <span className="text-slate-500 font-medium">Bản sao lưu</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">An toàn</div>
          <div className="text-[11px] text-slate-400 mt-1">Lần sao lưu gần nhất: Hôm qua</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Recent Audit Logs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Nhật ký hoạt động hệ thống gần nhất (Audit Trail)</span>
            </h3>
            <button
              onClick={() => navigate('/admin/audit-log')}
              className="font-semibold text-blue-600 hover:underline"
            >
              Xem toàn bộ →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">{log.action}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{log.details}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Thực hiện bởi: <strong>{log.userName}</strong> ({log.role}) · IP: {log.ip}
                  </div>
                </div>
                <span className="font-mono text-slate-400 text-[11px] shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Chức năng quản trị</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between"
              >
                <span>Quản lý tài khoản & Phân quyền</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/admin/classes')}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between"
              >
                <span>Cấu hình Lớp học & Khối lớp</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/admin/backups')}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between"
              >
                <span>Sao lưu & Phục hồi dữ liệu</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 flex items-center justify-between"
              >
                <span>Cấu hình Tham số Trường học</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
