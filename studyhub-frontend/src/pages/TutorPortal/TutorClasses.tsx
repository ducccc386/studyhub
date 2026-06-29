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
}

type TabType = 'active' | 'completed' | 'cancelled';


const STATUS_LABEL: Record<string, string> = {
  TRIAL:           'Chờ học thử',
  PENDING_PAYMENT: 'Chờ PH thanh toán',
  CONFIRMED:       'Đang dạy',
  PENDING_FINAL_PAYMENT: 'Chờ thanh toán nốt',
  PAID_IN_FULL:    'Đã đóng 100%',
  PENDING_SETTLEMENT: 'Chờ quyết toán',
  COMPLETED:       'Hoàn thành',
  CANCELLED:       'Đã hủy',
  DISBURSED:       'Đã giải ngân',
};

const STATUS_STYLE: Record<string, string> = {
  TRIAL:           'bg-amber-100 text-amber-700',
  PENDING_PAYMENT: 'bg-orange-100 text-orange-700',
  CONFIRMED:       'bg-primary-container text-on-primary-container',
  PENDING_FINAL_PAYMENT: 'bg-teal-100 text-teal-700',
  PAID_IN_FULL:    'bg-cyan-100 text-cyan-700',
  PENDING_SETTLEMENT: 'bg-indigo-100 text-indigo-700',
  COMPLETED:       'bg-surface-container-highest text-on-surface',
  CANCELLED:       'bg-error-container text-error',
  DISBURSED:       'bg-purple-100 text-purple-700',
};

