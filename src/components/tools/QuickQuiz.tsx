import React, { useState, useEffect } from 'react';
import { HelpCircle, Play, CheckCircle2, RotateCcw, BarChart3, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuickQuiz: React.FC = () => {
  const [question, setQuestion] = useState('Trong các số sau, số nào chia hết cho cả 2 và 5?');
  const [options, setOptions] = useState([
    { id: 'A', text: '124', votes: 2 },
    { id: 'B', text: '150', votes: 26 },
    { id: 'C', text: '175', votes: 3 },
    { id: 'D', text: '198', votes: 1 }
  ]);
  const [correctOption, setCorrectOption] = useState('B');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: any = null;
    if (isLive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isLive) {
      setIsLive(false);
      setIsRevealed(true);
      confetti({ particleCount: 60, spread: 60 });
    }
    return () => clearInterval(interval);
  }, [isLive, timer]);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleStart = () => {
    setIsLive(true);
    setIsRevealed(false);
    setTimer(30);
  };

  const handleReveal = () => {
    setIsLive(false);
    setIsRevealed(true);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  const handleReset = () => {
    setIsLive(false);
    setIsRevealed(false);
    setTimer(30);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📝 Quiz tương tác nhanh tại lớp</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chiếu câu hỏi khởi động hoặc củng cố bài học, đếm ngược thời gian và công bố kết quả
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <button
              onClick={handleReveal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Công bố kết quả ngay
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>BẮT ĐẦU QUIZ (30s)</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Đặt lại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live timer badge */}
      {isLive && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs animate-pulse">
          <span className="font-semibold text-blue-900">ĐANG ĐẾM NGƯỢC THỜI GIAN LÀM BÀI:</span>
          <span className="font-mono font-bold text-blue-600 text-lg">{timer} giây</span>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
          Câu hỏi nhanh
        </span>
        <h3 className="text-base font-bold text-slate-900 leading-snug">{question}</h3>
      </div>

      {/* Options & Votes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(opt => {
          const isCorrect = opt.id === correctOption;
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

          return (
            <div
              key={opt.id}
              className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                isRevealed
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 bg-white opacity-70'
                  : 'border-slate-200 bg-white hover:border-blue-400'
              }`}
            >
              {/* Progress bar background on reveal */}
              {isRevealed && (
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ${
                    isCorrect ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}
                  style={{ width: `${pct}%`, zIndex: 0 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                      isRevealed && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">{opt.text}</span>
                </div>

                {isRevealed && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{pct}%</span>
                    <span className="text-[10px] text-slate-400">({opt.votes} HS)</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isRevealed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              Đáp án chính xác: <strong>Đáp án {correctOption} (150)</strong>. Tỷ lệ trả lời đúng:{' '}
              <strong>81%</strong> (26/32 học sinh).
            </span>
          </div>
          <span className="font-semibold text-emerald-700 text-[11px]">Đã ghi nhận thi đua</span>
        </div>
      )}
    </div>
  );
};
