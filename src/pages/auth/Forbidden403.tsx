import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';

export const Forbidden403: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, switchRole } = useAuth();

  const state = (location.state as any) || {};
  const requiredRoles: Role[] = state.requiredRoles || [];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block mb-1">
          Lỗi 403 · Không có quyền truy cập
        </span>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Truy cập bị từ chối (Forbidden)</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Tài khoản hiện tại của bạn với vai trò <span className="font-semibold text-slate-800 uppercase">{role}</span> không có quyền truy cập vào khu vực này.
        </p>

        {requiredRoles.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs mb-6 text-left">
            <span className="text-slate-500 block mb-1">Vai trò yêu cầu:</span>
            <div className="flex flex-wrap gap-1.5">
              {requiredRoles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    navigate(`/${r}/dashboard`);
                  }}
                  className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-md font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Chuyển sang {r.toUpperCase()} để thử nghiệm</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={() => navigate(`/${role || 'teacher'}/dashboard`)}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Về Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
