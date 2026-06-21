import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    items: [
      { to: '/admin/dashboard', icon: 'dashboard', label: 'Tổng quan' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        to: '/admin/users',
        icon: 'manage_accounts',
        label: 'Người dùng & eKYC',
        sublabel: 'Quản lý tài khoản',
      },
      {
        to: '/admin/content',
        icon: 'content_paste',
        label: 'Nội dung & Điều phối',
        sublabel: 'Duyệt bài & báo cáo',
      },
      {
        to: '/admin/documents',
        icon: 'folder_open',
        label: 'Tài liệu công khai',
        sublabel: 'Quản lý & Tải lên PDF',
      },
      {
        to: '/admin/classes',
        icon: 'school',
        label: 'Quản lý Lớp học',
        sublabel: 'Workspace & Tài liệu lớp',
      },
    ],
  },
  {
    label: 'Thống kê & Tài chính',
    items: [
      {
        to: '/admin/reports',
        icon: 'bar_chart',
        label: 'Báo cáo & Phân tích',
        sublabel: 'Doanh thu & số liệu',
      },
      {
        to: '/admin/payouts',
        icon: 'account_balance',
        label: 'Giải ngân & Lương',
        sublabel: 'Thanh toán gia sư',
      },
    ],
  },
];

const AdminSideNavBar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-[68px] bottom-0 w-[260px] flex flex-col bg-white border-r border-slate-100 z-30 shadow-[2px_0_20px_rgba(0,0,0,0.04)]">

      {/* ── Admin Info ── */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white ring-2 ring-slate-800/20">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-[#0f172a] truncate">Quản trị viên</p>
            <p className="text-xs text-slate-400 font-medium">System Admin</p>
          </div>
        </div>

        {/* Quick stat */}
        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</p>
            <p className="text-sm font-extrabold text-emerald-600 leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All systems go
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Groups ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {group.label && (
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.12em] px-3 pt-3 pb-1.5">
                {group.label}
              </p>
            )}

            {group.items.map(({ to, icon, label, sublabel }: any) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-md shadow-slate-800/25'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#0f172a]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      <span
                        className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {icon}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-white' : ''}`}>
                        {label}
                      </p>
                      {sublabel && (
                        <p className={`text-[10px] leading-tight truncate mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                          {sublabel}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom: Settings & Logout ── */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-1.5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default AdminSideNavBar;
