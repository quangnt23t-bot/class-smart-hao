import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const ROUTE_LABELS: Record<string, string> = {
  teacher: 'Giáo viên',
  dashboard: 'Tổng quan',
  classes: 'Lớp học',
  students: 'Học sinh',
  parents: 'Ba mẹ học sinh',
  guardians: 'Ba mẹ học sinh',
  attendance: 'Điểm danh',
  schedule: 'Thời khóa biểu',
  assignments: 'Giao bài tập',
  quizzes: 'Chấm bài tự động',
  'question-bank': 'Ngân hàng câu hỏi',
  resources: 'Tài liệu số',
  ai: 'AI HỖ TRỢ',
  grades: 'Sổ điểm',
  behavior: 'Hành vi nề nếp',
  rewards: 'Thi đua & Huy hiệu',
  alerts: 'Cảnh báo thông minh',
  tools: 'Công cụ lớp học',
  wheel: 'Vòng quay may mắn',
  random: 'Chọn ngẫu nhiên',
  groups: 'Chia nhóm',
  timer: 'Đồng hồ đếm giờ',
  'quick-quiz': 'Quiz nhanh',
  announcements: 'Thông báo',
  reports: 'Báo cáo thống kê',
  student: 'Học sinh',
  parent: 'Phụ huynh',
  admin: 'Quản trị viên',
  users: 'Người dùng',
  'audit-log': 'Nhật ký hệ thống',
  settings: 'Cấu hình trường',
  profile: 'Hồ sơ cá nhân'
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();

  if (items && items.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 py-1.5 overflow-x-auto">
        <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </Link>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {item.href ? (
              <Link to={item.href} className="hover:text-blue-600 transition-colors truncate max-w-[200px]">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-700 truncate max-w-[220px]">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  const pathParts = location.pathname.split('/').filter(Boolean);
  if (pathParts.length <= 1) return null;

  if (location.pathname === '/teacher/classes') {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-400 py-1 overflow-x-auto">
        <Link to="/teacher/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1" title="Trang chủ">
          <Home className="w-3.5 h-3.5" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-500">Lớp học</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="font-semibold text-slate-700">Lớp của tôi</span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 py-1.5 overflow-x-auto">
      <Link to={`/${pathParts[0]}/dashboard`} className="hover:text-blue-600 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>
      {pathParts.map((part, index) => {
        const routePath = '/' + pathParts.slice(0, index + 1).join('/');
        const isLast = index === pathParts.length - 1;
        const label = ROUTE_LABELS[part] || part;

        return (
          <React.Fragment key={routePath}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-700 truncate">{label}</span>
            ) : (
              <Link to={routePath} className="hover:text-blue-600 transition-colors truncate">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
