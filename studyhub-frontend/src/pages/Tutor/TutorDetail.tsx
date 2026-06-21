import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';


interface TutorProfile {
  id: number;
  fullName: string;
  avatarUrl: string;
  major: string;
  universityName: string;
  introduction: string;
  price: number;
  averageRating: number;
  totalReviews: number;
  experienceYears: number;
  ekycStatus: string;
  subjects: Array<{ id: number; name: string }>;
  teachingMethod: string;
  birthDate: string;
  address: string;
  phoneNumber: string;
  degreeImageUrl: string;
  certificates: string[];
}

interface Review {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const TutorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, isLoggedIn } = useAuth();

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tutorRes, reviewsRes] = await Promise.all([
          apiFetch(`/tutors/${id}`),
          apiFetch(`/reviews/tutor/${id}`)
        ]);
        if (!tutorRes.ok) throw new Error('Không tìm thấy gia sư');
        const tutorData = await tutorRes.json();
        setTutor(tutorData);
        if (reviewsRes.ok) {
          const reviewData = await reviewsRes.json();
          setReviews(Array.isArray(reviewData) ? reviewData : []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const renderStars = (rating: number, size = '18px') => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className="material-symbols-outlined"
          style={{
            fontSize: size,
            fontVariationSettings: star <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0",
            color: '#f59e0b'
          }}
        >star</span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="material-symbols-outlined text-6xl text-error">person_off</span>
        <p className="text-error font-medium text-lg">{error || 'Không tìm thấy gia sư'}</p>
        <button onClick={() => navigate('/tutors')} className="px-6 py-2 bg-primary text-white rounded-xl font-semibold">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const experienceLabel = () => {
    if (!tutor.experienceYears) return 'Chưa có thông tin';
    if (tutor.experienceYears === 0) return 'Dưới 1 năm';
    if (tutor.experienceYears <= 3) return '1 - 3 năm';
    return 'Trên 3 năm';
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-[72px]">
        {/* Hero Section */}
        <section className="bg-surface-container-lowest w-full pt-12 pb-16 border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt={tutor.fullName}
                  src={tutor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.fullName)}&background=003d9b&color=fff&size=256`}
                />
                {tutor.ekycStatus === 'SUCCESS' && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    eKYC
                  </div>
                )}
              </div>
              <div className="flex-grow space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">{tutor.fullName}</h1>
                  {tutor.averageRating > 0 && (
                    <div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1", color: '#f59e0b' }}>star</span>
                      <span className="font-label-md text-label-md">{tutor.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-on-surface-variant">({tutor.totalReviews} đánh giá)</span>
                    </div>
                  )}
                </div>
                <p className="text-primary font-headline-sm text-headline-sm">
                  {tutor.major ? `${tutor.major}` : ''}{tutor.universityName ? ` — ${tutor.universityName}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects?.map(sub => (
                    <span key={sub.id} className="px-4 py-1.5 bg-secondary-container/20 text-on-secondary-container rounded-full font-label-md text-label-md">
                      {sub.name}
                    </span>
                  ))}
                </div>
                {tutor.introduction && (
                  <p className="text-on-surface-variant max-w-3xl font-body-lg text-body-lg">
                    {tutor.introduction}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[18px] text-primary">work</span>
                    Kinh nghiệm: <span className="font-semibold text-on-surface">{experienceLabel()}</span>
                  </div>
                  {tutor.teachingMethod && tutor.teachingMethod !== 'ALL' && (
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
                      Hình thức: <span className="font-semibold text-on-surface">
                        {tutor.teachingMethod === 'ONLINE' ? 'Online' : tutor.teachingMethod === 'OFFLINE' ? 'Offline' : 'Online & Offline'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-grow space-y-12">

            {/* Education */}
            {(tutor.universityName || tutor.degreeImageUrl) && (
              <section>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">school</span>
                  Học vấn &amp; Bằng cấp
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutor.universityName && (
                    <button 
                      onClick={() => {
                        if (!tutor.degreeImageUrl) return;
                        if (!isLoggedIn) {
                          alert('Vui lòng đăng nhập để xem chi tiết bằng cấp của gia sư.');
                          navigate('/login');
                          return;
                        }
                        setSelectedImage(tutor.degreeImageUrl);
                      }}
                      className={`bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex gap-4 text-left w-full ${tutor.degreeImageUrl ? 'hover:shadow-md transition-shadow cursor-pointer' : 'cursor-default'}`}>
                      <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-on-primary-fixed-variant">history_edu</span>
                      </div>
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface">{tutor.major || 'Sinh viên đại học'}</h3>
                        <p className="text-body-sm text-on-surface-variant">{tutor.universityName}</p>
                        {tutor.degreeImageUrl && <p className="text-body-sm text-primary hover:underline mt-1">Xem bằng cấp / thẻ sinh viên</p>}
                      </div>
                    </button>
                  )}
                  {tutor.certificates?.map((cert, i) => (
                    <button key={i} onClick={() => {
                        if (!isLoggedIn) {
                          alert('Vui lòng đăng nhập để xem chi tiết chứng chỉ của gia sư.');
                          navigate('/login');
                          return;
                        }
                        setSelectedImage(cert);
                      }}
                      className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex gap-4 hover:shadow-md transition-shadow text-left w-full">
                      <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-on-primary-fixed-variant">verified</span>
                      </div>
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface">Chứng chỉ #{i + 1}</h3>
                        <p className="text-body-sm text-primary hover:underline">Xem chứng chỉ</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">reviews</span>
                  Đánh giá từ học viên
                </h2>
                {reviews.length > 0 && (
                  <span className="font-label-md text-label-md text-primary">{reviews.length} đánh giá</span>
                )}
              </div>
              {reviews.length === 0 ? (
                <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3 text-outline-variant">rate_review</span>
                  <p>Chưa có đánh giá nào cho gia sư này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map(review => (
                    <div key={review.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary text-sm">
                            {review.reviewerName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-label-md text-label-md text-on-surface">{review.reviewerName || 'Phụ huynh'}</h4>
                            <p className="text-label-sm text-on-surface-variant text-xs">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                            </p>
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      {review.comment && <p className="text-on-surface-variant text-sm leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sticky CTA */}
          <aside className="w-full lg:w-[360px] flex-shrink-0">
            <div className="sticky top-[104px] bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm space-y-6">
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md mb-1">Học phí</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-headline-md font-headline-md text-primary">
                    {tutor.price ? `${tutor.price.toLocaleString('vi-VN')}đ/ca` : 'Thỏa thuận'}
                  </span>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-outline-variant">
                {tutor.ekycStatus === 'SUCCESS' && (
                  <div className="flex items-center gap-3 text-green-700 text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                    Đã xác thực eKYC
                  </div>
                )}
                {tutor.teachingMethod && (
                  <div className="flex items-center gap-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                    {tutor.teachingMethod === 'ONLINE' ? 'Dạy online (Google Meet / Zoom)' :
                      tutor.teachingMethod === 'OFFLINE' ? 'Dạy offline tại nhà' : 'Online & Offline'}
                  </div>
                )}
                <div className="flex items-center gap-3 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-[20px]">work</span>
                  Kinh nghiệm: {experienceLabel()}
                </div>
              </div>

              {isLoggedIn && role === 'parent' ? (
                <>
                  <button
                    onClick={() => navigate(`/parent/posts?inviteTutor=${tutor.id}&tutorName=${encodeURIComponent(tutor.fullName || '')}`)}

                    className="w-full bg-primary text-white py-4 rounded-lg font-headline-sm text-headline-sm hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">person_add</span> Mời dạy
                  </button>
                  <button
                    onClick={() => navigate('/parent/messages')}
                    className="w-full border border-primary text-primary py-4 rounded-lg font-headline-sm text-headline-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">chat</span> Nhắn tin
                  </button>
                </>
              ) : !isLoggedIn ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary text-white py-4 rounded-lg font-headline-sm text-headline-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">login</span> Đăng nhập để mời dạy
                </button>
              ) : null}

              <p className="text-center text-label-sm font-label-sm text-on-surface-variant px-4">
                Tư vấn miễn phí lộ trình học tập và chọn lớp phù hợp.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Image Viewer Popup */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2" onClick={() => setSelectedImage(null)}>
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
          <img src={selectedImage} alt="Phóng to" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default TutorDetail;
