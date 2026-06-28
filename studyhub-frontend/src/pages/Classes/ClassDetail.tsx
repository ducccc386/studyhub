import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClassDto } from '../../types/class';
import TutorProfileModal from '../../components/Shared/TutorProfileModal';

const CLASS_LEVELS = [
  { group: 'Tiểu học', options: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'] },
  { group: 'Trung học cơ sở', options: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'] },
  { group: 'Trung học phổ thông', options: ['Lớp 10', 'Lớp 11', 'Lớp 12'] },
];

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, role, userId } = useAuth();
  const [currentClass, setCurrentClass] = useState<ClassDto | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('autoOpenRegister') === 'true' && isLoggedIn && role === 'parent') {
      setIsModalOpen(true);
      // Xóa query param để tránh reload trang lại tự động mở tiếp
      navigate(`/classes/${id}`, { replace: true });
    }
  }, [location.search, isLoggedIn, role, navigate, id]);
  const [registerForm, setRegisterForm] = useState({
    studentName: '',
    studentGrade: '',
    studentLevel: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<{ studentName?: string; studentGrade?: string }>({});

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Không tìm thấy thông tin phụ huynh. Vui lòng đăng nhập lại.');
      return;
    }

    const errors: { studentName?: string; studentGrade?: string } = {};
    if (!registerForm.studentName.trim()) {
      errors.studentName = 'Vui lòng nhập họ tên học sinh';
    }
    if (!registerForm.studentGrade.trim()) {
      errors.studentGrade = 'Vui lòng chọn lớp học';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/enrollments?parentId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: id,
          ...registerForm
        })
      });
      
      if (response.ok) {
        alert('Đăng ký lớp học thành công! Yêu cầu của bạn đang chờ Gia sư duyệt.');
        setIsModalOpen(false);
        navigate('/parent/classes');
      } else {
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi kết nối máy chủ.');
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/courses/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setCurrentClass(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!currentClass) {
    return <div className="min-h-screen flex items-center justify-center">Không tìm thấy lớp học.</div>;
  }

  return (
    <div className="bg-background text-on-surface">
      <main className="pt-[104px] pb-20 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-on-surface-variant font-label-sm text-label-sm">
          <Link className="hover:text-primary" to="/classes">Lớp học</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="hover:text-primary cursor-pointer">{currentClass.subject || 'Toán học'}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-bold">{currentClass.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Section Card */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-[320px] w-full bg-slate-100 flex items-center justify-center">
                {currentClass.image ? (
                  <img className="w-full h-full object-cover" src={currentClass.image} alt={currentClass.title} />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-slate-300">school</span>
                )}
              </div>
              <div className="p-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">{currentClass.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <img alt={currentClass.tutorName} className="w-6 h-6 rounded-full object-cover" src={currentClass.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentClass.tutorName || 'T')}&background=003d9b&color=fff`} />
                    <span className="font-label-md text-label-md font-bold text-on-surface">{currentClass.tutorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-md text-label-md">{currentClass.rating} ({currentClass.reviewCount || currentClass.totalReviews || 0} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                    <span className="font-label-md text-label-md">{currentClass.currentStudents || 15}/{currentClass.maxStudents || 20} Học viên</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Description & Requirements */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-6">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Mô tả lớp học</h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {currentClass.description}
                </p>
              </div>
              <hr className="border-outline-variant" />
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Yêu cầu khóa học</h2>
                <ul className="space-y-3">
                  {(currentClass.requirements || []).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Tutor Profile */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <img alt={currentClass.tutorName} className="w-32 h-32 rounded-full border-4 border-surface-container-high object-cover" src={currentClass.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentClass.tutorName || 'T')}&background=003d9b&color=fff&size=256`} />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">{currentClass.tutorName}</h3>
                      <p className="text-primary font-label-md text-label-md uppercase tracking-wider">{currentClass.tutorDesc}</p>
                    </div>
                    {currentClass.tutorId && (
                      <button onClick={() => {
                        if (!isLoggedIn) {
                          alert('Vui lòng đăng nhập để xem hồ sơ chi tiết của gia sư!');
                          navigate('/login');
                          return;
                        }
                        setIsProfileModalOpen(true);
                      }} className="px-4 py-2 border border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary-container/10 transition-colors">Xem hồ sơ</button>
                    )}
                  </div>
                  <div className="flex gap-4 mb-4 flex-wrap">
                    {currentClass.tutorVerified && (
                      <div className="bg-surface-container-low px-3 py-1 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <span className="font-label-sm text-label-sm">Đã xác minh</span>
                      </div>
                    )}
                    <div className="bg-surface-container-low px-3 py-1 rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      <span className="font-label-sm text-label-sm">{currentClass.tutorExperience || 'Chưa cập nhật'}</span>
                    </div>
                    {currentClass.tutorUniversity && (
                      <div className="bg-surface-container-low px-3 py-1 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">school</span>
                        <span className="font-label-sm text-label-sm">{currentClass.tutorUniversity}</span>
                      </div>
                    )}
                    {currentClass.tutorMajor && (
                      <div className="bg-surface-container-low px-3 py-1 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span className="font-label-sm text-label-sm">{currentClass.tutorMajor}</span>
                      </div>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {currentClass.tutorDesc}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Sticky Card */}
          <div className="lg:col-span-4 sticky top-[96px]">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <span className="text-on-surface-variant font-label-sm text-label-sm block mb-1">Học phí mỗi ca</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg text-primary">{currentClass.price}</span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">/ ca ({currentClass.duration || '120 phút'})</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-outline-variant/30">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Lịch học</p>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">{currentClass.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-outline-variant/30">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Giờ học</p>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">{currentClass.sessionTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-outline-variant/30">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">{currentClass.locationType === 'computer' || currentClass.locationType === 'videocam' ? 'computer' : 'location_on'}</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Hình thức</p>
                    <p className="text-on-surface-variant font-body-sm text-body-sm">{currentClass.location}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => {
                if (!isLoggedIn) {
                  alert('Vui lòng đăng nhập để đăng ký lớp học này!');
                  navigate('/login', { state: { from: { pathname: `/classes/${id}`, search: '?autoOpenRegister=true' } } });
                } else if (role === 'parent') {
                  setIsModalOpen(true);
                } else {
                  alert('Tính năng này dành cho phụ huynh. Gia sư vui lòng sử dụng tính năng Ứng tuyển.');
                }
              }} className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm hover:bg-primary-container transition-all active:scale-95">
                Đăng ký ngay
              </button>
              <div className="text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">Liên hệ tư vấn miễn phí: <span className="font-bold text-on-surface">1900 8198</span></p>
              </div>
              <div className="pt-4 border-t border-outline-variant space-y-3">
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-on-surface-variant">Lộ trình học</span>
                  <span className="text-on-surface">{currentClass.totalSessions || '24 ca'}</span>
                </div>
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-on-surface-variant">Tài liệu tặng kèm</span>
                  <span className="text-on-surface">Sách bài tập + PDF</span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-6 rounded-xl border border-primary/20 bg-primary/5">
              <h4 className="font-label-md text-label-md text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Chính sách bảo hành
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Hoàn trả học phí nếu học sinh không tiến bộ sau 1 tháng tham gia đầy đủ các ca học.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Đăng ký vào lớp</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Vui lòng cung cấp một số thông tin cơ bản về học sinh để gia sư tiện nắm bắt và xếp lớp.
            </p>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">Họ tên học sinh <span className="text-error">*</span></label>
                <input required type="text" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary ${formErrors.studentName ? 'border-error' : 'border-outline-variant'}`} placeholder="Ví dụ: Nguyễn Văn A" value={registerForm.studentName} onChange={e => { setRegisterForm({...registerForm, studentName: e.target.value}); setFormErrors({...formErrors, studentName: undefined}); }} />
                {formErrors.studentName && <p className="text-error text-xs mt-1">{formErrors.studentName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-on-surface mb-1">Học sinh lớp <span className="text-error">*</span></label>
                  <select required className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-surface ${formErrors.studentGrade ? 'border-error' : 'border-outline-variant'}`} value={registerForm.studentGrade} onChange={e => { setRegisterForm({...registerForm, studentGrade: e.target.value}); setFormErrors({...formErrors, studentGrade: undefined}); }}>
                    <option value="" disabled>Chọn lớp</option>
                    {CLASS_LEVELS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  {formErrors.studentGrade && <p className="text-error text-xs mt-1">{formErrors.studentGrade}</p>}
                </div>
                <div>
                  <label className="block text-label-md font-medium text-on-surface mb-1">Lực học hiện tại</label>
                  <select className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface" value={registerForm.studentLevel} onChange={e => setRegisterForm({...registerForm, studentLevel: e.target.value})}>
                    <option value="">Chọn lực học</option>
                    <option value="Yếu/Kém">Yếu/Kém</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khá">Khá</option>
                    <option value="Giỏi">Giỏi</option>
                    <option value="Mất gốc">Mất gốc</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">Lời nhắn cho Gia sư</label>
                <textarea rows={3} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary" placeholder="Ví dụ: Mong muốn giáo viên nghiêm khắc..." value={registerForm.notes} onChange={e => setRegisterForm({...registerForm, notes: e.target.value})}></textarea>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-outline text-on-surface rounded-xl hover:bg-surface-variant font-label-md">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-on-primary rounded-xl hover:bg-primary-container font-label-md">Gửi yêu cầu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutor Profile Modal */}
      {isProfileModalOpen && currentClass?.tutorId && (
        <TutorProfileModal 
          tutorId={currentClass.tutorId} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ClassDetail;
