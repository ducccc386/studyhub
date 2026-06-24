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
  cvUrl?: string;
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
  interface SelectedFile {
    url: string;
    title: string;
    type: 'image' | 'pdf';
  }
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

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
            {(tutor.universityName || tutor.degreeImageUrl || tutor.cvUrl) && (
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
                        setSelectedFile({ url: tutor.degreeImageUrl, title: 'Bằng cấp / Thẻ sinh viên minh chứng', type: 'image' });
                      }}
                      className={`group bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex items-center justify-between gap-4 text-left w-full transition-all duration-300 ${tutor.degreeImageUrl ? 'hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 cursor-pointer' : 'cursor-default'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <span className="material-symbols-outlined text-on-primary-fixed-variant">history_edu</span>
                        </div>
                        <div>
                          <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{tutor.major || 'Sinh viên đại học'}</h3>
                          <p className="text-body-sm text-on-surface-variant mb-1">{tutor.universityName}</p>
                          {tutor.degreeImageUrl && (
                            <p className="text-label-sm font-label-sm text-primary flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              Xem minh chứng <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </p>
                          )}
                        </div>
                      </div>
                      {tutor.degreeImageUrl && (
                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
                        </div>
                      )}
                    </button>
                  )}
                  {tutor.certificates?.map((cert, i) => (
                    <button key={i} onClick={() => {
                        if (!isLoggedIn) {
                          alert('Vui lòng đăng nhập để xem chi tiết chứng chỉ của gia sư.');
                          navigate('/login');
                          return;
                        }
                        setSelectedFile({ url: cert, title: `Chứng chỉ #${i + 1}`, type: 'image' });
                      }}
                      className="group bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 text-left w-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <span className="material-symbols-outlined text-on-primary-fixed-variant">verified</span>
                        </div>
                        <div>
                          <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Chứng chỉ #{i + 1}</h3>
                          <p className="text-label-sm font-label-sm text-primary mt-1 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            Xem chứng chỉ <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
                      </div>
                    </button>
                  ))}
                  {tutor.cvUrl && (
                    <button onClick={() => {
                        if (!isLoggedIn) {
                          alert('Vui lòng đăng nhập để xem CV của gia sư.');
                          navigate('/login');
                          return;
                        }
                        const isPdf = tutor.cvUrl?.includes('application/pdf') || tutor.cvUrl?.toLowerCase().endsWith('.pdf');
                        setSelectedFile({ url: tutor.cvUrl as string, title: 'CV / Sơ yếu lý lịch', type: isPdf ? 'pdf' : 'image' });
                      }}
                      className="group bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-tertiary/30 text-left w-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <span className="material-symbols-outlined text-on-tertiary-fixed-variant">description</span>
                        </div>
                        <div>
                          <h3 className="font-label-md text-label-md text-on-surface group-hover:text-tertiary transition-colors">CV / Sơ yếu lý lịch</h3>
                          <p className="text-label-sm font-label-sm text-tertiary mt-1 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            Xem tài liệu <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-tertiary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-tertiary text-[20px]">visibility</span>
                      </div>
                    </button>
                  )}
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

      {/* File Viewer Popup */}
      {selectedFile && (
        <FileViewerPopup file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  );
};

const FileViewerPopup: React.FC<{ file: { url: string, title: string, type: 'image' | 'pdf' }, onClose: () => void }> = ({ file, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      {/* Contextual Header */}
      <div className="absolute top-0 left-0 w-full p-4 md:px-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-50" onClick={e => e.stopPropagation()}>
        <div className="text-white font-headline-sm text-headline-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container text-3xl">{file.type === 'pdf' ? 'picture_as_pdf' : 'image'}</span>
          {file.title}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <a href={file.url} download="document" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg flex items-center gap-2 transition-all font-label-md">
            <span className="material-symbols-outlined text-[20px]">download</span> <span className="hidden md:inline">Tải xuống</span>
          </a>
          <button className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all hover:scale-110" onClick={onClose}>
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
      </div>

      {file.type === 'pdf' ? (
        <div className="w-full max-w-5xl h-[85vh] mt-12 bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
           <iframe src={file.url} className="w-full flex-1" title="PDF Viewer" />
        </div>
      ) : (
        <div 
          className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" 
          onClick={e => e.stopPropagation()}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Zoom & Pan Toolbar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 z-50 border border-white/10">
             <button onClick={handleZoomOut} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"><span className="material-symbols-outlined">zoom_out</span></button>
             <span className="text-white font-label-md w-14 text-center">{Math.round(scale * 100)}%</span>
             <button onClick={handleZoomIn} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"><span className="material-symbols-outlined">zoom_in</span></button>
             <div className="w-px h-6 bg-white/20 mx-2"></div>
             <button onClick={handleReset} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors" title="Khôi phục gốc"><span className="material-symbols-outlined">restart_alt</span></button>
          </div>

          {/* Image Container with Spinner */}
          <div className="relative flex items-center justify-center w-full h-full" onMouseDown={onMouseDown} onDoubleClick={handleDoubleClick}>
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              src={file.url} 
              alt={file.title}
              onLoad={() => setIsLoaded(true)}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                opacity: isLoaded ? 1 : 0
              }}
              draggable={false}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10 relative z-10" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDetail;
