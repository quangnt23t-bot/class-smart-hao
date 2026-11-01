import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { QuizQuestion } from '../../types';
import {
  getExcelTemplateContent,
  getWordTemplateContent,
  downloadFile,
  parseCSVQuestions,
  parseWordQuestionText,
  detectDuplicates,
  ParsedQuestionItem
} from '../../utils/questionTemplates';

interface ImportTabProps {
  existingQuestions: QuizQuestion[];
  onSaveQuestions: (questions: Omit<QuizQuestion, 'id'>[]) => void;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

export const ImportTab: React.FC<ImportTabProps> = ({
  existingQuestions,
  onSaveQuestions,
  onSuccessToast,
  onErrorToast
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedQuestionItem[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'allow' | 'overwrite'>('skip');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'duplicate' | 'error'>('all');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<ParsedQuestionItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Templates
  const handleDownloadExcel = () => {
    downloadFile(getExcelTemplateContent(), 'Template_Ngan_Hang_Cau_Hoi.csv', 'text/csv;charset=utf-8;');
    onSuccessToast('Đã tải xuống Template Excel chuẩn Unicode (.csv)!');
  };

  const handleDownloadWord = () => {
    downloadFile(getWordTemplateContent(), 'Template_Soan_Thao_Word.docx', 'text/plain;charset=utf-8;');
    onSuccessToast('Đã tải xuống Template Word mẫu chuẩn (.docx / .txt)!');
  };

  // Process uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);

    try {
      const fileName = file.name.toLowerCase();
      const text = await file.text();

      let items: ParsedQuestionItem[] = [];

      if (fileName.endsWith('.json')) {
        try {
          const raw = JSON.parse(text);
          const arr = Array.isArray(raw) ? raw : [raw];
          items = arr.map((q: any, i: number) => ({
            index: i + 1,
            question: q.question || '',
            type: q.type || 'single',
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correctAnswer || (q.options ? q.options[0] : ''),
            explanation: q.explanation || '',
            difficulty: q.difficulty || 'medium',
            grade: q.grade || 'Khối 6',
            subject: q.subject || 'Toán học',
            topic: q.topic || 'Chung',
            points: q.points || 1,
            tags: Array.isArray(q.tags) ? q.tags : [],
            isValid: !!(q.question && q.correctAnswer),
            errors: !q.question ? ['Thiếu nội dung câu hỏi'] : !q.correctAnswer ? ['Thiếu đáp án'] : [],
            isDuplicate: false
          }));
        } catch {
          onErrorToast('Tệp JSON không đúng định dạng chuẩn.');
        }
      } else if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx')) {
        items = parseCSVQuestions(text);
      } else {
        // .docx, .txt, text-based
        items = parseWordQuestionText(text);
      }

      // Check duplicates
      const checkedItems = detectDuplicates(items, existingQuestions);
      setParsedItems(checkedItems);

      if (checkedItems.length === 0) {
        onErrorToast('Không tìm thấy câu hỏi hợp lệ trong tệp đã chọn. Vui lòng kiểm tra định dạng.');
      } else {
        onSuccessToast(`Đã nhận diện ${checkedItems.length} câu hỏi từ tệp "${file.name}"!`);
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      onErrorToast('Không thể đọc nội dung tệp. Vui lòng thử lại với tệp định dạng chuẩn.');
    } finally {
      setIsParsing(false);
    }
  };

  // Filter items for preview
  const filteredPreview = parsedItems.filter(item => {
    if (previewFilter === 'valid') return item.isValid && !item.isDuplicate;
    if (previewFilter === 'duplicate') return item.isDuplicate;
    if (previewFilter === 'error') return !item.isValid;
    return true;
  });

  const validCount = parsedItems.filter(i => i.isValid && !i.isDuplicate).length;
  const duplicateCount = parsedItems.filter(i => i.isDuplicate).length;
  const errorCount = parsedItems.filter(i => !i.isValid).length;

  // Confirm and Save
  const handleConfirmSave = () => {
    // Filter questions according to duplicateAction
    let toSave: ParsedQuestionItem[] = [];

    if (duplicateAction === 'skip') {
      toSave = parsedItems.filter(i => i.isValid && !i.isDuplicate);
    } else {
      toSave = parsedItems.filter(i => i.isValid);
    }

    if (toSave.length === 0) {
      onErrorToast('Không có câu hỏi hợp lệ nào để lưu.');
      return;
    }

    const formatted: Omit<QuizQuestion, 'id'>[] = toSave.map(item => ({
      question: item.question,
      type: item.type,
      options: item.options,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      difficulty: item.difficulty,
      grade: item.grade,
      subject: item.subject,
      topic: item.topic || 'Chương trình chuẩn',
      points: item.points || 1,
      tags: item.tags || [item.subject],
      sourceType: 'file',
      needsReview: false,
      createdAt: new Date().toISOString()
    }));

    onSaveQuestions(formatted);
    onSuccessToast(`Đã lưu thành công ${toSave.length} câu hỏi vào Ngân hàng!`);

    // Reset after save
    setParsedItems([]);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove single item from preview
  const handleRemoveItem = (index: number) => {
    setParsedItems(prev => prev.filter(i => i.index !== index));
  };

  // Edit item
  const handleStartEdit = (item: ParsedQuestionItem) => {
    setEditingIndex(item.index);
    setEditItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    setParsedItems(prev =>
      prev.map(i => {
        if (i.index === editItem.index) {
          const errors: string[] = [];
          if (!editItem.question.trim()) errors.push('Thiếu nội dung câu hỏi');
          if (editItem.type === 'single' && editItem.options.length < 2) errors.push('Cần ít nhất 2 phương án');
          if (!editItem.correctAnswer) errors.push('Thiếu đáp án đúng');
          return {
            ...editItem,
            isValid: errors.length === 0,
            errors
          };
        }
        return i;
      })
    );
    setEditingIndex(null);
    setEditItem(null);
    onSuccessToast('Đã cập nhật câu hỏi xem trước.');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-400" />
              <span>Tab 1: Nhập câu hỏi từ file Word / Excel / CSV</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tải template chuẩn, hệ thống tự động kiểm tra Unicode, validate schema và phát hiện trùng lặp.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* STEP 1: Download Templates */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Tải template chuẩn định dạng</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Sử dụng tệp mẫu có sẵn để chuẩn hóa dữ liệu câu hỏi, hỗ trợ đầy đủ các trường: Môn học, Khối lớp,
            Cấp độ nhận thức, Phương án và Lời giải chi tiết.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Tải Template Excel</span>
            </button>

            <button
              onClick={handleDownloadWord}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Tải Template Word</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1120] border border-[#1e293b] text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Gợi ý định dạng: </span>
              File Excel (.csv, .xlsx) hỗ trợ bảng cột rõ ràng. File Word (.docx, .txt) hỗ trợ cú pháp tự nhiên:
              <span className="font-mono text-purple-300 block mt-0.5">Câu 1: ... A. ... B. ... Đáp án: A</span>
            </div>
          </div>
        </div>

        {/* STEP 2: Upload Dropzone */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Tải lên file câu hỏi</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.docx,.doc,.txt,.json"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) processFile(f);
            }}
            className="border-2 border-dashed border-[#1e293b] hover:border-purple-500/60 hover:bg-purple-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-200">
              Tải lên file câu hỏi (DOCX, XLSX, CSV, JSON)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Kéo thả tệp vào đây hoặc bấm nút để chọn từ máy tính
            </p>

            <button
              type="button"
              className="mt-4 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all pointer-events-none"
            >
              Chọn tệp
            </button>
          </div>

          {selectedFile && (
            <div className="p-3 rounded-xl bg-[#0b1120] border border-[#1e293b] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">{selectedFile.name}</span>
                <span className="text-[11px] text-slate-400">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setParsedItems([]);
                }}
                className="text-slate-400 hover:text-rose-400 p-1"
                title="Hủy tệp"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Parsing indicator */}
      {isParsing && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-200">Đang kiểm tra schema, mã hóa Unicode và phát hiện trùng lặp...</p>
        </div>
      )}

      {/* PREVIEW & VALIDATION SECTION */}
      {parsedItems.length > 0 && !isParsing && (
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4 shadow-xl">
          {/* Header Summary Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Bản xem trước dữ liệu</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {parsedItems.length} câu hỏi
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kiểm tra kỹ trước khi xác nhận lưu vào kho dữ liệu chính thức.
              </p>
            </div>

            {/* Statistics badges */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{validCount} Hợp lệ</span>
              </span>
              {duplicateCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{duplicateCount} Trùng lặp</span>
                </span>
              )}
              {errorCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{errorCount} Lỗi</span>
                </span>
              )}
            </div>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b1120] border border-[#1e293b]">
              <button
                onClick={() => setPreviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  previewFilter === 'all' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả ({parsedItems.length})
              </button>
              <button
                onClick={() => setPreviewFilter('valid')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  previewFilter === 'valid' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hợp lệ ({validCount})
              </button>
              {duplicateCount > 0 && (
                <button
                  onClick={() => setPreviewFilter('duplicate')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    previewFilter === 'duplicate' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Trùng lặp ({duplicateCount})
                </button>
              )}
              {errorCount > 0 && (
                <button
                  onClick={() => setPreviewFilter('error')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    previewFilter === 'error' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lỗi ({errorCount})
                </button>
              )}
            </div>

            {/* Duplicate policy dropdown */}
            {duplicateCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Xử lý câu trùng:</span>
                <select
                  value={duplicateAction}
                  onChange={e => setDuplicateAction(e.target.value as any)}
                  className="bg-[#0b1120] border border-[#1e293b] text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="skip">Bỏ qua câu trùng lặp (Khuyến nghị)</option>
                  <option value="allow">Vẫn thêm vào ngân hàng</option>
                  <option value="overwrite">Ghi đè câu hỏi cũ</option>
                </select>
              </div>
            )}
          </div>

          {/* Table of Preview Items */}
          <div className="border border-[#1e293b] rounded-xl overflow-hidden bg-[#0b1120]">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111c33] text-slate-400 uppercase text-[10px] font-semibold tracking-wider sticky top-0 z-10 border-b border-[#1e293b]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">STT</th>
                    <th className="py-3 px-3">Nội dung câu hỏi</th>
                    <th className="py-3 px-3 w-28">Môn / Khối</th>
                    <th className="py-3 px-3 w-24">Mức độ</th>
                    <th className="py-3 px-3 w-40">Đáp án đúng</th>
                    <th className="py-3 px-3 w-32">Trạng thái</th>
                    <th className="py-3 px-3 w-20 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {filteredPreview.map(item => (
                    <tr key={item.index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{item.index}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-100 line-clamp-2">{item.question}</div>
                        {item.options && item.options.length > 0 && (
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                            <span>{item.options.length} phương án:</span>
                            {item.options.map((opt, i) => (
                              <span key={i} className="truncate max-w-[120px]">
                                {String.fromCharCode(65 + i)}. {opt}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.duplicateReason && (
                          <div className="text-[10px] text-amber-400 mt-0.5 font-medium">
                            ⚠️ {item.duplicateReason}
                          </div>
                        )}
                        {item.errors.length > 0 && (
                          <div className="text-[10px] text-rose-400 mt-0.5 font-medium">
                            ❌ {item.errors.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>{item.subject}</div>
                        <div className="text-[10px] text-slate-400">{item.grade}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            item.difficulty === 'easy'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : item.difficulty === 'medium'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.difficulty === 'hard'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          }`}
                        >
                          {item.difficulty === 'easy'
                            ? 'Nhận biết'
                            : item.difficulty === 'medium'
                            ? 'Thông hiểu'
                            : item.difficulty === 'hard'
                            ? 'Vận dụng'
                            : 'Vận dụng cao'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-medium truncate max-w-[160px]">
                        {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(', ') : item.correctAnswer}
                      </td>
                      <td className="py-3 px-3">
                        {item.isDuplicate ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                            Trùng lặp
                          </span>
                        ) : item.isValid ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold">
                            Lỗi dữ liệu
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
                            title="Sửa câu hỏi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.index)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                            title="Xóa câu hỏi khỏi bản xem trước"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
            <div className="text-xs text-slate-400">
              Sẵn sàng lưu{' '}
              <strong className="text-emerald-400">
                {duplicateAction === 'skip' ? validCount : validCount + duplicateCount}
              </strong>{' '}
              câu hỏi hợp lệ vào Ngân hàng dữ liệu.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsedItems([]);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={validCount === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận lưu vào Ngân hàng câu hỏi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK INLINE EDIT MODAL */}
      {editingIndex !== null && editItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-xs text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <h4 className="font-bold text-sm text-slate-100">Chỉnh sửa câu hỏi #{editItem.index}</h4>
              <button onClick={() => setEditingIndex(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Nội dung câu hỏi *</label>
              <textarea
                rows={3}
                value={editItem.question}
                onChange={e => setEditItem({ ...editItem, question: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {editItem.options && editItem.options.length > 0 && (
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">Các phương án lựa chọn:</label>
                {editItem.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-bold text-purple-400 w-5">{String.fromCharCode(65 + i)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...editItem.options];
                        newOpts[i] = e.target.value;
                        setEditItem({ ...editItem, options: newOpts });
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
                  value={Array.isArray(editItem.correctAnswer) ? editItem.correctAnswer.join(', ') : editItem.correctAnswer}
                  onChange={e => setEditItem({ ...editItem, correctAnswer: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0b1120] border border-[#1e293b] text-emerald-400 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mức độ nhận thức</label>
                <select
                  value={editItem.difficulty}
                  onChange={e => setEditItem({ ...editItem, difficulty: e.target.value as any })}
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
                value={editItem.explanation}
                onChange={e => setEditItem({ ...editItem, explanation: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
              <button
                onClick={() => setEditingIndex(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
              >
                Lưu sửa đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
