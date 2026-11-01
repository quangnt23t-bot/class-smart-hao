import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Bell, 
  Menu, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  BookOpen, 
  Users, 
  CheckSquare, 
  FileText, 
  Send, 
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClass } from '../../contexts/ClassContext';
import { Role } from '../../types';
import { StorageService } from '../../data/storage';

interface HeaderProps {
  onMenuToggle: () => void;
  onOpenQuickCreate?: (type: 'class' | 'student' | 'assignment' | 'announcement') => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, onOpenQuickCreate }) => {
  const { user, role, switchRole, logout, resetDemoData } = useAuth();
  const { selectedClassId } = useClass();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search filtering
  const allStudents = StorageService.getStudents();
  const allClasses = StorageService.getClasses();
  const allAssignments = StorageService.getAssignments();
  const allAnnouncements = StorageService.getAnnouncements();

  const filteredStudents = searchQuery.trim()
    ? allStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentCode.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
    : [];
  const filteredClasses = searchQuery.trim()
    ? allClasses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.subject.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const filteredAssignments = searchQuery.trim()
    ? allAssignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const hasSearchResults = filteredStudents.length > 0 || filteredClasses.length > 0 || filteredAssignments.length > 0;

  const roleLabels: Record<Role, { title: string; color: string }> = {
    teacher: { title: 'Giáo viên', color: 'bg-blue-100 text-blue-700' },
    student: { title: 'Học sinh', color: 'bg-emerald-100 text-emerald-700' },
    parent: { title: 'Phụ huynh', color: 'bg-purple-100 text-purple-700' },
    admin: { title: 'Quản trị viên', color: 'bg-rose-100 text-rose-700' }
  };

  const handleRoleChange = (newRole: Role) => {
    switchRole(newRole);
    setShowUserMenu(false);
    setShowRoleSwitcher(false);
    navigate(`/${newRole}/dashboard`);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={() => navigate(`/${role || 'teacher'}/dashboard`)} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
            SC
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base">SMART CLASS</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Hệ thống quản lý lớp học</p>
          </div>
        </div>
      </div>

      {/* Center: Global Search */}
      <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Tìm học sinh, lớp, bài tập, thông báo..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Global Search Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
            {hasSearchResults ? (
              <div className="space-y-3 text-xs">
                {filteredStudents.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Học sinh ({filteredStudents.length})
                    </span>
                    {filteredStudents.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          navigate(`/teacher/students/${s.id}`);
                        }}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <img src={s.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-slate-800">{s.name}</span>
                          <span className="text-slate-400 ml-1.5">({s.studentCode} · {s.className})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredClasses.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Lớp học ({filteredClasses.length})
                    </span>
                    {filteredClasses.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          navigate(`/teacher/classes/${c.id}`);
                        }}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="text-slate-400">{c.subject}</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredAssignments.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Bài tập ({filteredAssignments.length})
                    </span>
                    {filteredAssignments.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          navigate(`/teacher/assignments`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="font-medium text-slate-800 truncate">{a.title}</div>
                        <div className="text-[10px] text-slate-400">{a.className} · Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                Không tìm thấy kết quả phù hợp với "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick Create, Notifications, Role Switcher & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Create Button (Teacher role only) */}
        {role === 'teacher' && (
          <div ref={quickRef} className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo nhanh</span>
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickCreate?.('class');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Tạo lớp học mới</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickCreate?.('student');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Thêm học sinh</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    navigate(`/teacher/attendance?classId=${selectedClassId}`);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>Điểm danh hôm nay</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickCreate?.('assignment');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Giao bài tập mới</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    navigate(`/teacher/quizzes`);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>Tạo đề kiểm tra / Quiz</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenQuickCreate?.('announcement');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <Send className="w-4 h-4 text-indigo-500" />
                  <span>Gửi thông báo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Icon with Badge */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800">Thông báo mới</span>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">Đánh dấu đã đọc</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {allAnnouncements.map(a => (
                  <div key={a.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 line-clamp-1">{a.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{a.createdAt}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Quick Switcher Pill (Critical for Reviewing 4 distinct portals) */}
        <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          {(['teacher', 'student', 'parent', 'admin'] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                role === r ? 'bg-white text-blue-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {roleLabels[r].title}
            </button>
          ))}
        </div>

        {/* User Profile Dropdown */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px] leading-tight">
                {user?.name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">{roleLabels[role || 'teacher'].title}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-800">{user?.name}</div>
                <div className="text-slate-500 text-[11px] truncate">{user?.email}</div>
              </div>

              {/* Mobile Role Switcher */}
              <div className="lg:hidden px-3 py-2 border-b border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Chuyển vai trò
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {(['teacher', 'student', 'parent', 'admin'] as Role[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`px-2 py-1 text-[11px] rounded text-left ${
                        role === r ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {roleLabels[r].title}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  resetDemoData();
                  setShowUserMenu(false);
                  window.location.reload();
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Khôi phục dữ liệu mẫu ban đầu</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
