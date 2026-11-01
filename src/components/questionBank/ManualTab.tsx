import React, { useState } from 'react';
import {
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  Save,
  HelpCircle,
  Tag,
  BookOpen,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { QuizQuestion } from '../../types';

interface ManualTabProps {
  onSaveQuestion: (question: Omit<QuizQuestion, 'id'>) => void;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

export const ManualTab: React.FC<ManualTabProps> = ({
  onSaveQuestion,
  onSuccessToast,
  onErrorToast
}) => {
  // Metadata state
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Khối 6');
  const [topic, setTopic] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['GDPT 2018', 'Đề kiểm tra']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [questionType, setQuestionType] = useState<'single' | 'multiple' | 'true_false' | 'fill_blank'>('single');
  const [points, setPoints] = useState<number>(1);

  // Content state
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>([
    'Phương án A',
    'Phương án B',
    'Phương án C',
    'Phương án D'
  ]);
  const [correctAnswerSingle, setCorrectAnswerSingle] = useState<number>(0);
  const [correctAnswersMulti, setCorrectAnswersMulti] = useState<number[]>([0]);
  const [correctAnswerTF, setCorrectAnswerTF] = useState<'Đúng' | 'Sai'>('Đúng');
  const [correctAnswerFill, setCorrectAnswerFill] = useState('');
  const [explanation, setExplanation] = useState('');

  // Handle Option changes
  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 8) {
      onErrorToast('Số lượng phương án tối đa là 8.');
      return;
    }
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions(prev => [...prev, `Phương án ${nextLetter}`]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) {
      onErrorToast('Câu hỏi trắc nghiệm cần ít nhất 2 phương án.');
      return;
    }
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    if (correctAnswerSingle >= updated.length) {
      setCorrectAnswerSingle(0);
    }
    setCorrectAnswersMulti(prev => prev.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i)));
  };

  // Toggle multi-choice answer
  const handleToggleMultiAnswer = (idx: number) => {
    if (correctAnswersMulti.includes(idx)) {
      if (correctAnswersMulti.length <= 1) {
        onErrorToast('Cần ít nhất 1 đáp án đúng.');
        return;
      }
      setCorrectAnswersMulti(prev => prev.filter(i => i !== idx));
    } else {
      setCorrectAnswersMulti(prev => [...prev, idx]);
    }
  };

  // Tag management
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Validation
  const validateForm = (): boolean => {
    if (!questionText.trim()) {
      onErrorToast('Vui lòng nhập nội dung câu hỏi.');
      return false;
    }

    if (questionType === 'single' || questionType === 'multiple') {
      const emptyOpt = options.some(o => !o.trim());
      if (emptyOpt) {
        onErrorToast('Vui lòng điền đầy đủ tất cả các phương án lựa chọn.');
        return false;
      }
    }

    if (questionType === 'fill_blank' && !correctAnswerFill.trim()) {
      onErrorToast('Vui lòng nhập đáp án chính xác cho câu điền khuyết.');
      return false;
    }

    return true;
  };

  // Build question object
  const buildQuestionData = (): Omit<QuizQuestion, 'id'> => {
    let finalCorrectAnswer: string | string[];

    if (questionType === 'single') {
      finalCorrectAnswer = options[correctAnswerSingle] || options[0];
    } else if (questionType === 'multiple') {
      finalCorrectAnswer = correctAnswersMulti.map(idx => options[idx]);
    } else if (questionType === 'true_false') {
      finalCorrectAnswer = correctAnswerTF;
    } else {
      finalCorrectAnswer = correctAnswerFill.trim();
    }

    return {
      question: questionText.trim(),
      type: questionType,
      options:
        questionType === 'true_false'
          ? ['Đúng', 'Sai']
          : questionType === 'fill_blank'
          ? []
          : options.map(o => o.trim()),
      correctAnswer: finalCorrectAnswer,
      explanation: explanation.trim(),
      difficulty,
      grade,
      subject,
      topic: topic.trim() || 'Chủ đề chung',
      points: Number(points) || 1,
      tags: tags.length > 0 ? tags : [subject, grade],
      sourceType: 'manual',
      needsReview: false,
      createdAt: new Date().toISOString()
    };
  };

  // Save actions
  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = buildQuestionData();
    onSaveQuestion(data);
    onSuccessToast('Đã lưu câu hỏi thành công vào Ngân hàng!');

    // Reset content
    setQuestionText('');
    setExplanation('');
    setCorrectAnswerFill('');
    setTopic('');
  };

  const handleSaveAndAddNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = buildQuestionData();
    onSaveQuestion(data);
    onSuccessToast('Đã lưu câu hỏi! Sẵn sàng soạn câu tiếp theo.');

    // Reset only content, keep subject/grade/topic/tags for speedy drafting
    setQuestionText('');
    setExplanation('');
    setCorrectAnswerFill('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-purple-400" />
              <span>Tab 3: Soạn thảo câu hỏi thủ công</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Soạn thảo câu hỏi trắc nghiệm, tự luận, điền khuyết với ma trận chuẩn 4 cấp độ nhận thức GDPT 2018.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: QUESTION CONTENT (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Question Text Box */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>Nội dung câu hỏi *</span>
                </label>
                <span className="text-[11px] text-slate-400">Hỗ trợ ký hiệu toán học & văn bản dài</span>
              </div>

              <textarea
                rows={4}
                required
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Nhập nội dung câu hỏi tại đây... (Ví dụ: Cho hàm số y = f(x) liên tục trên đoạn [a; b]...)"
                className="w-full p-3 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
              />
            </div>

            {/* Answer Options Section */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>Phương án trả lời & Đáp án đúng</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {questionType === 'single'
                    ? 'Chọn radio để đánh dấu đáp án đúng'
                    : questionType === 'multiple'
                    ? 'Chọn checkbox cho các đáp án đúng'
                    : ''}
                </span>
              </div>

              {/* SINGLE CHOICE / MULTIPLE CHOICE */}
              {(questionType === 'single' || questionType === 'multiple') && (
                <div className="space-y-3">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelectedSingle = correctAnswerSingle === idx;
                    const isSelectedMulti = correctAnswersMulti.includes(idx);

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                          (questionType === 'single' && isSelectedSingle) ||
                          (questionType === 'multiple' && isSelectedMulti)
                            ? 'bg-emerald-500/10 border-emerald-500/40'
                            : 'bg-[#0b1120] border-[#1e293b]'
                        }`}
                      >
                        {/* Selector control */}
                        {questionType === 'single' ? (
                          <input
                            type="radio"
                            name="correct_answer_single"
                            checked={isSelectedSingle}
                            onChange={() => setCorrectAnswerSingle(idx)}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                            title="Chọn làm đáp án đúng"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelectedMulti}
                            onChange={() => handleToggleMultiAnswer(idx)}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0"
                            title="Chọn làm đáp án đúng"
                          />
                        )}

                        <span className="font-bold text-purple-400 text-xs w-6 shrink-0">{letter}.</span>

                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={e => handleOptionChange(idx, e.target.value)}
                          placeholder={`Nhập nội dung phương án ${letter}`}
                          className="flex-1 bg-transparent border-0 text-slate-100 text-xs focus:outline-none focus:ring-0"
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Xóa phương án này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="w-full py-2.5 rounded-xl border border-dashed border-[#1e293b] hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm phương án {String.fromCharCode(65 + options.length)}</span>
                  </button>
                </div>
              )}

              {/* TRUE / FALSE */}
              {questionType === 'true_false' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {['Đúng', 'Sai'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCorrectAnswerTF(val as any)}
                      className={`p-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        correctAnswerTF === val
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                          : 'bg-[#0b1120] border-[#1e293b] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${correctAnswerTF === val ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>{val}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* FILL IN THE BLANK */}
              {questionType === 'fill_blank' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Từ khóa / Đáp án chính xác *</label>
                  <input
                    type="text"
                    required
                    value={correctAnswerFill}
                    onChange={e => setCorrectAnswerFill(e.target.value)}
                    placeholder="Nhập từ hoặc cụm từ đáp án chính xác..."
                    className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-emerald-400 font-semibold text-xs focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Hệ thống sẽ so khớp câu trả lời của học sinh với từ khóa trên (không phân biệt chữ hoa/thường).
                  </p>
                </div>
              )}
            </div>

            {/* Explanation Section */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-lg space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Lời giải / Hướng dẫn giải chi tiết
              </label>
              <textarea
                rows={3}
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Giải thích vì sao chọn đáp án trên, công thức áp dụng hoặc lưu ý quan trọng..."
                className="w-full p-3 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: ATTRIBUTES & MATRIX (4 COLS) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-lg space-y-4">
              <div className="pb-2 border-b border-[#1e293b]">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Phân loại câu hỏi</span>
                </span>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Môn học *</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-medium"
                >
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
              </div>

              {/* Grade */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Khối lớp *</label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="Khối 6">Khối 6</option>
                  <option value="Khối 7">Khối 7</option>
                  <option value="Khối 8">Khối 8</option>
                  <option value="Khối 9">Khối 9</option>
                  <option value="Khối 10">Khối 10</option>
                  <option value="Khối 11">Khối 11</option>
                  <option value="Khối 12">Khối 12</option>
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Chủ đề / Bài học</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="VD: Số nguyên tố, Định luật Ohm..."
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Cognitive Level */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cấp độ nhận thức</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="easy">Nhận biết (Dễ)</option>
                  <option value="medium">Thông hiểu (Vừa)</option>
                  <option value="hard">Vận dụng (Khó)</option>
                  <option value="expert">Vận dụng cao (Rất khó)</option>
                </select>
              </div>

              {/* Question Format Type */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Hình thức câu hỏi</label>
                <select
                  value={questionType}
                  onChange={e => setQuestionType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="single">Trắc nghiệm 1 đáp án</option>
                  <option value="multiple">Nhiều đáp án (Multiple)</option>
                  <option value="true_false">Đúng / Sai</option>
                  <option value="fill_blank">Điền khuyết / Tự luận ngắn</option>
                </select>
              </div>

              {/* Points */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Điểm số mặc định</label>
                <input
                  type="number"
                  min="0.25"
                  max="10"
                  step="0.25"
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                <label className="text-xs font-semibold text-slate-300 block">Thẻ phân loại (Tags)</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Nhập tag rồi ấn Enter..."
                  className="w-full p-2 rounded-lg bg-[#0b1120] border border-[#1e293b] text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleSaveAndAddNext}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Lưu & Tiếp tục thêm</span>
              </button>

              <button
                type="button"
                onClick={handleSaveOnly}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Lưu câu hỏi</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
