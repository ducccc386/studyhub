import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';


const LEARNING_MODES = [
  { value: 'ONLINE', label: 'Online', icon: 'videocam' },
  { value: 'OFFLINE', label: 'Offline', icon: 'location_on' },
  { value: 'BOTH', label: 'Cả hai', icon: 'devices' },
];

const CLASS_LEVELS = [
  { group: 'Tiểu học', options: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'] },
  { group: 'Trung học cơ sở', options: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'] },
  { group: 'Trung học phổ thông', options: ['Lớp 10', 'Lớp 11', 'Lớp 12'] },
];

const CreatePost: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [learningMode, setLearningMode] = useState<'ONLINE' | 'OFFLINE' | 'BOTH'>('OFFLINE');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [sessionTime, setSessionTime] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [req, setReq] = useState('');
  const [studentName, setStudentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch(`/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => {});

    if (userId) {
      apiFetch(`/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.childrenName) setStudentName(data.childrenName);
        })
        .catch(() => {});
    }
  }, [userId]);

  const validatePrice = (val: string) => {
    const n = parseInt(val.replace(/,/g, ''), 10);
    if (!val) { setPriceError(''); return; }
    if (isNaN(n)) { setPriceError('Vui lòng nhập số'); return; }
    if (n < 50000) { setPriceError('Tối thiểu 50,000 VNĐ'); return; }
    if (n > 1000000) { setPriceError('Tối đa 1,000,000 VNĐ'); return; }
    setPriceError('');
  };

  const handlePriceChange = (val: string) => {
    setPrice(val);
    validatePrice(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { alert('Vui lòng đăng nhập lại!'); return; }
    if (!subject) { alert('Vui lòng chọn môn học'); return; }
    if (!classLevel) { alert('Vui lòng chọn lớp'); return; }
    if (!price) { alert('Vui lòng nhập mức lương'); return; }
    if (priceError) { alert(priceError); return; }

    const priceNum = parseInt(price.replace(/,/g, ''), 10);

    // Build schedule string from selected days + time
    const DAY_LABELS: Record<string, string> = {
      'T2': 'Thứ 2', 'T3': 'Thứ 3', 'T4': 'Thứ 4',
      'T5': 'Thứ 5', 'T6': 'Thứ 6', 'T7': 'Thứ 7', 'CN': 'Chủ nhật'
    };
    const scheduleStr = selectedDays.length > 0
      ? `${selectedDays.map(d => DAY_LABELS[d]).join(', ')}${sessionTime ? ` - ${sessionTime}` : ''}`
      : '';

    const newPost = {
      title: `Tìm gia sư ${subject} - ${classLevel}`,
      subject,
      classLevel,
      description: req || `Cần tìm gia sư môn ${subject} cho học sinh ${classLevel}.`,
      status: 'RECRUITING',
      location: learningMode !== 'ONLINE' ? city : 'Học Online',
      detailedAddress: learningMode !== 'ONLINE' ? detailedAddress : '',
      schedule: scheduleStr,
      pricePerSession: priceNum,
      learningMode,
      requirement: req,
      studentName,
    };

    setSubmitting(true);
    try {
      const res = await apiFetch(`/posts?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        alert('Đăng tin thành công! Gia sư có thể xem và ứng tuyển ngay bây giờ.');
        navigate('/parent/posts');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  const needsAddress = learningMode !== 'ONLINE';

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="font-bold text-3xl text-on-surface mb-2">Đăng tin tuyển dụng</h1>
        <p className="font-normal text-base text-on-surface-variant max-w-2xl">
          Tìm kiếm gia sư phù hợp nhất cho con của bạn bằng cách điền chi tiết yêu cầu bên dưới.
          Tin tuyển dụng sẽ được hiển thị ngay sau khi đăng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm flex flex-col gap-7">

            {/* Tên của con */}
            <div className="space-y-2">
              <label className="font-semibold text-sm text-on-surface block">Tên học sinh (các con) <span className="text-error">*</span></label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                required
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
              />
            </div>

            {/* Row 1: Môn học + Lớp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold text-sm text-on-surface block">Môn học <span className="text-error">*</span></label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-3 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                  >
                    <option value="" disabled>Chọn môn học</option>
                    {subjects.length > 0
                      ? subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                      : ['Toán học','Ngữ văn','Tiếng Anh','Vật lý','Hóa học','Sinh học','Lịch sử','Địa lý','Tin học'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))
                    }
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm text-on-surface block">Lớp <span className="text-error">*</span></label>
                <div className="relative">
                  <select
                    value={classLevel}
                    onChange={e => setClassLevel(e.target.value)}
                    required
                    className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-3 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                  >
                    <option value="" disabled>Chọn lớp</option>
                    {CLASS_LEVELS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Row 2: Hình thức học + Mức lương */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold text-sm text-on-surface block">Hình thức học <span className="text-error">*</span></label>
                <div className="flex gap-2">
                  {LEARNING_MODES.map(m => (
                    <label key={m.value} className="flex-1 cursor-pointer">
                      <input
                        className="peer hidden"
                        type="radio"
                        name="learningMode"
                        value={m.value}
                        checked={learningMode === m.value}
                        onChange={() => setLearningMode(m.value as any)}
                      />
                      <div className="flex flex-col items-center justify-center gap-1 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface-variant peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all text-xs font-semibold">
                        <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                        {m.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm text-on-surface block">
                  Mức lương đề xuất (VNĐ/ca) <span className="text-error">*</span>
                </label>
                <input
                  value={price}
                  onChange={e => handlePriceChange(e.target.value)}
                  className={`w-full bg-surface border rounded-lg px-4 py-3 focus:ring-2 outline-none transition-all text-base ${priceError ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                  placeholder="Ví dụ: 200000"
                  type="number"
                  min="50000"
                  max="1000000"
                  step="10000"
                />
                {priceError
                  ? <p className="text-xs text-error mt-1">{priceError}</p>
                  : <p className="text-xs text-on-surface-variant mt-1">Từ 50,000 đến 1,000,000 VNĐ/ca</p>
                }
              </div>
            </div>

            {/* Row 3: Lịch học */}
            <div className="space-y-3">
              <label className="font-semibold text-sm text-on-surface block">
                Lịch học <span className="text-on-surface-variant font-normal">(chọn các ngày trong tuần)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const).map(day => (
                  <label key={day} className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="peer hidden"
                      checked={selectedDays.includes(day)}
                      onChange={() => {
                        setSelectedDays(prev =>
                          prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                        );
                      }}
                    />
                    <div className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all select-none">
                      {day}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">schedule</span>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={e => setSessionTime(e.target.value)}
                  className="bg-surface border border-outline-variant rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                  placeholder="Giờ bắt đầu"
                />
                <span className="text-sm text-on-surface-variant">Giờ bắt đầu buổi học</span>
              </div>
              {(selectedDays.length > 0 || sessionTime) && (
                <p className="text-sm text-primary font-medium bg-primary/5 px-3 py-2 rounded-lg border border-primary/20">
                  Lịch: {selectedDays.join(', ')}{sessionTime ? ` — ${sessionTime}` : ''}
                </p>
              )}
            </div>

            {/* Row 4: Địa chỉ — chỉ hiện khi cần */}
            {needsAddress && (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-on-surface block">Thành phố</label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-3 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                    >
                      <option>Hà Nội</option>
                      <option>TP. Hồ Chí Minh</option>
                      <option>Đà Nẵng</option>
                      <option>Cần Thơ</option>
                      <option>Hải Phòng</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-on-surface block">Địa chỉ chi tiết</label>
                  <input
                    value={detailedAddress}
                    onChange={e => setDetailedAddress(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                    placeholder="Số nhà, tên đường..."
                    type="text"
                  />
                </div>
              </div>
            )}

            {/* Row 4: Yêu cầu đặc biệt */}
            <div className="space-y-2">
              <label className="font-semibold text-sm text-on-surface block">Yêu cầu đặc biệt</label>
              <textarea
                value={req}
                onChange={e => setReq(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base resize-none"
                placeholder="Ví dụ: Cần gia sư nữ, sinh viên trường Ngoại Thương, có kinh nghiệm dạy trẻ tự kỷ..."
                rows={4}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !!priceError}
                className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    Đăng tin tuyển dụng
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar tips */}
        <div className="space-y-6">
          <div className="bg-primary text-white p-8 rounded-2xl overflow-hidden relative">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-80">tips_and_updates</span>
              <h3 className="font-semibold text-xl mb-3">Mẹo tìm gia sư</h3>
              <ul className="space-y-3 text-sm opacity-90">
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                  <span>Mô tả chi tiết năng lực học tập hiện tại của học sinh.</span>
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                  <span>Đặt mức lương cạnh tranh để thu hút gia sư giỏi.</span>
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                  <span>Xác định rõ mục tiêu cuối cùng (ví dụ: thi đại học).</span>
                </li>
              </ul>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl">
            <h4 className="font-semibold text-sm mb-4 text-on-surface">Thống kê thị trường</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <p className="font-medium text-xs text-on-surface-variant">Lương trung bình Toán 12</p>
                <p className="font-semibold text-xl text-secondary">250,000đ <span className="text-xs font-normal">/ ca</span></p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <p className="font-medium text-xs text-on-surface-variant">Gia sư đang sẵn sàng</p>
                <p className="font-semibold text-xl text-secondary">1,240+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
