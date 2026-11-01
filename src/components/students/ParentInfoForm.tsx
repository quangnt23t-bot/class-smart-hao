import React from 'react';
import { User, Phone, Mail, MapPin, Plus, Trash2, CheckCircle2, Copy } from 'lucide-react';
import { StudentFormData, StudentFormErrors, ParentContact } from '../../types/studentForm';

interface ParentInfoFormProps {
  formData: StudentFormData;
  onChange: (fields: Partial<StudentFormData>) => void;
  errors: StudentFormErrors;
  onClearParentError: (parentId: string, field: string) => void;
  onCopyStudentAddress: (parentId: string) => void;
  onSwitchToStudentTab: () => void;
}

export const ParentInfoForm: React.FC<ParentInfoFormProps> = ({
  formData,
  onChange,
  errors,
  onClearParentError,
  onCopyStudentAddress,
  onSwitchToStudentTab
}) => {
  const parents = formData.parents || [];

  const handleAddParent = () => {
    const isFirst = parents.length === 0;
    const defaultRelation = parents.some(p => p.relationship === 'Bố') ? 'Mẹ' : 'Bố';
    const newParent: ParentContact = {
      id: `p_${Date.now()}`,
      fullName: '',
      relationship: defaultRelation,
      phone: '',
      email: '',
      address: formData.address || '',
      isPrimary: isFirst
    };
    onChange({ parents: [...parents, newParent] });
  };

  const handleUpdateParent = (id: string, updates: Partial<ParentContact>) => {
    onChange({
      parents: parents.map(p => {
        if (p.id !== id) {
          if (updates.isPrimary) {
            return { ...p, isPrimary: false };
          }
          return p;
        }
        return { ...p, ...updates };
      })
    });
  };

  const handleRemoveParent = (id: string) => {
    if (parents.length <= 1) return;
    const updated = parents.filter(p => p.id !== id);
    if (!updated.some(p => p.isPrimary) && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange({ parents: updated });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-xs">Người giám hộ & Phụ huynh</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dùng để gửi thông báo điểm danh, kết quả học tập và liên hệ khẩn cấp
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddParent}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm phụ huynh</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {parents.map((parent, index) => {
          const parentErrors = errors.parents?.[parent.id] || {};
          return (
            <div
              key={parent.id}
              className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5 space-y-3 relative"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {parent.relationship || 'Phụ huynh'} {parent.fullName ? `· ${parent.fullName}` : ''}
                  </span>
                  {parent.isPrimary && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Liên hệ chính
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!parent.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleUpdateParent(parent.id, { isPrimary: true })}
                      className="text-[10px] font-medium text-slate-500 hover:text-blue-600 px-2 py-0.5 rounded hover:bg-white transition-colors"
                    >
                      Đặt làm chính
                    </button>
                  )}
                  {parents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParent(parent.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-white transition-colors"
                      title="Xóa người liên hệ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 1: Họ tên + Mối quan hệ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Họ và tên phụ huynh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn Bình"
                      value={parent.fullName}
                      onChange={e => {
                        handleUpdateParent(parent.id, { fullName: e.target.value });
                        onClearParentError(parent.id, 'fullName');
                      }}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all ${
                        parentErrors.fullName
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {parentErrors.fullName && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{parentErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mối quan hệ</label>
                  <select
                    value={parent.relationship}
                    onChange={e => handleUpdateParent(parent.id, { relationship: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Ông">Ông</option>
                    <option value="Bà">Bà</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              {/* Row 2: SĐT + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={parent.phone}
                      onChange={e => {
                        handleUpdateParent(parent.id, { phone: e.target.value });
                        onClearParentError(parent.id, 'phone');
                      }}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all ${
                        parentErrors.phone
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {parentErrors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{parentErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email phụ huynh</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="phuhuynh@example.com"
                      value={parent.email || ''}
                      onChange={e => {
                        handleUpdateParent(parent.id, { email: e.target.value });
                        onClearParentError(parent.id, 'email');
                      }}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all ${
                        parentErrors.email
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {parentErrors.email && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{parentErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Địa chỉ liên hệ & Copy button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Địa chỉ liên hệ</label>
                  {formData.address && (
                    <button
                      type="button"
                      onClick={() => onCopyStudentAddress(parent.id)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép từ địa chỉ học sinh</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Địa chỉ nhà hoặc nơi công tác"
                    value={parent.address || ''}
                    onChange={e => handleUpdateParent(parent.id, { address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Back to student tab footer link */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onSwitchToStudentTab}
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>← Quay lại Thông tin học sinh</span>
        </button>
      </div>
    </div>
  );
};
