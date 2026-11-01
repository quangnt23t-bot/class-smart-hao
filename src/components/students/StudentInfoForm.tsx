import React, { useRef, useEffect } from 'react';
import { User, Hash, Calendar, Phone, MapPin, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { StudentFormData, StudentFormErrors } from '../../types/studentForm';

interface StudentInfoFormProps {
  formData: StudentFormData;
  onChange: (fields: Partial<StudentFormData>) => void;
  errors: StudentFormErrors;
  onClearError: (field: keyof StudentFormErrors) => void;
  onSwitchToParentTab: () => void;
  onGenerateCode: () => void;
}

export const StudentInfoForm: React.FC<StudentInfoFormProps> = ({
  formData,
  onChange,
  errors,
  onClearError,
  onSwitchToParentTab,
  onGenerateCode
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto focus first input on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-3.5 text-xs">
      {/* 1. HỌ VÀ TÊN HỌC SINH */}
      <div>
        <label className="font-semibold text-slate-700 block mb-1.5">
          Họ và tên học sinh <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Ví dụ: Nguyễn Hoàng Nam, Trần Bảo Anh..."
            value={formData.fullName}
            onChange={e => {
              onChange({ fullName: e.target.value });
              if (errors.fullName) onClearError('fullName');
            }}
            className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all ${
              errors.fullName
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.fullName}</p>
        )}
      </div>

      {/* 2. MÃ HỌC SINH & GIỚI TÍNH (2 Cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Mã học sinh */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              Mã học sinh <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={onGenerateCode}
              className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Tạo tự động</span>
            </button>
          </div>

          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="HS2024-013"
              value={formData.studentCode}
              onChange={e => {
                onChange({ studentCode: e.target.value.toUpperCase() });
                if (errors.studentCode) onClearError('studentCode');
              }}
              className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl font-mono text-xs text-slate-800 placeholder-slate-400 outline-none transition-all ${
                errors.studentCode
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
          </div>
          {errors.studentCode && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.studentCode}</p>
          )}
        </div>

        {/* Giới tính */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Giới tính</label>
          <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => onChange({ gender: 'Nam' })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formData.gender === 'Nam'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nam
            </button>
            <button
              type="button"
              onClick={() => onChange({ gender: 'Nữ' })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formData.gender === 'Nữ'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nữ
            </button>
          </div>
        </div>
      </div>

      {/* 3. NGÀY SINH + SỐ THỨ TỰ + TỔ HỌC TẬP (3 Cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Ngày sinh */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Ngày sinh</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.dateOfBirth}
              onChange={e => {
                onChange({ dateOfBirth: e.target.value });
                if (errors.dateOfBirth) onClearError('dateOfBirth');
              }}
              className={`w-full pl-9 pr-2 py-2 bg-white border rounded-xl text-slate-800 outline-none transition-all ${
                errors.dateOfBirth
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Số thứ tự STT */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Số thứ tự (STT)</label>
          <input
            type="number"
            min={1}
            max={99}
            placeholder="13"
            value={formData.studentNumber}
            onChange={e => {
              onChange({ studentNumber: e.target.value });
              if (errors.studentNumber) onClearError('studentNumber');
            }}
            className={`w-full px-3 py-2 bg-white border rounded-xl text-slate-800 outline-none text-center font-mono font-semibold transition-all ${
              errors.studentNumber
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
            }`}
          />
          {errors.studentNumber && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.studentNumber}</p>
          )}
        </div>

        {/* Tổ học tập */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Tổ học tập</label>
          <div className="relative">
            <select
              value={formData.group}
              onChange={e => onChange({ group: e.target.value })}
              className="w-full appearance-none px-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
            >
              <option value="Tổ 1">Tổ 1</option>
              <option value="Tổ 2">Tổ 2</option>
              <option value="Tổ 3">Tổ 3</option>
              <option value="Tổ 4">Tổ 4</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. SỐ ĐIỆN THOẠI + ĐỊA CHỈ THƯỜNG TRÚ (2 Cột) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Số điện thoại học sinh</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              placeholder="0987.xxx.xxx"
              value={formData.phone}
              onChange={e => {
                onChange({ phone: e.target.value });
                if (errors.phone) onClearError('phone');
              }}
              className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all ${
                errors.phone
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Địa chỉ thường trú học sinh</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Hà Nội"
              value={formData.address}
              onChange={e => onChange({ address: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 5. CALLOUT CARD TẠI CUỐI TAB HỌC SINH */}
      <div className="pt-1.5">
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <p className="text-slate-600 text-xs font-medium">
            Cần thêm thông tin liên hệ Bố/Mẹ cho học sinh này?
          </p>
          <button
            type="button"
            onClick={onSwitchToParentTab}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0 transition-colors cursor-pointer group"
          >
            <span>Thông tin phụ huynh</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
