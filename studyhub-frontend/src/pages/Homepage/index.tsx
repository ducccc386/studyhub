import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomSelect from '../../components/CustomSelect';
import { ClassDto } from '../../types/class';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hana-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { url?: string; style?: React.CSSProperties };
    }
  }
}

const STATS = [
  { value: '12,000+', label: 'Lớp đã kết nối', icon: 'school', color: 'from-blue-500 to-indigo-600' },
  { value: '3,500+', label: 'Gia sư xác thực', icon: 'verified', color: 'from-emerald-500 to-teal-600' },
  { value: '98%', label: 'Tỷ lệ hài lòng', icon: 'thumb_up', color: 'from-violet-500 to-purple-600' },
  { value: '500+', label: 'Lớp mới mỗi ngày', icon: 'trending_up', color: 'from-orange-500 to-rose-500' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Đăng bài tìm gia sư',
    desc: 'Mô tả môn học, lịch học, học phí mong muốn. Hệ thống gợi ý gia sư phù hợp ngay lập tức.',
    icon: 'post_add',
    gradient: 'from-blue-100 to-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    step: '02',
    title: 'Duyệt & Chọn gia sư',
    desc: 'Xem hồ sơ, bằng cấp đã xác thực eKYC, đánh giá từ phụ huynh khác và mời dạy thử miễn phí.',
    icon: 'person_search',
    gradient: 'from-emerald-100 to-teal-100',
    iconColor: 'text-emerald-600',
  },
  {
    step: '03',
    title: 'Học thử & Chốt lớp',
    desc: 'Buổi học thử hoàn toàn miễn phí. Nếu hài lòng mới chốt lớp, an toàn cho cả hai bên.',
    icon: 'fact_check',
    gradient: 'from-violet-100 to-purple-100',
    iconColor: 'text-violet-600',
  },
];

