import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


/**
 * TutorSideNavBar — đơn giản hóa từ 10 → 6 mục
 * Chia theo 3 nhóm rõ ràng:
 *   1. Việc làm (tìm lớp + quản lý lớp)
 *   2. Hoạt động (lịch + thu nhập)
 *   3. Liên lạc (tin nhắn)
 *
 * Các mục ít dùng (Lời mời, Đã ứng tuyển, Đánh giá) được tích hợp
 * vào trong trang tương ứng dưới dạng tabs / quick-links.
 */

const navGroups = [
  {
    // Không có tiêu đề — mục đứng độc lập
    items: [
      { to: '/tutor/dashboard', icon: 'dashboard', label: 'Tổng quan' },
    ],
  },
  {
    label: 'Việc làm',
    items: [

      {
        to: '/tutor/classes',
        icon: 'school',
        label: 'Lớp đang dạy',
        sublabel: 'Quản lý lớp hiện tại',
      },
      {
        to: '/tutor/bookings',
        icon: 'person_add',
        label: 'Lời mời dạy',
        sublabel: 'Yêu cầu từ phụ huynh',
      },
    ],
  },
  {
    label: 'Hoạt động',
    items: [
      {
        to: '/tutor/schedule',
        icon: 'calendar_month',
        label: 'Lịch dạy',
        sublabel: 'Thời khóa biểu',
      },
      {
        to: '/tutor/billing',
        icon: 'payments',
        label: 'Công nợ',
        sublabel: 'Thanh toán phí nền tảng',
      },
    ],
  },
  {
    label: 'Liên lạc',
    items: [
      {
        to: '/tutor/messages',
        icon: 'chat',
        label: 'Tin nhắn',
      },
    ],
  },
];

const TutorSideNavBar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-[68px] bottom-0 w-[260px] flex flex-col bg-white border-r border-slate-100 z-30 shadow-[2px_0_20px_rgba(0,0,0,0.04)]">



      {/* ── Navigation Groups ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {/* Section label */}
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

      {/* ── Bottom: Đăng bài PR + Settings + Logout ── */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-1.5">
        {/* CTA: Quản lý bài đăng (PR) */}
        <NavLink
          to="/tutor/posts"
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
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                post_add
              </span>
              Quản lý Bài PR
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/tutor/settings"
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

        {/* Logout */}
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

export default TutorSideNavBar;
