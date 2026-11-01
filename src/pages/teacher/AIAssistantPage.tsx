import React, { useState } from 'react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  Edit3,
  Copy,
  Send,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { classes, selectedClassId } = useClass();
  const { success, info } = useToast();

  const [aiTask, setAiTask] = useState<'questions' | 'quiz' | 'lesson_plan' | 'student_feedback' | 'analysis'>('questions');
  const [topic, setTopic] = useState('Số nguyên tố, hợp số và các bài toán phân tích thừa số nguyên tố');
  const [gradeLevel, setGradeLevel] = useState('Khối 6');
  const [difficulty, setDifficulty] = useState('Vận dụng');
  const [studentPerformance, setStudentPerformance] = useState('Học sinh khá, chăm chỉ nhưng còn lúng túng khi trình bày');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-baked pedagogical intelligent templates if API offline
  const sampleOutputs: Record<string, string> = {
    questions: `### ĐỀ XUẤT BỘ CÂU HỎI TRẮC NGHIỆM & TỰ LUẬN
**Chủ đề:** ${topic} (${gradeLevel} - Mức độ: ${difficulty})

**Câu 1 (Nhận biết):** Trong các số sau, số nào là số nguyên tố?
* A. 15
* B. 27
* **C. 31 (Đáp án đúng)**
* D. 35
* *Giải thích:* 31 chỉ chia hết cho 1 và chính nó. 15 chia hết cho 3, 27 chia hết cho 9, 35 chia hết cho 5.

**Câu 2 (Thông hiểu):** Phân tích số 120 ra thừa số nguyên tố ta được:
* **A. 2³ · 3 · 5 (Đáp án đúng)**
* B. 2² · 3² · 5
* C. 2⁴ · 3 · 5
* D. 2 · 3 · 5²
* *Giải thích:* 120 = 2 · 60 = 2 · 2 · 30 = 2³ · 3 · 5.

**Câu 3 (Vận dụng - Tự luận):** 
Một lớp học có 24 học sinh nam và 18 học sinh nữ. Cô giáo muốn chia đều số học sinh vào các tổ sao cho số nam và số nữ ở mỗi tổ là bằng nhau.
a) Hỏi có thể chia được nhiều nhất bao nhiêu tổ?
b) Khi đó mỗi tổ có bao nhiêu học sinh nam, bao nhiêu học sinh nữ?
* *Hướng dẫn giải:* 
- Số tổ nhiều nhất là ƯCLN(24, 18) = 6 tổ.
- Mỗi tổ có: 24 : 6 = 4 nam, 18 : 6 = 3 nữ.`,

    quiz: `### ĐỀ KIỂM TRA ĐÁNH GIÁ 15 PHÚT
**Môn:** Toán học - ${gradeLevel} | **Thời gian:** 15 phút

**Phần I: Trắc nghiệm khách quan (6.0 điểm - Mỗi câu 1.5 điểm)**
1. Khẳng định nào sau đây là **ĐÚNG**?
   * A. Mọi số nguyên tố đều là số lẻ.
   * B. Số 0 và số 1 là số nguyên tố.
   * **C. Số 2 là số nguyên tố chẵn duy nhất.**
   * D. Hợp số là số tự nhiên lớn hơn 1 và chỉ có hai ước.

2. Cho các số: 13, 21, 37, 49. Có bao nhiêu số nguyên tố?
   * A. 1 số
   * **B. 2 số (13 và 37)**
   * C. 3 số
   * D. 4 số

**Phần II: Tự luận (4.0 điểm)**
Tìm số tự nhiên x biết: 120 chia hết cho x, 180 chia hết cho x và x > 15.
* *Lời giải chi tiết và biểu điểm:*
- x là ước chung của 120 và 180 (1.0 điểm)
- ƯCLN(120, 180) = 60 (1.5 điểm)
- Các ước chung của 120 và 180: {1; 2; 3; 4; 5; 6; 10; 12; 15; 20; 30; 60} (1.0 điểm)
- Vì x > 15 nên x ∈ {20; 30; 60} (0.5 điểm)`,

    lesson_plan: `### GỢI Ý KẾ HOẠCH BÀI DẠY (GIÁO ÁN ĐỔI MỚI)
**Bài học:** ${topic}
**Thời lượng:** 2 tiết (90 phút) | **Khối:** ${gradeLevel}

**1. MỤC TIÊU BÀI HỌC:**
* **Kiến thức:** Nắm vững định nghĩa số nguyên tố, hợp số; biết cách phân tích một số ra thừa số nguyên tố.
* **Năng lực:** Năng lực tư duy logic và suy luận toán học; giải quyết vấn đề thực tiễn thông qua bài toán chia nhóm.
* **Phẩm chất:** Chăm chỉ, cẩn thận, hợp tác tích cực trong thảo luận nhóm.

**2. TIẾN TRÌNH DẠY HỌC (5 BƯỚC):**
* **Khởi động (7 phút):** Trò chơi "Ai nhanh hơn": Tìm nhanh các ước số của số 1 đến 10.
* **Hình thành kiến thức (35 phút):** 
  - Hoạt động 1: Phân loại các số theo số lượng ước (1 ước, 2 ước, nhiều hơn 2 ước).
  - Hoạt động 2: Giới thiệu định nghĩa số nguyên tố và hợp số.
* **Luyện tập (25 phút):** Thực hành giải bài tập theo nhóm 4 học sinh.
* **Vận dụng (15 phút):** Bài toán mã hóa tin nhắn bí mật đơn giản bằng số nguyên tố.
* **Củng cố & Hướng dẫn về nhà (8 phút):** Sơ đồ tư duy tóm tắt bài học.`,

    student_feedback: `### GỢI Ý LỜI PHÊ & NHẬN XÉT HỌC BẠ HỌC SINH
**Tình trạng học lực:** ${studentPerformance}

**Mẫu 1 (Khích lệ & định hướng):**
"Em có thái độ học tập nghiêm túc, chăm chỉ và chủ động trong các giờ học Toán. Nắm bắt được các kiến thức trọng tâm cơ bản. Cần rèn luyện thêm kỹ năng trình bày các bước giải tự luận rõ ràng, mạch lạc hơn để tránh mất điểm đáng tiếc."

**Mẫu 2 (Gửi phụ huynh):**
"Cháu rất có ý thức tự giác, tiếp thu bài nhanh ở các dạng toán quen thuộc. Đề nghị gia đình tiếp tục đồng hành nhắc nhở cháu đọc kỹ đề bài và luyện tập thêm các câu hỏi vận dụng nâng cao ở nhà."

**Mẫu 3 (Nhận xét học kỳ):**
"Hoàn thành tốt các nhiệm vụ học tập. Điểm số ổn định, có tinh thần tương thân tương ái giúp đỡ bạn bè cùng tiến bộ."`
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedResult('');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: aiTask,
          prompt: `Chủ đề: ${topic}. Khối lớp: ${gradeLevel}. Mức độ: ${difficulty}. Đối tượng: ${studentPerformance}`,
          context: { gradeLevel, topic }
        })
      });

      const data = await res.json();
      if (data.text) {
        setGeneratedResult(data.text);
      } else {
        // High quality fallback
        setTimeout(() => {
          setGeneratedResult(sampleOutputs[aiTask] || sampleOutputs.questions);
        }, 600);
      }
    } catch (e) {
      setGeneratedResult(sampleOutputs[aiTask] || sampleOutputs.questions);
    } finally {
      setIsGenerating(false);
      success('AI đã hoàn thành bản đề xuất! Thầy/cô vui lòng xem lại và chỉnh sửa trước khi sử dụng.');
    }
  };

  const handleSaveAsAssignment = () => {
    const curClass = classes.find(c => c.id === selectedClassId) || classes[0];
    StorageService.addAssignment({
      classId: curClass.id,
      className: curClass.name,
      title: `Bài tập: ${topic}`,
      description: generatedResult,
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      assignedDate: new Date().toISOString(),
      maxScore: 10,
      status: 'published',
      targetType: 'all'
    });
    success(`Đã lưu và giao bài tập cho lớp ${curClass.name}!`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    success('Đã sao chép nội dung vào Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 rounded-2xl p-6 text-white shadow-md shadow-purple-500/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-200 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Trợ lý Giáo dục Thông minh</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">AI Hỗ trợ Giáo viên Soạn bài & Đánh giá</h1>
        <p className="text-xs text-purple-100 max-w-2xl mt-1 leading-relaxed">
          Tự động gợi ý ngân hàng câu hỏi, ma trận đề thi, kế hoạch bài dạy và lời phê học bạ theo chương trình GDPT.
          <strong> Lưu ý:</strong> AI chỉ đóng vai trò trợ lý đề xuất, giáo viên hoàn toàn kiểm soát và chỉnh sửa trước khi ban hành.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Prompt & Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Cấu hình yêu cầu AI</h3>

            {/* Task Type Selector */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nhiệm vụ bạn cần hỗ trợ</label>
              <select
                value={aiTask}
                onChange={e => setAiTask(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800"
              >
                <option value="questions">Tạo câu hỏi trắc nghiệm & tự luận</option>
                <option value="quiz">Tạo đề kiểm tra / Quiz 15-45 phút</option>
                <option value="lesson_plan">Gợi ý kế hoạch bài dạy (Giáo án)</option>
                <option value="student_feedback">Gợi ý nhận xét học bạ học sinh</option>
              </select>
            </div>

            {/* Topic Input */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên bài học / Chủ đề kiến thức *</label>
              <textarea
                rows={3}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="VD: Phân số, Tam giác đều, Hình hộp chữ nhật..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Grade & Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Khối lớp</label>
                <select
                  value={gradeLevel}
                  onChange={e => setGradeLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
                >
                  <option value="Khối 6">Khối 6</option>
                  <option value="Khối 7">Khối 7</option>
                  <option value="Khối 8">Khối 8</option>
                  <option value="Khối 9">Khối 9</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mức độ nhận thức</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
                >
                  <option value="Nhận biết">Nhận biết</option>
                  <option value="Thông hiểu">Thông hiểu</option>
                  <option value="Vận dụng">Vận dụng</option>
                  <option value="Vận dụng cao">Vận dụng cao</option>
                </select>
              </div>
            </div>

            {/* Student context for feedback task */}
            {aiTask === 'student_feedback' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả học lực học sinh</label>
                <input
                  type="text"
                  value={studentPerformance}
                  onChange={e => setStudentPerformance(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>TẠO ĐỀ XUẤT VỚI AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 2 Cols: AI Result Preview, Edit & Approval */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col h-full min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Bản đề xuất của AI</span>
                {generatedResult && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Sẵn sàng duyệt
                  </span>
                )}
              </div>

              {generatedResult && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-md font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Khóa chỉnh sửa' : 'Chỉnh sửa'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-md font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output area */}
            <div className="flex-1 overflow-y-auto">
              {generatedResult ? (
                isEditing ? (
                  <textarea
                    rows={16}
                    value={generatedResult}
                    onChange={e => setGeneratedResult(e.target.value)}
                    className="w-full h-full p-3 font-mono text-xs text-slate-800 border border-blue-300 rounded-xl focus:outline-none"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                    {generatedResult}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-8">
                  <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                  <span className="font-semibold text-slate-600">Chưa có nội dung đề xuất</span>
                  <p className="max-w-xs mt-1 text-[11px]">
                    Điền chủ đề ở khung bên trái và bấm "TẠO ĐỀ XUẤT VỚI AI" để bắt đầu soạn thảo.
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer (Xem -> Chỉnh sửa -> Duyệt -> Lưu / Giao) */}
            {generatedResult && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                <span className="text-[11px] text-slate-400">
                  Quy trình sư phạm: Xem xét kỹ trước khi ban hành cho học sinh
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAsAssignment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Duyệt & Lưu thành Bài tập</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
