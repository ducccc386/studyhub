import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    label: 'Tuyển gia sư',
    items: [
      {
        to: '/parent/posts',
        icon: 'post_add',
        label: 'Bài đăng của tôi',
        sublabel: 'Quản lý & xem ứng viên',
      },
      {
        to: '/parent/classes',
        icon: 'school',
        label: 'Lớp học',
        sublabel: 'Theo dõi lớp đang học',
      },
    ],
  },
  {
    label: 'Tương tác',
    items: [
      {
        to: '/parent/feedback',
        icon: 'rate_review',
        label: 'Phản hồi & Đánh giá',
        sublabel: 'Đánh giá gia sư',
      },
      {
        to: '/parent/messages',
        icon: 'chat',
        label: 'Tin nhắn',
      },
      {
        to: '/parent/transactions',
        icon: 'receipt_long',
        label: 'Lịch sử giao dịch',
        sublabel: 'Giao dịch chuyển khoản',
      },
    ],
  },
];

const SideNavBar: React.FC = () => {
  const {  } = useAuth();

  return (
    <aside className="fixed left-0 top-[68px] bottom-0 w-[260px] flex flex-col bg-white border-r border-slate-100 z-30 shadow-[2px_0_20px_rgba(0,0,0,0.04)]">

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
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#0f172a]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-primary/10'
                    }`}>
                      <span
                        className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}
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

      {/* ── Bottom: CTA + Settings ── */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-1.5">
        {/* CTA: Đăng bài tìm gia sư */}
        <NavLink
          to="/parent/posts/create"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-primary/8 text-primary border border-primary/20 hover:bg-primary/15'
            }`
          }
        >
          {() => (
            <>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_circle
              </span>
              Đăng tin tìm gia sư
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/parent/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-slate-100 text-[#0f172a] font-semibold'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                settings
              </span>
              Cài đặt
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default SideNavBar;
