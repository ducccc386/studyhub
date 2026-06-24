import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface Transaction {
  id: number;
  transactionCode: string;
  amount: number;
  status: string;
  createdAt: string;
  className: string;
  parentName: string;
  classId: number;
}

const ParentTransactionHistory: React.FC = () => {
  const { userId: parentId } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!parentId) return;
    try {
      setLoading(true);
      const response = await apiFetch(`/payment/history/parent/${parentId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        setError('Không thể tải lịch sử giao dịch.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [parentId]);

  return (
    <div className="max-w-[1440px] mx-auto pb-20 animate-fade-in">
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-background mb-1">Lịch sử giao dịch</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Quản lý các giao dịch chuyển khoản thuê gia sư.</p>
      </div>

      {error && (
        <div className="mb-4 bg-error-container text-on-error-container p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col overflow-hidden animate-slide-up">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Danh sách giao dịch</h3>
          <button 
            onClick={fetchTransactions}
            className="flex items-center gap-1 text-primary font-label-md text-label-md hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Làm mới
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Mã GD</th>
                <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Lớp học</th>
                <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Số tiền</th>
                <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Thời gian</th>
                <th className="py-3 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                    <div className="w-8 h-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant font-body-md">
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 font-body-sm font-bold text-on-surface">{t.transactionCode || `#${t.id}`}</td>
                    <td className="py-4 px-6 font-body-sm text-on-surface font-medium">{t.className}</td>
                    <td className="py-4 px-6 font-body-sm text-primary font-bold">
                      {t.amount ? t.amount.toLocaleString('vi-VN') + ' đ' : '0 đ'}
                    </td>
                    <td className="py-4 px-6 font-body-sm text-on-surface-variant">
                      {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      {t.status === 'SUCCESS' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold flex items-center gap-1 inline-flex">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> THÀNH CÔNG
                        </span>
                      ) : t.status === 'PENDING' ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold inline-flex">
                          CHỜ THANH TOÁN
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold inline-flex">
                          {t.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentTransactionHistory;
