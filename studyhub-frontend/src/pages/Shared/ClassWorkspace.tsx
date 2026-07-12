import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import LessonFeedbackModal from '../../components/LessonFeedbackModal';

const ClassWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role, userId } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'DASHBOARD'); // DASHBOARD, LOGS, BILLING
  const [session, setSession] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [meetingLink, setMeetingLink] = useState('');
  const [editingLink, setEditingLink] = useState(false);

  const [address, setAddress] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);

  // Thêm Log State
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({ title: '', content: '', tutorFeedback: '', status: 'PRESENT' });

  // Thêm Feedback State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedLogForFeedback, setSelectedLogForFeedback] = useState<any>(null);

  // Thêm Material State
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [materialType, setMaterialType] = useState('REFERENCE');

  // Syllabus State
  const [syllabus, setSyllabus] = useState<any>(null);
  const [selectedSyllabusSession, setSelectedSyllabusSession] = useState<any>(null);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isSyllabusEditModalOpen, setIsSyllabusEditModalOpen] = useState(false);
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);
  const [newSyllabusSession, setNewSyllabusSession] = useState({
    title: '',
    content: '',
    keyKnowledge: '',
    expectedOutcome: '',
    scheduledDate: ''
  });

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');

  useEffect(() => {
    if (!showPaymentModal || !transactionCode || paymentStatus === 'SUCCESS') return;

    const interval = setInterval(async () => {
      try {
        const res = await apiFetch(`/payment/status/${transactionCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'SUCCESS') {
            setPaymentStatus('SUCCESS');
            setSession((prev: any) => ({ ...prev, status: 'CONFIRMED' }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [showPaymentModal, transactionCode, paymentStatus]);

  const handleConfirmHire = async () => {
    try {
      const res = await apiFetch(`/payment/confirm-hire/${id}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setQrUrl(data.qrUrl);
          setTransactionCode(data.transactionCode);
          setPaymentStatus('PENDING');
          setShowPaymentModal(true);
        }
      } else {
        alert('Có lỗi xảy ra khi tạo giao dịch thanh toán.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await apiFetch(`/class-sessions/${id}`);
      if (!res.ok) throw new Error('Không tìm thấy lớp học');
      const data = await res.json();
      setSession(data);
      setMeetingLink(data.meetingLink || '');
      setAddress(data.address || '');

      const logRes = await apiFetch(`/lesson-logs/class/${id}`);
      if (logRes.ok) {
        setLogs(await logRes.json());
      }

      const matRes = await apiFetch(`/study-materials/class/${id}`);
      if (matRes.ok) {
        setMaterials(await matRes.json());
      }

      const sylRes = await apiFetch(`/class-sessions/${id}/syllabus`);
      if (sylRes.ok) {
        setSyllabus(await sylRes.json());
      }
    } catch (err) {
      console.error(err);
      navigate(role === 'parent' ? '/parent/classes' : role === 'admin' ? '/admin/classes' : '/tutor/classes');
    } finally {
      setLoading(false);
    }
  };

  const saveMeetingLink = async () => {
    try {
      const res = await apiFetch(`/class-sessions/${id}/meeting-link`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: meetingLink })
      });
      if (res.ok) {
        setEditingLink(false);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi lưu link');
    }
  };

  const saveAddress = async () => {
    try {
      const res = await apiFetch(`/class-sessions/${id}/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address })
      });
      if (res.ok) {
        setEditingAddress(false);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi lưu địa chỉ');
    }
  };

  const submitLog = async () => {
    try {
      const payload = {
        ...newLog,
        scheduledDate: new Date().toISOString().split('.')[0]
      };
      const res = await apiFetch(`/lesson-logs/class/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowLogForm(false);
        setNewLog({ title: '', content: '', tutorFeedback: '', status: 'PRESENT' });
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Lỗi thêm nhật ký từ máy chủ');
      }
    } catch (err: any) {
      alert('Lỗi thêm nhật ký: ' + err.message);
    }
  };

  const handleSubmitFeedback = async (data: { status: string; rating: number; feedback: string; tags: string }) => {
    if (!selectedLogForFeedback) return;
    try {
      const res = await apiFetch(`/lesson-logs/${selectedLogForFeedback.id}/parent-confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsFeedbackModalOpen(false);
        setSelectedLogForFeedback(null);
        fetchData();
        alert('Cảm ơn bạn đã gửi đánh giá!');
      } else {
        alert('Có lỗi xảy ra khi gửi xác nhận.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ.');
    }
  };

  const submitMaterial = async () => {
    if (!materialTitle || !materialFile || !userId) {
      alert('Vui lòng nhập tên tài liệu và chọn file đính kèm');
      return;
    }

    setUploadingMaterial(true);
    const formData = new FormData();
    if (userId) formData.append('uploaderId', userId.toString());
    formData.append('uploaderRole', (role ?? 'tutor').toUpperCase());
    formData.append('title', materialTitle);
    formData.append('file', materialFile);
    formData.append('materialType', materialType);

    try {
      const res = await apiFetch(`/study-materials/class/${id}`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
         const error = await res.json();
         throw new Error(error.error || 'Lỗi server');
      }
      setShowMaterialForm(false);
      setMaterialTitle('');
      setMaterialFile(null);
      setMaterialType('REFERENCE');
      fetchData(); // Reload materials
      alert('Đã tải lên tài liệu thành công!');
    } catch (err: any) {
      alert('Lỗi upload file: ' + err.message);
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleSyllabusTypeChange = async (type: string) => {
    if (!syllabus) return;
    const updatedSyllabus = { ...syllabus, syllabusType: type };
    try {
      const res = await apiFetch(`/class-sessions/${id}/syllabus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSyllabus)
      });
      if (res.ok) {
        setSyllabus(await res.json());
      } else {
        alert('Có lỗi xảy ra khi đổi loại lộ trình');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleSaveSyllabusSession = async () => {
    if (!newSyllabusSession.title || !newSyllabusSession.content || !newSyllabusSession.scheduledDate) {
      alert('Vui lòng điền đầy đủ tiêu đề, nội dung và ngày dự kiến.');
      return;
    }

    const updatedSessions = [...(syllabus?.sessions || [])];
    const sessionData = {
      ...newSyllabusSession,
      sessionNumber: editingSessionIndex !== null ? updatedSessions[editingSessionIndex].sessionNumber : updatedSessions.length + 1,
      scheduledDate: new Date(newSyllabusSession.scheduledDate).toISOString()
    };

    if (editingSessionIndex !== null) {
      updatedSessions[editingSessionIndex] = sessionData;
    } else {
      updatedSessions.push(sessionData);
    }

    const updatedSyllabus = {
      ...syllabus,
      sessions: updatedSessions,
      // Reset về DRAFT nếu đang APPROVED và thêm session mới
      syllabusStatus: (syllabus?.syllabusStatus === 'APPROVED' && editingSessionIndex === null)
        ? 'DRAFT'
        : syllabus?.syllabusStatus
    };

    try {
      const res = await apiFetch(`/class-sessions/${id}/syllabus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSyllabus)
      });
      if (res.ok) {
        setSyllabus(await res.json());
        setIsSyllabusEditModalOpen(false);
        setNewSyllabusSession({ title: '', content: '', keyKnowledge: '', expectedOutcome: '', scheduledDate: '' });
        setEditingSessionIndex(null);
        alert('Lưu buổi học dự kiến thành công!');
      } else {
        alert('Lỗi lưu kế hoạch bài học.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ.');
    }
  };

  const handleDeleteSyllabusSession = async (index: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa buổi học này khỏi lộ trình?')) return;
    const updatedSessions = (syllabus?.sessions || []).filter((_: any, i: number) => i !== index)
      .map((s: any, i: number) => ({ ...s, sessionNumber: i + 1 }));

    const updatedSyllabus = {
      ...syllabus,
      sessions: updatedSessions
    };

    try {
      const res = await apiFetch(`/class-sessions/${id}/syllabus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSyllabus)
      });
      if (res.ok) {
        setSyllabus(await res.json());
      } else {
        alert('Lỗi khi xóa.');
      }
    } catch (err) {
      alert('Lỗi kết nối.');
    }
  };

  const handleSubmitSyllabus = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn gửi lộ trình này lên Admin phê duyệt?')) return;
    try {
      const res = await apiFetch(`/class-sessions/${id}/syllabus/submit`, { method: 'POST' });
      if (res.ok) {
        setSyllabus(await res.json());
        alert('Đã gửi lộ trình phê duyệt thành công!');
      } else {
        alert('Có lỗi xảy ra khi gửi phê duyệt.');
      }
    } catch (err) {
      alert('Lỗi kết nối.');
    }
  };

  const handleApproveSyllabus = async () => {
    try {
      const res = await apiFetch(`/class-sessions/${id}/syllabus/approve`, { method: 'POST' });
      if (res.ok) {
        setSyllabus(await res.json());
        alert('Đã duyệt lộ trình thành công!');
      } else {
        alert('Có lỗi xảy ra khi duyệt.');
      }
    } catch (err) {
      alert('Lỗi kết nối.');
    }
  };


  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (!session) return null;

  const isTutor = role === 'tutor';
  const isParent = role === 'parent';

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-3xl p-6 md:p-8 border border-outline-variant shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-4xl text-primary">school</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-1">{session.className}</h1>
            <p className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">menu_book</span> Môn: {session.subject}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider 
            ${session.status === 'TRIAL' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-green-100 text-green-800 border border-green-200'}
          `}>
            {session.status === 'TRIAL' ? 'Đang học thử' : 'Chính thức'}
          </span>
          <p className="text-sm font-bold text-primary">{session.pricePerSession?.toLocaleString('vi-VN')}đ / buổi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant overflow-x-auto hide-scrollbar">
        {['DASHBOARD', 'SYLLABUS', 'LOGS', 'MATERIALS', 'BILLING'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
            }`}
          >
            {tab === 'DASHBOARD' ? 'Tổng quan' : tab === 'SYLLABUS' ? 'Lộ trình học' : tab === 'LOGS' ? 'Nhật ký giảng dạy' : tab === 'MATERIALS' ? 'Tài liệu học tập' : 'Học phí'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Learning Mode */}
              <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm">
                <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Khu vực học tập ({session.learningMode})
                </h3>

                {(session.learningMode === 'ONLINE' || session.learningMode === 'BOTH') && (
                  <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <h4 className="text-sm font-bold text-primary mb-2">Học Online (Google Meet / Zoom)</h4>
                    {isTutor ? (
                      editingLink ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={meetingLink} 
                            onChange={e => setMeetingLink(e.target.value)} 
                            placeholder="Dán link Google Meet vào đây..."
                            className="flex-1 px-4 py-2 text-sm border border-outline-variant rounded-lg focus:border-primary outline-none"
                          />
                          <button onClick={saveMeetingLink} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90">Lưu</button>
                          <button onClick={() => setEditingLink(false)} className="px-4 py-2 border border-outline-variant text-sm font-medium rounded-lg">Hủy</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <a href={session.meetingLink || '#'} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium text-sm truncate max-w-[70%]">
                            {session.meetingLink || 'Chưa cập nhật link'}
                          </a>
                          <button onClick={() => setEditingLink(true)} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20">Cập nhật Link</button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-4">
                        {session.meetingLink ? (
                          <a href={session.meetingLink} target="_blank" rel="noreferrer" className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow hover:bg-primary/90 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">video_camera_front</span> Tham gia phòng học
                          </a>
                        ) : (
                          <p className="text-sm text-on-surface-variant italic">Gia sư chưa cập nhật link phòng học.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(session.learningMode === 'OFFLINE' || session.learningMode === 'BOTH') && (
                  <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <h4 className="text-sm font-bold text-on-surface mb-2">Học Offline tại nhà</h4>
                    {isParent ? (
                      editingAddress ? (
                        <div className="flex flex-col gap-2 mb-3">
                          <input 
                            type="text" 
                            value={address} 
                            onChange={e => setAddress(e.target.value)} 
                            placeholder="Nhập địa chỉ nhà chi tiết..."
                            className="w-full px-4 py-2 text-sm border border-outline-variant rounded-lg focus:border-primary outline-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={saveAddress} className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90">Lưu</button>
                            <button onClick={() => setEditingAddress(false)} className="px-4 py-1.5 border border-outline-variant text-sm font-medium rounded-lg">Hủy</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-on-surface-variant truncate max-w-[70%]">{session.address || 'Chưa có địa chỉ cụ thể'}</p>
                          <button onClick={() => setEditingAddress(true)} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 shrink-0">Cập nhật Địa chỉ</button>
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-on-surface-variant mb-3">{session.address || 'Phụ huynh chưa cung cấp địa chỉ cụ thể'}</p>
                    )}
                    
                    {session.address && (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.address)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">map</span> Xem trên bản đồ
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Lịch học cố định</h3>
                <div className="flex items-center gap-3 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <span className="font-medium">{session.schedule}</span>
                </div>
              </div>

              <div className="bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Người đồng hành</h3>
                {isTutor ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">face</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{session.parentName}</p>
                      <p className="text-xs text-on-surface-variant">Phụ huynh</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <img src={session.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.tutorName || 'User')}&background=random`} alt="tutor" className="w-12 h-12 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-on-surface">{session.tutorName}</p>
                      <p className="text-xs text-on-surface-variant">Gia sư</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SYLLABUS TAB */}
        {activeTab === 'SYLLABUS' && (
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-outline-variant">
              <div>
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">route</span>
                  Lộ trình học tập & Kế hoạch bài học
                </h3>
                <p className="text-sm text-on-surface-variant">Lên kế hoạch và thống nhất lộ trình học tập giữa Gia sư và Học sinh.</p>
              </div>
              {role === 'tutor' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-on-surface-variant">Chế độ lộ trình:</span>
                  <select
                    className="p-2.5 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary font-bold text-primary cursor-pointer"
                    value={syllabus?.syllabusType || 'STANDARD'}
                    onChange={(e) => handleSyllabusTypeChange(e.target.value)}
                  >
                    <option value="STANDARD">Lộ trình chuẩn (Sách giáo khoa)</option>
                    <option value="CUSTOM">Lộ trình tự chọn (Thiết kế ngắn hạn)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Standard Syllabus (SGK) */}
            {(syllabus?.syllabusType === 'STANDARD' || !syllabus) && (
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary shrink-0">info</span>
                  <div>
                    <h4 className="font-bold text-primary text-sm mb-1">Chương trình học chuẩn theo Bộ Giáo dục & Đào tạo</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Lộ trình này áp dụng khung kiến thức chuẩn của sách giáo khoa quốc gia cho môn học **{session.subject}**. Gia sư sẽ căn cứ vào tiến độ học trên trường để bám sát và bổ trợ.
                    </p>
                  </div>
                </div>

                {/* Simulated outline list */}
                <div className="border border-outline-variant rounded-2xl overflow-hidden divide-y divide-outline-variant bg-surface-container-lowest">
                  {(session.subject?.includes('Toán') || session.subject?.includes('Math')) ? (
                    <>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 1: Khảo sát hàm số & Đồ thị</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Cực trị hàm số, tiệm cận, vẽ đồ thị, biện luận nghiệm phương trình.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 1 - 4</span>
                      </div>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 2: Mũ & Logarit</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Lũy thừa, căn thức, phương trình, hệ phương trình và bất phương trình logarit.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 5 - 8</span>
                      </div>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 3: Nguyên hàm & Tích phân</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Phương pháp đổi biến số, nguyên hàm từng phần, ứng dụng tính diện tích và thể tích.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 9 - 12</span>
                      </div>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 4: Số phức</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Biểu diễn hình học của số phức, phương trình bậc hai với hệ số thực, module số phức.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 13 - 16</span>
                      </div>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 5: Hình học không gian & Khối đa diện</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Thể tích khối lăng trụ, khối chóp, diện tích xung quanh khối tròn xoay (nón, trụ, cầu).</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 17 - 20</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 1: Ôn tập Ngữ pháp & Cấu trúc nền tảng</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Hệ thống lại các thì tiếng Anh, câu bị động, câu điều kiện, cấu trúc so sánh.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 1 - 4</span>
                      </div>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 2: Phát triển Từ vựng theo Chủ đề</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Học từ vựng theo cụm từ (Collocations), từ đồng nghĩa về chủ đề Education, Work, Technology.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 5 - 8</span>
                      </div>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 3: Kỹ năng Nghe & Đọc cơ bản</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Luyện nghe từ khóa, scanning đoạn văn ngắn, phân tích cấu trúc bài đọc mẫu.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 9 - 12</span>
                      </div>
                      <div className="p-4 flex justify-between items-center hover:bg-surface-container/20 transition-colors">
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">Phần 4: Luyện nói phản xạ & Viết câu ngắn</h5>
                          <p className="text-xs text-on-surface-variant mt-1">Phản xạ trả lời câu hỏi giao tiếp thông dụng, sửa lỗi ngữ pháp phát âm trực tiếp.</p>
                        </div>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">Buổi 13 - 16</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Custom Syllabus (Gia sư tự thiết lập) */}
            {syllabus?.syllabusType === 'CUSTOM' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-on-surface">Trạng thái phê duyệt kế hoạch:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${syllabus.syllabusStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border border-green-200' :
                        syllabus.syllabusStatus === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'}
                    `}>
                      {syllabus.syllabusStatus === 'APPROVED' ? 'Đã duyệt' :
                       syllabus.syllabusStatus === 'SUBMITTED' ? 'Đang chờ duyệt' : 'Bản nháp'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Tutor Submit button - shown when DRAFT */}
                    {role === 'tutor' && syllabus.syllabusStatus === 'DRAFT' && (
                      <button
                        onClick={handleSubmitSyllabus}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center gap-1.5 shadow"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span> Gửi phê duyệt
                      </button>
                    )}

                    {/* Admin Approve button */}
                    {role === 'admin' && syllabus.syllabusStatus === 'SUBMITTED' && (
                      <button
                        onClick={handleApproveSyllabus}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 flex items-center gap-1.5 shadow"
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span> Duyệt kế hoạch
                      </button>
                    )}

                    {/* Tutor Add button - shown in DRAFT or APPROVED */}
                    {role === 'tutor' && (syllabus.syllabusStatus === 'DRAFT' || syllabus.syllabusStatus === 'APPROVED') && (
                      <button
                        onClick={() => {
                          setNewSyllabusSession({ title: '', content: '', keyKnowledge: '', expectedOutcome: '', scheduledDate: '' });
                          setEditingSessionIndex(null);
                          setIsSyllabusEditModalOpen(true);
                        }}
                        className="px-4 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:bg-secondary/90 flex items-center gap-1.5 shadow"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span> Thiết lập buổi dạy
                      </button>
                    )}
                  </div>
                </div>

                {/* Plan sessions list */}
                <div className="space-y-4">
                  {!syllabus.sessions || syllabus.sessions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest text-on-surface-variant italic">
                      Gia sư chưa thiết lập kế hoạch buổi học nào cho lộ trình tự chọn này.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {syllabus.sessions.map((s: any, idx: number) => (
                        <div
                          key={s.id || idx}
                          onClick={() => {
                            setSelectedSyllabusSession(s);
                            setIsSyllabusModalOpen(true);
                          }}
                          className="p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm hover:shadow-md cursor-pointer hover:border-primary transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">Buổi {s.sessionNumber}</span>
                              <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                {new Date(s.scheduledDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <h4 className="font-bold text-on-surface text-sm mb-2 line-clamp-1">{s.title}</h4>
                            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">{s.content}</p>
                          </div>
                          
                          <div className="flex justify-between items-center border-t border-outline-variant/30 pt-3">
                            <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">visibility</span> Click xem chi tiết
                            </span>

                            {role === 'tutor' && (syllabus.syllabusStatus === 'DRAFT' || syllabus.syllabusStatus === 'APPROVED') && (
                              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setNewSyllabusSession({
                                      title: s.title,
                                      content: s.content,
                                      keyKnowledge: s.keyKnowledge || '',
                                      expectedOutcome: s.expectedOutcome || '',
                                      scheduledDate: s.scheduledDate ? s.scheduledDate.substring(0, 10) : ''
                                    });
                                    setEditingSessionIndex(idx);
                                    setIsSyllabusEditModalOpen(true);
                                  }}
                                  className="w-8 h-8 rounded-full hover:bg-primary/10 text-primary flex items-center justify-center transition-colors"
                                  title="Sửa"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSyllabusSession(idx)}
                                  className="w-8 h-8 rounded-full hover:bg-error/10 text-error flex items-center justify-center transition-colors"
                                  title="Xóa"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'LOGS' && (
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant shadow-sm">
            {/* Cảnh báo khi đạt giới hạn học thử */}
            {isTutor && session.status === 'TRIAL' && (session.progress || 0) >= 2 && (
              <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex items-start gap-3">
                <span className="material-symbols-outlined shrink-0 text-amber-600">warning</span>
                <div>
                  <h4 className="font-bold mb-1 text-amber-900 text-sm">Đã đạt giới hạn số buổi học thử</h4>
                  <p className="text-xs leading-relaxed">Bạn đã dạy hết 2 buổi học thử miễn phí. Vui lòng nhắc Phụ huynh truy cập mục <strong>Học phí</strong> để bấm <strong>Xác nhận thuê và thanh toán</strong>. Bạn không thể thêm nhật ký buổi học thứ 3 cho đến khi thanh toán hoàn tất.</p>
                </div>
              </div>
            )}
            {isParent && session.status === 'TRIAL' && (session.progress || 0) >= 2 && (
              <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex items-start gap-3">
                <span className="material-symbols-outlined shrink-0 text-amber-600">payments</span>
                <div>
                  <h4 className="font-bold mb-1 text-amber-900 text-sm">Yêu cầu thanh toán học phí</h4>
                  <p className="text-xs leading-relaxed">Bạn đã hoàn thành 2 buổi học thử với Gia sư. Vui lòng truy cập mục <strong>Học phí</strong> bên dưới để tiến hành <strong>Xác nhận thuê & Thanh toán</strong> nhằm tiếp tục quá trình học tập chính thức.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history_edu</span>
                Tiến độ học tập ({logs.length} buổi)
              </h3>
              {isTutor && !showLogForm && (
                session.status === 'TRIAL' && (session.progress || 0) >= 2 ? (
                  <div className="text-xs font-bold text-error bg-error/10 px-4 py-2.5 rounded-xl border border-error/20 flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Khóa: Đang chờ PH thanh toán
                  </div>
                ) : (
                  <button onClick={() => setShowLogForm(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow hover:bg-primary/90 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">add</span> Thêm nhật ký
                  </button>
                )
              )}
            </div>

            {showLogForm && (
              <div className="mb-8 p-6 bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-inner">
                <h4 className="font-bold text-on-surface mb-4">Thêm nhật ký buổi học mới</h4>
                <div className="space-y-4">
                  <input type="text" placeholder="Tiêu đề bài học (Ví dụ: Ôn tập Hình học không gian)" className="w-full p-3 border border-outline-variant rounded-xl text-sm" value={newLog.title} onChange={e => setNewLog({...newLog, title: e.target.value})} />
                  <textarea placeholder="Nội dung đã dạy..." className="w-full p-3 border border-outline-variant rounded-xl text-sm h-24" value={newLog.content} onChange={e => setNewLog({...newLog, content: e.target.value})}></textarea>
                  <textarea placeholder="Nhận xét về học sinh (Thái độ, điểm cần cải thiện)..." className="w-full p-3 border border-outline-variant rounded-xl text-sm h-24" value={newLog.tutorFeedback} onChange={e => setNewLog({...newLog, tutorFeedback: e.target.value})}></textarea>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setShowLogForm(false)} className="px-5 py-2.5 text-sm font-medium border border-outline-variant rounded-xl hover:bg-surface-container">Hủy</button>
                    <button onClick={submitLog} className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 shadow">Lưu nhật ký</button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {logs.length === 0 ? (
                <p className="text-center text-sm text-on-surface-variant italic py-8">Chưa có nhật ký buổi học nào.</p>
              ) : (
                <div className="relative border-l-2 border-primary/20 ml-3 md:ml-4 space-y-8 pb-4">
                  {logs.map((log, index) => (
                    <div key={log.id} className="relative pl-6 md:pl-8">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></div>
                      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                          <h4 className="font-bold text-on-surface text-base">Buổi {logs.length - index}: {log.title}</h4>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg w-fit">
                            {new Date(log.scheduledDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-on-surface-variant block mb-1">Nội dung:</span>
                            <p className="text-on-surface leading-relaxed">{log.content}</p>
                          </div>
                          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                            <span className="font-semibold text-amber-800 block mb-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">feedback</span> Nhận xét của Gia sư:
                            </span>
                            <p className="text-amber-900 leading-relaxed italic">{log.tutorFeedback}</p>
                          </div>
                          
                          {/* Parent Approval UI */}
                          <div className="pt-3 border-t border-outline-variant/30 mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {log.parentApprovalStatus === 'APPROVED' ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">verified</span> Phụ huynh đã xác nhận
                                </span>
                              ) : log.parentApprovalStatus === 'DISPUTED' ? (
                                <span className="px-3 py-1 bg-error/10 text-error font-bold text-xs rounded-full flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">report_problem</span> Có khiếu nại
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-surface-container text-on-surface-variant font-bold text-xs rounded-full flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> Chờ xác nhận
                                </span>
                              )}
                            </div>
                            
                            {isParent && (!log.parentApprovalStatus || log.parentApprovalStatus === 'PENDING') && (
                              <button 
                                onClick={() => { setSelectedLogForFeedback(log); setIsFeedbackModalOpen(true); }}
                                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow hover:bg-primary/90 transition-all flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">draw</span> Xác nhận & Đánh giá
                              </button>
                            )}
                          </div>

                          {(log.parentApprovalStatus === 'APPROVED' || log.parentApprovalStatus === 'DISPUTED') && (log.parentRating || log.parentFeedback || log.parentFeedbackTags) && (
                            <div className={`mt-2 p-3 rounded-xl border ${log.parentApprovalStatus === 'APPROVED' ? 'bg-green-50 border-green-100' : 'bg-error/5 border-error/10'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-semibold text-xs flex items-center gap-1 ${log.parentApprovalStatus === 'APPROVED' ? 'text-green-800' : 'text-error'}`}>
                                  <span className="material-symbols-outlined text-[16px]">rate_review</span> Đánh giá từ Phụ huynh:
                                </span>
                                {log.parentRating && (
                                  <div className="flex items-center gap-0.5">
                                    {[1,2,3,4,5].map((star: number) => (
                                      <span key={star} className={`material-symbols-outlined text-[16px] ${star <= log.parentRating ? 'text-amber-400' : 'text-outline-variant'}`}
                                        style={{ fontVariationSettings: star <= log.parentRating ? "'FILL' 1" : "'FILL' 0" }}>
                                        star
                                      </span>
                                    ))}
                                    <span className="text-xs font-bold text-amber-600 ml-1">{log.parentRating}/5</span>
                                  </div>
                                )}
                              </div>
                              {log.parentFeedbackTags && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {log.parentFeedbackTags.split(',').map((tag: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-white text-on-surface-variant rounded-full text-[10px] border border-outline-variant/30 font-medium">
                                      {tag.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {log.parentFeedback && (
                                <p className={`text-xs italic leading-relaxed ${log.parentApprovalStatus === 'APPROVED' ? 'text-green-900' : 'text-error'}`}>
                                  "{log.parentFeedback}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'MATERIALS' && (
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder_open</span>
                Tài liệu học tập ({materials.length} file)
              </h3>
              {!showMaterialForm && (
                <button onClick={() => setShowMaterialForm(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow hover:bg-primary/90 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">upload_file</span> Tải lên tài liệu
                </button>
              )}
            </div>

            {showMaterialForm && (
              <div className="mb-8 p-6 bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-inner">
                <h4 className="font-bold text-on-surface mb-4">Tải lên tài liệu mới</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Tên tài liệu <span className="text-error">*</span></label>
                    <input type="text" placeholder="VD: Đề cương ôn tập HK1 Toán 12" className="w-full p-3 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary" value={materialTitle} onChange={e => setMaterialTitle(e.target.value)} />
                  </div>
                  {role === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1">Loại tài liệu <span className="text-error">*</span></label>
                      <select 
                        className="w-full p-3 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary bg-surface"
                        value={materialType} 
                        onChange={e => setMaterialType(e.target.value)}
                      >
                        <option value="REFERENCE">Tài liệu tham khảo (Gia sư/Mentor tải lên)</option>
                        <option value="OFFICIAL">Tài liệu chính thức (Sách giáo khoa, Giáo trình hệ thống)</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">File đính kèm (PDF, DOCX, PNG...) <span className="text-error">*</span></label>
                    <input type="file" className="w-full p-3 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary" onChange={e => setMaterialFile(e.target.files ? e.target.files[0] : null)} />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => { setShowMaterialForm(false); setMaterialType('REFERENCE'); }} className="px-5 py-2.5 text-sm font-medium border border-outline-variant rounded-xl hover:bg-surface-container" disabled={uploadingMaterial}>Hủy</button>
                    <button onClick={submitMaterial} className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 shadow flex items-center gap-2" disabled={uploadingMaterial}>
                      {uploadingMaterial && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                      {uploadingMaterial ? 'Đang tải lên...' : 'Xác nhận tải lên'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Giáo trình & Sách giáo khoa chính thức */}
              <div className="space-y-4">
                <h4 className="text-md font-bold text-primary flex items-center gap-2 pb-2 border-b border-outline-variant">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  Giáo trình chính thức
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {materials.filter(m => m.materialType === 'OFFICIAL').length}
                  </span>
                </h4>
                <div className="space-y-3">
                  {materials.filter(m => m.materialType === 'OFFICIAL').length === 0 ? (
                    <div className="text-center text-sm text-on-surface-variant italic py-8 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
                      Chưa có giáo trình chính thức nào.
                    </div>
                  ) : (
                    materials.filter(m => m.materialType === 'OFFICIAL').map((mat) => (
                      <div key={mat.id} className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">
                              {mat.fileType === 'pdf' ? 'picture_as_pdf' : mat.fileType === 'docx' || mat.fileType === 'doc' ? 'description' : 'insert_drive_file'}
                            </span>
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-sm text-on-surface truncate" title={mat.title}>{mat.title}</h4>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span> {mat.uploaderName}
                              <span className="mx-1">•</span>
                              {new Date(mat.uploadedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <a href={mat.fileUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full hover:bg-primary/20 text-primary flex items-center justify-center transition-colors tooltip" title="Xem file">
                            <span className="material-symbols-outlined">download</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Tài liệu tham khảo */}
              <div className="space-y-4">
                <h4 className="text-md font-bold text-on-surface-variant flex items-center gap-2 pb-2 border-b border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface-variant">description</span>
                  Tài liệu tham khảo
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                    {materials.filter(m => m.materialType !== 'OFFICIAL').length}
                  </span>
                </h4>
                <div className="space-y-3">
                  {materials.filter(m => m.materialType !== 'OFFICIAL').length === 0 ? (
                    <div className="text-center text-sm text-on-surface-variant italic py-8 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
                      Chưa có tài liệu tham khảo nào.
                    </div>
                  ) : (
                    materials.filter(m => m.materialType !== 'OFFICIAL').map((mat) => (
                      <div key={mat.id} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">
                              {mat.fileType === 'pdf' ? 'picture_as_pdf' : mat.fileType === 'docx' || mat.fileType === 'doc' ? 'description' : 'insert_drive_file'}
                            </span>
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-sm text-on-surface truncate" title={mat.title}>{mat.title}</h4>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[14px]">account_circle</span> {mat.uploaderName}
                              <span className="mx-1">•</span>
                              {new Date(mat.uploadedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <a href={mat.fileUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full hover:bg-on-surface/10 text-on-surface flex items-center justify-center transition-colors tooltip" title="Xem file">
                            <span className="material-symbols-outlined">download</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'BILLING' && (
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              Quản lý học phí
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant text-center">
                <p className="text-sm font-medium text-on-surface-variant mb-2">Số buổi đã dạy</p>
                <p className="text-3xl font-bold text-on-surface">{logs.length}</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant text-center">
                <p className="text-sm font-medium text-on-surface-variant mb-2">Học phí / Buổi</p>
                <p className="text-xl font-bold text-on-surface">{session.pricePerSession?.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 text-center shadow-inner">
                <p className="text-sm font-bold text-primary mb-2">Tạm tính cần thanh toán</p>
                <p className="text-3xl font-black text-primary">{(logs.length * (session.pricePerSession || 0)).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            <div className="text-center p-6 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant text-sm text-on-surface-variant">
              {session.status === 'TRIAL' ? (
                isParent ? (
                  <div className="space-y-4">
                    <p className="font-medium text-on-surface">Sau khi hoàn thành học thử, hãy Xác nhận thuê gia sư và thanh toán để tiếp tục quá trình học tập chính thức.</p>
                    <button 
                      onClick={handleConfirmHire}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-sm hover:bg-primary/90 flex items-center justify-center gap-2 mx-auto"
                    >
                      <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                      Xác nhận thuê & Thanh toán
                    </button>
                  </div>
                ) : (
                  <p>Lớp học đang trong thời gian học thử. Phụ huynh sẽ tiến hành thanh toán sau khi chốt thuê.</p>
                )
              ) : session.status === 'PENDING_PAYMENT' ? (
                <div className="space-y-4">
                  <p className="font-bold text-amber-600">Đang chờ phụ huynh thanh toán học phí...</p>
                  {isParent && (
                    <button 
                      onClick={handleConfirmHire}
                      className="px-6 py-2 border border-primary text-primary rounded-xl font-bold hover:bg-primary/10 transition-colors"
                    >
                      Mở lại mã QR thanh toán
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-green-600 font-bold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-green-600">verified</span>
                  Đã thanh toán thành công. Lớp học chính thức diễn ra!
                </p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="text-xl font-bold text-on-surface">Thanh toán & Chốt thuê</h3>
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
                  <p className="text-on-surface-variant">Cảm ơn bạn đã lựa chọn gia sư của StudyHub. Lớp học đã được chuyển sang trạng thái Chính thức.</p>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow hover:bg-primary/90 w-full"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-on-surface-variant text-sm mb-1">Quét mã VietQR bằng App ngân hàng để thanh toán</p>
                    <p className="text-primary font-black text-2xl">{session.pricePerSession?.toLocaleString('vi-VN')}đ</p>

                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-inner border border-outline-variant mb-6 relative">
                    <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center pointer-events-none rounded-2xl opacity-0 transition-opacity"></div>
                  </div>
                  
                  <div className="w-full bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-2 text-sm text-left mb-6">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-medium">Nội dung chuyển khoản:</span>
                      <span className="font-bold text-on-surface select-all">{transactionCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-medium">Trạng thái:</span>
                      <span className="font-bold text-amber-600 flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                        Đang chờ thanh toán...
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center text-on-surface-variant/70">
                    Hệ thống đang liên tục kiểm tra tài khoản (Polling).<br/>Cửa sổ này sẽ tự động chuyển sang Thành công khi nhận được tiền.
                  </p>

                  <button
                    onClick={async () => {
                      if (!window.confirm("Bấm OK để mô phỏng thanh toán thành công cho lớp học này (chế độ Test)?")) return;
                      try {
                        const res = await apiFetch(`/payment/mock-pay/${transactionCode}`, { method: 'POST' });
                        if (res.ok) {
                          setPaymentStatus('SUCCESS');
                          setSession((prev: any) => ({ ...prev, status: 'CONFIRMED' }));
                        } else {
                          const data = await res.json();
                          alert('Lỗi khi giả lập thanh toán: ' + (data.error || 'Lỗi không xác định'));
                        }
                      } catch (err) {
                        alert('Không thể kết nối máy chủ để giả lập thanh toán.');
                      }
                    }}
                    className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">bug_report</span>
                    Xác thực nhanh (Test Demo)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Session View Modal */}
      {isSyllabusModalOpen && selectedSyllabusSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">Buổi {selectedSyllabusSession.sessionNumber}</span>
                Chi tiết kế hoạch bài học
              </h3>
              <button onClick={() => setIsSyllabusModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Tên bài học</span>
                <h4 className="text-base font-bold text-on-surface">{selectedSyllabusSession.title}</h4>
              </div>

              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Nội dung giảng dạy</span>
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
                  {selectedSyllabusSession.content}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Kiến thức trọng tâm</span>
                  <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line">
                    {selectedSyllabusSession.keyKnowledge || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                  <span className="text-xs font-bold text-green-800 uppercase tracking-wider block mb-1">Kết quả đầu ra</span>
                  <p className="text-xs text-green-900 leading-relaxed whitespace-pre-line">
                    {selectedSyllabusSession.expectedOutcome || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-on-surface-variant pt-2 border-t border-outline-variant/30">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>Ngày học dự kiến: <strong>{new Date(selectedSyllabusSession.scheduledDate).toLocaleDateString('vi-VN')}</strong></span>
              </div>
            </div>
            
            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant flex justify-end">
              <button onClick={() => setIsSyllabusModalOpen(false)} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Session Edit/Create Modal (Tutor only) */}
      {isSyllabusEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="text-base font-bold text-on-surface">
                {editingSessionIndex !== null ? `Chỉnh sửa buổi học số ${editingSessionIndex + 1}` : 'Thiết lập buổi học dự kiến mới'}
              </h3>
              <button onClick={() => setIsSyllabusEditModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Tên bài học <span className="text-error">*</span></label>
                <input
                  type="text"
                  placeholder="VD: Ôn tập Tích phân cơ bản"
                  className="w-full p-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary"
                  value={newSyllabusSession.title}
                  onChange={e => setNewSyllabusSession({ ...newSyllabusSession, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Nội dung bài học <span className="text-error">*</span></label>
                <textarea
                  placeholder="Mô tả chi tiết những gì học sinh sẽ được học..."
                  className="w-full p-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary h-24"
                  value={newSyllabusSession.content}
                  onChange={e => setNewSyllabusSession({ ...newSyllabusSession, content: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Kiến thức trọng tâm (Đầu mục)</label>
                <textarea
                  placeholder="Các công thức hoặc lý thuyết chính cần nhớ..."
                  className="w-full p-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary h-16"
                  value={newSyllabusSession.keyKnowledge}
                  onChange={e => setNewSyllabusSession({ ...newSyllabusSession, keyKnowledge: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Kết quả đầu ra</label>
                <input
                  type="text"
                  placeholder="Học sinh làm được dạng bài tập nào..."
                  className="w-full p-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary"
                  value={newSyllabusSession.expectedOutcome}
                  onChange={e => setNewSyllabusSession({ ...newSyllabusSession, expectedOutcome: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Ngày dạy dự kiến <span className="text-error">*</span></label>
                <input
                  type="date"
                  className="w-full p-3 border border-outline-variant rounded-xl text-sm bg-surface outline-none focus:border-primary"
                  value={newSyllabusSession.scheduledDate}
                  onChange={e => setNewSyllabusSession({ ...newSyllabusSession, scheduledDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant flex justify-end gap-3">
              <button
                onClick={() => setIsSyllabusEditModalOpen(false)}
                className="px-5 py-2 text-sm font-medium border border-outline-variant rounded-xl hover:bg-surface-container"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSyllabusSession}
                className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 shadow"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      <LessonFeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => { setIsFeedbackModalOpen(false); setSelectedLogForFeedback(null); }}
        onSubmit={handleSubmitFeedback}
        lessonTitle={selectedLogForFeedback ? selectedLogForFeedback.title : ''}
      />
    </div>
  );
};

export default ClassWorkspace;
