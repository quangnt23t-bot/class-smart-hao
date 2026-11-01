import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize, Minimize, Bell, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ClassroomTimer: React.FC = () => {
  const [totalSeconds, setTotalSeconds] = useState(300); // 5 min default
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Play audio chime when timer ends
  const playAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.2);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime + idx * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.2 + 0.4);
        osc.start(audioCtx.currentTime + idx * 0.2);
        osc.stop(audioCtx.currentTime + idx * 0.2 + 0.4);
      });
    } catch (e) {
      // Audio fallback
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      playAlarm();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleSetPreset = (minutes: number) => {
    const s = minutes * 60;
    setTotalSeconds(s);
    setSecondsLeft(s);
    setIsRunning(false);
  };

  const handleReset = () => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-12 bg-slate-900 text-white justify-center' : ''
      }`}
    >
      <div className="w-full flex items-center justify-between mb-8 max-w-lg">
        <div>
          <h2 className={`font-bold text-lg ${isFullscreen ? 'text-white' : 'text-slate-900'}`}>
            ⏱ Đồng hồ đếm giờ lớp học
          </h2>
          <p className={`text-xs ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
            Đếm ngược thời gian làm bài, thảo luận nhóm, thi đua
          </p>
        </div>
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-lg border transition-colors ${
            isFullscreen
              ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
          title="Toàn màn hình"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center mb-8">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className={isFullscreen ? 'stroke-slate-800' : 'stroke-slate-100'}
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className={`transition-all duration-500 ${
              secondsLeft < 30 ? 'stroke-rose-500' : 'stroke-blue-600'
            }`}
            strokeWidth="6"
            strokeDasharray={276.46}
            strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span
            className={`font-mono font-bold tracking-tighter tabular-nums transition-colors ${
              isFullscreen ? 'text-6xl sm:text-7xl text-white' : 'text-5xl sm:text-6xl text-slate-900'
            } ${secondsLeft < 30 ? 'text-rose-600 animate-pulse' : ''}`}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className={`text-xs mt-1 font-medium ${isFullscreen ? 'text-slate-400' : 'text-slate-400'}`}>
            {isRunning ? 'Đang đếm ngược' : secondsLeft === 0 ? 'HẾT GIỜ!' : 'Tạm dừng'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 text-sm cursor-pointer"
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
        </button>

        <button
          onClick={handleReset}
          className={`p-3 rounded-xl border transition-colors ${
            isFullscreen
              ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
          title="Đặt lại"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
        {[1, 3, 5, 10, 15].map(m => (
          <button
            key={m}
            onClick={() => handleSetPreset(m)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              totalSeconds === m * 60
                ? 'bg-blue-600 text-white shadow-xs'
                : isFullscreen
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {m} phút
          </button>
        ))}
      </div>
    </div>
  );
};
