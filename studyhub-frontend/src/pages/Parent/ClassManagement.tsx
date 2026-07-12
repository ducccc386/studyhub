import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import toast from 'react-hot-toast';
import { toastConfirm } from '../../utils/toastConfirm';

interface ClassSessionDTO {
  id: number;
  postId: number;
  parentId: number;
  parentName: string;
  tutorProfileId: number;
  tutorName: string;
  tutorAvatar: string;
  className: string;
  subject: string;
  schedule: string;
  learningMode: string;
  address: string;
  status: string;
  pricePerSession: number;
  progress: number;
  createdAt: string;
  nextSessionDate: string;
}

type TabType = 'active' | 'completed' | 'cancelled';


const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  TRIAL:           { label: 'Chờ học thử',     color: 'text-amber-700',   bgColor: 'bg-amber-100 border-amber-200',   icon: 'hourglass_empty' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán',  color: 'text-orange-700',  bgColor: 'bg-orange-100 border-orange-200', icon: 'pending_actions' },
  CONFIRMED:       { label: 'Đang học',        color: 'text-green-700',   bgColor: 'bg-green-100 border-green-200',   icon: 'check_circle' },
  PENDING_FINAL_PAYMENT: { label: 'Chờ thanh toán nốt', color: 'text-teal-700', bgColor: 'bg-teal-100 border-teal-200', icon: 'payments' },
  PAID_IN_FULL:    { label: 'Đã đóng 100%',    color: 'text-cyan-700',    bgColor: 'bg-cyan-100 border-cyan-200',     icon: 'verified' },
  PENDING_SETTLEMENT: { label: 'Chờ quyết toán', color: 'text-indigo-700', bgColor: 'bg-indigo-100 border-indigo-200', icon: 'calculate' },
  COMPLETED:       { label: 'Hoàn thành',      color: 'text-blue-700',    bgColor: 'bg-blue-100 border-blue-200',     icon: 'task_alt' },
  CANCELLED:       { label: 'Đã hủy',          color: 'text-red-700',     bgColor: 'bg-red-100 border-red-200',       icon: 'cancel' },
  PENDING_CANCELLATION: { label: 'Chờ xử lý hủy',   color: 'text-red-700',     bgColor: 'bg-red-100 border-red-200',       icon: 'pending_actions' },
  DISBURSED:       { label: 'Đã giải ngân',    color: 'text-purple-700',  bgColor: 'bg-purple-100 border-purple-200', icon: 'payments' },
};

