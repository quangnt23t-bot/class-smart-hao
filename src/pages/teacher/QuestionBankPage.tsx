import React, { useState, useEffect } from 'react';
import { StorageService } from '../../data/storage';
import { useToast } from '../../contexts/ToastContext';
import { QuizQuestion } from '../../types';
import {
  FileSpreadsheet,
  Sparkles,
  Edit3,
  Database,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ImportTab } from '../../components/questionBank/ImportTab';
import { AIAssistantTab } from '../../components/questionBank/AIAssistantTab';
import { ManualTab } from '../../components/questionBank/ManualTab';
import { RepositoryView } from '../../components/questionBank/RepositoryView';

type ActiveTabType = 'import' | 'ai' | 'manual' | 'repository';

export const QuestionBankPage: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('repository');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    const list = StorageService.getQuestions();
    setQuestions(list);
  };

  // Add single question
  const handleSaveQuestion = (qData: Omit<QuizQuestion, 'id'>) => {
    StorageService.addQuestion(qData);
    loadQuestions();
  };

  // Add bulk questions (from File import or AI assistant)
  const handleSaveQuestionsBulk = (items: Omit<QuizQuestion, 'id'>[]) => {
    StorageService.addQuestionsBulk(items);
    loadQuestions();
    // Switch to repository to see the saved results
    setActiveTab('repository');
  };

  // Update existing question
  const handleUpdateQuestion = (updated: QuizQuestion) => {
    StorageService.updateQuestion(updated.id, updated);
    loadQuestions();
  };

  // Delete single
  const handleDeleteQuestion = (id: string) => {
    StorageService.deleteQuestion(id);
    loadQuestions();
  };

  // Delete bulk
  const handleDeleteBulk = (ids: string[]) => {
    StorageService.deleteQuestionsBulk(ids);
    loadQuestions();
  };

  return (
    <div className="min-h-[85vh] -m-4 sm:-m-6 p-4 sm:p-6 bg-[#070d19] text-slate-100 space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Database className="w-5 h-5" />
              </span>
              <span>NGÂN HÀNG CÂU HỎI THÔNG MINH</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Chuẩn GDPT 2018
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Hệ thống quản trị và số hóa câu hỏi theo ma trận 4 cấp độ nhận thức. Tích hợp AI Gemini chống ảo giác
            và công cụ phân tích tệp Word / Excel chuyên sâu.
          </p>
        </div>

        {/* Quick repository count badge */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('repository')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'repository'
                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                : 'bg-[#0f172a] border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4 text-purple-300" />
            <span>Kho câu hỏi</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#070d19] text-purple-300 border border-purple-500/30">
              {questions.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3 MAIN NAVIGATION TABS + REPOSITORY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* TAB 1 */}
        <button
          onClick={() => setActiveTab('import')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'import'
              ? 'bg-[#0f172a] border-purple-500 ring-1 ring-purple-500/50 shadow-xl'
              : 'bg-[#0b1120] border-[#1e293b] hover:border-slate-700 hover:bg-[#0f172a]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`p-2 rounded-xl text-xs font-bold ${
                activeTab === 'import'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 group-hover:text-purple-300'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Tab 1</span>
          </div>
          <div className="font-bold text-xs text-slate-100">1. Nhập từ file</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">Word / Excel / CSV / JSON</div>
        </button>

        {/* TAB 2 */}
        <button
          onClick={() => setActiveTab('ai')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'ai'
              ? 'bg-[#0f172a] border-purple-500 ring-1 ring-purple-500/50 shadow-xl'
              : 'bg-[#0b1120] border-[#1e293b] hover:border-slate-700 hover:bg-[#0f172a]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`p-2 rounded-xl text-xs font-bold ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 group-hover:text-purple-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">AI Gemini</span>
          </div>
          <div className="font-bold text-xs text-slate-100">2. Trợ lý AI Gemini</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">Chống ảo giác & Chuẩn ma trận</div>
        </button>

        {/* TAB 3 */}
        <button
          onClick={() => setActiveTab('manual')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'manual'
              ? 'bg-[#0f172a] border-purple-500 ring-1 ring-purple-500/50 shadow-xl'
              : 'bg-[#0b1120] border-[#1e293b] hover:border-slate-700 hover:bg-[#0f172a]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`p-2 rounded-xl text-xs font-bold ${
                activeTab === 'manual'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 group-hover:text-purple-300'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Tab 3</span>
          </div>
          <div className="font-bold text-xs text-slate-100">3. Tạo câu hỏi bằng tay</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">Soạn thảo chuẩn ma trận</div>
        </button>

        {/* REPOSITORY TAB */}
        <button
          onClick={() => setActiveTab('repository')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === 'repository'
              ? 'bg-[#0f172a] border-purple-500 ring-1 ring-purple-500/50 shadow-xl'
              : 'bg-[#0b1120] border-[#1e293b] hover:border-slate-700 hover:bg-[#0f172a]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`p-2 rounded-xl text-xs font-bold ${
                activeTab === 'repository'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 group-hover:text-purple-300'
              }`}
            >
              <Database className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              {questions.length} câu
            </span>
          </div>
          <div className="font-bold text-xs text-slate-100">Kho câu hỏi đã lưu</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">Xem, lọc, xuất Word/Excel</div>
        </button>
      </div>

      {/* TAB CONTENT WITH STATE PRESERVATION */}
      <div className="tab-viewport">
        {activeTab === 'import' && (
          <ImportTab
            existingQuestions={questions}
            onSaveQuestions={handleSaveQuestionsBulk}
            onSuccessToast={success}
            onErrorToast={error}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantTab
            onSaveQuestions={handleSaveQuestionsBulk}
            onSuccessToast={success}
            onErrorToast={error}
          />
        )}

        {activeTab === 'manual' && (
          <ManualTab
            onSaveQuestion={handleSaveQuestion}
            onSuccessToast={success}
            onErrorToast={error}
          />
        )}

        {activeTab === 'repository' && (
          <RepositoryView
            questions={questions}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDeleteBulk={handleDeleteBulk}
            onSuccessToast={success}
            onErrorToast={error}
          />
        )}
      </div>
    </div>
  );
};
