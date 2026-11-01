import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { BehaviorRecord } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  HeartHandshake,
  Plus,
  Search,
  ThumbsUp,
  AlertCircle,
  Award,
  Filter
} from 'lucide-react';

export const BehaviorPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { success, error } = useToast();

  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>(StorageService.getBehaviors());
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'reminder'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const students = StorageService.getStudents();

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 's_1');
  const [type, setType] = useState<'positive' | 'reminder'>('positive');
  const [category, setCategory] = useState('Phát biểu xây dựng bài');
  const [points, setPoints] = useState(5);
  const [note, setNote] = useState('');

  const filtered = behaviors.filter(b => {
    if (filterType === 'positive') return b.type === 'positive';
    if (filterType === 'reminder') return b.type === 'reminder';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st) return;

    const created = StorageService.addBehavior({
      classId: st.classId,
      studentId: st.id,
      studentName: st.name,
      type,
      category,
      points: type === 'positive' ? Math.abs(points) : -Math.abs(points),
      date: new Date().toLocaleString('vi-VN'),
      teacherId: 'u_teacher_1',
      teacherName: 'Cô Nguyễn Thị Lan',
      note: note.trim()
    });

    setBehaviors(StorageService.getBehaviors());
    success(`Đã ghi nhận ${type === 'positive' ? 'khen thưởng' : 'nhắc nhở'} cho ${st.name}!`);
    setIsAddOpen(false);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sổ Ghi nhận Hành vi & Nề nếp</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận các biểu hiện tích cực, điểm cộng khuyến khích và các hành vi cần nhắc nhở
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận hành vi</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ghi nhận ({behaviors.length})
        </button>
        <button
          onClick={() => setFilterType('positive')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filterType === 'positive' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Biểu dương / Tích cực ({behaviors.filter(b => b.type === 'positive').length})
        </button>
        <button
          onClick={() => setFilterType('reminder')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filterType === 'reminder' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cần nhắc nhở ({behaviors.filter(b => b.type === 'reminder').length})
        </button>
      </div>

      {/* Behaviors List */}
      <div className="space-y-3">
        {filtered.map(b => (
          <div
            key={b.id}
            className={`p-4 rounded-xl border flex items-start justify-between text-xs transition-all ${
              b.type === 'positive'
                ? 'bg-emerald-50/40 border-emerald-200'
                : 'bg-rose-50/40 border-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  b.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}
              >
                {b.type === 'positive' ? <ThumbsUp className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{b.studentName}</span>
                  <span className="text-[10px] text-slate-400">· {b.date}</span>
                </div>
                <div className="font-semibold text-slate-800 mt-0.5">{b.category}</div>
                {b.note && <p className="text-slate-500 mt-1 leading-relaxed">{b.note}</p>}
                <div className="text-[10px] text-slate-400 mt-1.5">Ghi nhận: {b.teacherName}</div>
              </div>
            </div>

            <span
              className={`font-mono font-bold text-base px-2.5 py-1 rounded-lg ${
                b.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {b.points > 0 ? `+${b.points}` : b.points}
            </span>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Ghi nhận hành vi nề nếp học sinh"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Chọn học sinh</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentCode} - Lớp {s.className})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Loại ghi nhận</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('positive');
                  setCategory('Phát biểu xây dựng bài');
                  setPoints(5);
                }}
                className={`py-2 rounded-lg font-semibold border ${
                  type === 'positive'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                + Tích cực / Khen thưởng
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('reminder');
                  setCategory('Nói chuyện riêng');
                  setPoints(2);
                }}
                className={`py-2 rounded-lg font-semibold border ${
                  type === 'reminder'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                - Cần nhắc nhở
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nội dung ghi nhận</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {type === 'positive' ? (
                <>
                  <option value="Phát biểu xây dựng bài">Phát biểu xây dựng bài (+5đ)</option>
                  <option value="Giúp bạn học tập">Giúp bạn học tập (+5đ)</option>
                  <option value="Hoàn thành xuất sắc bài tập">Hoàn thành xuất sắc bài tập (+10đ)</option>
                  <option value="Tiến bộ trong tuần">Có tiến bộ vượt bậc (+5đ)</option>
                </>
              ) : (
                <>
                  <option value="Nói chuyện riêng">Nói chuyện riêng trong giờ (-2đ)</option>
                  <option value="Quên mang bài tập">Quên mang bài tập về nhà (-3đ)</option>
                  <option value="Không chú ý nghe giảng">Không chú ý nghe giảng (-2đ)</option>
                  <option value="Đi trễ không phép">Đi trễ không phép (-3đ)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ghi chú cụ thể</label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Chi tiết hoàn cảnh hoặc lời nhắc nhở..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Lưu ghi nhận
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
