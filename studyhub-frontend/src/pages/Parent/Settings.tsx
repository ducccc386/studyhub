import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

const Settings: React.FC = () => {
  const { name, email, avatar: contextAvatar, userId, updateProfile } = useAuth();

  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile fields
  const [avatar, setAvatar] = useState(contextAvatar || '');
  const [fullName, setFullName] = useState(name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [childrenName, setChildrenName] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load profile from API on mount
  useEffect(() => {
    if (!userId) return;
    apiFetch(`/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.fullName) setFullName(data.fullName);
        if (data.avatarUrl) setAvatar(data.avatarUrl);
        if (data.phone) setPhone(data.phone);
        if (data.address) setAddress(data.address);
        if (data.childrenName) setChildrenName(data.childrenName);
        if (data.createdAt) setCreatedAt(data.createdAt);
      })
      .catch(() => {});
  }, [userId]);

  // Sync context changes (e.g. after login)
  useEffect(() => {
    if (name) setFullName(name);
    if (contextAvatar) setAvatar(contextAvatar);
  }, [name, contextAvatar]);

  const showMsg = (type: 'success' | 'error', msg: string) => {
    setShowToast({ type, msg });
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatar(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ fullName, avatarUrl: avatar, phone, address, childrenName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi cập nhật');
      }
      updateProfile(fullName, avatar);
      showMsg('success', 'Đã cập nhật hồ sơ thành công!');
    } catch (err: any) {
      showMsg('error', err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMsg('error', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      showMsg('error', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (!userId) return;
    setChangingPassword(true);
    try {
      const res = await apiFetch(`/users/${userId}/change-password`, {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMsg('success', 'Đổi mật khẩu thành công!');
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const joinDate = createdAt
    ? new Date(createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in">
      <div className="mb-8 animate-slide-up">
        <h2 className="font-bold text-3xl text-on-surface mb-2">Quản lý hồ sơ</h2>
        <p className="text-on-surface-variant text-base font-normal">Cập nhật thông tin cá nhân của bạn để có trải nghiệm tốt nhất.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Avatar */}
        <div className="lg:col-span-4 animate-slide-up stagger-1">
          <div className="glass border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-high shadow-sm mb-4">
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=003d9b&color=fff&size=256`}
                />
              </div>
              <label
                className="absolute bottom-4 right-0 bg-primary text-on-primary p-2 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-transform active:scale-95"
                htmlFor="avatar-upload"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <input accept="image/*" className="hidden" id="avatar-upload" type="file" onChange={handleAvatarChange} />
              </label>
            </div>
            <h3 className="font-semibold text-xl mt-2 text-on-surface">{fullName || 'Phụ huynh'}</h3>
            <p className="text-on-surface-variant text-sm font-normal">Phụ huynh học sinh</p>

            <div className="w-full mt-6 pt-6 border-t border-outline-variant text-left space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                <span className="text-sm font-medium text-on-surface">Tài khoản đã xác minh</span>
              </div>
              {joinDate && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_month</span>
                  <span className="text-sm text-on-surface-variant">Tham gia từ {joinDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-8 animate-slide-up stagger-2">
          {/* Profile Form */}
          <div className="glass border border-white/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-white/20 flex justify-between items-center bg-surface-container/30">
              <h3 className="font-semibold text-xl text-on-surface">Thông tin cá nhân</h3>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">Chỉnh sửa</span>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleSaveProfile}>
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="fullname">Họ và tên</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">person</span>
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base text-on-surface"
                    id="fullname"
                    placeholder="Nhập họ và tên đầy đủ"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="phone">Số điện thoại</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">call</span>
                    <input
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base text-on-surface"
                      id="phone"
                      placeholder="0xxx xxx xxx"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="email">Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">mail</span>
                    <input
                      className="w-full pl-11 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant cursor-not-allowed text-on-surface-variant text-base"
                      id="email"
                      readOnly
                      type="email"
                      value={email || ''}
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant italic mt-1">Vui lòng liên hệ hỗ trợ để đổi email</p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="address">Địa chỉ học tập</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant text-sm">location_on</span>
                  <textarea
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base text-on-surface resize-none"
                    id="address"
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <p className="text-xs font-medium text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Địa chỉ này giúp gia sư xác định khu vực giảng dạy phù hợp.
                </p>
              </div>

              {/* Children Name */}
              <div className="space-y-2">
                <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="children-name">Tên con của bạn</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">family_restroom</span>
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base text-on-surface"
                    id="children-name"
                    placeholder="Ví dụ: Nguyễn Văn A, Nguyễn Thị B"
                    type="text"
                    value={childrenName}
                    onChange={(e) => setChildrenName(e.target.value)}
                  />
                </div>
                <p className="text-xs font-medium text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Thông tin các con của phụ huynh để hiển thị/điền nhanh khi đăng bài.
                </p>
              </div>

              <div className="pt-6 border-t border-outline-variant flex items-center justify-end gap-4">
                <button
                  className="px-6 py-2.5 rounded-full font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95"
                  type="button"
                  onClick={() => { setFullName(name || ''); setAvatar(contextAvatar || ''); }}
                >
                  Hủy
                </button>
                <button
                  className="px-8 py-2.5 rounded-full font-semibold text-sm bg-primary text-on-primary shadow-md hover:bg-primary/90 transition-all active:scale-95 hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                  type="submit"
                  disabled={saving}
                >
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass border border-white/20 rounded-2xl overflow-hidden shadow-sm mt-8 animate-slide-up stagger-3">
            <div className="p-6 border-b border-white/20 flex justify-between items-center bg-surface-container/30">
              <h3 className="font-semibold text-xl text-on-surface">Đổi mật khẩu</h3>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleSavePassword}>
              <div className="space-y-2">
                <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="current-password">Mật khẩu hiện tại</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">lock</span>
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base text-on-surface"
                    id="current-password"
                    placeholder="••••••••"
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="new-password">Mật khẩu mới</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">password</span>
                    <input
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base text-on-surface"
                      id="new-password"
                      placeholder="••••••••"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold text-sm text-on-surface-variant" htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">verified</span>
                    <input
                      className={`w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border ${confirmPassword && newPassword !== confirmPassword ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base text-on-surface`}
                      id="confirm-password"
                      placeholder="••••••••"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-error">Mật khẩu không khớp</p>
                  )}
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant flex items-center justify-end">
                <button
                  className="px-8 py-2.5 rounded-full font-semibold text-sm bg-primary text-on-primary shadow-md hover:bg-primary/90 transition-all active:scale-95 hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                  type="submit"
                  disabled={changingPassword}
                >
                  {changingPassword && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 py-3 px-6 rounded-lg shadow-xl transition-all duration-300 flex items-center gap-3 z-[60] ${showToast.type === 'success' ? 'bg-on-surface text-white' : 'bg-error text-white'}`}>
          <span className="material-symbols-outlined text-xl">
            {showToast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-semibold text-sm">{showToast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
