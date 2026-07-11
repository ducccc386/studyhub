import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ekyc' | 'accounts'>('accounts');
  
  // --- REAL DATA FOR EKYC TAB ---
  const [pendingTutors, setPendingTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  // --- REAL DATA FOR ACCOUNTS TAB ---
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const fetchPendingEkyc = async () => {
    try {
      const response = await apiFetch('/admin/ekyc/pending');
      const data = await response.json();
      setPendingTutors(Array.isArray(data) ? data : []);
      setSelectedTutor((current: any) => {
        if (!current) return data.length > 0 ? data[0] : null;
        const stillExists = data.some((t: any) => t.id === current.id);
        if (!stillExists) return data.length > 0 ? data[0] : null;
        return current;
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu eKYC:', error);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await apiFetch('/admin/users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ekyc') {
      fetchPendingEkyc();
    } else if (activeTab === 'accounts') {
      fetchUsers();
    }
  }, [activeTab]);

  const filteredUsers = users.filter(u =>
    !userSearch ||
    (u.fullName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleApprove = async (id: number) => {
    try {
      await apiFetch(`/admin/ekyc/${id}/approve`, { method: 'PUT' });
      alert('Đã duyệt hồ sơ thành công!');
      fetchPendingEkyc();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiFetch(`/admin/ekyc/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason: 'Hình ảnh CCCD mờ, không rõ nét' })
      });
      alert('Đã từ chối hồ sơ!');
      fetchPendingEkyc();
    } catch (error) {
      console.error('Lỗi khi từ chối eKYC:', error);
    }
  };

  const handleReEvaluateAI = async (id: number) => {
    try {
      const response = await apiFetch(`/admin/ekyc/${id}/re-evaluate`, { method: 'PUT' });
      const data = await response.json();
      if (response.ok) {
        alert(`Quét AI thành công! Độ khớp: ${data.similarityScore}%`);
        fetchPendingEkyc();
        if (selectedTutor?.id === id) {
          setSelectedTutor({ ...selectedTutor, similarityScore: data.similarityScore });
        }
      } else {
        alert(`Lỗi AI: ${data.error}`);
      }
    } catch (error) {
      console.error('Lỗi khi quét AI:', error);
      alert('Có lỗi xảy ra khi kết nối với AI Face Matching.');
    }
  };

  const handleToggleLock = async (userId: number, currentStatus: string) => {
    const action = currentStatus === 'ACTIVE' ? 'lock' : 'unlock';
    if (!window.confirm(`Bạn có chắc muốn ${action === 'lock' ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;
    try {
      await apiFetch(`/admin/users/${userId}/${action}`, { method: 'PUT' });
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleCleanAndRandomize = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA vĩnh viễn toàn bộ tài khoản bị khóa và ngẫu nhiên hóa ngày tham gia của các tài khoản khác?')) return;
    try {
      const response = await apiFetch('/admin/users/clean-and-randomize', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        alert(`Đã dọn dẹp ${data.deletedCount} tài khoản bị khóa thành công!`);
        fetchUsers();
      } else {
        alert(`Lỗi: ${data.error || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi kết nối máy chủ');
    }
  };

  const formatDateCSV = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch { return ''; }
  };

  const escapeCSV = (val: any) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const exportUsersCSV = () => {
    const headers = ['ID', 'Họ tên', 'Email', 'Vai trò', 'Số điện thoại', 'Địa chỉ', 'Ngày tham gia', 'Trạng thái'];
    const rows = users.map((u: any) => [
      u.id,
      escapeCSV(u.fullName || ''),
      escapeCSV(u.email || ''),
      escapeCSV(u.role === 'ADMIN' ? 'Quản trị' : u.role === 'TUTOR' ? 'Gia sư' : 'Phụ huynh'),
      escapeCSV(u.phoneNumber || ''),
      escapeCSV(u.address || ''),
      escapeCSV(formatDateCSV(u.createdAt)),
      escapeCSV(u.status === 'ACTIVE' || !u.status ? 'Hoạt động' : 'Đã khóa'),
    ]);
    const csvContent = [
      headers.map(h => escapeCSV(h)).join(','),
      ...rows.map((r: any[]) => r.join(','))
    ].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh-sach-nguoi-dung-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-20 animate-fade-in">
      {/* Page Header & Tabs */}
      <div className="mb-8 animate-slide-up">
        <h2 className="font-headline-lg text-headline-lg md:text-headline-xl md:font-headline-xl text-on-surface mb-6 font-bold text-[#0f172a]">
          Quản lý Người dùng &amp; eKYC
        </h2>
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('ekyc')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'ekyc' ? 'text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Duyệt hồ sơ Gia sư
            {activeTab === 'ekyc' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'accounts' ? 'text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Quản lý Tài khoản
            {activeTab === 'accounts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
          </button>
        </div>
      </div>

      {/* TAB: QUẢN LÝ TÀI KHOẢN */}
      {activeTab === 'accounts' && (
        <div className="animate-slide-up stagger-1 space-y-6">
          {/* Search + Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Làm mới
            </button>
            <button
              onClick={handleCleanAndRandomize}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              title="Xóa toàn bộ tài khoản bị khóa vĩnh viễn và ngẫu nhiên hóa ngày tham gia"
            >
              <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
              Dọn dẹp &amp; Ngẫu nhiên ngày
            </button>
            <button
              onClick={exportUsersCSV}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              title="Xuất danh sách người dùng ra CSV để import Google Sheets"
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              Xuất Google Sheets (.csv)
            </button>

            {/* Summary badges */}
            <div className="ml-auto flex gap-2">
              <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                Tổng: {filteredUsers.length} người dùng
              </span>
              <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                Gia sư: {filteredUsers.filter((u: any) => u.role === 'TUTOR').length}
              </span>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                Phụ huynh: {filteredUsers.filter((u: any) => u.role === 'PARENT').length}
              </span>
            </div>
          </div>

          <div className="bg-white p-0 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {usersLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <span className="material-symbols-outlined text-5xl block mb-3 text-slate-300">group</span>
                <p>{userSearch ? 'Không tìm thấy người dùng phù hợp.' : 'Chưa có dữ liệu người dùng.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Người dùng</th>
                      <th className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò</th>
                      <th className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</th>
                      <th className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Địa chỉ</th>
                      <th className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày tham gia</th>
                      <th className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                      <th className="py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Avatar + Name + Email */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.email || 'U')}&background=random`}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                            />
                            <div>
                              <p className="font-semibold text-sm text-slate-800">{user.fullName || '—'}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'TUTOR' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.role === 'ADMIN' ? 'Quản trị' : user.role === 'TUTOR' ? 'Gia sư' : 'Phụ huynh'}
                          </span>
                        </td>
                        {/* Phone */}
                        <td className="py-3.5 px-5 text-sm text-slate-600">
                          {user.phoneNumber ? (
                            <a href={`tel:${user.phoneNumber}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[13px] text-slate-400">call</span>
                              {user.phoneNumber}
                            </a>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Chưa cập nhật</span>
                          )}
                        </td>
                        {/* Address */}
                        <td className="py-3.5 px-5 text-sm text-slate-500 max-w-[180px]">
                          {user.address ? (
                            <span className="line-clamp-2 text-slate-600" title={user.address}>{user.address}</span>
                          ) : (
                            <span className="text-slate-300 italic text-xs">Chưa cập nhật</span>
                          )}
                        </td>
                        {/* Join date */}
                        <td className="py-3.5 px-5 text-sm text-slate-500">
                          {user.createdAt ? (
                            <div>
                              <p className="font-medium text-slate-700">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                              <p className="text-xs text-slate-400">{new Date(user.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          ) : '—'}
                        </td>
                        {/* Status */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' || !user.status ? 'bg-green-500' : 'bg-red-400'}`}></span>
                            <span className={`text-xs font-bold ${
                              user.status === 'ACTIVE' || !user.status ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {user.status === 'ACTIVE' || !user.status ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleToggleLock(user.id, user.status || 'ACTIVE')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                user.status === 'LOCKED' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                              }`}
                            >
                              {user.status === 'LOCKED' ? 'Mở khóa' : 'Khóa TK'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


      {/* =========================================================================
                                 TAB: DUYỆT EKYC
      ========================================================================= */}
      {activeTab === 'ekyc' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-slide-up stagger-1">
          {/* Left Column: Verification Queue */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col h-[800px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0">
                <h3 className="font-bold text-lg text-[#0f172a]">Hàng chờ duyệt</h3>
                <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">{pendingTutors.length} Chờ</span>
              </div>
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {pendingTutors.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">Không có hồ sơ nào đang chờ duyệt.</div>
                ) : (
                  pendingTutors.map((tutor) => (
                    <div 
                      key={tutor.id} 
                      onClick={() => setSelectedTutor(tutor)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedTutor?.id === tutor.id ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <img src={tutor.avatarUrl || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className={`font-bold text-sm ${selectedTutor?.id === tutor.id ? 'text-primary' : 'text-[#0f172a]'}`}>{tutor.fullName}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{tutor.user?.email}</p>
                          </div>
                        </div>
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Chờ duyệt</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed View */}
          <div className="xl:col-span-8">
            {selectedTutor ? (
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden h-[800px] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                {/* Profile Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-5 items-center">
                    <img src={selectedTutor.avatarUrl || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-white shadow-sm object-cover" />
                    <div>
                      <h2 className="font-bold text-xl text-[#0f172a] mb-1">{selectedTutor.fullName}</h2>
                      <p className="text-sm font-medium text-slate-500 mb-2.5">{selectedTutor.user?.email}</p>
                      <div className="flex gap-2">
                        {selectedTutor.subjects?.map((sub: any) => (
                           <span key={sub.id} className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-bold">{sub.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleReject(selectedTutor.id)}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors shadow-sm"
                    >
                      Từ chối
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedTutor.id)}
                      className="flex-1 md:flex-none px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 active:scale-95"
                    >
                      Duyệt hồ sơ
                    </button>
                  </div>
                </div>
                
                {/* Documents Canvas */}
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-amber-600">badge</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Xác minh danh tính</p>
                        <p className="text-sm font-bold text-amber-600 mt-0.5">Cần xem xét</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-amber-600">school</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Bằng cấp</p>
                        <p className="text-sm font-bold text-amber-600 mt-0.5">Cần xem xét</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">id_card</span> Giấy tờ tuỳ thân
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="aspect-[1.6/1] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden group">
                          {selectedTutor.idCardFrontUrl ? (
                            <img src={selectedTutor.idCardFrontUrl} alt="CCCD" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400">
                              <span className="material-symbols-outlined text-4xl mb-2">image</span>
                              <span className="text-xs font-medium">Chưa cung cấp</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Loại giấy tờ</p>
                            <p className="text-sm font-semibold text-[#0f172a]">Căn cước công dân</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Tên trên giấy tờ (AI Trích xuất)</p>
                            <p className="text-sm font-semibold text-[#0f172a]">{selectedTutor.fullName}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Ngày sinh</p>
                            <p className="text-sm font-semibold text-[#0f172a]">{selectedTutor.birthDate || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Số điện thoại</p>
                            <p className="text-sm font-semibold text-[#0f172a]">{selectedTutor.phoneNumber || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Địa chỉ</p>
                            <p className="text-sm font-semibold text-[#0f172a]">{selectedTutor.address || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Độ khớp khuôn mặt (AI Matching)</p>
                              <button 
                                onClick={() => handleReEvaluateAI(selectedTutor.id)}
                                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80"
                              >
                                <span className="material-symbols-outlined text-[14px]">psychology</span>
                                Quét lại
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${selectedTutor.similarityScore > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                  style={{ width: `${selectedTutor.similarityScore || 0}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-bold ${selectedTutor.similarityScore > 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {selectedTutor.similarityScore || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">school</span> Bằng cấp / Chứng chỉ
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="aspect-[1.6/1] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden group">
                          {selectedTutor.degreeImageUrl ? (
                            <img src={selectedTutor.degreeImageUrl} alt="Bằng cấp" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400">
                              <span className="material-symbols-outlined text-4xl mb-2">image</span>
                              <span className="text-xs font-medium">Chưa cung cấp</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Trường Đại học/Cao đẳng</p>
                            <p className="text-sm font-semibold text-[#0f172a]">{selectedTutor.universityName || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Chuyên ngành</p>
                            <p className="text-sm font-semibold text-[#0f172a]">{selectedTutor.major || "Chưa cập nhật"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Kinh nghiệm</p>
                            <p className="text-sm font-semibold text-[#0f172a]">{selectedTutor.experienceYears !== undefined ? `${selectedTutor.experienceYears} năm` : "Chưa cập nhật"}</p>
                          </div>

                        </div>
                      </div>
                      
                      {selectedTutor.certificates && selectedTutor.certificates.length > 0 && (
                        <div className="mt-8">
                          <h4 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">workspace_premium</span> Các chứng chỉ khác
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedTutor.certificates.map((cert: string, index: number) => (
                              <div key={index} className="aspect-[1.4/1] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                <img src={cert} alt={`Chứng chỉ ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl h-[800px] flex items-center justify-center text-slate-400 flex-col shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">badge</span>
                <p>Chọn một hồ sơ bên trái để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
