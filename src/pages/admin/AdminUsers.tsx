import React, { useState } from 'react';
import { StorageService } from '../../data/storage';
import { useToast } from '../../contexts/ToastContext';
import { User, Role } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Users, Plus, Search, Shield, Trash2, Edit2, Lock } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('teacher');

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('Vui lòng điền đủ thông tin');
      return;
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      role,
      phone: '0912 000 000'
    };
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.logAction('Tạo tài khoản người dùng mới', newUser.name, `Tạo tài khoản ${newUser.email} (${newUser.role})`);
    success(`Đã thêm người dùng ${name} (${role})!`);
    setIsAddOpen(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Người dùng & Phân quyền</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị danh sách tài khoản Giáo viên, Học sinh, Phụ huynh và Quản trị viên
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo người dùng mới</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
          <option value="parent">Phụ huynh</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Người dùng</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Vai trò (Role)</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <span>{u.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                      u.role === 'teacher'
                        ? 'bg-blue-50 text-blue-700'
                        : u.role === 'student'
                        ? 'bg-emerald-50 text-emerald-700'
                        : u.role === 'parent'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono">{u.phone || '—'}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-emerald-600 font-semibold text-[11px]">Hoạt động</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tạo tài khoản người dùng mới"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email đăng nhập *</label>
            <input
              type="email"
              required
              placeholder="user@smartclass.edu.vn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vai trò trong hệ thống</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="teacher">Giáo viên</option>
              <option value="student">Học sinh</option>
              <option value="parent">Phụ huynh</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Lưu tài khoản
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
