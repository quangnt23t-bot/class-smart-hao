import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Role } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { Shield, Sparkles, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { loginWithEmail, loginWithGoogle, switchRole } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      error('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmail(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      success('Đăng nhập thành công qua Firebase Authentication!');
      navigate('/teacher/dashboard');
    } else {
      setErrorMessage(res.error || 'Email hoặc mật khẩu không chính xác');
      error(res.error || 'Đăng nhập thất bại');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const res = await loginWithGoogle();
    setIsLoading(false);

    if (res.success) {
      success('Đăng nhập Google qua Firebase thành công!');
      navigate('/teacher/dashboard');
    } else {
      setErrorMessage(res.error || 'Đăng nhập Google thất bại');
      error(res.error || 'Đăng nhập Google thất bại');
    }
  };

  const handleQuickDemoLogin = (r: Role) => {
    switchRole(r);
    success(`Đã vào hệ thống với vai trò Demo: ${r.toUpperCase()}`);
    navigate(`/${r}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/30 mb-3">
          SC
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          SMART CLASS
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Đăng nhập hệ thống (Dự án Firebase: acquired-agent-9nm9t)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Lỗi xác thực Firebase:</span>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tài khoản Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu *
                </label>
                <Link to="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xác thực qua Firebase...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Firebase Google Auth Button */}
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 absolute">hoặc</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Đăng nhập với Google (Firebase Auth)</span>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Đăng ký tài khoản mới ngay
            </Link>
          </div>

          {/* Quick Demo Access (For Instant Testing) */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Chế độ trải nghiệm nhanh (Demo Mode)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('teacher')}
                className="p-2 text-left border border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-all group cursor-pointer"
              >
                <div className="font-semibold text-blue-900 group-hover:text-blue-700">Giáo viên</div>
                <div className="text-[10px] text-slate-500 truncate">Cô Nguyễn Thị Lan</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="p-2 text-left border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl transition-all group cursor-pointer"
              >
                <div className="font-semibold text-emerald-900 group-hover:text-emerald-700">Học sinh</div>
                <div className="text-[10px] text-slate-500 truncate">Trần Đức Anh (6A1)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('parent')}
                className="p-2 text-left border border-purple-200 bg-purple-50/50 hover:bg-purple-50 rounded-xl transition-all group cursor-pointer"
              >
                <div className="font-semibold text-purple-900 group-hover:text-purple-700">Phụ huynh</div>
                <div className="text-[10px] text-slate-500 truncate">Bác Trần Văn Hùng</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 text-left border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all group cursor-pointer"
              >
                <div className="font-semibold text-slate-900 group-hover:text-slate-700">Quản trị viên</div>
                <div className="text-[10px] text-slate-500 truncate">Admin Trường THCS</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
