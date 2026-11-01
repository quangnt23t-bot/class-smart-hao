import React, { useState } from 'react';
import { StorageService } from '../../data/storage';
import { useToast } from '../../contexts/ToastContext';
import { Alert } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  Check,
  Send,
  UserX,
  FileWarning
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { success } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(StorageService.getAlerts());
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [activeAlertToResolve, setActiveAlertToResolve] = useState<Alert | null>(null);
  const [actionNote, setActionNote] = useState('');

  const filtered = alerts.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const handleUpdateStatus = (alertId: string, newStatus: Alert['status'], note?: string) => {
    StorageService.updateAlertStatus(alertId, newStatus, note);
    setAlerts(StorageService.getAlerts());
    success(`Đã cập nhật trạng thái cảnh báo sang: ${newStatus}`);
    setActiveAlertToResolve(null);
    setActionNote('');
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Mới phát hiện</span>;
      case 'viewed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Đã xem</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Đang xử lý</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã giải quyết</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cảnh báo Học tập Thông minh</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động phát hiện học sinh có nguy cơ tụt hạng, sụt giảm chuyên cần hoặc chưa nộp nhiều bài tập
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả cảnh báo ({alerts.length})
        </button>
        <button
          onClick={() => setStatusFilter('new')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            statusFilter === 'new' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cần xử lý ({alerts.filter(a => a.status === 'new').length})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang theo dõi ({alerts.filter(a => a.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            statusFilter === 'resolved' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đã giải quyết ({alerts.filter(a => a.status === 'resolved').length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map(a => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl border transition-all shadow-2xs ${
              a.status === 'resolved' ? 'bg-white border-slate-200 opacity-80' : 'bg-white border-amber-300 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    a.severity === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
                    {getStatusBadge(a.status)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Học sinh: <strong>{a.studentName}</strong> · Lớp {a.className} · Ngày phát hiện: {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                {a.status === 'new' && (
                  <button
                    onClick={() => handleUpdateStatus(a.id, 'in_progress')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-semibold transition-colors"
                  >
                    Bắt đầu xử lý
                  </button>
                )}

                {a.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      setActiveAlertToResolve(a);
                      setActionNote(a.actionTaken || '');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-xs"
                  >
                    Đánh dấu đã giải quyết
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 ml-11 leading-relaxed">{a.description}</p>

            {a.actionTaken && (
              <div className="mt-3 ml-11 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200">
                <strong>Biện pháp đã xử lý:</strong> {a.actionTaken}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RESOLVE MODAL */}
      {activeAlertToResolve && (
        <Modal
          isOpen={!!activeAlertToResolve}
          onClose={() => setActiveAlertToResolve(null)}
          title="Ghi nhận giải quyết cảnh báo"
          subtitle={`Ghi rõ biện pháp can thiệp cho học sinh ${activeAlertToResolve.studentName}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Biện pháp đã thực hiện (VD: Đã gọi điện phụ huynh, đã phụ đạo thêm 1 buổi...)
              </label>
              <textarea
                rows={3}
                required
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                placeholder="Nhập nội dung xử lý..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveAlertToResolve(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(activeAlertToResolve.id, 'resolved', actionNote)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
              >
                Hoàn tất giải quyết
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
