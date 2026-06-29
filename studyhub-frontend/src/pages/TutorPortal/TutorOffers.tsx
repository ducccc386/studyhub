import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

interface DirectBookingDTO {
  id: number;
  parentId: number;
  parentName: string;
  parentAvatarUrl: string;
  tutorId: number;
  subject: string;
  schedule: string;
  learningMode: string;
  address: string;
  pricePerSession: number;
  parentMessage: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}


const TutorOffers: React.FC = () => {
  const { tutorId } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<DirectBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = () => {
    if (!tutorId) { setLoading(false); return; }
    apiFetch(`/bookings/tutor/${tutorId}`)
      .then(res => res.json())
      .then(data => {
        setOffers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchOffers(); }, [tutorId]);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    if (!window.confirm(`Bạn có chắc muốn ${action === 'accept' ? 'chấp nhận' : 'từ chối'} lời mời này?`)) return;
    try {
      const response = await apiFetch(`/bookings/${id}/${action}`, { method: 'PUT' });
      if (!response.ok) throw new Error('Có lỗi xảy ra');
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' } : o));
      if (action === 'accept') {
        alert('Đã chấp nhận lời mời dạy! Bạn có thể xem trong Quản lý lớp.');
        navigate('/tutor/classes');
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  const pendingOffers = offers.filter(o => o.status === 'PENDING');

  return (
    <div className="max-w-[1440px] mx-auto space-y-gutter pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-bold text-3xl text-on-surface">Lời mời nhận lớp</h2>
          <p className="text-on-surface-variant mt-1">Quản lý các yêu cầu mời dạy trực tiếp từ Phụ huynh.</p>
        </div>
        {pendingOffers.length > 0 && (
          <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            {pendingOffers.length} lời mời chờ phản hồi
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-outline-variant mb-6">
        <button className="pb-2 border-b-2 border-primary text-primary font-semibold text-sm">
          Tất cả ({offers.length})
        </button>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">mail_outline</span>
          <h2 className="font-bold text-xl text-on-surface mb-2">Bạn chưa có lời mời nào</h2>
          <p className="text-on-surface-variant text-sm">Phụ huynh có thể gửi lời mời dạy trực tiếp đến bạn từ trang hồ sơ gia sư.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer, idx) => (
            <div key={offer.id} className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up opacity-0 stagger-${(idx % 6) + 1}`}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Parent Info & Message */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={offer.parentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.parentName)}&background=random`}
                        alt="Phụ huynh"
                        className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                      />
                      <div>
                        <h4 className="font-bold text-on-surface">{offer.parentName || 'Phụ huynh'}</h4>
                        <p className="text-xs text-on-surface-variant">Gửi {new Date(offer.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    {offer.status === 'PENDING' ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Chờ phản hồi</span>
                    ) : offer.status === 'ACCEPTED' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Đã chấp nhận</span>
                    ) : (
                      <span className="px-3 py-1 bg-surface-container-high text-on-surface text-xs font-bold rounded-full">Đã từ chối</span>
                    )}
                  </div>

                  {offer.parentMessage && (
                    <div className="bg-surface-container rounded-lg p-4 relative">
                      <span className="material-symbols-outlined text-outline-variant absolute top-4 left-4">format_quote</span>
                      <p className="text-sm text-on-surface-variant pl-10 italic">"{offer.parentMessage}"</p>
                    </div>
                  )}
                </div>

                {/* Class Details & Actions */}
                <div className="w-full md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-outline-variant pt-4 md:pt-0 md:pl-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-on-surface text-lg mb-3">{offer.subject || 'Chưa xác định môn học'}</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span>{offer.schedule || 'TBD (Thỏa thuận)'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                        <span className="font-bold text-primary">{offer.pricePerSession?.toLocaleString('vi-VN')}đ/ca</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span>{offer.learningMode === 'ONLINE' ? 'Online' : 'Offline'} {offer.address ? `- ${offer.address}` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {offer.status === 'PENDING' && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleAction(offer.id, 'reject')}
                        className="flex-1 py-2.5 border border-error text-error font-semibold text-sm rounded-lg hover:bg-error-container hover:text-on-error-container transition-all active:scale-[0.98]"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleAction(offer.id, 'accept')}
                        className="flex-1 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm"
                      >
                        Chấp nhận
                      </button>
                    </div>
                  )}
                  {offer.status === 'ACCEPTED' && (
                    <button
                      onClick={() => navigate('/tutor/messages')}
                      className="w-full py-2.5 border border-primary text-primary font-semibold text-sm rounded-lg hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span> Nhắn tin
                    </button>
                  )}
                  {offer.status === 'REJECTED' && (
                    <div className="w-full py-2.5 text-center font-semibold text-sm text-on-surface-variant bg-surface-container-low rounded-lg">
                      Đã từ chối
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorOffers;
