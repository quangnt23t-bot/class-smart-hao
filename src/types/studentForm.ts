export interface ParentContact {
  id: string;
  fullName: string;
  relationship: 'Bố' | 'Mẹ' | 'Ông' | 'Bà' | 'Người giám hộ' | 'Khác';
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

export interface StudentFormData {
  fullName: string;
  studentCode: string;
  gender: 'Nam' | 'Nữ';
  dateOfBirth: string;
  studentNumber: string; // STT
  group: string; // 'Tổ 1' | 'Tổ 2' | 'Tổ 3' | 'Tổ 4'
  phone: string;
  address: string;
  parents: ParentContact[];
}

export interface StudentFormErrors {
  fullName?: string;
  studentCode?: string;
  dateOfBirth?: string;
  studentNumber?: string;
  phone?: string;
  parents?: Record<string, { fullName?: string; phone?: string; email?: string }>;
}
