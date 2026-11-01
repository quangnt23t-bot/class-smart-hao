import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useClass } from '../../contexts/ClassContext';
import { Student } from '../../types';
import { RotateCw, RefreshCw, Trophy, UserX, Volume2, Sparkles } from 'lucide-react';

export const WheelOfFortune: React.FC = () => {
  const { classes, selectedClassId, setSelectedClassId, students } = useClass();

  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [removedStudents, setRemovedStudents] = useState<Student[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [duration, setDuration] = useState(5); // seconds

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize students when class changes
  useEffect(() => {
    setAvailableStudents(students);
    setRemovedStudents([]);
    setWinner(null);
  }, [students]);

  // Color palette for wheel segments
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6',
    '#6366F1', '#F97316', '#84CC16', '#0EA5E9'
  ];

  // Draw the wheel on canvas
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (availableStudents.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.fillText('Đã hết học sinh trong vòng quay', centerX, centerY);
      return;
    }

    const arcSize = (2 * Math.PI) / availableStudents.length;

    availableStudents.forEach((student, i) => {
      const angle = i * arcSize;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.fillText(student.name, radius - 20, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2563EB';
    ctx.stroke();

    // Center icon
    ctx.fillStyle = '#2563EB';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QUAY', centerX, centerY + 4);
  };

  useEffect(() => {
    drawWheel();
  }, [availableStudents]);

  // Audio tone generation for realistic tick & win
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // Audio fallback
    }
  };

  const handleSpin = () => {
    if (isSpinning || availableStudents.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // Pick random index
    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const selectedStudent = availableStudents[randomIndex];

    // Compute target angle so arrow points to randomIndex
    const arcSize = 360 / availableStudents.length;
    // Arrow is at top (270 degrees in canvas math)
    const targetSegmentCenter = randomIndex * arcSize + arcSize / 2;
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    const targetAngle = extraSpins + (360 - targetSegmentCenter);

    setCurrentRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(selectedStudent);
      playChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, duration * 1000);
  };

  const handleRemoveWinner = () => {
    if (!winner) return;
    setRemovedStudents(prev => [...prev, winner]);
    setAvailableStudents(prev => prev.filter(s => s.id !== winner.id));
    setWinner(null);
  };

  const handleReset = () => {
    setAvailableStudents(students);
    setRemovedStudents([]);
    setWinner(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🎡 Vòng quay may mắn gọi học sinh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lựa chọn học sinh ngẫu nhiên trả lời câu hỏi, lên bảng hoặc nhận phần thưởng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.totalStudents} HS)
              </option>
            ))}
          </select>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
            title="Làm mới lại danh sách đầy đủ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Wheel Canvas Area */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center relative">
          {/* Arrow pointer */}
          <div className="absolute top-2 z-10 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-rose-600 drop-shadow-md"></div>

          <div
            className="relative transition-transform ease-out"
            style={{
              transform: `rotate(${currentRotation}deg)`,
              transitionDuration: isSpinning ? `${duration}s` : '0s'
            }}
          >
            <canvas ref={canvasRef} width={420} height={420} className="max-w-full h-auto drop-shadow-xl" />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning || availableStudents.length === 0}
              className={`px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isSpinning || availableStudents.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-blue-500/30'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Đang quay...' : 'QUAY NGAY'}</span>
            </button>
          </div>
        </div>

        {/* Side Panel: Winner & Lists */}
        <div className="space-y-4">
          {/* Winner Card */}
          {winner && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-center animate-in zoom-in-95 duration-200 shadow-md shadow-emerald-500/10">
              <div className="w-12 h-12 bg-emerald-600 rounded-full text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Chúc mừng học sinh
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{winner.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã: {winner.studentCode} · {winner.className}
              </p>

              <div className="mt-4 flex items-center gap-2 justify-center">
                <button
                  onClick={handleRemoveWinner}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Loại khỏi lượt sau</span>
                </button>
                <button
                  onClick={() => setWinner(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Giữ lại
                </button>
              </div>
            </div>
          )}

          {/* Stats & Session info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Còn lại trong vòng quay:</span>
              <span className="font-bold text-blue-600">{availableStudents.length} học sinh</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Đã quay trúng & loại:</span>
              <span className="font-bold text-slate-700">{removedStudents.length} học sinh</span>
            </div>

            {removedStudents.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-1">Danh sách đã gọi:</span>
                <div className="flex flex-wrap gap-1">
                  {removedStudents.map(s => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 text-[10px]"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
