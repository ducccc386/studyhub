import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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


const TutorBookings: React.FC = () => {
  const { tutorId } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<DirectBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // tutorId here is profile.id
    if (!tutorId) return;

    apiFetch(`/bookings/tutor/${tutorId}`)
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [tutorId]);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    if (!window.confirm(`Bạn có chắc muốn ${action === 'accept' ? 'chấp nhận' : 'từ chối'} lời mời này?`)) return;

    try {
      const response = await apiFetch(`/bookings/${id}/${action}`, { method: 'PUT' });
      if (!response.ok) throw new Error('Có lỗi xảy ra');
      alert(`Đã ${action === 'accept' ? 'chấp nhận' : 'từ chối'} thành công!`);
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' } : b));

      if (action === 'accept') {
         // Chuyển hướng đến màn hình lớp học
         navigate('/tutor/classes');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-20">
      <div className="animate-slide-up">
        <h1 className="font-bold text-3xl text-on-surface mb-2">Lời mời dạy trực tiếp</h1>
        <p className="font-normal text-base text-on-surface-variant">Phụ huynh gửi lời mời dạy trực tiếp đến bạn sẽ xuất hiện tại đây.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : bookings.length === 0 ? (
          <div className="col-span-full py-20 text-center text-on-surface-variant bg-surface rounded-2xl border border-outline-variant">
            Bạn chưa nhận được lời mời nào.
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <img src={booking.parentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.parentName || 'User')}&background=random`} alt="Parent" className="w-12 h-12 rounded-full object-cover border border-outline-variant" />
                <div>
                  <h3 className="font-bold text-on-surface">{booking.parentName}</h3>
                  <p className="text-xs text-on-surface-variant">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="ml-auto">
                  {booking.status === 'PENDING' ? (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Chờ duyệt</span>
                  ) : booking.status === 'ACCEPTED' ? (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Đã nhận</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Đã từ chối</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1 text-sm text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                  <span className="font-semibold">{booking.subject || 'Chưa xác định'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                  <span>{booking.schedule || 'TBD (Thỏa thuận)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                  <span className="font-semibold text-primary">{(booking.pricePerSession || 0).toLocaleString('vi-VN')}đ / buổi</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">{booking.learningMode === 'ONLINE' ? 'laptop_mac' : 'location_on'}</span>
                  <div>
                    <span className="block">{booking.learningMode === 'ONLINE' ? 'Học trực tuyến' : 'Học trực tiếp'}</span>
                    {booking.address && <span className="block text-xs text-on-surface-variant mt-0.5">{booking.address}</span>}
                  </div>
                </div>
                {booking.parentMessage && (
                  <div className="mt-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 text-xs text-on-surface-variant italic relative">
                    <span className="material-symbols-outlined text-[14px] absolute top-3 left-3 text-outline">format_quote</span>
                    <span className="pl-6 block">{booking.parentMessage}</span>
                  </div>
                )}
              </div>

              {booking.status === 'PENDING' && (
                <div className="flex gap-3 mt-auto pt-4 border-t border-outline-variant">
                  <button onClick={() => handleAction(booking.id, 'reject')} className="flex-1 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm">Từ chối</button>
                  <button onClick={() => handleAction(booking.id, 'accept')} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm shadow-md">Nhận lớp</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorBookings;
