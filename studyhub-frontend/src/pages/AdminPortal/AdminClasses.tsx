import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/class-sessions/admin/all');
      if (res.ok) {
        setClasses(await res.json());
      } else {
        console.error('Không thể tải danh sách lớp học');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = classes.filter(c =>
    (c.className || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.tutorName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.parentName || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel = (s: string) => {
    if (s === 'TRIAL') return { text: 'Đang học thử', cls: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (s === 'CONFIRMED') return { text: 'Chính thức', cls: 'bg-green-100 text-green-800 border-green-200' };
    if (s === 'PENDING_PAYMENT') return { text: 'Chờ thanh toán', cls: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { text: s, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">school</span>
            Quản lý Lớp học
          </h1>
          <p className="text-sm text-on-surface-variant">Xem tất cả lớp học đang hoạt động, vào workspace để upload tài liệu, duyệt lộ trình.</p>
        </div>
        <button
          onClick={loadClasses}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:bg-primary/10 px-3 py-2 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span> Làm mới
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Tìm theo tên lớp, môn học, gia sư, phụ huynh..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary bg-surface"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang tải danh sách lớp học...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl block mb-3 text-outline-variant">school</span>
          {search ? 'Không tìm thấy lớp học phù hợp.' : 'Chưa có lớp học nào.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Lớp học</th>
                  <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Môn</th>
                  <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Gia sư</th>
                  <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Phụ huynh</th>
                  <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Trạng thái</th>
                  <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase text-xs tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((cls) => {
                  const st = statusLabel(cls.status);
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-800">{cls.className || `Lớp #${cls.id}`}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{cls.schedule || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                          {cls.subject || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">{cls.tutorName || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">{cls.parentName || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>
                          {st.text}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => navigate(`/admin/classes/${cls.id}/workspace`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          Vào Workspace
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Tổng: {filtered.length} lớp học
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClasses;
