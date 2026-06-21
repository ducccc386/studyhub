import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import TutorProfileModal from '../../components/Shared/TutorProfileModal';

interface ApplicantDTO {
  id: number;
  jobPostingId: number;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  tutorTitle: string;
  tutorRating: number;
  tutorReviews: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
}

interface JobPostingDTO {
  id: number;
  parentId: number;
  parentName: string;
  title: string;
  subject: string;
  classLevel: string;
  description: string;
  postedAt: string;
  status: string; // PENDING_APPROVAL, RECRUITING, CLOSED
  location: string;
  detailedAddress: string;
  schedule: string;
  pricePerSession: number;
  learningMode: string;
  requirement: string;
  applicantsCount: number;
  applicants: ApplicantDTO[];
}


const PostManagement: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteTutorId = searchParams.get('inviteTutor');
  const inviteTutorName = searchParams.get('tutorName');

  const [activeTab, setActiveTab] = useState<'posts' | 'bookings'>('posts');
  const [posts, setPosts] = useState<JobPostingDTO[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [inviteBanner, setInviteBanner] = useState<string | null>(inviteTutorId);
  const [sendingInvite, setSendingInvite] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      apiFetch(`/posts/parent/${userId}`).then(res => res.json()),
      apiFetch(`/bookings/parent/${userId}`).then(res => res.json())
    ])
      .then(([postsData, bookingsData]) => {
        setPosts(Array.isArray(postsData) ? postsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  const handleAcceptApplicant = async (applicantId: number) => {
    // Tạm thời bỏ window.confirm vì có thể trình duyệt của user đang block dialog
    setAccepting(applicantId);
    try {
      const res = await apiFetch(`/class-sessions/accept-applicant/${applicantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || 'Có lỗi xảy ra');
      }
      
      alert('Đã chấp nhận gia sư! Lớp học đã được tạo.');
      navigate('/parent/classes');
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
      setAccepting(null);
    }
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        className="material-symbols-outlined text-[16px]"
        style={{ fontVariationSettings: star <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0", color: '#f59e0b' }}
      >
        star
      </span>
    ));
  };

  const handleInviteTutorToPost = async (postId: number) => {
    if (!inviteBanner) return;
    if (!window.confirm('Gửi lời mời đến gia sư này cho bài đăng đã chọn?')) return;
    setSendingInvite(postId);
    try {
      const res = await apiFetch(`/bookings`, {
        method: 'POST',
        body: JSON.stringify({ tutorId: parseInt(inviteBanner!), jobPostingId: postId, parentId: userId })
      });
      if (res.ok) {
        alert('Đã gửi lời mời thành công! Gia sư sẽ nhận được thông báo.');
        setInviteBanner(null);
        navigate('/parent/posts');
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể gửi lời mời'));
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setSendingInvite(null);
    }
  };

  const totalPosts = posts.length;
  const activePosts = posts.filter(p => p.status === 'RECRUITING').length;
  const pendingApprovalPosts = posts.filter(p => p.status === 'PENDING_APPROVAL').length;
  const newApplicantsCount = posts.reduce((sum, p) => sum + (p.applicantsCount || 0), 0);

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-20">
      {/* Invite Banner */}
      {inviteBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined text-blue-600 text-[24px]">person_add</span>
          <div className="flex-1">
            <p className="font-semibold text-blue-800 text-sm">
              Bạn đang muốn mời gia sư <span className="text-primary">{inviteTutorName ? decodeURIComponent(inviteTutorName) : `#${inviteBanner}`}</span>
            </p>
            <p className="text-blue-600 text-xs mt-0.5">Chọn bài đăng bên dưới để gửi lời mời đến gia sư này.</p>
          </div>
          <button onClick={() => setInviteBanner(null)} className="text-blue-400 hover:text-blue-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}


      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="font-bold text-3xl text-on-surface">Quản lý bài đăng & Ứng viên</h1>
          <p className="font-normal text-base text-on-surface-variant mt-2">Theo dõi bài đăng và chọn gia sư phù hợp nhất ngay tại đây.</p>
        </div>
        <Link to="/parent/posts/create" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo bài đăng mới
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up stagger-1">
        <div className="glass p-6 rounded-2xl border border-white/20 flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">list_alt</span>
          </div>
          <div>
            <p className="font-medium text-xs text-on-surface-variant uppercase">Tổng bài đăng</p>
            <p className="font-bold text-2xl text-on-surface">{totalPosts}</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/20 flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="font-medium text-xs text-on-surface-variant uppercase">Đang tuyển</p>
            <p className="font-bold text-2xl text-on-surface">{activePosts}</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/20 flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined">hourglass_empty</span>
          </div>
          <div>
            <p className="font-medium text-xs text-on-surface-variant uppercase">Chờ duyệt</p>
            <p className="font-bold text-2xl text-on-surface">{pendingApprovalPosts}</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/20 flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center text-on-tertiary-container">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="font-medium text-xs text-on-surface-variant uppercase">Tổng ứng viên</p>
            <p className="font-bold text-2xl text-on-surface">{newApplicantsCount}</p>
          </div>
        </div>
      </div>

      {/* List of Postings */}
      <div className="flex flex-col gap-8 animate-slide-up stagger-2">
        <div className="flex gap-4 border-b border-outline-variant mb-6">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`pb-3 font-semibold transition-colors relative ${activeTab === 'posts' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Bài đăng của tôi
          {activeTab === 'posts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 font-semibold transition-colors relative ${activeTab === 'bookings' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          Lời mời đã gửi
          {activeTab === 'bookings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'bookings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {bookings.length === 0 ? (
            <div className="col-span-full py-20 text-center text-on-surface-variant bg-surface rounded-2xl border border-outline-variant">
              Bạn chưa gửi lời mời dạy nào.
            </div>
          ) : (
            bookings.map(booking => (
              <div key={booking.id} className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <img src={booking.tutorAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.tutorName || 'User')}&background=random`} alt="Tutor" className="w-12 h-12 rounded-full object-cover border border-outline-variant" />
                  <div>
                    <h3 className="font-bold text-on-surface cursor-pointer hover:text-primary" onClick={() => setSelectedTutorId(booking.tutorId)}>{booking.tutorName}</h3>
                    <p className="text-xs text-on-surface-variant">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="ml-auto">
                    {booking.status === 'PENDING' ? (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Chờ phản hồi</span>
                    ) : booking.status === 'ACCEPTED' ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Đã đồng ý</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Đã từ chối</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1 text-sm text-on-surface">
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-on-surface-variant">Môn học:</span>
                    <span className="font-semibold">{booking.subject}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-on-surface-variant">Lịch học:</span>
                    <span>{booking.schedule}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-on-surface-variant">Học phí:</span>
                    <span className="font-semibold text-primary">{booking.pricePerSession.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-on-surface-variant">Hình thức:</span>
                    <span>{booking.learningMode === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : posts.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-outline-variant">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">article</span>
            <p className="text-on-surface-variant">Bạn chưa tạo bài đăng nào.</p>
          </div>
        ) : (
          posts.map((post) => {
            const isClosed = post.status === 'CLOSED';
            const pendingApplicants = post.applicants?.filter(a => a.status === 'PENDING') || [];
            const acceptedApplicant = post.applicants?.find(a => a.status === 'ACCEPTED');

            return (
              <div key={post.id} className={`glass rounded-2xl border ${isClosed ? 'border-outline-variant/40 bg-surface/40' : 'border-outline-variant'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                
                {/* Header Bài đăng */}
                <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row justify-between gap-4 bg-surface-container-lowest/50">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary-container text-on-primary-container font-semibold text-xs rounded-full">
                        {post.subject} ({post.classLevel})
                      </span>
                      {post.status === 'CLOSED' ? (
                        <span className="px-3 py-1 bg-surface-container-highest text-on-surface font-semibold text-xs rounded-full">Đã đóng</span>
                      ) : post.status === 'PENDING_APPROVAL' ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 font-semibold text-xs rounded-full">Chờ admin duyệt</span>
                      ) : (
                        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-semibold text-xs rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Đang tuyển gia sư
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-on-surface mb-2">{post.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">payments</span> {post.pricePerSession?.toLocaleString('vi-VN')}đ/buổi</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{post.learningMode === 'ONLINE' ? 'laptop_mac' : 'location_on'}</span> {post.learningMode === 'ONLINE' ? 'Online' : 'Offline'}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {post.schedule}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> Đăng ngày: {new Date(post.postedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <div className="text-center bg-surface px-4 py-2 rounded-xl border border-outline-variant">
                      <p className="text-xs text-on-surface-variant mb-1 font-medium">Số người ứng tuyển</p>
                      <p className="text-2xl font-bold text-primary">{post.applicantsCount || 0}</p>
                    </div>
                    {inviteBanner && post.status === 'RECRUITING' && (
                      <button
                        onClick={() => handleInviteTutorToPost(typeof post.id === 'string' ? parseInt(post.id) : post.id)}
                        disabled={sendingInvite === (typeof post.id === 'string' ? parseInt(post.id) : post.id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow"
                      >
                        {sendingInvite === (typeof post.id === 'string' ? parseInt(post.id) : post.id) ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">send</span>
                        )}
                        Mời vào bài này
                      </button>
                    )}
                  </div>
                </div>


                {/* Danh sách Ứng viên */}
                <div className="p-6 bg-surface-container-lowest">
                  <h4 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">group</span> 
                    Danh sách ứng viên ({post.applicants?.length || 0})
                  </h4>

                  {post.applicants?.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant bg-surface rounded-xl border border-dashed border-outline-variant">
                      {post.status === 'RECRUITING' 
                        ? 'Chưa có gia sư nào nộp đơn. Đừng lo, bài đăng của bạn vẫn đang được gợi ý tới các gia sư.'
                        : 'Bài đăng này không có ứng viên.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {/* Ưu tiên hiện người được chấp nhận lên đầu */}
                      {acceptedApplicant && (
                        <div className="border border-green-300 bg-green-50/50 rounded-2xl p-5 flex flex-col md:flex-row gap-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                            ĐÃ CHỌN LÀM GIA SƯ
                          </div>
                          <img src={acceptedApplicant.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(acceptedApplicant.tutorName || 'User')}&background=random`} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-bold text-lg text-on-surface mb-1">{acceptedApplicant.tutorName}</h5>
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(acceptedApplicant.tutorRating || 5)}
                              <span className="text-sm text-on-surface-variant ml-1">{acceptedApplicant.tutorRating ? acceptedApplicant.tutorRating.toFixed(1) : '5.0'}</span>
                            </div>
                            <p className="text-sm text-on-surface-variant font-medium mb-2"><span className="material-symbols-outlined text-[16px] align-middle">school</span> {acceptedApplicant.tutorTitle}</p>
                            <div className="bg-white p-3 rounded-lg text-sm text-on-surface-variant italic border border-green-100 shadow-sm relative">
                                <span className="material-symbols-outlined text-green-200 absolute -top-2 -left-2 text-2xl rotate-180 bg-white rounded-full">format_quote</span>
                                {acceptedApplicant.message}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Các ứng viên đang chờ duyệt (PENDING) */}
                      {pendingApplicants.map(app => (
                        <div key={app.id} className="border border-outline-variant bg-surface rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                          <div className="flex gap-4">
                            <img src={app.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.tutorName || 'User')}&background=random`} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-surface-container-high shadow-sm shrink-0" />
                            <div className="flex-1">
                              <h5 className="font-bold text-lg text-on-surface">{app.tutorName}</h5>
                              <div className="flex items-center gap-1 mb-1">
                                {renderStars(app.tutorRating || 5)}
                                <span className="text-sm text-on-surface-variant ml-1">{app.tutorRating ? app.tutorRating.toFixed(1) : 'Chưa có'}</span>
                              </div>
                              <p className="text-sm text-on-surface-variant font-medium"><span className="material-symbols-outlined text-[14px] align-middle">school</span> {app.tutorTitle}</p>
                            </div>
                          </div>
                          
                          {app.message && (
                            <div className="bg-surface-container-lowest p-3 rounded-lg text-sm text-on-surface-variant italic border border-outline-variant/50 relative mt-2">
                              <span className="material-symbols-outlined text-outline-variant/30 absolute -top-2 -left-2 text-2xl rotate-180 bg-surface-container-lowest rounded-full">format_quote</span>
                              {app.message}
                            </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-outline-variant flex justify-end gap-3 relative z-10">
                            <button
                              type="button"
                              onClick={() => setSelectedTutorId(app.tutorId)}
                              className="px-4 py-2 rounded-xl text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                // Bỏ window.confirm
                                try {
                                  const res = await apiFetch(`/class-sessions/reject-applicant/${app.id}`, { method: 'POST' });
                                  if (!res.ok) throw new Error();
                                  setPosts(prev => prev.map(p => {
                                    if (p.id !== post.id) return p;
                                    return { ...p, applicants: p.applicants.filter(a => a.id !== app.id) };
                                  }));
                                } catch { alert('Lỗi khi từ chối'); }
                              }}
                              disabled={accepting !== null}
                              className="px-6 py-2 bg-surface border border-outline-variant text-on-surface-variant rounded-xl text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                              Từ chối
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcceptApplicant(app.id)}
                              disabled={accepting !== null}
                              className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                              {accepting === app.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                  Duyệt chọn gia sư
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Ứng viên bị từ chối */}
                      {post.applicants?.filter(a => a.status === 'REJECTED').map(app => (
                        <div key={app.id} className="border border-outline-variant/30 bg-surface/50 rounded-2xl p-5 flex flex-row gap-4 opacity-60">
                          <img src={app.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.tutorName || 'User')}&background=random`} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-outline-variant shrink-0" />
                          <div>
                            <h5 className="font-semibold text-on-surface">{app.tutorName}</h5>
                            <p className="text-xs text-on-surface-variant">Đã từ chối</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedTutorId && (
        <TutorProfileModal 
          tutorId={selectedTutorId} 
          onClose={() => setSelectedTutorId(null)} 
        />
      )}
    </div>
  );
};

export default PostManagement;
