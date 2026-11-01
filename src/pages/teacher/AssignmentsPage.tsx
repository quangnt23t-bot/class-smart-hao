import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { Assignment, Submission } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Send,
  MoreVertical,
  Paperclip,
  Check
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'expired' | 'draft'>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState(selectedClassId || 'all');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(9);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(10);
  const [targetClass, setTargetClass] = useState(selectedClassId || 'c_6a1');

  const assignments = StorageService.getAssignments();
  const submissions = StorageService.getSubmissions();

  const filtered = assignments.filter(a => {
    const matchClass = selectedClassFilter === 'all' || a.classId === selectedClassFilter;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const isExpired = new Date(a.dueDate) < new Date();

    if (activeTab === 'published') return matchClass && matchSearch && a.status === 'published' && !isExpired;
    if (activeTab === 'expired') return matchClass && matchSearch && isExpired;
    if (activeTab === 'draft') return matchClass && matchSearch && a.status === 'draft';
    return matchClass && matchSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      error('Vui lòng điền đủ tiêu đề và hạn nộp');
      return;
    }
    const c = classes.find(x => x.id === targetClass) || classes[0];
    StorageService.addAssignment({
      classId: c.id,
      className: c.name,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      assignedDate: new Date().toISOString(),
      maxScore: Number(maxScore) || 10,
      status: 'published',
      targetType: 'all'
    });
    success(`Đã giao bài tập thành công cho lớp ${c.name}!`);
    setIsCreateOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleDuplicate = (asg: Assignment) => {
    StorageService.addAssignment({
      ...asg,
      title: `${asg.title} (Bản sao)`
    });
    success(`Đã nhân bản bài tập "${asg.title}"!`);
  };

  const handleRemindStudents = (asg: Assignment) => {
    success(`Đã gửi thông báo nhắc nhở nộp bài đến các học sinh lớp ${asg.className}!`);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    StorageService.gradeSubmission(gradingSubmission.id, Number(scoreInput), feedbackInput);
    success(`Đã chấm bài cho học sinh ${gradingSubmission.studentName} (${scoreInput}đ)!`);
    setGradingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Bài tập về nhà</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giao bài, theo dõi tiến độ nộp bài, chấm điểm trực tiếp và gửi nhận xét cho học sinh
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        {/* 4 Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs">
          {[
            { key: 'all', label: 'Tất cả bài tập' },
            { key: 'published', label: 'Đang giao' },
            { key: 'expired', label: 'Hết hạn nộp' },
            { key: 'draft', label: 'Bản nháp' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề bài tập..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={selectedClassFilter}
            onChange={e => setSelectedClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(asg => {
          const isExpired = new Date(asg.dueDate) < new Date();
          const asgSubmissions = submissions.filter(s => s.assignmentId === asg.id);

          return (
            <div
              key={asg.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Lớp {asg.className} · Thang {asg.maxScore}đ
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">{asg.title}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isExpired ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isExpired ? 'Hết hạn' : 'Đang giao'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{asg.description}</p>

                {/* Submissions tracking bar */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2 mb-4">
                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-600">
                    <span>Tiến độ nộp bài:</span>
                    <span className="font-bold text-slate-900">
                      {asg.totalSubmissions || asgSubmissions.length} học sinh đã nộp
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((asg.totalSubmissions || 1) / 32) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Đã chấm: {asg.gradedCount || 0} bài</span>
                    <span className="text-amber-600 font-semibold">Chờ chấm: {asg.pendingCount || 0} bài</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemindStudents(asg)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    title="Nhắc nhở học sinh chưa nộp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(asg)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Nhân bản đề bài"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {asgSubmissions.length > 0 && (
                    <button
                      onClick={() => {
                        setGradingSubmission(asgSubmissions[0]);
                        setScoreInput(asgSubmissions[0].score || 9);
                        setFeedbackInput(asgSubmissions[0].feedback || 'Làm bài tốt');
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Chấm bài ({asgSubmissions.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Giao bài tập mới"
        subtitle="Soạn tiêu đề, yêu cầu và chỉ định lớp học"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tiêu đề bài tập *</label>
            <input
              type="text"
              required
              placeholder="VD: Bài tập số học 05..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lớp nhận bài</label>
              <select
                value={targetClass}
                onChange={e => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Thang điểm</label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={e => setMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Hạn nộp bài *</label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Yêu cầu bài làm</label>
            <textarea
              rows={3}
              placeholder="Hướng dẫn chi tiết cách làm, trang SGK hoặc lưu ý nộp..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Giao bài ngay
            </button>
          </div>
        </form>
      </Modal>

      {/* GRADING SUBMISSION MODAL */}
      {gradingSubmission && (
        <Modal
          isOpen={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          title={`Chấm bài: ${gradingSubmission.studentName}`}
          subtitle="Nhập điểm số và nhận xét chi tiết gửi cho học sinh"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Nội dung bài làm của học sinh:</span>
              <p className="text-slate-800 leading-relaxed italic">{gradingSubmission.content || 'Em xin gửi file bài làm ạ.'}</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Điểm số (Thang 10) *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                required
                value={scoreInput}
                onChange={e => setScoreInput(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-lg text-blue-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lời nhận xét / Lời phê của cô *</label>
              <textarea
                rows={3}
                required
                placeholder="Nhập nhận xét động viên, chỉ rõ ưu nhược điểm..."
                value={feedbackInput}
                onChange={e => setFeedbackInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Lưu điểm & Trả bài
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
