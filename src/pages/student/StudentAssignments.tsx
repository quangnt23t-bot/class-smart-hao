import React, { useState } from 'react';
import { StorageService } from '../../data/storage';
import { useToast } from '../../contexts/ToastContext';
import { Assignment, Submission } from '../../types';
import { Modal } from '../../components/common/Modal';
import { FileText, Clock, CheckCircle2, Upload, Send, Paperclip } from 'lucide-react';

export const StudentAssignments: React.FC = () => {
  const { success, error } = useToast();
  const student = StorageService.getStudentById('s_1')!;

  const assignments = StorageService.getAssignments(student.classId);
  const submissions = StorageService.getSubmissions(undefined, student.id);

  const [activeAssignmentToSubmit, setActiveAssignmentToSubmit] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionContent.trim() || !activeAssignmentToSubmit) {
      error('Vui lòng nhập nội dung bài làm');
      return;
    }
    StorageService.submitAssignment(activeAssignmentToSubmit.id, student, submissionContent.trim());
    success('Nộp bài thành công! Giáo viên sẽ chấm bài và phản hồi sớm.');
    setActiveAssignmentToSubmit(null);
    setSubmissionContent('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bài tập của tôi</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Danh sách các bài tập về nhà được giao, tiến độ hoàn thành và điểm số phản hồi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map(asg => {
          const mySub = submissions.find(s => s.assignmentId === asg.id);
          const isSubmitted = !!mySub;

          return (
            <div key={asg.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{asg.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      isSubmitted
                        ? mySub.status === 'graded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isSubmitted ? (mySub.status === 'graded' ? 'Đã chấm' : 'Đã nộp bài') : 'Chưa nộp'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{asg.description}</p>
              </div>

              {/* Status details */}
              {isSubmitted ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Điểm đạt được:</span>
                    <span className="font-bold font-mono text-emerald-600 text-sm">
                      {mySub.score !== undefined ? `${mySub.score} / 10 điểm` : 'Đang chờ cô chấm'}
                    </span>
                  </div>
                  {mySub.feedback && (
                    <div className="text-[11px] text-blue-700 pt-1">
                      <strong>Lời nhận xét của cô:</strong> {mySub.feedback}
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}</span>
                  </span>

                  <button
                    onClick={() => setActiveAssignmentToSubmit(asg)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                  >
                    Nộp bài làm
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUBMISSION MODAL */}
      {activeAssignmentToSubmit && (
        <Modal
          isOpen={!!activeAssignmentToSubmit}
          onClose={() => setActiveAssignmentToSubmit(null)}
          title={`Nộp bài: ${activeAssignmentToSubmit.title}`}
          subtitle="Nhập câu trả lời hoặc đính kèm ảnh chụp bài giải của em"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Yêu cầu đề bài:</span>
              <p className="text-slate-600 leading-relaxed">{activeAssignmentToSubmit.description}</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nội dung bài làm của em *</label>
              <textarea
                rows={5}
                required
                placeholder="Gõ lời giải chi tiết hoặc ghi chú bài làm vào đây..."
                value={submissionContent}
                onChange={e => setSubmissionContent(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50 text-slate-500 cursor-pointer">
              <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <span>Đính kèm ảnh bài làm hoặc file PDF</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveAssignmentToSubmit(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Nộp bài ngay
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
