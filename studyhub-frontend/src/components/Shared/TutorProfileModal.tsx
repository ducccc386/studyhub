import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

interface Subject {
  id: number;
  name: string;
}

interface TutorProfile {
  id: number;
  fullName: string;
  birthDate: string;
  address: string;
  phoneNumber: string;
  avatarUrl: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  universityName: string;
  major: string;
  degreeImageUrl: string;
  experienceYears: number;
  certificates: string[];
  introduction: string;
  status: string;
  ekycStatus: string;
  similarityScore: number;
  price: number;
  teachingMethod: string;
  averageRating: number;
  totalReviews: number;
  subjects: Subject[];
}

interface TutorProfileModalProps {
  tutorId: number | string;
  onClose: () => void;
}

const TutorProfileModal: React.FC<TutorProfileModalProps> = ({ tutorId, onClose }) => {
  const { role, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  useEffect(() => {
    if (!tutorId) return;
    
    setLoading(true);
    fetch(`${BASE_URL}/tutors/${tutorId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải thông tin gia sư');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [tutorId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">badge</span>
            Hồ sơ chi tiết Gia sư
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest/50">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error || !profile ? (
            <div className="text-center text-error py-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl mb-2">error</span>
              <p>{error || 'Lỗi tải dữ liệu'}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="flex flex-col md:flex-row gap-6 items-start bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
                <div className="relative shrink-0">
                  <img 
                    src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=random`} 
                    alt="Avatar" 
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-surface-container-high shadow-md" 
                  />
                  {profile.ekycStatus === 'SUCCESS' && (
                    <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-1 shadow-sm">
                      <span className="material-symbols-outlined text-green-500 text-3xl" title="Đã xác thực danh tính">verified</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-on-surface mb-2">{profile.fullName}</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{profile.price?.toLocaleString('vi-VN')}đ <span className="text-sm font-normal text-on-surface-variant">/ buổi</span></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">school</span>
                      Sinh viên {profile.universityName}
                    </span>
                    {profile.major && (
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        Ngành: {profile.major}
                      </span>
                    )}
                    {profile.teachingMethod && (
                      <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">{profile.teachingMethod === 'ONLINE' ? 'laptop_mac' : 'location_on'}</span>
                        Dạy: {profile.teachingMethod}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">star</span>
                      <span className="font-bold text-on-surface">{profile.averageRating ? profile.averageRating.toFixed(1) : 'Chưa có'}</span>
                      <span>({profile.totalReviews || 0} đánh giá)</span>
                    </div>
                    {profile.experienceYears > 0 && (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        {profile.experienceYears} năm kinh nghiệm
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin cá nhân */}
                <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
                  <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Thông tin liên hệ
                  </h4>
                  <ul className="space-y-4 text-sm">
                    <li className="flex gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">calendar_month</span>
                      <div>
                        <span className="block text-xs text-on-surface-variant mb-0.5">Ngày sinh</span>
                        <span className="font-medium text-on-surface">{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">call</span>
                      <div>
                        <span className="block text-xs text-on-surface-variant mb-0.5">Số điện thoại</span>
                        <span className="font-medium text-on-surface">{profile.phoneNumber || 'Đang ẩn'}</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">location_on</span>
                      <div>
                        <span className="block text-xs text-on-surface-variant mb-0.5">Địa chỉ hiện tại</span>
                        <span className="font-medium text-on-surface">{profile.address || 'Chưa cập nhật'}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Môn học giảng dạy */}
                <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
                  <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">library_books</span>
                    Môn học nhận dạy
                  </h4>
                  {profile.subjects && profile.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.subjects.map(sub => (
                        <span key={sub.id} className="border border-primary text-primary px-3 py-1.5 rounded-lg text-sm font-medium">
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">Chưa đăng ký môn học nào.</p>
                  )}
                </div>
              </div>



              {/* Hình ảnh văn bằng, chứng chỉ */}
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">military_tech</span>
                  Bằng cấp & Chứng chỉ
                </h4>
                
                <div className="space-y-6">
                  {/* Bằng ĐH */}
                  {profile.degreeImageUrl && (
                    <div>
                      <h5 className="text-xs font-bold text-on-surface-variant mb-2">Bằng Đại học / Thẻ sinh viên</h5>
                      <img src={profile.degreeImageUrl} alt="Degree" className="w-48 h-auto object-cover rounded-xl border border-outline-variant shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                        if (!isLoggedIn) {
                          alert('Vui lòng đăng nhập để xem chi tiết chứng chỉ của gia sư.');
                          return;
                        }
                        setSelectedImage(profile.degreeImageUrl!);
                      }} />
                    </div>
                  )}

                  {/* Chứng chỉ khác */}
                  {profile.certificates && profile.certificates.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-on-surface-variant mb-2">Chứng chỉ khác</h5>
                      <div className="flex flex-wrap gap-4">
                        {profile.certificates.map((cert, idx) => (
                          <img key={idx} src={cert} alt={`Certificate ${idx}`} className="w-32 h-auto object-cover rounded-xl border border-outline-variant shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                            if (!isLoggedIn) {
                              alert('Vui lòng đăng nhập để xem chi tiết chứng chỉ của gia sư.');
                              return;
                            }
                            setSelectedImage(cert);
                          }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {!profile.degreeImageUrl && (!profile.certificates || profile.certificates.length === 0) && (
                    <p className="text-sm text-on-surface-variant italic">Gia sư chưa cập nhật hình ảnh bằng cấp, chứng chỉ.</p>
                  )}
                </div>
              </div>
              
              {/* Căn cước công dân (Chỉ hiện nếu đã được xác thực) */}
              {profile.idCardFrontUrl && profile.ekycStatus === 'SUCCESS' && role === 'admin' && (
                <div className="bg-green-50 p-6 rounded-2xl border border-green-200 shadow-sm">
                  <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                    Xác thực CCCD
                  </h4>
                  <p className="text-xs text-green-700 mb-4">Danh tính của gia sư đã được StudyHub xác thực thành công thông qua Căn cước công dân và Sinh trắc học khuôn mặt.</p>
                  <div className="flex gap-4">
                    <img src={profile.idCardFrontUrl} alt="ID Front" className="w-40 h-auto object-cover rounded-xl border border-green-200 shadow-sm opacity-90 blur-[2px] hover:blur-none transition-all" />
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface text-right shrink-0 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold rounded-xl transition-colors shadow-sm"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>

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

export default TutorProfileModal;
