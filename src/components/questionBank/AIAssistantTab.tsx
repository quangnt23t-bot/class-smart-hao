import React, { useState, useRef } from 'react';
import {
  Sparkles,
  BrainCircuit,
  FileText,
  Link2,
  Image as ImageIcon,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Sliders,
  HelpCircle,
  Eye,
  Plus,
  ShieldAlert,
  ArrowRight,
  FileCode,
  Globe,
  ExternalLink,
  XCircle,
  Loader2
} from 'lucide-react';
import { QuizQuestion } from '../../types';
import {
  generateQuestionsWithAI,
  GenerateAIQuestionsParams,
  GeneratedQuestionItem,
  extractDocumentText,
  scrapeWebUrl
} from '../../utils/aiQuestionGenerator';

interface WebLinkItem {
  id: string;
  url: string;
  title?: string;
  text?: string;
  wordCount?: number;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

interface AIAssistantTabProps {
  onSaveQuestions: (questions: Omit<QuizQuestion, 'id'>[]) => void;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  onSaveQuestions,
  onSuccessToast,
  onErrorToast
}) => {
  // Shared Configuration parameters
  const [topic, setTopic] = useState('Định luật vạn vật hấp dẫn và trọng lực');
  const [subject, setSubject] = useState('Vật lý');
  const [grade, setGrade] = useState('Khối 10');
  const [count, setCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<'single' | 'multiple' | 'true_false' | 'fill_blank' | 'mixed'>('single');

  // Cognitive distribution (Sum = 100%)
  const [easyPct, setEasyPct] = useState(40);
  const [mediumPct, setMediumPct] = useState(30);
  const [hardPct, setHardPct] = useState(20);
  const [expertPct, setExpertPct] = useState(10);

  // Active Input Method: 'text' | 'file' | 'link' | 'image'
  const [sourceMethod, setSourceMethod] = useState<'text' | 'file' | 'link' | 'image'>('text');

  // METHOD 1: Văn bản State
  const [textInput, setTextInput] = useState(
    'Mọi vật trong vũ trụ đều hút nhau với một lực gọi là lực hấp dẫn. Lực hấp dẫn giữa hai chất điểm tỉ lệ thuận với tích hai khối lượng của chúng và tỉ lệ nghịch với bình phương khoảng cách giữa chúng: F_hd = G * (m1 * m2) / r^2, trong đó hằng số hấp dẫn G = 6.67 x 10^-11 N.m^2/kg^2. Trọng lực là lực hút của Trái Đất tác dụng lên vật.'
  );

  // METHOD 2: File (PDF/Word) State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docStatus, setDocStatus] = useState<'idle' | 'extracting' | 'success' | 'error'>('idle');
  const [docExtractedText, setDocExtractedText] = useState('');
  const [docWordCount, setDocWordCount] = useState(0);
  const [docCharCount, setDocCharCount] = useState(0);
  const [docErrorMsg, setDocErrorMsg] = useState('');

  // METHOD 3: Link Web State
  const [urlInput, setUrlInput] = useState('');
  const [webLinks, setWebLinks] = useState<WebLinkItem[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);

  // METHOD 4: Hình ảnh State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<'idle' | 'ready' | 'error'>('idle');
  const [imageErrorMsg, setImageErrorMsg] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [isFallbackNotice, setIsFallbackNotice] = useState(false);

  // Modal edit
  const [editingItem, setEditingItem] = useState<GeneratedQuestionItem | null>(null);

  // Refs for hidden inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ===================== METHOD 2: FILE HANDLERS =====================
  const handleSelectDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.docx') && !ext.endsWith('.pdf') && !ext.endsWith('.txt')) {
      onErrorToast('Hệ thống chỉ hỗ trợ tệp định dạng .docx, .pdf hoặc .txt');
      return;
    }

    setDocFile(file);
    setDocStatus('extracting');
    setDocErrorMsg('');
    setDocExtractedText('');

    const res = await extractDocumentText(file);
    if (res.success && res.text) {
      setDocStatus('success');
      setDocExtractedText(res.text);
      setDocWordCount(res.wordCount || 0);
      setDocCharCount(res.charCount || 0);
      onSuccessToast(`Đã trích xuất thành công ${res.wordCount} từ từ tệp "${file.name}"!`);
    } else {
      setDocStatus('error');
      const err = res.error || 'Trích xuất nội dung thất bại. Vui lòng kiểm tra lại tệp tin.';
      setDocErrorMsg(err);
      onErrorToast(err);
    }
  };

  const handleClearDocFile = () => {
    setDocFile(null);
    setDocStatus('idle');
    setDocExtractedText('');
    setDocWordCount(0);
    setDocCharCount(0);
    setDocErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ===================== METHOD 3: LINK WEB HANDLERS =====================
  const handleAddWebLink = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      onErrorToast('Vui lòng nhập đường link URL của bài học.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      onErrorToast('URL không hợp lệ. Vui lòng nhập link bắt đầu bằng http:// hoặc https://');
      return;
    }

    // Check duplicate
    if (webLinks.some(l => l.url.toLowerCase() === trimmed.toLowerCase())) {
      onErrorToast('Đường link này đã có trong danh sách nguồn.');
      return;
    }

    const tempId = `link_${Date.now()}`;
    const newItem: WebLinkItem = {
      id: tempId,
      url: trimmed,
      status: 'loading'
    };

    setWebLinks(prev => [newItem, ...prev]);
    setUrlInput('');
    setIsAddingLink(true);

    try {
      const res = await scrapeWebUrl(trimmed);
      if (res.success && res.text) {
        setWebLinks(prev =>
          prev.map(l =>
            l.id === tempId
              ? {
                  ...l,
                  status: 'success',
                  title: res.title || 'Tài liệu trực tuyến',
                  text: res.text,
                  wordCount: res.wordCount
                }
              : l
          )
        );
        onSuccessToast(`Đã truy cập và trích xuất thành công nội dung trang web (${res.wordCount} từ)!`);
      } else {
        const errorMsg = res.error || 'Không thể truy cập hoặc đọc nội dung trang web này.';
        setWebLinks(prev =>
          prev.map(l =>
            l.id === tempId
              ? {
                  ...l,
                  status: 'error',
                  error: errorMsg
                }
              : l
          )
        );
        onErrorToast(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi gửi yêu cầu đọc trang web.';
      setWebLinks(prev =>
        prev.map(l => (l.id === tempId ? { ...l, status: 'error', error: errorMsg } : l))
      );
      onErrorToast(errorMsg);
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleRemoveWebLink = (id: string) => {
    setWebLinks(prev => prev.filter(l => l.id !== id));
  };

  // ===================== METHOD 4: HÌNH ẢNH HANDLERS =====================
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onErrorToast('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setImageFile(file);
    setImageMimeType(file.type);
    setImageErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreviewUrl(result);
      setImageBase64(result);
      setImageStatus('ready');
      onSuccessToast(`Đã nạp hình ảnh "${file.name}" sẵn sàng cho AI đọc dữ liệu.`);
    };
    reader.onerror = () => {
      setImageStatus('error');
      setImageErrorMsg('Không thể đọc file hình ảnh. Vui lòng thử lại với ảnh khác.');
      onErrorToast('Lỗi khi đọc file ảnh.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageBase64(null);
    setImageMimeType(null);
    setImageStatus('idle');
    setImageErrorMsg('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // ===================== VALIDATION BEFORE CREATION =====================
  const validateSourceInput = (): { isValid: boolean; errorMsg?: string; sourceTextPayload?: string; sourceUrlsPayload?: string[] } => {
    if (!topic.trim()) {
      return { isValid: false, errorMsg: 'Vui lòng nhập tên Chủ đề / Bài học cần tạo câu hỏi.' };
    }

    if (sourceMethod === 'text') {
      if (!textInput.trim()) {
        return { isValid: false, errorMsg: 'Vui lòng nhập hoặc dán nội dung văn bản bài học ở phương thức Văn bản.' };
      }
      return { isValid: true, sourceTextPayload: textInput.trim() };
    }

    if (sourceMethod === 'file') {
      if (!docFile) {
        return { isValid: false, errorMsg: 'Vui lòng chọn và tải lên tệp tài liệu (PDF, Word, TXT).' };
      }
      if (docStatus === 'extracting') {
        return { isValid: false, errorMsg: 'Hệ thống đang trích xuất nội dung tệp, vui lòng chờ trong giây lát...' };
      }
      if (docStatus === 'error' || !docExtractedText.trim()) {
        return {
          isValid: false,
          errorMsg: docErrorMsg || 'Tệp tải lên chưa được trích xuất thành công. Hệ thống không thể tạo câu hỏi từ tệp lỗi.'
        };
      }
      return { isValid: true, sourceTextPayload: docExtractedText.trim() };
    }

    if (sourceMethod === 'link') {
      const validLinks = webLinks.filter(l => l.status === 'success' && l.text);
      if (validLinks.length === 0) {
        return {
          isValid: false,
          errorMsg: 'Chưa có liên kết web nào được trích xuất nội dung thành công. Vui lòng thêm và trích xuất link hợp lệ.'
        };
      }
      const combinedText = validLinks.map(l => `[Nguồn: ${l.title || l.url}]\n${l.text}`).join('\n\n');
      const urls = validLinks.map(l => l.url);
      return { isValid: true, sourceTextPayload: combinedText, sourceUrlsPayload: urls };
    }

    if (sourceMethod === 'image') {
      if (!imagePreviewUrl || !imageBase64) {
        return { isValid: false, errorMsg: 'Vui lòng tải lên hình ảnh trang sách hoặc đề thi cần đọc dữ liệu.' };
      }
      return { isValid: true };
    }

    return { isValid: false, errorMsg: 'Phương thức đầu vào chưa hợp lệ.' };
  };

  // ===================== TRIGGER AI GENERATION =====================
  const handleStartAIGeneration = async () => {
    const check = validateSourceInput();
    if (!check.isValid) {
      onErrorToast(check.errorMsg || 'Vui lòng kiểm tra lại nguồn dữ liệu đầu vào.');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(3);

    const params: GenerateAIQuestionsParams = {
      topic: topic.trim(),
      subject,
      grade,
      count,
      questionType,
      difficultyDist: {
        easy: easyPct,
        medium: mediumPct,
        hard: hardPct,
        expert: expertPct
      },
      sourceMethod,
      sourceText: check.sourceTextPayload || '',
      sourceUrls: check.sourceUrlsPayload || [],
      sourceFileName: docFile?.name,
      imageBase64: sourceMethod === 'image' ? imageBase64 || undefined : undefined,
      imageMimeType: sourceMethod === 'image' ? imageMimeType || undefined : undefined
    };

    try {
      const res = await generateQuestionsWithAI(params);
      if (res.success && res.questions.length > 0) {
        setGeneratedQuestions(res.questions);
        setIsFallbackNotice(res.isFallback);
        setCurrentStep(4);
        onSuccessToast(`AI Gemini đã tạo thành công ${res.questions.length} câu hỏi chuẩn hóa!`);
      } else {
        onErrorToast('Không thể tạo câu hỏi. Vui lòng kiểm tra lại nội dung đầu vào.');
      }
    } catch (err: any) {
      console.error(err);
      onErrorToast('Đã có lỗi xảy ra trong quá trình sinh câu hỏi.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle selection
  const handleToggleSelect = (tempId: string) => {
    setGeneratedQuestions(prev =>
      prev.map(q => (q.tempId === tempId ? { ...q, isSelected: !q.isSelected } : q))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setGeneratedQuestions(prev => prev.map(q => ({ ...q, isSelected: select })));
  };

  const handleDeleteItem = (tempId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.tempId !== tempId));
  };

  // Save selected questions
  const handleSaveSelected = () => {
    const selected = generatedQuestions.filter(q => q.isSelected);
    if (selected.length === 0) {
      onErrorToast('Vui lòng chọn ít nhất một câu hỏi để lưu.');
      return;
    }

    const formatted: Omit<QuizQuestion, 'id'>[] = selected.map(q => ({
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points || 1,
      topic: q.topic,
      grade: q.grade,
      subject: q.subject,
      tags: q.tags,
      sourceType: 'ai',
      needsReview: q.needsReview,
      createdAt: new Date().toISOString()
    }));

    onSaveQuestions(formatted);
    onSuccessToast(`Đã lưu thành công ${selected.length} câu hỏi AI vào Ngân hàng!`);

    setGeneratedQuestions([]);
    setCurrentStep(1);
  };

  // Update item from modal
  const handleSaveEdit = () => {
    if (!editingItem) return;
    setGeneratedQuestions(prev =>
      prev.map(q => (q.tempId === editingItem.tempId ? editingItem : q))
    );
    setEditingItem(null);
    onSuccessToast('Đã cập nhật nội dung câu hỏi.');
  };

  const selectedCount = generatedQuestions.filter(q => q.isSelected).length;

  // Compute status for button enablement
  const checkCurrentSourceReady = (): boolean => {
    if (sourceMethod === 'text') return textInput.trim().length > 0;
    if (sourceMethod === 'file') return docStatus === 'success' && docExtractedText.trim().length > 0;
    if (sourceMethod === 'link') return webLinks.some(l => l.status === 'success' && l.text);
    if (sourceMethod === 'image') return imageStatus === 'ready' && !!imagePreviewUrl;
    return false;
  };

  const isReadyToGenerate = checkCurrentSourceReady();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Tab 2: Trợ lý AI Gemini – Tạo ngân hàng câu hỏi thông minh</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Quy trình AI 5 bước: Nhập chủ đề/bài học → Cấu hình khối, môn, số lượng → Gemini tạo câu hỏi → Review & Lưu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>Gemini 3.8 Flash Engine</span>
            </span>
          </div>
        </div>
      </div>

      {/* ANTI-HALLUCINATION WARNING BANNER */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 shadow-lg relative overflow-hidden flex items-start gap-3.5 text-xs">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="font-bold text-purple-200 flex items-center gap-2">
            <span>Cảnh báo chống ảo giác AI (Anti-Hallucination Guard)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/30 text-purple-200 uppercase tracking-wider font-mono">
              Bảo vệ dữ liệu
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Gemini được ràng buộc chặt chẽ theo tài liệu nguồn đã cung cấp. Những câu hỏi mà tài liệu nguồn không đủ cơ sở dữ liệu sẽ tự động được AI đánh dấu nhãn{' '}
            <span className="text-amber-300 font-semibold underline">"Cần xem xét"</span> để giáo viên đối soát lại trước khi sử dụng cho học sinh.
          </p>
        </div>
      </div>

      {/* 5-STEP VISUAL PROGRESS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {[
          { step: 1, title: '1. Nguồn nội dung', active: true },
          { step: 2, title: '2. Ma trận & Mức độ', active: true },
          { step: 3, title: '3. Gemini xử lý', active: isGenerating || generatedQuestions.length > 0 },
          { step: 4, title: '4. Kiểm tra & Chỉnh sửa', active: generatedQuestions.length > 0 },
          { step: 5, title: '5. Lưu vào Ngân hàng', active: generatedQuestions.length > 0 }
        ].map(item => (
          <div
            key={item.step}
            className={`p-3 rounded-xl border text-center font-medium transition-all ${
              item.active
                ? 'bg-[#111c33] border-purple-500/50 text-purple-300 shadow-sm'
                : 'bg-[#0b1120] border-[#1e293b] text-slate-500'
            }`}
          >
            <span>{item.title}</span>
          </div>
        ))}
      </div>

      {/* MAIN CONFIGURATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: 4 INPUT METHODS (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Phương thức đầu vào nguồn tài liệu</span>
              </span>
              <span className="text-[11px] text-slate-400">Chọn 1 trong 4 phương thức dưới đây</span>
            </div>

            {/* 4 MANDATORY INPUT METHOD BUTTONS IN EXACT SPECIFIED ORDER */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* 1. Văn bản */}
              <button
                type="button"
                onClick={() => setSourceMethod('text')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceMethod === 'text'
                    ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 ring-2 ring-purple-400'
                    : 'bg-[#0b1120] border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium'
                }`}
              >
                <span className="text-sm">📝</span>
                <span>Văn bản</span>
              </button>

              {/* 2. File (PDF/Word) */}
              <button
                type="button"
                onClick={() => setSourceMethod('file')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceMethod === 'file'
                    ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 ring-2 ring-purple-400'
                    : 'bg-[#0b1120] border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium'
                }`}
              >
                <span className="text-sm">📄</span>
                <span>File (PDF/Word)</span>
              </button>

              {/* 3. Link Web */}
              <button
                type="button"
                onClick={() => setSourceMethod('link')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceMethod === 'link'
                    ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 ring-2 ring-purple-400'
                    : 'bg-[#0b1120] border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium'
                }`}
              >
                <span className="text-sm">🔗</span>
                <span>Link Web</span>
              </button>

              {/* 4. Hình ảnh */}
              <button
                type="button"
                onClick={() => setSourceMethod('image')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sourceMethod === 'image'
                    ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 ring-2 ring-purple-400'
                    : 'bg-[#0b1120] border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium'
                }`}
              >
                <span className="text-sm">🖼️</span>
                <span>Hình ảnh</span>
              </button>
            </div>

            {/* ================= METHOD 1: VĂN BẢN ================= */}
            {sourceMethod === 'text' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">
                    Nhập hoặc dán nội dung bài học, tài liệu, chủ đề hay yêu cầu tạo câu hỏi:
                  </label>
                  <span className="text-[11px] text-purple-400 font-mono">
                    {textInput.length} ký tự · {textInput.trim() ? textInput.trim().split(/\s+/).length : 0} từ
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Dán văn bản bài học, định lý, khái niệm khoa học, trích đoạn văn học hoặc yêu cầu biên soạn câu hỏi..."
                  className="w-full p-3.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans placeholder:text-slate-500"
                />
                <p className="text-[11px] text-slate-400">
                  💡 Không bắt buộc tải tệp. Nội dung bạn nhập ở đây sẽ luôn được giữ nguyên khi chuyển đổi qua lại giữa các phương thức.
                </p>
              </div>
            )}

            {/* ================= METHOD 2: FILE (PDF/WORD) ================= */}
            {sourceMethod === 'file' && (
              <div className="space-y-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSelectDocFile}
                  accept=".docx,.pdf,.txt"
                  className="hidden"
                />

                {/* Upload Drop Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#1e293b] hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group bg-[#0b1120]"
                >
                  <UploadCloud className="w-10 h-10 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-200">
                    Tải lên tài liệu tham khảo (Hỗ trợ PDF, DOCX, TXT)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kéo thả tệp vào đây hoặc bấm nút dưới để duyệt tệp từ thiết bị
                  </p>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Chọn tệp
                  </button>
                </div>

                {/* Processing Spinner */}
                {docStatus === 'extracting' && (
                  <div className="p-3.5 rounded-xl bg-[#0b1120] border border-purple-500/40 flex items-center gap-3 text-xs text-purple-300">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Hệ thống đang trích xuất nội dung văn bản từ tệp "{docFile?.name}"...</span>
                  </div>
                )}

                {/* Error Banner */}
                {docStatus === 'error' && (
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-300">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-bold">Trích xuất nội dung tệp thất bại:</div>
                      <div>{docErrorMsg}</div>
                      <div className="text-[11px] text-rose-400/80 pt-1">
                        Hệ thống không tạo câu hỏi dựa trên nội dung chưa đọc được. Vui lòng thử tải lại tệp khác hoặc copy văn bản sang phương thức Văn bản.
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Card */}
                {docStatus === 'success' && docFile && (
                  <div className="p-4 rounded-xl bg-[#0b1120] border border-emerald-500/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-100 truncate">{docFile.name}</span>
                        <span className="text-[11px] text-slate-400">
                          ({(docFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearDocFile}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Gỡ bỏ tệp"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                      <span>✓ Đã trích xuất nội dung thành công</span>
                      <strong>{docWordCount} từ ({docCharCount} ký tự)</strong>
                    </div>

                    {/* Collapsible snippet preview */}
                    <div className="p-2.5 rounded-lg bg-[#070d19] border border-[#1e293b] text-[11px] text-slate-400 line-clamp-3 font-mono leading-relaxed">
                      {docExtractedText}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= METHOD 3: LINK WEB ================= */}
            {sourceMethod === 'link' && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Đường dẫn bài học / tài liệu trực tuyến:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddWebLink();
                          }
                        }}
                        placeholder="Dán link trang web tài liệu (ví dụ: https://example.com/bai-hoc)..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 text-xs focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddWebLink}
                      disabled={isAddingLink}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {isAddingLink ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang lấy...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Thêm Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* List of Added Links */}
                {webLinks.length === 0 ? (
                  <div className="p-5 rounded-xl bg-[#0b1120] border border-dashed border-[#1e293b] text-center text-xs text-slate-400">
                    Chưa có liên kết nào được thêm. Hãy dán URL và bấm <strong>“Thêm Link”</strong> để hệ thống tự động cào và trích xuất nội dung bài học.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {webLinks.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          item.status === 'success'
                            ? 'bg-[#0b1120] border-emerald-500/40'
                            : item.status === 'error'
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : 'bg-[#0b1120] border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <Link2 className="w-4 h-4 text-purple-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-slate-200 block truncate">
                                {item.title || item.url}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">{item.url}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.status === 'loading' && (
                              <span className="text-[10px] text-purple-300 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Đang đọc...</span>
                              </span>
                            )}
                            {item.status === 'success' && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                                ✓ Đã lấy {item.wordCount} từ
                              </span>
                            )}
                            {item.status === 'error' && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                                ✕ Lỗi đọc link
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveWebLink(item.id)}
                              className="text-slate-400 hover:text-rose-400 p-1"
                              title="Xóa link"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {item.status === 'error' && item.error && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-900/30 text-[11px] text-rose-300">
                            ⚠️ {item.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= METHOD 4: HÌNH ẢNH ================= */}
            {sourceMethod === 'image' && (
              <div className="space-y-3 pt-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleSelectImage}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                {!imagePreviewUrl ? (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-[#1e293b] hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group bg-[#0b1120]"
                  >
                    <ImageIcon className="w-10 h-10 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-200">
                      Tải lên hình ảnh trang sách hoặc đề cương (PNG, JPG, WEBP)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Kéo thả ảnh vào đây hoặc bấm nút dưới để chọn tệp
                    </p>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        imageInputRef.current?.click();
                      }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      Chọn tệp
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0b1120] border border-purple-500/40 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="font-bold text-slate-100">{imageFile?.name || 'Ảnh bài học'}</span>
                        {imageFile && (
                          <span className="text-[11px] text-slate-400">
                            ({(imageFile.size / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Gỡ bỏ ảnh"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Image Preview Box */}
                    <div className="relative rounded-xl overflow-hidden border border-[#1e293b] max-h-60 bg-black/40 flex items-center justify-center">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview tài liệu"
                        className="max-h-60 w-auto object-contain"
                      />
                    </div>

                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>
                        Ảnh đã sẵn sàng. Trợ lý Gemini Vision sẽ trực tiếp phân tích hình ảnh và bám sát nội dung để tạo câu hỏi.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SHARED PARAMETERS & ACTION BUTTON (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Cấu hình chung ma trận câu hỏi</span>
              </span>
            </div>

            {/* Topic Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Chủ đề / Tên bài học *</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="VD: Phương trình bậc hai, Thì hiện tại hoàn thành..."
                className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Subject and Grade */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Môn học *</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
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

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Khối lớp *</label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
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
            </div>

            {/* Count & Question Type */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Số lượng câu *</label>
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu (Tiêu chuẩn)</option>
                  <option value={15}>15 câu</option>
                  <option value={20}>20 câu</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Định dạng</label>
                <select
                  value={questionType}
                  onChange={e => setQuestionType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="single">Trắc nghiệm 1 đáp án</option>
                  <option value="multiple">Nhiều đáp án</option>
                  <option value="true_false">Đúng / Sai</option>
                  <option value="fill_blank">Điền khuyết</option>
                  <option value="mixed">Hỗn hợp đề thi</option>
                </select>
              </div>
            </div>

            {/* Cognitive Levels Distribution */}
            <div className="space-y-3 pt-2 border-t border-[#1e293b]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Phân bổ 4 mức độ nhận thức:</span>
                <span className="text-purple-400 font-mono text-[11px]">
                  Tổng: {easyPct + mediumPct + hardPct + expertPct}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-[#0b1120] border border-blue-500/30">
                  <div className="flex justify-between text-[11px] text-blue-300 mb-1">
                    <span>Nhận biết</span>
                    <strong>{easyPct}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={easyPct}
                    onChange={e => setEasyPct(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-2 rounded-xl bg-[#0b1120] border border-emerald-500/30">
                  <div className="flex justify-between text-[11px] text-emerald-300 mb-1">
                    <span>Thông hiểu</span>
                    <strong>{mediumPct}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={mediumPct}
                    onChange={e => setMediumPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-2 rounded-xl bg-[#0b1120] border border-amber-500/30">
                  <div className="flex justify-between text-[11px] text-amber-300 mb-1">
                    <span>Vận dụng</span>
                    <strong>{hardPct}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={hardPct}
                    onChange={e => setHardPct(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-2 rounded-xl bg-[#0b1120] border border-purple-500/30">
                  <div className="flex justify-between text-[11px] text-purple-300 mb-1">
                    <span>Vận dụng cao</span>
                    <strong>{expertPct}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={expertPct}
                    onChange={e => setExpertPct(Number(e.target.value))}
                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* MANDATORY ACTION BUTTON: Bắt đầu tạo bằng AI */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartAIGeneration}
                disabled={isGenerating || !isReadyToGenerate}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Gemini đang đọc dữ liệu & tạo {count} câu hỏi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Bắt đầu tạo bằng AI</span>
                  </>
                )}
              </button>

              {!isReadyToGenerate && (
                <p className="text-[11px] text-amber-400/90 text-center mt-2">
                  ⚠️ Vui lòng cung cấp nội dung nguồn tương ứng với phương thức đang chọn trước khi bấm tạo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GENERATED QUESTIONS REVIEW SECTION */}
      {generatedQuestions.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl space-y-4">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Bản xem trước câu hỏi do AI tạo</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  {generatedQuestions.length} câu hỏi
                </span>
                {isFallbackNotice && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    Chuẩn GDPT 2018
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem lại, chỉnh sửa nội dung hoặc bỏ chọn các câu không phù hợp trước khi đưa vào ngân hàng.
              </p>
            </div>

            {/* Select All & Summary */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0b1120] border border-[#1e293b] text-slate-300 hover:text-white"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0b1120] border border-[#1e293b] text-slate-400 hover:text-slate-200"
              >
                Bỏ chọn
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.tempId}
                className={`p-4 rounded-xl border transition-all ${
                  q.isSelected
                    ? 'bg-[#0b1120] border-purple-500/40 shadow-sm'
                    : 'bg-[#070d19] border-[#1e293b] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={q.isSelected}
                      onChange={() => handleToggleSelect(q.tempId)}
                      className="mt-1 w-4 h-4 rounded-md accent-purple-600 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-purple-300">Câu {idx + 1}:</span>
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

                        {q.needsReview && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Cần xem xét</span>
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400">
                          Độ tin cậy: <strong className="text-purple-300">{q.confidenceScore}%</strong>
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-100 leading-snug">{q.question}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...q })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Sửa câu hỏi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(q.tempId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Xóa khỏi danh sách"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options display */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#1e293b]/60 text-xs">
                    {q.options.map((opt, i) => {
                      const isCorrect = String(opt) === String(q.correctAnswer);
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-[#0f172a] border-[#1e293b] text-slate-300'
                          }`}
                        >
                          <span>
                            {String.fromCharCode(65 + i)}. {opt}
                          </span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation & Grounding Note */}
                <div className="mt-2.5 p-2 rounded-lg bg-[#0f172a] border border-[#1e293b] text-[11px] text-slate-300 space-y-1">
                  <div>
                    <strong className="text-purple-300">Giải thích:</strong> {q.explanation}
                  </div>
                  {q.sourceGroundingNote && (
                    <div className="text-[10px] text-slate-400 italic">
                      🔍 Nguồn trích xuất: {q.sourceGroundingNote}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
            <div className="text-xs text-slate-400">
              Đã chọn <strong className="text-purple-400">{selectedCount}</strong> / {generatedQuestions.length} câu hỏi.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGeneratedQuestions([])}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveSelected}
                disabled={selectedCount === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu {selectedCount} câu hỏi vào Ngân hàng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL FOR AI QUESTION */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-xs text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-purple-400" />
                <span>Chỉnh sửa câu hỏi AI</span>
              </h4>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Nội dung câu hỏi *</label>
              <textarea
                rows={3}
                value={editingItem.question}
                onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {editingItem.options && editingItem.options.length > 0 && (
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">Phương án:</label>
                {editingItem.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-bold text-purple-400 w-5">{String.fromCharCode(65 + i)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...(editingItem.options || [])];
                        newOpts[i] = e.target.value;
                        setEditingItem({ ...editingItem, options: newOpts });
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
                  value={String(editingItem.correctAnswer)}
                  onChange={e => setEditingItem({ ...editingItem, correctAnswer: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0b1120] border border-[#1e293b] text-emerald-400 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mức độ nhận thức</label>
                <select
                  value={editingItem.difficulty}
                  onChange={e => setEditingItem({ ...editingItem, difficulty: e.target.value as any })}
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
                value={editingItem.explanation}
                onChange={e => setEditingItem({ ...editingItem, explanation: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#0b1120] border border-[#1e293b] text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
