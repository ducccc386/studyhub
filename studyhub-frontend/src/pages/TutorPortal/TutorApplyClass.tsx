import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TutorProfileModal from '../../components/Shared/TutorProfileModal';
import { apiFetch } from '../../utils/api';

interface JobPostingDTO {
  id: number;
  parentId: number;
  parentName: string;
  parentAvatar: string;
  title: string;
  subject: string;
  classLevel: string;
  description: string;
  postedAt: string;
  status: string;
  location: string;
  detailedAddress: string;
  schedule: string;
  pricePerSession: number;
  learningMode: string;
  requirement: string;
  studyDuration?: string;
}

interface TutorProfile {
  id: number;
  fullName: string;
  avatarUrl: string;
  universityName: string;
  major: string;
  experienceYears: number;
}


const TutorApplyClass: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { tutorId } = useAuth(); // tutorId is TutorProfile.id

  const [post, setPost] = useState<JobPostingDTO | null>(null);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!postId || !tutorId) {
      if (!tutorId) setError('Không tìm thấy hồ sơ gia sư. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      apiFetch(`/posts/${postId}`).then(res => {
        if (!res.ok) throw new Error('Không tìm thấy bài đăng hoặc có lỗi xảy ra');
        return res.json();
      }),
      apiFetch(`/tutors/${tutorId}`).then(res => {
        if (!res.ok) throw new Error('Không lấy được hồ sơ gia sư');
        return res.json();
      })
    ])
    .then(([postData, profileData]) => {
      setPost(postData);
      setProfile(profileData);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [postId, tutorId]);

  const handleSubmit = async () => {
    if (!post || !profile) {
      alert("Thiếu thông tin, không thể nộp đơn.");
      return;
    }
    if (!agreed) {
      alert("Bạn phải đồng ý với cam kết chất lượng để tiếp tục.");
      return;
    }

    setSubmitting(true);
    
    const bodyData = {
      tutorProfileId: profile.id, 
      tutorName: profile.fullName || 'Gia sư ẩn danh',
      tutorAvatar: profile.avatarUrl || '',
      tutorTitle: profile.universityName ? `Sinh viên ${profile.universityName}` : 'Gia sư StudyHub',
      message: message
    };

    try {
      const res = await apiFetch(`/posts/${postId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Có lỗi xảy ra khi ứng tuyển');
      }

      alert('Hồ sơ ứng tuyển đã được gửi thành công!');
      navigate('/tutor/search-classes');
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post || !profile) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <span className="material-symbols-outlined text-6xl text-error">error</span>
        <p className="text-error font-medium">{error || 'Có lỗi xảy ra'}</p>
        <button onClick={() => navigate('/tutor/search-classes')} className="px-6 py-2 bg-primary text-white rounded-xl font-semibold">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-fade-in">
      <div className="space-y-2 animate-slide-up">
        <h1 className="text-3xl font-bold text-on-surface">Ứng tuyển lớp học</h1>
        <p className="text-base text-on-surface-variant">Bài đăng: <span className="font-semibold text-primary">{post.title}</span></p>
      </div>

      {/* Thông tin lớp học tóm tắt */}
      <section className="glass border border-outline-variant rounded-2xl p-6 shadow-sm animate-slide-up">
        <h2 className="text-lg font-bold text-on-surface mb-4">Thông tin lớp học</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-on-surface-variant">Môn học:</span> <span className="font-medium text-on-surface">{post.subject} ({post.classLevel})</span></div>
          <div><span className="text-on-surface-variant">Học phí:</span> <span className="font-medium text-on-surface text-primary">{post.pricePerSession?.toLocaleString('vi-VN')}đ/buổi</span></div>
          <div><span className="text-on-surface-variant">Hình thức:</span> <span className="font-medium text-on-surface">{post.learningMode === 'ONLINE' ? '🌐 Online' : post.learningMode === 'OFFLINE' ? '📍 Offline' : '🌐📍 Cả hai (Online & Offline)'}</span></div>
          <div><span className="text-on-surface-variant">Địa điểm:</span> <span className="font-medium text-on-surface">{post.learningMode === 'ONLINE' ? 'Học Online' : (post.detailedAddress ? `${post.detailedAddress}, ${post.location}` : post.location)}</span></div>
          <div><span className="text-on-surface-variant">Lịch học:</span> <span className="font-medium text-on-surface">{post.schedule || 'Chưa rõ'}</span></div>
          {post.studyDuration && <div><span className="text-on-surface-variant">Thời hạn học:</span> <span className="font-bold text-primary">{post.studyDuration}</span></div>}
          <div className="col-span-2"><span className="text-on-surface-variant">Yêu cầu:</span> <span className="font-medium text-on-surface">{post.requirement || post.description || 'Không có yêu cầu đặc biệt'}</span></div>
        </div>
      </section>

      {/* Profile Confirmation Section */}
      <section className="glass border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-up stagger-1">
        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_box</span>
          Xác nhận Hồ sơ (Sẽ hiển thị cho Phụ huynh)
        </h2>
        <div className="flex items-start gap-5 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-surface object-cover shadow-sm shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-4xl text-primary">person</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-on-surface mb-1">{profile.fullName || 'Gia sư'}</h3>
            <p className="text-sm font-medium text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">school</span>
              {profile.universityName ? `Sinh viên ${profile.universityName}` : 'Gia sư'}
            </p>
            {profile.major && <p className="text-sm text-on-surface-variant">Chuyên ngành: {profile.major}</p>}
          </div>
          <Link to="/tutor/settings" className="shrink-0 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">Sửa hồ sơ</Link>
        </div>
      </section>

      {/* Cover Letter Section */}
      <section className="glass border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-up stagger-2">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">edit_document</span>
          Thư ngỏ (Cover Letter)
        </h2>
        <p className="text-sm text-on-surface-variant mb-4">Hãy viết một đoạn ngắn giới thiệu bản thân, phương pháp giảng dạy và lý do bạn phù hợp với lớp này. Phụ huynh sẽ đọc thư này ngay dưới bài đăng của họ.</p>
        <textarea 
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full h-40 rounded-xl bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm p-4 resize-y transition-all outline-none" 
          placeholder="Ví dụ: Chào anh/chị, em là sinh viên năm 3 ĐH Sư Phạm chuyên ngành Toán, có kinh nghiệm 2 năm ôn thi đại học..."
        ></textarea>
      </section>

      {/* Commitment & Action */}
      <section className="glass border border-primary/20 bg-primary/5 rounded-2xl p-6 animate-slide-up stagger-3">
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">verified_user</span>
          Cam kết chất lượng
        </h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input 
            className="mt-1 w-5 h-5 rounded border-primary text-primary focus:ring-primary cursor-pointer" 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-sm text-on-surface-variant leading-relaxed">
            Tôi cam kết những thông tin trong hồ sơ của tôi là hoàn toàn chính xác. Tôi đồng ý với các điều khoản của StudyHub về việc duy trì chất lượng giảng dạy và chuẩn mực đạo đức nghề nghiệp.
          </span>
        </label>
        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
          <button 
            onClick={() => setShowProfileModal(true)} 
            className="px-6 py-3 rounded-xl bg-secondary-container text-on-secondary-container text-sm font-medium hover:bg-secondary-container/80 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Xem trước hồ sơ
          </button>
          <button 
            onClick={() => navigate('/tutor/search-classes')} 
            className="px-6 py-3 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors text-center"
            disabled={submitting}
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting || !agreed}
            className={`px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2
              ${agreed ? 'bg-primary text-white hover:bg-primary/90 active:scale-95 hover:shadow-lg' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-70'}
            `}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Đang gửi...
              </>
            ) : 'Gửi hồ sơ ứng tuyển'}
          </button>
        </div>
      </section>

      {showProfileModal && profile && (
        <TutorProfileModal 
          tutorId={profile.id} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
};

export default TutorApplyClass;