const TutorClasses: React.FC = () => {
  const { tutorId } = useAuth();
  const [classes, setClasses] = useState<ClassSessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [search, setSearch] = useState('');
  
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [classToCancel, setClassToCancel] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [classToUpdatePrice, setClassToUpdatePrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');

  useEffect(() => {
    if (!tutorId) { setLoading(false); return; }
    apiFetch(`/class-sessions/tutor/${tutorId}`)
      .then(res => res.json())
      .then(data => {
        setClasses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [tutorId]);

  const updateStatus = async (sessionId: number, newStatus: string) => {
    try {
      const res = await apiFetch(`/class-sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      const updated: ClassSessionDTO = await res.json();
      setClasses(prev => prev.map(s => s.id === sessionId ? updated : s));
      toast.success('Báo cáo hoàn thành thành công. Chờ phụ huynh thanh toán nốt 75%.');
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  const handleCancelClass = async () => {
    if (!classToCancel || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy lớp');
      return;
    }
    try {
      const res = await apiFetch(`/class-sessions/${classToCancel}/tutor-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason, tutorProfileId: tutorId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Hủy lớp thất bại');
      }
      const updated: ClassSessionDTO = await res.json();
      setClasses(prev => prev.map(s => s.id === classToCancel ? updated : s));
      toast.success('Hủy lớp thành công');
      setCancelModalVisible(false);
      setClassToCancel(null);
      setCancelReason('');
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  const handleUpdatePrice = async () => {
    if (!classToUpdatePrice || !newPrice.trim()) {
      toast.error('Vui lòng nhập giá mới');
      return;
    }
    const priceNum = Number(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Giá mới phải lớn hơn 0');
      return;
    }

    try {
      const res = await apiFetch(`/class-sessions/${classToUpdatePrice}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerSession: priceNum }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Cập nhật thất bại');
      }
      const updated: ClassSessionDTO = await res.json();
      setClasses(prev => prev.map(s => s.id === classToUpdatePrice ? updated : s));
      toast.success('Cập nhật học phí thành công!');
      setPriceModalVisible(false);
      setClassToUpdatePrice(null);
      setNewPrice('');
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  const activeClasses    = classes.filter(c => ['TRIAL', 'PENDING_PAYMENT', 'CONFIRMED', 'PENDING_FINAL_PAYMENT', 'PAID_IN_FULL', 'PENDING_SETTLEMENT'].includes(c.status));
  const completedClasses = classes.filter(c => ['COMPLETED', 'DISBURSED'].includes(c.status));
  const cancelledClasses = classes.filter(c => c.status === 'CANCELLED');

  const displayClasses = (
    activeTab === 'active'    ? activeClasses :
    activeTab === 'completed' ? completedClasses :
    cancelledClasses
  ).filter(c =>
    !search || c.className.toLowerCase().includes(search.toLowerCase()) ||
    (c.parentName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-bold text-3xl text-on-surface">Quản lý lớp học</h2>
          <p className="text-on-surface-variant mt-1">Quản lý tiến độ và lịch trình các lớp bạn đang phụ trách.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm w-full md:w-[250px]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{activeClasses.length}</p>
              <p className="text-sm text-amber-600 font-medium">Đang dạy</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{completedClasses.length}</p>
              <p className="text-sm text-blue-600 font-medium">Hoàn thành</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{cancelledClasses.length}</p>
              <p className="text-sm text-red-600 font-medium">Đã hủy</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-outline-variant mb-6">
            {([
              { key: 'active',    label: `Đang dạy (${activeClasses.length})` },
              { key: 'completed', label: `Đã hoàn thành (${completedClasses.length})` },
              { key: 'cancelled', label: `Đã hủy (${cancelledClasses.length})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayClasses.length === 0 ? (
              <div className="col-span-full text-center py-10 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant">
                {classes.length === 0 ? 'Bạn chưa có lớp học nào.' : 'Không có lớp học nào trong mục này.'}
              </div>
            ) : displayClasses.map((cls, idx) => (
              <div
                key={cls.id}
                className={`border border-outline-variant rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-surface-container-lowest flex flex-col group relative overflow-hidden animate-slide-up opacity-0 stagger-${(idx % 6) + 1}`}
              >
                {/* Mode badge */}
                <div className={`absolute top-0 right-0 ${
                  cls.learningMode === 'ONLINE'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-tertiary-container text-on-tertiary-container'
                } text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider`}>
                  {cls.learningMode === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4 pr-20">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {cls.subject && (
                        <span className="inline-block px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded text-[10px] font-bold uppercase tracking-wider">
                          {cls.subject}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 ${STATUS_STYLE[cls.status] ?? 'bg-surface-container text-on-surface'} text-[10px] font-bold rounded uppercase`}>
                        {STATUS_LABEL[cls.status] ?? cls.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-on-surface line-clamp-1">{cls.className}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span>Phụ huynh: <span className="font-medium text-on-surface">{cls.parentName || '—'}</span></span>
                  </div>
                  {cls.schedule && (
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>{cls.schedule}</span>
                    </div>
                  )}
                  {cls.pricePerSession && (
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      <span>{cls.pricePerSession.toLocaleString('vi-VN')}đ/buổi</span>
                    </div>
                  )}
                  {cls.address && (
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span className="truncate">{cls.address}</span>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-on-surface-variant font-medium">Tiến độ</span>
                    <span className="text-primary font-bold">{cls.progress ?? 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${cls.progress ?? 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-outline-variant flex gap-3">
                  <Link 
                    to={`/tutor/classes/${cls.id}/workspace`}
                    className={`flex-1 text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    cls.status === 'CONFIRMED'
                      ? 'bg-primary text-on-primary hover:bg-primary/90'
                      : 'border border-primary text-primary hover:bg-primary/10'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">play_lesson</span>
                    Vào không gian lớp
                  </Link>
                  
                  {cls.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => {
                        toastConfirm('Xác nhận đã dạy xong khóa học này để phụ huynh thanh toán nốt?', () => updateStatus(cls.id, 'PENDING_FINAL_PAYMENT'));
                      }}
                      className="flex-1 text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all active:scale-[0.98]">
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                      Báo cáo xong
                    </button>
                  )}

                  <div className="relative group/menu">
                    <button className="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 flex flex-col p-2">
                      <button className="text-left px-4 py-2 hover:bg-surface-container rounded-lg text-sm flex items-center gap-2 text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                        Xin đổi lịch
                      </button>
                      {(cls.status === 'TRIAL' || cls.status === 'PENDING_PAYMENT' || cls.status === 'CONFIRMED') && (
                        <button 
                          onClick={() => {
                            setClassToCancel(cls.id);
                            setCancelModalVisible(true);
                          }}
                          className="text-left px-4 py-2 hover:bg-error-container hover:text-error rounded-lg text-sm flex items-center gap-2 text-error transition-colors mt-1">
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                          Báo hủy lớp
                        </button>
                      )}
                      {(cls.status === 'TRIAL' || cls.status === 'PENDING_PAYMENT') && (
                        <button 
                          onClick={() => {
                            setClassToUpdatePrice(cls.id);
                            setNewPrice(cls.pricePerSession?.toString() || '');
                            setPriceModalVisible(true);
                          }}
                          className="text-left px-4 py-2 hover:bg-primary-container hover:text-primary rounded-lg text-sm flex items-center gap-2 text-primary transition-colors mt-1">
                          <span className="material-symbols-outlined text-[18px]">edit_square</span>
                          Đổi học phí
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cancel Class Modal */}
      {cancelModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl animate-slide-up">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Hủy nhận lớp</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Bạn có chắc chắn muốn hủy nhận lớp này? Việc tự ý hủy lớp có thể ảnh hưởng đến điểm uy tín của bạn. Vui lòng nhập lý do bên dưới.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">Lý do hủy lớp <span className="text-error">*</span></label>
                <textarea 
                  rows={3} 
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-error bg-surface text-on-surface" 
                  placeholder="Ví dụ: Bận lịch đột xuất, vấn đề sức khỏe..." 
                  value={cancelReason} 
                  onChange={e => setCancelReason(e.target.value)}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setCancelModalVisible(false);
                    setClassToCancel(null);
                    setCancelReason('');
                  }} 
                  className="flex-1 py-3 border border-outline text-on-surface rounded-xl hover:bg-surface-variant font-label-md transition-colors"
                >
                  Đóng
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelClass}
                  className="flex-1 py-3 bg-error text-on-error rounded-xl hover:bg-error/90 font-label-md transition-colors"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {priceModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl animate-slide-up">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Điều chỉnh học phí</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Bạn chỉ có thể đổi giá trước khi phụ huynh thanh toán cọc. 
              Mã thanh toán của phụ huynh sẽ tự động được cập nhật theo giá mới này.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">Học phí 1 buổi (VNĐ) <span className="text-error">*</span></label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface text-on-surface" 
                  placeholder="Ví dụ: 150000" 
                  value={newPrice} 
                  onChange={e => setNewPrice(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setPriceModalVisible(false);
                    setClassToUpdatePrice(null);
                    setNewPrice('');
                  }} 
                  className="flex-1 py-3 border border-outline text-on-surface rounded-xl hover:bg-surface-variant font-label-md transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  onClick={handleUpdatePrice}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl hover:bg-primary/90 font-label-md transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorClasses;
