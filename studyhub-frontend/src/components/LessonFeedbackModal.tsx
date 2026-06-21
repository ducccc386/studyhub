import React, { useState } from 'react';

interface LessonFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { status: string; rating: number; feedback: string; tags: string }) => void;
  lessonTitle: string;
}

const PREDEFINED_TAGS = [
  "Đúng giờ",
  "Giảng bài dễ hiểu",
  "Nhiệt tình",
  "Giao bài tập đầy đủ",
  "Tương tác tốt với học sinh",
  "Chưa đúng giờ"
];

const LessonFeedbackModal: React.FC<LessonFeedbackModalProps> = ({ isOpen, onClose, onSubmit, lessonTitle }) => {
  const [status, setStatus] = useState<'APPROVED' | 'DISPUTED'>('APPROVED');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      status,
      rating,
      feedback,
      tags: selectedTags.join(', ')
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">verified</span>
            Xác nhận buổi học
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
            <p className="text-sm font-semibold text-primary">Bài học: {lessonTitle}</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-on-surface">Trạng thái buổi học</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all font-medium text-sm
                ${status === 'APPROVED' ? 'bg-green-50 border-green-500 text-green-700' : 'border-outline-variant text-on-surface hover:bg-surface-container'}`}
              >
                <input type="radio" name="status" value="APPROVED" checked={status === 'APPROVED'} onChange={() => setStatus('APPROVED')} className="hidden" />
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Đồng ý đã học
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all font-medium text-sm
                ${status === 'DISPUTED' ? 'bg-error/10 border-error text-error' : 'border-outline-variant text-on-surface hover:bg-surface-container'}`}
              >
                <input type="radio" name="status" value="DISPUTED" checked={status === 'DISPUTED'} onChange={() => setStatus('DISPUTED')} className="hidden" />
                <span className="material-symbols-outlined text-[20px]">report_problem</span>
                Khiếu nại / Vấn đề
              </label>
            </div>
            {status === 'DISPUTED' && (
              <p className="text-xs text-error italic">Quản trị viên sẽ được thông báo để xử lý khiếu nại này.</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-on-surface">Đánh giá Gia sư</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 outline-none"
                >
                  <span className={`material-symbols-outlined text-3xl ${star <= rating ? 'text-amber-400 fill-amber-400 icon-filled' : 'text-outline-variant'}`}>
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-on-surface">Đánh giá nhanh</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                    ${selectedTags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-on-surface">Nhận xét chi tiết</label>
            <textarea 
              className="w-full p-4 border border-outline-variant rounded-xl text-sm min-h-[100px] outline-none focus:border-primary"
              placeholder={status === 'APPROVED' ? "Mức độ hiểu bài của con, sự nhiệt tình của gia sư..." : "Vui lòng mô tả rõ vấn đề bạn gặp phải..."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium border border-outline-variant rounded-xl hover:bg-surface-container transition-colors">
            Hủy
          </button>
          <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 shadow transition-colors">
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonFeedbackModal;