const ClassManagement: React.FC = () => {
  const { userId } = useAuth();
  const [sessions, setSessions] = useState<ClassSessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // QR Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'deposit' | 'final' | 'extra' | ''>('');

  const fetchSessions = () => {
    if (!userId) { setLoading(false); return; }
    apiFetch(`/class-sessions/parent/${userId}`)
      .then(res => res.json())
      .then(data => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  // Polling for payment status
  useEffect(() => {
    if (!showPaymentModal || !transactionCode || paymentStatus === 'SUCCESS') return;

    const interval = setInterval(() => {
      apiFetch(`/payment/status/${transactionCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'SUCCESS') {
            setPaymentStatus('SUCCESS');
            fetchSessions();
          }
        })
        .catch(err => console.error('Error polling status:', err));
    }, 3000);

    return () => clearInterval(interval);
  }, [showPaymentModal, transactionCode, paymentStatus, userId]);

  const handleTrialDecision = async (sessionId: number, isAccepted: boolean) => {
    setUpdatingId(sessionId);
    try {
      const res = await apiFetch(`/class-sessions/${sessionId}/trial-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAccepted }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      const updated: ClassSessionDTO = await res.json();
      setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
      toast.success(isAccepted ? 'Đã xác nhận học tiếp. Vui lòng thanh toán cọc!' : 'Đã hủy lớp học thử thành công.');
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePayment = async (sessionId: number, type: 'deposit' | 'final' | 'extra' | 'renew') => {
    setUpdatingId(sessionId);
    try {
      const url = type === 'renew' ? `/transactions/renew/${sessionId}` : `/transactions/${type}/${sessionId}`;
      const res = await apiFetch(url, {
        method: 'POST',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Tạo mã thanh toán thất bại');
      }
      const data = await res.json();
      setQrUrl(data.qrUrl);
      setTransactionCode(data.transactionCode);
      setPaymentAmount(data.amount || 0);
      setPaymentStatus('PENDING');
      setPaymentType(type === 'renew' ? 'deposit' : type);
      setShowPaymentModal(true);
      fetchSessions();
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const activeSessions    = sessions.filter(s => ['TRIAL', 'PENDING_PAYMENT', 'CONFIRMED', 'PENDING_FINAL_PAYMENT'].includes(s.status));
  const completedSessions = sessions.filter(s => ['PAID_IN_FULL', 'PENDING_SETTLEMENT', 'COMPLETED', 'DISBURSED'].includes(s.status));
  const cancelledSessions = sessions.filter(s => ['CANCELLED', 'PENDING_CANCELLATION'].includes(s.status));

  const displaySessions =
    activeTab === 'active'    ? activeSessions :
    activeTab === 'completed' ? completedSessions :
    cancelledSessions;

  const getConfig = (status: string) => STATUS_CONFIG[status] ?? { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100 border-gray-200', icon: 'help' };

  return (
    <div className="max-w-[1440px] mx-auto pb-20 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-bold text-3xl text-on-surface mb-2">Quản lý lớp học</h1>
          <p className="font-normal text-base text-on-surface-variant">
            Theo dõi trạng thái và tiến độ các lớp học của bạn.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest border border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">school</span>
          <h2 className="font-bold text-xl text-on-surface mb-2">Chưa có lớp học nào</h2>
          <p className="text-on-surface-variant mb-6">Hãy đăng bài tuyển gia sư để bắt đầu!</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{activeSessions.length}</p>
              <p className="text-sm text-amber-600 font-medium">Đang học</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{completedSessions.length}</p>
              <p className="text-sm text-blue-600 font-medium">Hoàn thành</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{cancelledSessions.length}</p>
              <p className="text-sm text-red-600 font-medium">Đã hủy</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 mb-6 w-fit">
            {([
              { key: 'active',    label: `Đang học (${activeSessions.length})` },
              { key: 'completed', label: `Hoàn thành (${completedSessions.length})` },
              { key: 'cancelled', label: `Đã hủy (${cancelledSessions.length})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Session Cards */}
          <div className="space-y-4">
            {displaySessions.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
                Không có lớp học nào trong mục này.
              </div>
            ) : displaySessions.map(session => {
              const cfg = getConfig(session.status);
              return (
                <div
                  key={session.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col md:flex-row gap-5 hover:shadow-md transition-all"
                >
                  {/* Tutor Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
                    {session.tutorAvatar ? (
                      <img src={session.tutorAvatar} alt={session.tutorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-primary">person</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`px-2 py-0.5 border rounded-full text-[11px] font-bold flex items-center gap-1 ${cfg.bgColor} ${cfg.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                      {session.learningMode && (
                        <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full">
                          {session.learningMode === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-on-surface mb-1 truncate">{session.className}</h3>
                    {session.subject && <p className="text-sm text-on-surface-variant mb-2">Môn: <span className="font-medium text-on-surface">{session.subject}</span></p>}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-on-surface-variant">
                        Gia sư: <span className="font-medium text-on-surface">{session.tutorName}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant mb-3">
                      {session.schedule && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {session.schedule}
                        </span>
                      )}
                      {session.pricePerSession && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">payments</span>
                          {session.pricePerSession.toLocaleString('vi-VN')}đ/buổi
                        </span>
                      )}
                      {session.address && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {session.address}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-on-surface-variant">Tiến độ</span>
                        <span className="text-primary font-bold">{session.progress ?? 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${session.progress ?? 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status-based info banners */}
                    {session.status === 'TRIAL' && (
                      <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        {session.progress === 0 
                          ? 'Giai đoạn học thử (0/2 buổi). Đang chờ gia sư lên lịch và dạy thử.' 
                          : `Đang học thử (${session.progress}/2 buổi). Sau khi hoàn tất 2 buổi học thử, vui lòng Xác nhận học tiếp hoặc Hủy lớp.`}
                      </div>
                    )}
                    {session.status === 'PENDING_PAYMENT' && (
                      <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        Đang chờ thanh toán để bắt đầu khóa học chính thức.
                      </div>
                    )}
                    {session.status === 'CONFIRMED' && (
                      <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Lớp học đang tiến hành. Liên hệ gia sư nếu cần thay đổi lịch.
                      </div>
                    )}
                    {session.status === 'PENDING_FINAL_PAYMENT' && (
                      <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        Gia sư đã xác nhận hoàn thành khóa học. Vui lòng thanh toán nốt 75% học phí.
                      </div>
                    )}
                    {(session.status === 'CANCELLED' || session.status === 'PENDING_CANCELLATION') && (session as any).cancelReason && (
                      <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                        <div>
                          <strong>Lý do hủy:</strong> {(session as any).cancelReason}
                          {session.status === 'PENDING_CANCELLATION' && (
                            <span className="block text-xs mt-1 italic">
                              Hệ thống đang xử lý hoàn trả tiền cọc cho bạn. Vui lòng đợi thông báo từ Admin.
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 justify-start md:items-end">
                    {session.status === 'PENDING_PAYMENT' ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-outline-variant/30 text-on-surface-variant border border-outline-variant/50 rounded-lg text-sm font-bold cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1 mb-2"
                        title="Vui lòng thanh toán cọc để vào không gian lớp"
                      >
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        Không gian Lớp học
                      </button>
                    ) : (
                      <Link
                        to={`/parent/classes/${session.id}/workspace`}
                        className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors whitespace-nowrap flex items-center justify-center gap-1 mb-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                        Không gian Lớp học
                      </Link>
                    )}

                    {session.status === 'TRIAL' && (
                      <>
                        <button
                          onClick={() => handleTrialDecision(session.id, true)}
                          disabled={updatingId === session.id}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          ✓ Xác nhận học tiếp
                        </button>
                        <button
                          onClick={() => toastConfirm('Bạn có chắc muốn hủy lớp học này?', () => handleTrialDecision(session.id, false))}
                          disabled={updatingId === session.id}
                          className="px-4 py-2 border border-error text-error rounded-lg text-sm font-semibold hover:bg-error/5 transition-colors disabled:opacity-60 whitespace-nowrap"
                        >
                          Hủy lớp
                        </button>
                      </>
                    )}
                    {session.status === 'PENDING_PAYMENT' && (
                      <button
                        onClick={() => handlePayment(session.id, 'deposit')}
                        disabled={updatingId === session.id}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-opacity whitespace-nowrap flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                        Thanh toán cọc (25%)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="text-xl font-bold text-on-surface">
                {paymentType === 'deposit' ? 'Thanh toán học phí' : (paymentType === 'final' ? 'Thanh toán nốt' : 'Thanh toán phát sinh')}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              {paymentStatus === 'SUCCESS' ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <h4 className="text-2xl font-black text-on-surface">Thanh toán thành công!</h4>
                  <p className="text-on-surface-variant">Lớp học đã được cập nhật trạng thái mới.</p>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow hover:bg-primary/90 w-full"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <>
                  {paymentType === 'deposit' && (
                    <div className="w-full bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 text-sm text-blue-800 flex items-start gap-3 text-left">
                      <span className="material-symbols-outlined mt-0.5">info</span>
                      <p>Hệ thống thu phí hoa hồng 25% học phí 1 tháng. 75% học phí còn lại phụ huynh và gia sư sẽ tự thanh toán trực tiếp sau khi hoàn thành khóa học.</p>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <p className="text-on-surface-variant text-sm mb-1">Mở App ngân hàng quét mã QR để thanh toán</p>
                    <p className="text-primary font-black text-2xl">{paymentAmount.toLocaleString('vi-VN')}đ</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-inner border border-outline-variant mb-6 relative">
                    <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center pointer-events-none rounded-2xl opacity-0 transition-opacity"></div>
                  </div>
                  
                  <div className="w-full bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-2 text-sm text-left mb-6">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Mã giao dịch:</span>
                      <span className="font-mono font-bold text-on-surface">{transactionCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Trạng thái:</span>
                      <span className="font-bold text-orange-600 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        Đang chờ thanh toán...
                      </span>
                    </div>
                  </div>

                  {/* Mock Payment Button for Testing */}
                  <button
                    onClick={async () => {
                      const res = await apiFetch(`/payment/mock-pay/${transactionCode}`, { method: 'POST' });
                      if (res.ok) toast.success("Đã mô phỏng thanh toán thành công!");
                    }}
                    className="text-xs text-primary underline opacity-60 hover:opacity-100 mt-2"
                  >
                    Mô phỏng chuyển khoản thành công (Test)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
