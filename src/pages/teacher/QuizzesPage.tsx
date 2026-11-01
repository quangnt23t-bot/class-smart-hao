import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { Quiz } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Share2,
  Edit2,
  Copy,
  Sparkles
} from 'lucide-react';

export const QuizzesPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { success, error } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>(StorageService.getQuizzes());
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(15);
  const [targetClass, setTargetClass] = useState(selectedClassId || 'c_6a1');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);

  const questions = StorageService.getQuestions();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Vui lòng nhập tên đề kiểm tra');
      return;
    }
    const c = classes.find(x => x.id === targetClass) || classes[0];
    const created = StorageService.addQuiz({
      classId: c.id,
      className: c.name,
      title: title.trim(),
      description: 'Đánh giá kiến thức trọng tâm học kỳ 1.',
      durationMinutes: Number(duration) || 15,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      shuffleQuestions,
      shuffleAnswers,
      autoGrade: true,
      questions: questions.slice(0, 4),
      status: 'published',
      totalQuestions: 4,
      totalPoints: 10
    });
    setQuizzes(StorageService.getQuizzes());
    success(`Đã tạo đề kiểm tra "${created.title}" thành công!`);
    setIsCreateOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kiểm tra & Quiz trực tuyến</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý đề kiểm tra 15 phút, 1 tiết, thi học kỳ với hệ thống chấm điểm tự động
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đề kiểm tra mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map(q => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Lớp {q.className}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">{q.title}</h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang mở thi
              </span>
            </div>

            <p className="text-xs text-slate-500">{q.description}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Thời gian</span>
                <span className="font-bold text-slate-800">{q.durationMinutes} phút</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Số câu hỏi</span>
                <span className="font-bold text-slate-800">{q.totalQuestions} câu</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Chấm điểm</span>
                <span className="font-bold text-emerald-600">Tự động</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-mono text-[10px]">
                {q.shuffleQuestions ? 'Đảo câu & đáp án: Bật' : 'Không đảo câu'}
              </span>
              <button
                onClick={() => success(`Đã sao chép link đề kiểm tra: ${q.title}`)}
                className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ link thi</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE QUIZ MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo đề kiểm tra mới"
        subtitle="Cấu hình thời gian làm bài và liên kết với ngân hàng câu hỏi"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tên đề kiểm tra *</label>
            <input
              type="text"
              required
              placeholder="VD: Kiểm tra 15 phút - Chương 1..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lớp làm bài</label>
              <select
                value={targetClass}
                onChange={e => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.subject})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Thời gian (phút)</label>
              <input
                type="number"
                min={5}
                max={90}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={e => setShuffleQuestions(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-700">Tự động xáo trộn thứ tự câu hỏi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shuffleAnswers}
                onChange={e => setShuffleAnswers(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-700">Tự động xáo trộn các phương án A, B, C, D</span>
            </label>
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
              Phát đề ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