import { TestimonialDto } from '../../types/testimonial';
import { useNavigate } from 'react-router-dom';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [classesToShow, setClassesToShow] = useState<ClassDto[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialDto[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [hanaReady, setHanaReady] = useState(false);

  useEffect(() => {
    // Delay rendering hana-viewer slightly to allow route transitions
    // and navbar animations to finish smoothly without main thread blocking.
    const timer = setTimeout(() => {
      if (customElements.get('hana-viewer')) {
        setHanaReady(true);
        return;
      }
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://cdn.spline.design/@splinetool/hana-viewer@1.2.54/hana-viewer.js';
      script.onload = () => setHanaReady(true);
      document.head.appendChild(script);
    }, 400); // 400ms delay gives enough time for 200ms-300ms CSS transitions to finish

    // Fetch featured courses
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/courses/featured`)
      .then(res => res.json())
      .then(data => {
        setClassesToShow(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Failed to fetch featured courses:', err));

    // Fetch featured testimonials
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/testimonials/featured`)
      .then(res => res.json())
      .then(data => {
        setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Failed to fetch featured testimonials:', err));

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#f7f9ff] text-on-background overflow-x-hidden">
      <main>

        {/* ===== HERO SECTION ===== */}
        <section className="relative pt-[120px] pb-24 flex justify-center">
          {/* Background blobs and 3D Spline */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Gradient background — shows instantly while 3D loads */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] via-[#f7f9ff] to-[#f0f9ff]" />
            <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-indigo-300/20 blur-[120px]" />
            <div className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-secondary/20 to-teal-300/20 blur-[100px]" />



            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          </div>

          <div className="relative z-10 px-6 md:px-16 w-full max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center">
              {/* LEFT TEXT */}
              <div className="w-full max-w-4xl text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white border border-primary/20 rounded-full px-4 py-2 mb-8 shadow-sm animate-scale-in">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-primary text-sm font-semibold">Nền tảng eKYC giáo dục tiên phong Việt Nam</span>
                </div>

                <h1 className="font-extrabold text-[52px] md:text-[64px] leading-[1.05] text-[#0f172a] mb-6 animate-slide-up opacity-0 stagger-1">
                  Tìm{' '}
                  <span className="relative inline-block">
                    <span className="shimmer-text">gia sư tận tâm</span>
                  </span>
                  <br />
                  chỉ trong vài phút
                </h1>

                <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto animate-slide-up opacity-0 stagger-2 leading-relaxed">
                  Kết nối với hàng nghìn gia sư đã được xác thực danh tính và chuyên môn. Học thử miễn phí, an tâm tuyệt đối.
                </p>

                {/* Search Bar */}
                <div className="relative z-20 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,61,155,0.12)] p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto border border-white/80 animate-slide-up opacity-0 stagger-3">
                  {/* Keyword input */}
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b sm:border-b-0 sm:border-r border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-[20px] shrink-0">search</span>
                    <input
                      className="w-full bg-transparent border-none outline-none text-sm placeholder:text-slate-400 text-slate-700"
                      placeholder="Môn học, từ khóa..."
                      type="text"
                      value={keyword}
                      onChange={e => setKeyword(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                           navigate(`/tutors?keyword=${encodeURIComponent(keyword)}`);
                        }
                      }}
                    />
                  </div>
                  {/* Location selector */}
                  <CustomSelect
                    options={[
                      { value: '', label: 'Khu vực học' },
                      { value: 'hcm', label: 'TP. Hồ Chí Minh' },
                      { value: 'hn', label: 'Hà Nội' },
                      { value: 'dn', label: 'Đà Nẵng' },
                    ]}
                    value={searchLocation}
                    onChange={setSearchLocation}
                    icon="location_on"
                    placeholder="Khu vực"
                    className="sm:w-[160px]"
                  />
                  {/* Search button */}
                  <button 
                    onClick={() => navigate(`/tutors?keyword=${encodeURIComponent(keyword)}`)}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    Tìm ngay
                  </button>
                </div>

                {/* Quick tags */}
                <div className="relative z-10 flex flex-wrap gap-2 mt-5 justify-center animate-slide-up opacity-0 stagger-4">
                  <span className="text-sm text-slate-400">Phổ biến:</span>
                  {['Toán lớp 10', 'IELTS 6.5', 'Luyện thi ĐH', 'Tiếng Anh'].map(tag => (
                    <button key={tag} className="px-3 py-1 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-full text-xs font-medium text-slate-500 transition-all shadow-sm hover:shadow">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== STATS ROW ===== */}
        <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-slide-up opacity-0 stagger-${idx + 1} group`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <p className="text-3xl font-extrabold text-[#0f172a] mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="px-6 md:px-16 pt-20 pb-0 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Cách hoạt động
            </span>
            <h2 className="text-4xl font-extrabold text-[#0f172a] leading-tight">Đơn giản · Nhanh chóng · An toàn</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed">
              Từ đăng bài đến buổi học đầu tiên, quy trình được tối ưu để mang lại trải nghiệm tuyệt vời nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-indigo-200 via-teal-200 to-violet-200 z-0" />

            {HOW_IT_WORKS.map((step, idx) => (
              <div
                key={idx}
                className={`relative z-10 bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group animate-slide-up opacity-0 stagger-${idx + 1}`}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 relative shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  <span className={`material-symbols-outlined ${step.iconColor} text-[36px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-md">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* 3D Spline Design */}
          <div className="mt-8 w-full h-[400px] md:h-[500px] flex justify-center items-center relative z-10 animate-slide-up opacity-0 stagger-4 -mb-10 md:-mb-20 overflow-hidden group">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%]">
              {hanaReady && (
                <hana-viewer url="https://prod.spline.design/XstVPGIkuMmDC1wd-wP4/scene.hanacode" style={{ width: '100%', height: '100%' }}></hana-viewer>
              )}
            </div>
            
            {/* Overlay to fade bottom edge */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f7f9ff] via-[#f7f9ff]/80 to-transparent pointer-events-none z-20" />
          </div>
        </section>

        {/* ===== CLASS LIST SECTION ===== */}
        <section className="px-6 md:px-16 pt-32 pb-20 bg-white relative">
          {/* Smooth gradient transition at the top of the white section */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f7f9ff] to-white pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-bold px-4 py-1.5 rounded-full mb-3 border border-emerald-100">
                  ✦ Mới cập nhật
                </span>
                <h2 className="text-4xl font-extrabold text-[#0f172a]">Lớp học nổi bật</h2>
              </div>
              <Link to="/classes" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20">
                Xem tất cả
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {classesToShow.map((cls, idx) => (
                <div
                  key={cls.id}
                  className={`bg-white rounded-3xl border border-slate-100 overflow-hidden group hover:shadow-[0_20px_60px_-10px_rgba(0,61,155,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col animate-slide-up opacity-0 stagger-${idx + 1} shadow-sm`}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img alt={cls.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={cls.image} loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
                      {cls.price}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-amber-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-slate-700">{cls.rating}</span>
                      {cls.reviewCount !== undefined && (
                        <span className="text-xs text-slate-500">({cls.reviewCount})</span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-[#0f172a] mb-2 line-clamp-2 group-hover:text-primary transition-colors">{cls.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-5 leading-relaxed">{cls.description}</p>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="material-symbols-outlined text-[16px] text-primary">{cls.locationType === 'Offline' ? 'location_on' : 'laptop_mac'}</span>
                        {cls.location}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                        {cls.schedule}
                      </div>
                    </div>

                    {/* Tutor row */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-5">
                      <img src={cls.tutorAvatar} alt="Tutor" className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow" loading="lazy" decoding="async" />
                      <div>
                        <p className="text-xs font-bold text-[#0f172a]">{cls.tutorName}</p>
                        <p className="text-xs text-slate-400">{cls.tutorDesc}</p>
                      </div>
                    </div>

                    <Link
                      to={`/classes/${cls.id}`}
                      className="mt-auto block text-center w-full bg-primary/8 hover:bg-primary text-primary hover:text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 active:scale-[0.98] border border-primary/20 hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                    >
                      Chi tiết lớp học
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-bold uppercase tracking-widest mb-3 block">Đánh giá thực tế</span>
            <h2 className="text-4xl font-extrabold text-[#0f172a]">Phụ huynh & Gia sư nói gì?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up opacity-0 stagger-${idx + 1} relative overflow-hidden shadow-sm`}
              >
                <div className="absolute top-6 right-8 text-7xl text-primary/8 font-serif select-none">"</div>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-amber-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-slate-600 italic leading-relaxed mb-6 text-[15px]">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" loading="lazy" decoding="async" />
                  <div>
                    <p className="font-bold text-[#0f172a] text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary via-[#0052cc] to-indigo-700 rounded-[2.5rem] p-12 md:p-16 overflow-hidden shadow-[0_30px_80px_-10px_rgba(0,61,155,0.4)]">
            {/* Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="text-center lg:text-left max-w-xl flex-1">
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white/90 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  Dành riêng cho gia sư
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                  Biến kiến thức của bạn<br />thành thu nhập bền vững
                </h2>
                <p className="text-white/75 leading-relaxed mb-8 text-[15px]">
                  Gia nhập mạng lưới 3,500+ gia sư ưu tú. Quản lý lớp học thông minh, thu nhập minh bạch và nhận hỗ trợ 24/7 từ StudyHub.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Đăng ký trở thành gia sư
                  </button>
                  <button className="bg-white/10 border-2 border-white/25 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300 active:scale-95">
                    Tìm hiểu chính sách
                  </button>
                </div>
              </div>

              <div className="shrink-0 w-full lg:w-auto flex flex-col gap-4">
                {[
                  { icon: 'verified_user', title: 'Hồ sơ chuyên nghiệp', desc: 'Xác thực eKYC nâng cao uy tín' },
                  { icon: 'calendar_clock', title: 'Lịch dạy linh hoạt', desc: 'Hoàn toàn chủ động thời gian' },
                  { icon: 'account_balance_wallet', title: 'Thu nhập minh bạch', desc: 'Thanh toán rõ ràng, nhanh chóng' },
                ].map((feat, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/15 transition-colors w-full lg:w-[320px]">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{feat.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-[15px]">{feat.title}</h4>
                      <p className="text-white/65 text-sm">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Homepage;
