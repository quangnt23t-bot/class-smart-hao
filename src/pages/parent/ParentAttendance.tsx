import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { CheckCircle2, Clock, Calendar, Send, MessageSquare } from 'lucide-react';

export const ParentAttendance: React.FC = () => {
  const { selectedChildId } = useAuth();
  const student = StorageService.getStudentById(selectedChildId || 's_1')!;
  const records = StorageService.getAttendance().filter(a => a.studentId === student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Chuyên cần của con ({student.name})</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tỷ lệ chuyên cần đạt <strong>{student.attendanceRate}%</strong>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Nhật ký điểm danh từng buổi</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {records.map(r => (
            <div key={r.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-500">{r.date}</span>
                <span className="text-slate-800 font-medium ml-3">{r.period}</span>
                {r.note && <span className="text-slate-400 ml-2">({r.note})</span>}
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Có mặt
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ParentMessages: React.FC = () => {
  const { success, error } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Cô Nguyễn Thị Lan',
      text: 'Chào anh Bình, tuần này em Đức Anh học rất tốt và hăng hái phát biểu xây dựng bài. Gia đình tiếp tục động viên cháu nhé!',
      time: '02/10/2026 16:30',
      isTeacher: true
    },
    {
      id: 2,
      sender: 'Phụ huynh Trần Văn Bình',
      text: 'Dạ cảm ơn cô Lan nhiều ạ. Gia đình sẽ nhắc nhở cháu ôn tập kỹ phần hình học cho buổi kiểm tra sắp tới.',
      time: '02/10/2026 17:15',
      isTeacher: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'Phụ huynh Trần Văn Bình',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isTeacher: false
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    success('Đã gửi tin nhắn đến cô giáo!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Trao đổi với Giáo viên chủ nhiệm</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kênh nhắn tin trực tiếp và phản hồi 2 chiều với cô Nguyễn Thị Lan
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Cô Nguyễn Thị Lan</h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đang trực tuyến phản hồi</span>
            </p>
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 text-xs">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isTeacher ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                  m.isTeacher
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                    : 'bg-blue-600 text-white rounded-tr-xs shadow-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập tin nhắn gửi cô giáo..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
