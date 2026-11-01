import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WheelOfFortune } from '../../components/tools/WheelOfFortune';
import { RandomPicker } from '../../components/tools/RandomPicker';
import { GroupMaker } from '../../components/tools/GroupMaker';
import { ClassroomTimer } from '../../components/tools/ClassroomTimer';
import { QuickQuiz } from '../../components/tools/QuickQuiz';
import { RotateCw, UserCheck, Users, Clock, HelpCircle, Gamepad2 } from 'lucide-react';

export const ClassroomToolsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tool') || 'wheel';

  const tools = [
    { key: 'wheel', label: 'Vòng quay may mắn', icon: RotateCw },
    { key: 'random', label: 'Bốc thăm ngẫu nhiên', icon: UserCheck },
    { key: 'groups', label: 'Chia nhóm tự động', icon: Users },
    { key: 'timer', label: 'Đồng hồ đếm giờ', icon: Clock },
    { key: 'quick-quiz', label: 'Quiz nhanh tại lớp', icon: HelpCircle }
  ];

  const handleSelectTool = (key: string) => {
    setSearchParams({ tool: key });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Bộ công cụ tương tác trực tiếp</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Trung tâm Công cụ Lớp học (Tool Hub)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Các công cụ trực quan hỗ trợ khuấy động không khí lớp, gọi tên công bằng và phân nhóm học tập
          </p>
        </div>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-semibold">
        {tools.map(t => {
          const Icon = t.icon;
          const isActive = currentTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleSelectTool(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tool Rendering */}
      <div>
        {currentTab === 'wheel' && <WheelOfFortune />}
        {currentTab === 'random' && <RandomPicker />}
        {currentTab === 'groups' && <GroupMaker />}
        {currentTab === 'timer' && <ClassroomTimer />}
        {currentTab === 'quick-quiz' && <QuickQuiz />}
      </div>
    </div>
  );
};
