import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  FileCode,
  Sparkles,
  Layers,
  BookOpen,
  Check,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { QuizQuestion } from '../../types';
import { downloadFile } from '../../utils/questionTemplates';

interface RepositoryViewProps {
  questions: QuizQuestion[];
  onUpdateQuestion: (updated: QuizQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onDeleteBulk: (ids: string[]) => void;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteBulk,
  onSuccessToast,
  onErrorToast
}) => {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [reviewOnlyFilter, setReviewOnlyFilter] = useState(false);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isExamPreviewOpen, setIsExamPreviewOpen] = useState(false);
  const [examIncludeAnswers, setExamIncludeAnswers] = useState(false);

  // Filter questions
  const filtered = questions.filter(q => {
    const matchSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(search.toLowerCase())) ||
      (q.tags && q.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

    const matchSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchGrade = gradeFilter === 'all' || q.grade === gradeFilter;
    const matchDiff = diffFilter === 'all' || q.difficulty === diffFilter;
    const matchSource = sourceFilter === 'all' || q.sourceType === sourceFilter;
    const matchReview = !reviewOnlyFilter || !!q.needsReview;

    return matchSearch && matchSubject && matchGrade && matchDiff && matchSource && matchReview;
  });

  // Statistics calculation
  const totalCount = questions.length;
  const easyCount = questions.filter(q => q.difficulty === 'easy').length;
  const medCount = questions.filter(q => q.difficulty === 'medium').length;
  const hardCount = questions.filter(q => q.difficulty === 'hard').length;
  const expertCount = questions.filter(q => q.difficulty === 'expert').length;
  const needsReviewCount = questions.filter(q => q.needsReview).length;

  const aiCount = questions.filter(q => q.sourceType === 'ai').length;
  const fileCount = questions.filter(q => q.sourceType === 'file').length;
  const manualCount = questions.filter(q => q.sourceType === 'manual' || !q.sourceType).length;

  // Bulk selection handling
  const handleToggleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedIds(filtered.map(q => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSingle = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} câu hỏi đã chọn?`)) {
      onDeleteBulk(selectedIds);
      setSelectedIds([]);
      onSuccessToast(`Đã xóa ${selectedIds.length} câu hỏi khỏi ngân hàng.`);
    }
  };

  // Export functions
  const exportToCSV = () => {
    const target = selectedIds.length > 0 ? questions.filter(q => selectedIds.includes(q.id)) : filtered;
    if (target.length === 0) {
      onErrorToast('Không có câu hỏi nào để xuất.');
      return;
    }

    const headers = ['STT', 'Câu hỏi', 'Phương án A', 'Phương án B', 'Phương án C', 'Phương án D', 'Đáp án đúng', 'Mức độ', 'Môn học', 'Khối lớp', 'Lời giải'];
    const rows = target.map((q, idx) => {
      const opts = q.options || [];
      return [
        idx + 1,
        `"${(q.question || '').replace(/"/g, '""')}"`,
        `"${(opts[0] || '').replace(/"/g, '""')}"`,
        `"${(opts[1] || '').replace(/"/g, '""')}"`,
        `"${(opts[2] || '').replace(/"/g, '""')}"`,
        `"${(opts[3] || '').replace(/"/g, '""')}"`,
        `"${String(q.correctAnswer || '').replace(/"/g, '""')}"`,
        q.difficulty,
        q.subject,
        q.grade,
        `"${(q.explanation || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    downloadFile(csvContent, `Ngan_Hang_Cau_Hoi_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    onSuccessToast(`Đã xuất ${target.length} câu hỏi ra định dạng CSV/Excel!`);
  };

  const exportToWord = () => {
    const target = selectedIds.length > 0 ? questions.filter(q => selectedIds.includes(q.id)) : filtered;
    if (target.length === 0) {
      onErrorToast('Không có câu hỏi nào để xuất.');
      return;
    }

    let text = `BỘ GIÁO DỤC VÀ ĐÀO TẠO\nĐỀ THI TỔNG HỢP TỪ NGÂN HÀNG CÂU HỎI\nNgày xuất: ${new Date().toLocaleDateString('vi-VN')}\n\n`;
    target.forEach((q, idx) => {
      text += `Câu ${idx + 1} (${q.subject} - ${q.grade} - [${q.difficulty}]): ${q.question}\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, i) => {
          text += `   ${String.fromCharCode(65 + i)}. ${opt}\n`;
        });
      }
      text += `Đáp án: ${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}\n`;
      if (q.explanation) {
        text += `Lời giải: ${q.explanation}\n`;
      }
      text += '\n';
    });

    downloadFile(text, `De_Kiem_Tra_${new Date().toISOString().slice(0, 10)}.docx`, 'text/plain;charset=utf-8;');
    onSuccessToast(`Đã xuất ${target.length} câu hỏi ra định dạng đề thi Word (.docx)!`);
  };

  const exportToJSON = () => {
    const target = selectedIds.length > 0 ? questions.filter(q => selectedIds.includes(q.id)) : filtered;
    const jsonStr = JSON.stringify(target, null, 2);
    downloadFile(jsonStr, `QuestionBank_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    onSuccessToast(`Đã xuất ${target.length} câu hỏi ra định dạng JSON!`);
  };

  // Save edited question
  const handleSaveQuestionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    onUpdateQuestion(editingQuestion);
    setEditingQuestion(null);
    onSuccessToast('Đã lưu các thay đổi của câu hỏi!');
  };

  return (
    <div className="space-y-6">
      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng số câu hỏi</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{totalCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
            <span className="text-emerald-400">● AI: {aiCount}</span>
            <span>· File: {fileCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-blue-500/30 shadow-md space-y-1">
          <div className="flex items-center justify-between text-blue-300 text-xs font-semibold">
            <span>Nhận biết</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20">Dễ</span>
          </div>
          <div className="text-2xl font-black text-blue-400">{easyCount}</div>
          <div className="text-[11px] text-slate-400">
            {totalCount > 0 ? Math.round((easyCount / totalCount) * 100) : 0}% ngân hàng
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-emerald-500/30 shadow-md space-y-1">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
            <span>Thông hiểu</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">Vừa</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{medCount}</div>
          <div className="text-[11px] text-slate-400">
            {totalCount > 0 ? Math.round((medCount / totalCount) * 100) : 0}% ngân hàng
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-amber-500/30 shadow-md space-y-1">
          <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
            <span>Vận dụng</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">Khó</span>
          </div>
          <div className="text-2xl font-black text-amber-400">{hardCount}</div>
          <div className="text-[11px] text-slate-400">
            {totalCount > 0 ? Math.round((hardCount / totalCount) * 100) : 0}% ngân hàng
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-purple-500/30 shadow-md space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
            <span>Vận dụng cao</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20">Rất khó</span>
          </div>
          <div className="text-2xl font-black text-purple-400">{expertCount}</div>
          <div className="text-[11px] text-slate-400">
            {totalCount > 0 ? Math.round((expertCount / totalCount) * 100) : 0}% ngân hàng
          </div>
        </div>
      </div>

      {/* FILTER & EXPORT TOOLBAR */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo nội dung câu hỏi, chủ đề, bài học, từ khóa tag..."
              className="w-full pl-9 pr-3 py-2 bg-[#0b1120] border border-[#1e293b] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsExamPreviewOpen(true)}
              className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Xem thử đề thi</span>
            </button>

            <button
              type="button"
              onClick={exportToCSV}
              className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xuất Excel (.csv UTF-8)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={exportToWord}
              className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xuất Đề thi Word (.docx)"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Word</span>
            </button>

            <button
              type="button"
              onClick={exportToJSON}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-[#1e293b] text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xuất JSON"
            >
              <FileCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdowns Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1 border-t border-[#1e293b]">
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="p-2 bg-[#0b1120] border border-[#1e293b] rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả môn học</option>
            <option value="Toán học">Toán học</option>
            <option value="Vật lý">Vật lý</option>
            <option value="Hóa học">Hóa học</option>
            <option value="Sinh học">Sinh học</option>
            <option value="Ngữ văn">Ngữ văn</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Lịch sử">Lịch sử</option>
            <option value="Địa lý">Địa lý</option>
            <option value="Tin học">Tin học</option>
            <option value="KHTN">KHTN</option>
            <option value="GDCD">GDCD</option>
          </select>

          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="p-2 bg-[#0b1120] border border-[#1e293b] rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="Khối 6">Khối 6</option>
            <option value="Khối 7">Khối 7</option>
            <option value="Khối 8">Khối 8</option>
            <option value="Khối 9">Khối 9</option>
            <option value="Khối 10">Khối 10</option>
            <option value="Khối 11">Khối 11</option>
            <option value="Khối 12">Khối 12</option>
          </select>

          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className="p-2 bg-[#0b1120] border border-[#1e293b] rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="easy">Nhận biết (Dễ)</option>
            <option value="medium">Thông hiểu (Vừa)</option>
            <option value="hard">Vận dụng (Khó)</option>
            <option value="expert">Vận dụng cao</option>
          </select>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="p-2 bg-[#0b1120] border border-[#1e293b] rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả nguồn gốc</option>
            <option value="ai">Trợ lý AI Gemini</option>
            <option value="file">Nhập từ tệp tin</option>
            <option value="manual">Soạn thủ công</option>
          </select>

          <button
            type="button"
            onClick={() => setReviewOnlyFilter(!reviewOnlyFilter)}
            className={`p-2 rounded-xl border text-center font-medium transition-colors flex items-center justify-center gap-1.5 ${
              reviewOnlyFilter
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#0b1120] border-[#1e293b] text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cần đối soát ({needsReviewCount})</span>
          </button>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>
              Đã chọn <strong className="text-white">{selectedIds.length}</strong> câu hỏi.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 rounded-lg border border-purple-500/30 text-purple-300 hover:text-white"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={handleExecuteBulkDelete}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa đã chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* QUESTIONS LIST */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-center space-y-3 text-slate-400">
            <Database className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Không tìm thấy câu hỏi phù hợp với bộ lọc</p>
            <p className="text-xs">Hãy thử đổi từ khóa tìm kiếm hoặc bỏ chọn các điều kiện lọc ở trên.</p>
          </div>
        ) : (
          filtered.map((q, idx) => {
            const isSelected = selectedIds.includes(q.id);
            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#0f172a] border-purple-500 shadow-md'
                    : 'bg-[#0f172a] border-[#1e293b] hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSingle(q.id)}
                      className="mt-1 w-4 h-4 rounded accent-purple-600 cursor-pointer"
                    />

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-300 font-mono">#{idx + 1}</span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            q.difficulty === 'easy'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : q.difficulty === 'medium'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : q.difficulty === 'hard'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}
                        >
                          {q.difficulty === 'easy'
                            ? 'Nhận biết'
                            : q.difficulty === 'medium'
                            ? 'Thông hiểu'
                            : q.difficulty === 'hard'
                            ? 'Vận dụng'
                            : 'Vận dụng cao'}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {q.subject} · {q.grade}
                        </span>

                        {q.sourceType === 'ai' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-semibold">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>AI Gemini</span>
                          </span>
                        )}

                        {q.sourceType === 'file' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                            📁 File import
                          </span>
                        )}

                        {q.needsReview && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Cần đối soát</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-100 text-xs sm:text-sm leading-snug">
                        {q.question}
                      </h3>

                      {q.topic && (
                        <div className="text-[11px] text-purple-300 font-medium">
                          Chủ đề: {q.topic}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Single item actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...q })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
                          onDeleteQuestion(q.id);
                          onSuccessToast('Đã xóa câu hỏi khỏi ngân hàng.');
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options display */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1e293b] text-xs">
                    {q.options.map((opt, i) => {
                      const isCorrect = Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.includes(opt)
                        : String(opt) === String(q.correctAnswer);

                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-[#0b1120] border-[#1e293b] text-slate-300'
                          }`}
                        >
                          <span className="truncate pr-2">
                            {String.fromCharCode(65 + i)}. {opt}
                          </span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Direct correct answer for fill-blank */}
                {(!q.options || q.options.length === 0) && q.correctAnswer && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                    Đáp án đúng: {String(q.correctAnswer)}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-[11px] text-slate-300">
                    <strong className="text-purple-300">Lời giải chi tiết: </strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* EXAM PREVIEW MODAL */}
      {isExamPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-xs text-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>Chế độ xem trước Đề kiểm tra ({filtered.length} câu)</span>
                </h4>
                <p className="text-[11px] text-slate-400">Xem trước bố cục học sinh nhìn thấy khi làm bài.</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examIncludeAnswers}
                    onChange={e => setExamIncludeAnswers(e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
                  />
                  <span>Hiện đáp án & lời giải</span>
                </label>

                <button
                  onClick={() => setIsExamPreviewOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="text-center pb-4 border-b border-[#1e293b] space-y-1">
                <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                  ĐỀ KIỂM TRA ĐÁNH GIÁ NĂNG LỰC HỌC SINH
                </h2>
                <p className="text-xs text-slate-400">
                  Thời gian làm bài: {Math.max(15, filtered.length * 2)} phút · Tổng số: {filtered.length} câu hỏi
                </p>
              </div>

              <div className="space-y-5">
                {filtered.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <div className="font-bold text-slate-100 flex items-start gap-2">
                      <span className="text-purple-400 shrink-0">Câu {idx + 1}:</span>
                      <span>{q.question}</span>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                        {q.options.map((opt, i) => {
                          const isCorrect = Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.includes(opt)
                            : String(opt) === String(q.correctAnswer);

                          return (
                            <div
                              key={i}
                              className={`p-2 rounded-lg border text-xs ${
                                examIncludeAnswers && isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                                  : 'bg-[#0b1120] border-[#1e293b] text-slate-300'
                              }`}
                            >
                              <span>
                                {String.fromCharCode(65 + i)}. {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {examIncludeAnswers && q.explanation && (
                      <div className="ml-4 p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-200">
                        <strong>Lời giải:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1e293b] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={exportToWord}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Tải đề thi Word</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExamPreviewOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-xs text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-purple-400" />
                <span>Chỉnh sửa câu hỏi</span>
              </h4>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestionEdit} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nội dung câu hỏi *</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.question}
                  onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {editingQuestion.options && editingQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300 block">Các phương án:</label>
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-bold text-purple-400 w-5">{String.fromCharCode(65 + i)}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...editingQuestion.options!];
                          newOpts[i] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        className="flex-1 p-2 rounded-lg bg-[#0b1120] border border-[#1e293b] text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Đáp án đúng *</label>
                  <input
                    type="text"
                    required
                    value={
                      Array.isArray(editingQuestion.correctAnswer)
                        ? editingQuestion.correctAnswer.join(', ')
                        : String(editingQuestion.correctAnswer)
                    }
                    onChange={e => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#0b1120] border border-[#1e293b] text-emerald-400 font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Cấp độ nhận thức</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full p-2 rounded-lg bg-[#0b1120] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="easy">Nhận biết</option>
                    <option value="medium">Thông hiểu</option>
                    <option value="hard">Vận dụng</option>
                    <option value="expert">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Lời giải chi tiết</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
