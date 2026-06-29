import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

interface ClassSession {
  id: number;
  className: string;
  tutorName: string;
  price: number;
  status: string;
}

interface Transaction {
  id: number;
  transactionCode: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  className: string;
  parentName: string;
  tutorName?: string;
  classId: number;
}

const AdminPayouts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [payouts, setPayouts] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCompletedClasses = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/admin/payment/completed-classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      } else {
        setError('Không thể tải danh sách lớp.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/payment/admin/history');
      if (response.ok) {
        const data = await response.json();
        const history = (Array.isArray(data) ? data : [])
            .filter((t: any) => t.type === 'PAYOUT')
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPayouts(history);
      } else {
        setError('Không thể tải lịch sử giải ngân.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchCompletedClasses();
    } else {
      fetchPayoutHistory();
    }
  }, [activeTab]);

  const handleDisburse = async (classId: number) => {
    if (!window.confirm(`Xác nhận đã chuyển lương cho gia sư của lớp #${classId}?`)) return;

    try {
      setProcessingId(classId);
      setError(null);
      setSuccessMsg(null);

      const response = await apiFetch(`/admin/payment/disburse/${classId}`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccessMsg(`Giải ngân thành công cho Lớp #${classId}`);
        setClasses(prev => prev.filter(c => c.id !== classId));
      } else {
        const data = await response.json();
        setError(data.error || 'Có lỗi xảy ra khi giải ngân.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-20 animate-fade-in">
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-background mb-1">Quản lý Giải ngân</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Thanh toán lương cho gia sư và xem lịch sử giải ngân.</p>
      </div>

      {error && (
        <div className="mb-4 bg-error-container text-on-error-container p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 bg-primary-container text-on-primary-container p-4 rounded-lg text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {successMsg}
        </div>
      )}

      <div className="flex space-x-1 border-b border-outline-variant mb-6">
        <button
          onClick={() => { setActiveTab('pending'); setError(null); setSuccessMsg(null); }}
          className={`px-6 py-3 font-label-lg text-label-lg transition-colors border-b-2 relative top-[1px] ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Chờ giải ngân
        </button>
        <button
          onClick={() => { setActiveTab('history'); setError(null); setSuccessMsg(null); }}
          className={`px-6 py-3 font-label-lg text-label-lg transition-colors border-b-2 relative top-[1px] ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Lịch sử đã giải ngân
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            {activeTab === 'pending' ? 'Danh sách lớp chờ giải ngân' : 'Lịch sử giải ngân'}
          </h3>
          <button 
            onClick={activeTab === 'pending' ? fetchCompletedClasses : fetchPayoutHistory}
            className="flex items-center gap-1 text-primary font-label-md text-label-md hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Làm mới
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'pending' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ID</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tên lớp</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Gia sư</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Số tiền</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      <div className="w-8 h-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant font-body-md">
                      Không có lớp học nào đang chờ giải ngân.
                    </td>
                  </tr>
                ) : (
                  classes.map(c => (
                    <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 font-body-sm font-bold text-on-surface">#{c.id}</td>
                      <td className="py-4 px-6 font-body-sm text-on-surface font-medium">{c.className}</td>
                      <td className="py-4 px-6 font-body-sm text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline text-[18px]">person</span>
                          {c.tutorName}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-body-sm text-primary font-bold">
                        {c.price ? c.price.toLocaleString('vi-VN') + ' đ' : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDisburse(c.id)}
                          disabled={processingId === c.id}
                          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-on-primary rounded-lg font-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {processingId === c.id ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px] mr-1">payments</span>
                          )}
                          Giải ngân
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Mã GD</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Gia sư nhận</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Lớp học</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Số tiền</th>
                  <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      <div className="w-8 h-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant font-body-md">
                      Chưa có lịch sử giải ngân nào.
                    </td>
                  </tr>
                ) : (
                  payouts.map(t => (
                    <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 font-body-sm font-bold text-on-surface">{t.transactionCode || `#${t.id}`}</td>
                      <td className="py-4 px-6 font-body-sm text-on-surface font-medium">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline text-[18px]">person</span>
                          {t.tutorName || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-body-sm text-on-surface-variant">{t.className || `Lớp #${t.classId}`}</td>
                      <td className="py-4 px-6 font-body-sm text-secondary font-bold">
                        -{t.amount ? t.amount.toLocaleString('vi-VN') + ' đ' : '0 đ'}
                      </td>
                      <td className="py-4 px-6 font-body-sm text-on-surface-variant">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayouts;
