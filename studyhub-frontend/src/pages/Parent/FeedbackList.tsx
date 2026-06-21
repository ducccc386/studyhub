import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import LessonFeedbackModal from '../../components/LessonFeedbackModal';

interface LessonLogDTO {
  id: number;
  classSessionId: number;
  className: string;
  tutorName: string;
  tutorAvatar: string;
  title: string;
  content: string;
  tutorFeedback: string;
  scheduledDate: string;
  parentApprovalStatus: string;
  parentRating: number | null;
  parentFeedback: string | null;
  parentFeedbackTags: string | null;
}

const FeedbackList: React.FC = () => {
  const { userId } = useAuth();
  const [pendingLogs, setPendingLogs] = useState<LessonLogDTO[]>([]);
  const [reviewedLogs, setReviewedLogs] = useState<LessonLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LessonLogDTO | null>(null);

  const fetchData = async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const [pendingRes, reviewedRes] = await Promise.all([
        apiFetch(`/lesson-logs/parent/${userId}/pending`),
        apiFetch(`/lesson-logs/parent/${userId}/reviewed`),
      ]);
      setPendingLogs(pendingRes.ok ? await pendingRes.json() : []);
      setReviewedLogs(reviewedRes.ok ? await reviewedRes.json() : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleSubmitFeedback = async (data: { status: string; rating: number; feedback: string; tags: string }) => {
    if (!selectedLog) return;
    try {
      const res = await apiFetch(`/lesson-logs/${selectedLog.id}/parent-confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsFeedbackModalOpen(false);
        setSelectedLog(null);
        await fetchData();
        alert('Cảm ơn bạn đã gửi đánh giá!');
      }
    } catch (e) {
      alert('Lỗi kết nối.');
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl text-on-surface mb-2">Đánh giá & Phản hồi</h1>
        <p className="font-normal text-lg text-on-surface-variant">Xác nhận buổi học và chia sẻ trải nghiệm với Gia sư của bạn.</p>
      </div>

      {/* Pending Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-amber-500">pending_actions</span>
          <h2 className="font-semibold text-xl text-on-surface">Buổi học chờ xác nhận ({pendingLogs.length})</h2>
        </div>
        {pendingLogs.length === 0 ? (
          <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block mb-3 text-outline-variant">task_alt</span>
            Tất cả buổi học đã được xác nhận.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingLogs.map((log) => (
              <div key={log.id} className="bg-white border border-amber-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <img
                    src={log.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.tutorName || 'T')}&background=random`}
                    alt={log.tutorName}
                    className="w-11 h-11 rounded-full object-cover border border-outline-variant shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-on-surface truncate">{log.tutorName}</p>
                    <p className="text-xs text-on-surface-variant truncate">{log.className}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="font-semibold text-sm text-amber-900 mb-1">{log.title}</p>
                  <p className="text-xs text-amber-700 line-clamp-2">{log.content}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {new Date(log.scheduledDate).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">Chờ xác nhận</span>
                </div>

                <button
                  onClick={() => { setSelectedLog(log); setIsFeedbackModalOpen(true); }}
                  className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow"
                >
                  <span className="material-symbols-outlined text-[18px]">draw</span>
                  Xác nhận & Đánh giá
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviewed History Section */}
      <section>
        <div className="flex items-center gap-2 mb-5 border-t border-outline-variant pt-6">
          <span className="material-symbols-outlined text-primary">history</span>
          <h2 className="font-semibold text-xl text-on-surface">Đánh giá đã gửi ({reviewedLogs.length})</h2>
        </div>
        {reviewedLogs.length === 0 ? (
          <div className="text-center py-10 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block mb-3 text-outline-variant">rate_review</span>
            Bạn chưa gửi đánh giá nào.
          </div>
        ) : (
          <div className="space-y-4">
            {reviewedLogs.map((log) => (
              <div key={log.id} className={`border rounded-2xl p-5 flex flex-col md:flex-row gap-5 ${log.parentApprovalStatus === 'DISPUTED' ? 'border-error/30 bg-error/5' : 'border-green-200 bg-green-50/50'}`}>
                {/* Tutor info */}
                <div className="md:w-1/5 flex flex-col items-start gap-2">
                  <img
                    src={log.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.tutorName || 'T')}&background=random`}
                    alt={log.tutorName}
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                  />
                  <p className="font-bold text-sm text-on-surface">{log.tutorName}</p>
                  <p className="text-xs text-on-surface-variant">{log.className}</p>
                  {renderStars(log.parentRating)}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${log.parentApprovalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-error/10 text-error'}`}>
                    {log.parentApprovalStatus === 'APPROVED' ? '✓ Đã xác nhận' : '⚠ Khiếu nại'}
                  </span>
                </div>

                {/* Content */}
                <div className="md:w-4/5 flex flex-col gap-2">
                  <p className="font-semibold text-sm text-on-surface">{log.title}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(log.scheduledDate).toLocaleDateString('vi-VN')}</p>
                  {log.parentFeedbackTags && (
                    <div className="flex flex-wrap gap-1">
                      {log.parentFeedbackTags.split(',').map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-outline-variant rounded-full text-[11px] text-on-surface-variant">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                  {log.parentFeedback && (
                    <p className="text-sm text-on-surface italic leading-relaxed">"{log.parentFeedback}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <LessonFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => { setIsFeedbackModalOpen(false); setSelectedLog(null); }}
        onSubmit={handleSubmitFeedback}
        lessonTitle={selectedLog ? selectedLog.title : ''}
      />
    </div>
  );
};

export default FeedbackList;
