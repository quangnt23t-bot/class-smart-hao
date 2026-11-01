import React, { useState } from 'react';
import { StorageService } from '../../data/storage';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { Announcement } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Bell, Plus, Search, Send, Clock, Eye, AlertCircle } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { success, error } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>(StorageService.getAnnouncements());
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<Announcement['target']>('all');
  const [priority, setPriority] = useState<Announcement['priority']>('normal');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      error('Vui lòng điền đủ thông tin');
      return;
    }
    const created = StorageService.addAnnouncement({
      title: title.trim(),
      content: content.trim(),
      senderName: 'Cô Nguyễn Thị Lan',
      senderRole: 'Giáo viên chủ nhiệm',
      target,
      priority
    });
    setAnnouncements(StorageService.getAnnouncements());
    success('Đã phát thông báo mới thành công!');
    setIsCreateOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bảng Tin & Thông báo Lớp học</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gửi thông báo nhanh đến toàn trường, các lớp chủ nhiệm, phụ huynh hoặc học sinh
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      a.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : a.priority === 'important'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {a.priority === 'urgent' ? 'Khẩn cấp' : a.priority === 'important' ? 'Quan trọng' : 'Bình thường'}
                  </span>
                  <span className="text-[11px] text-slate-400">· Đối tượng: {a.target === 'all' ? 'Toàn trường' : a.target === 'parents' ? 'Phụ huynh' : 'Lớp học'}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
              </div>

              <span className="text-xs text-slate-400 font-mono shrink-0">{a.createdAt}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Người gửi: <strong>{a.senderName}</strong> ({a.senderRole})</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{a.viewsCount} lượt xem</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Gửi thông báo mới"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              placeholder="VD: Lịch thi giữa kỳ 1, Nhắc nhở đồng phục..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gửi đến đối tượng</label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">Toàn thể lớp và phụ huynh</option>
                <option value="class">Chỉ học sinh trong lớp</option>
                <option value="parents">Chỉ gửi phụ huynh học sinh</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="normal">Bình thường</option>
                <option value="important">Quan trọng</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nội dung chi tiết *</label>
            <textarea
              rows={4}
              required
              placeholder="Nhập nội dung cần truyền đạt..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Phát thông báo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
