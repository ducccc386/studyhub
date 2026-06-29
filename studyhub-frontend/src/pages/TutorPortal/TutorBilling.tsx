import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

interface InvoiceDTO {
  id: number | string;
  month: string;
  totalSessions: number;
  totalRevenue: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  className: string;
  qrCodeUrl?: string;
}


const TutorBilling: React.FC = () => {
  const { tutorId } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    if (!tutorId) { setLoading(false); return; }
    apiFetch(`/billing/tutor/${tutorId}`)
      .then(res => res.json())
      .then(data => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        // API chưa có → hiển thị thông báo trống
        setInvoices([]);
        setLoading(false);
      });
  }, [tutorId]);

  const pendingInvoices = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE');
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const totalDebt = pendingInvoices.reduce((sum, i) => sum + i.platformFeeAmount, 0);
  const displayInvoices = activeTab === 'pending' ? pendingInvoices : paidInvoices;

  return (
    <div className="max-w-[1440px] mx-auto space-y-gutter pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-slide-up">
        <div>
          <h2 className="font-bold text-3xl text-on-surface">Công nợ &amp; Thanh toán</h2>
          <p className="text-on-surface-variant mt-1">Quản lý hóa đơn phí nền tảng (25%) hàng tháng.</p>
        </div>
        {totalDebt > 0 && (
          <div className="glass bg-primary-container text-on-primary-container px-4 py-3 rounded-xl flex items-center gap-4 shadow-sm border border-primary/20 hover:-translate-y-1 transition-transform">
            <div>
              <p className="text-xs opacity-80">Tổng nợ cần thanh toán</p>
              <p className="text-2xl font-bold">{totalDebt.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
        )}
      </div>

      {/* Warning Alert */}
      <div className="glass bg-orange-50/80 border border-orange-200 text-orange-800 p-4 rounded-2xl flex items-start gap-3 mb-6 animate-slide-up stagger-1">
        <span className="material-symbols-outlined text-orange-500 shrink-0">warning</span>
        <div>
          <h4 className="font-bold text-sm mb-1">Lưu ý thanh toán phí</h4>
          <p className="text-sm">Theo chính sách của StudyHub, phí hoa hồng nền tảng (25%) sẽ được tính dựa trên số ca thực dạy đã check-in. Vui lòng thanh toán trước ngày mùng 5 hàng tháng để tránh bị khóa tài khoản.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-outline-variant mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Chưa thanh toán ({pendingInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Lịch sử thanh toán ({paidInvoices.length})
        </button>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayInvoices.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-outline-variant">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">receipt_long</span>
          <p className="text-on-surface-variant">
            {activeTab === 'pending' ? 'Không có hóa đơn nào cần thanh toán.' : 'Chưa có lịch sử thanh toán.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up stagger-2">
          {displayInvoices.map((invoice) => (
            <div key={invoice.id} className="glass border border-white/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full mb-3 inline-block border border-outline-variant">
                        Hóa đơn: {invoice.id}
                      </span>
                      <h3 className="font-bold text-xl text-on-surface">{invoice.month}</h3>
                    </div>
                    {invoice.status === 'PENDING' ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold">CHƯA THANH TOÁN</span>
                    ) : invoice.status === 'OVERDUE' ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">QUÁ HẠN</span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> ĐÃ THANH TOÁN
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant">
                      <p className="text-xs text-on-surface-variant mb-1">Lớp giảng dạy</p>
                      <p className="text-sm font-semibold text-on-surface">{invoice.className}</p>
                    </div>
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant">
                      <p className="text-xs text-on-surface-variant mb-1">Số ca đã dạy</p>
                      <p className="text-sm font-semibold text-on-surface">{invoice.totalSessions} ca</p>
                    </div>
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant">
                      <p className="text-xs text-on-surface-variant mb-1">Tổng học phí nhận</p>
                      <p className="text-sm font-bold text-green-600">{invoice.totalRevenue.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <p className="text-xs text-on-surface-variant mb-1">Phí phải nộp ({invoice.platformFeePercent}%)</p>
                      <p className="text-sm font-bold text-primary">{invoice.platformFeeAmount.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                    <span>Hạn chót thanh toán: <span className="font-bold text-error">{new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</span></span>
                  </div>
                </div>

                {invoice.status === 'PENDING' && invoice.qrCodeUrl && (
                  <div className="w-full lg:w-[300px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/20 bg-surface-container/30 p-6 flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-on-surface mb-4 text-center">Quét mã VietQR để thanh toán</p>
                    <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-sm mb-4 border border-outline-variant flex items-center justify-center hover:scale-105 transition-transform duration-300">
                      <img src={invoice.qrCodeUrl} alt="VietQR" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button className="w-full py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">upload</span> Xác nhận đã CK
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorBilling;
