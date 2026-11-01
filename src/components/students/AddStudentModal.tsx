import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useClass } from '../../contexts/ClassContext';
import { useToast } from '../../contexts/ToastContext';
import { StorageService } from '../../data/storage';
import { Student } from '../../types';
import { StudentFormData, StudentFormErrors, ParentContact } from '../../types/studentForm';
import { FormTabs } from './FormTabs';
import { StudentInfoForm } from './StudentInfoForm';
import { ParentInfoForm } from './ParentInfoForm';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
  className?: string;
  onSuccess?: (student: Student) => void;
}

const createInitialFormData = (classCodePrefix: string = 'HS'): StudentFormData => ({
  fullName: '',
  studentCode: `${classCodePrefix}${Math.floor(100 + Math.random() * 900)}`,
  gender: 'Nam',
  dateOfBirth: '2010-09-15',
  studentNumber: '1',
  group: 'Tổ 1',
  phone: '',
  address: '',
  parents: [
    {
      id: `p_${Date.now()}`,
      fullName: '',
      relationship: 'Bố',
      phone: '',
      email: '',
      address: '',
      isPrimary: true
    }
  ]
});

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  classId,
  className: customClassName,
  onSuccess
}) => {
  const { classes, selectedClassId, updateClass, refreshData } = useClass();
  const { success, error: toastError } = useToast();

  // Find effective class
  const targetClass = useMemo(() => {
    const id = classId || selectedClassId || 'c_10a1';
    return classes.find(c => c.id === id) || classes[0] || null;
  }, [classId, selectedClassId, classes]);

  const displayClassName = customClassName || (targetClass ? targetClass.name : 'Lớp 10A1');
  const classCodePrefix = targetClass
    ? `HS${targetClass.name.replace(/[^A-Za-z0-9]/g, '')}-`
    : 'HS10-';

  // Form state
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');
  const [formData, setFormData] = useState<StudentFormData>(() => createInitialFormData(classCodePrefix));
  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Set next student STT and code based on existing students in class
  const calculateNextStudentMeta = useCallback(() => {
    if (!targetClass) return { nextStt: 1, nextCode: `${classCodePrefix}01` };
    const existingStudents = StorageService.getStudents().filter(s => s.classId === targetClass.id);
    const nextStt = existingStudents.length + 1;
    const nextCode = `${classCodePrefix}${nextStt < 10 ? `0${nextStt}` : nextStt}`;
    return { nextStt, nextCode };
  }, [targetClass, classCodePrefix]);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      const { nextStt, nextCode } = calculateNextStudentMeta();
      setFormData({
        fullName: '',
        studentCode: nextCode,
        gender: 'Nam',
        dateOfBirth: '2010-09-15',
        studentNumber: String(nextStt),
        group: `Tổ ${((nextStt - 1) % 4) + 1}`,
        phone: '',
        address: '',
        parents: [
          {
            id: `p_${Date.now()}`,
            fullName: '',
            relationship: 'Bố',
            phone: '',
            email: '',
            address: '',
            isPrimary: true
          }
        ]
      });
      setErrors({});
      setActiveTab('student');
      setShowUnsavedDialog(false);
    }
  }, [isOpen, targetClass, calculateNextStudentMeta]);

  // Determine if form is dirty
  const isDirty = useMemo(() => {
    return (
      formData.fullName.trim() !== '' ||
      formData.phone.trim() !== '' ||
      formData.address.trim() !== '' ||
      formData.parents.some(p => p.fullName.trim() !== '' || p.phone.trim() !== '')
    );
  }, [formData]);

  // Handle request to close
  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedDialog(false);
    onClose();
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
  };

  // Field change handler
  const handleFormChange = (fields: Partial<StudentFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleClearError = (field: keyof StudentFormErrors) => {
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleClearParentError = (parentId: string, field: string) => {
    setErrors(prev => {
      if (!prev.parents || !prev.parents[parentId]) return prev;
      const updatedParents = { ...prev.parents };
      const parentErr = { ...updatedParents[parentId] };
      delete (parentErr as any)[field];
      if (Object.keys(parentErr).length === 0) {
        delete updatedParents[parentId];
      } else {
        updatedParents[parentId] = parentErr;
      }
      return { ...prev, parents: updatedParents };
    });
  };

  const handleGenerateCode = () => {
    const { nextCode } = calculateNextStudentMeta();
    const randomizedSuffix = Math.floor(10 + Math.random() * 89);
    handleFormChange({ studentCode: `${nextCode.slice(0, -2)}${randomizedSuffix}` });
    handleClearError('studentCode');
  };

  const handleCopyStudentAddress = (parentId: string) => {
    if (!formData.address) return;
    setFormData(prev => ({
      ...prev,
      parents: prev.parents.map(p => (p.id === parentId ? { ...p, address: prev.address } : p))
    }));
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: StudentFormErrors = {};
    let isValid = true;

    // Validate Student Info
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên học sinh';
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên tối thiểu 2 ký tự';
      isValid = false;
    }

    if (!formData.studentCode.trim()) {
      newErrors.studentCode = 'Vui lòng nhập mã học sinh';
      isValid = false;
    }

    // Check duplicate student code
    const existing = StorageService.getStudents();
    const isCodeTaken = existing.some(
      s => s.studentCode.toLowerCase() === formData.studentCode.trim().toLowerCase()
    );
    if (isCodeTaken) {
      newErrors.studentCode = 'Mã học sinh này đã tồn tại trong hệ thống';
      isValid = false;
    }

    // Validate Parents if filled
    const parentErrors: Record<string, { fullName?: string; phone?: string; email?: string }> = {};
    formData.parents.forEach(p => {
      const err: { fullName?: string; phone?: string; email?: string } = {};
      if (p.fullName.trim() && !p.phone.trim()) {
        err.phone = 'Vui lòng nhập số điện thoại phụ huynh';
        isValid = false;
      }
      if (p.phone.trim() && !/^[0-9+\s().-]{8,15}$/.test(p.phone.trim())) {
        err.phone = 'Số điện thoại không hợp lệ';
        isValid = false;
      }
      if (p.email && p.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
        err.email = 'Email không hợp lệ';
        isValid = false;
      }
      if (Object.keys(err).length > 0) {
        parentErrors[p.id] = err;
      }
    });

    if (Object.keys(parentErrors).length > 0) {
      newErrors.parents = parentErrors;
    }

    setErrors(newErrors);

    // If errors in student tab, switch to student tab
    if (newErrors.fullName || newErrors.studentCode) {
      setActiveTab('student');
    } else if (newErrors.parents) {
      setActiveTab('parent');
    }

    return isValid;
  };

  // Submit Handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toastError('Vui lòng kiểm tra các trường thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);

    try {
      const primaryParent = formData.parents.find(p => p.isPrimary) || formData.parents[0];
      const targetClassIdValue = targetClass ? targetClass.id : 'c_10a1';
      const targetClassNameValue = targetClass ? targetClass.name : displayClassName;

      // Create student in storage
      const newStudent = StorageService.addStudent({
        studentCode: formData.studentCode.trim().toUpperCase(),
        name: formData.fullName.trim(),
        gender: formData.gender,
        birthDate: formData.dateOfBirth,
        classId: targetClassIdValue,
        className: targetClassNameValue,
        parentName: primaryParent?.fullName?.trim() || undefined,
        parentPhone: primaryParent?.phone?.trim() || undefined,
        parentEmail: primaryParent?.email?.trim() || undefined,
        address: formData.address.trim() || undefined,
        groupNumber: parseInt(formData.group.replace(/\D/g, '') || '1', 10),
        avatar:
          formData.gender === 'Nữ'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        status: 'active'
      });

      // Update class student count in context
      if (targetClass) {
        updateClass(targetClass.id, {
          totalStudents: (targetClass.totalStudents || 0) + 1
        });
      }

      refreshData();
      success(`Đã thêm thành công học sinh ${newStudent.name} vào ${displayClassName}!`);

      if (onSuccess) {
        onSuccess(newStudent);
      }

      if (keepAdding) {
        // Reset form for next student
        const nextSttNum = parseInt(formData.studentNumber || '1', 10) + 1;
        const nextCode = `${classCodePrefix}${nextSttNum < 10 ? `0${nextSttNum}` : nextSttNum}`;
        setFormData({
          fullName: '',
          studentCode: nextCode,
          gender: 'Nam',
          dateOfBirth: '2010-09-15',
          studentNumber: String(nextSttNum),
          group: `Tổ ${((nextSttNum - 1) % 4) + 1}`,
          phone: '',
          address: '',
          parents: [
            {
              id: `p_${Date.now()}`,
              fullName: '',
              relationship: 'Bố',
              phone: '',
              email: '',
              address: '',
              isPrimary: true
            }
          ]
        });
        setErrors({});
        setActiveTab('student');
      } else {
        onClose();
      }
    } catch (err: any) {
      toastError(err.message || 'Có lỗi xảy ra khi lưu học sinh');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed Overlay */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={handleRequestClose}
      >
        {/* Modal Container: Max width 480-520px, rounded ~16-20px, crisp shadow */}
        <div
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-[510px] overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* 1. MODAL HEADER */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-start justify-between gap-3 bg-white shrink-0">
            <div>
              <h2 id="modal-title" className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                Thêm từng học sinh
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Nhập hồ sơ học sinh và thông tin phụ huynh vào <strong className="text-blue-600 font-semibold">{displayClassName}</strong>
              </p>
            </div>

            {/* Close Button X */}
            <button
              type="button"
              onClick={handleRequestClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. SEGMENTED TAB CONTROL */}
          <div className="px-4 sm:px-5 pt-3.5 pb-2 shrink-0 bg-white">
            <FormTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              parentCount={formData.parents.filter(p => p.fullName.trim() !== '').length}
            />
          </div>

          {/* 3. MODAL BODY (SCROLLABLE) */}
          <div className="px-4 sm:px-5 py-2 overflow-y-auto flex-1">
            {activeTab === 'student' ? (
              <StudentInfoForm
                formData={formData}
                onChange={handleFormChange}
                errors={errors}
                onClearError={handleClearError}
                onSwitchToParentTab={() => setActiveTab('parent')}
                onGenerateCode={handleGenerateCode}
              />
            ) : (
              <ParentInfoForm
                formData={formData}
                onChange={handleFormChange}
                errors={errors}
                onClearParentError={handleClearParentError}
                onCopyStudentAddress={handleCopyStudentAddress}
                onSwitchToStudentTab={() => setActiveTab('student')}
              />
            )}
          </div>

          {/* 4. MODAL FOOTER */}
          <div className="p-4 sm:p-5 border-t border-[#E2E8F0] bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            {/* Quick Batch Entry Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={keepAdding}
                onChange={e => setKeepAdding(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 rounded-sm cursor-pointer"
              />
              <span className="font-medium text-[11px] sm:text-xs">Tiếp tục thêm học sinh khác</span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleRequestClose}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>

              {activeTab === 'student' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('parent')}
                    className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>TT Phụ huynh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu học sinh</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu học sinh</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onContinueEditing={handleContinueEditing}
        onConfirmClose={handleConfirmClose}
      />
    </>
  );
};
