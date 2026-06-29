import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CustomSelect from '../../components/CustomSelect';
import { tutorApi, Subject, Tutor, TutorFilterParams } from '../../services/tutorApi';

const TutorList: React.FC = () => {
  const [searchParamsUrl, setSearchParamsUrl] = useSearchParams();
  const initialKeyword = searchParamsUrl.get('keyword') || '';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination & Total
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword); // Only update when hitting search
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [method, setMethod] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await tutorApi.getSubjects();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch subjects', error);
      }
    };
    fetchSubjects();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params: TutorFilterParams = {
        keyword: searchKeyword,
        subjectIds: selectedSubjectIds,
        maxPrice: maxPrice,
        minRating: rating,
        teachingMethod: method,
        sortBy: sortBy,
        page: page,
        size: 4
      };
      const response = await tutorApi.getTutors(params);
      setTutors(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch tutors', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [searchKeyword, selectedSubjectIds, maxPrice, rating, method, sortBy, page]);

  const handleSubjectToggle = (id: number) => {
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
    setPage(0); // reset page on filter change
  };

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(0);
    if (keyword) {
      searchParamsUrl.set('keyword', keyword);
    } else {
      searchParamsUrl.delete('keyword');
    }
    setSearchParamsUrl(searchParamsUrl);
  };

  return (
    <div className="bg-[#f7f9ff] text-on-surface min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-[#0a2463] via-primary to-indigo-600 pt-[132px] pb-24 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px] animate-float" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[400px] h-[400px] rounded-full bg-indigo-300/10 blur-[80px] animate-float-slow" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
            Bảng tin Gia Sư
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Tìm gia sư hoàn hảo cho bạn
          </h1>
          <p className="text-white/70 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
            Lướt chọn các bài PR từ 5,000+ gia sư được xác thực eKYC, sẵn sàng đồng hành cùng bạn.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 border-r border-slate-100">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
              <input
                className="w-full border-none outline-none text-sm placeholder:text-slate-400 text-slate-700 bg-transparent"
                placeholder="Tên gia sư hoặc từ khóa..."
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-[18px]">search</span>
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className="w-full md:w-[240px] shrink-0">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sticky top-24 shadow-sm space-y-7">
            <h3 className="font-bold text-lg text-[#0f172a] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              Bộ lọc
            </h3>

            {/* Subject */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Môn học</p>
              <div className="space-y-2.5">
                {subjects.map(s => (
                  <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                      type="checkbox"
                      checked={selectedSubjectIds.includes(s.id)}
                      onChange={() => handleSubjectToggle(s.id)}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-primary transition-colors font-medium">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Học phí tối đa (VNĐ/ca)</p>
              <input 
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary" 
                max="1000000" min="50000" step="50000" type="range" 
                value={maxPrice}
                onChange={e => {
                  setMaxPrice(Number(e.target.value));
                  setPage(0);
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                <span>50k</span>
                <span className="text-primary font-bold">{maxPrice.toLocaleString()}đ</span>
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Đánh giá</p>
              <div className="space-y-2">
                {[5, 4, 3].map(r => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      className="border-slate-300 text-primary focus:ring-primary h-4 w-4" 
                      name="rating" type="radio" 
                      checked={rating === r}
                      onChange={() => {
                        setRating(r);
                        setPage(0);
                      }}
                    />
                    <span className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                      {r}+ <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    className="border-slate-300 text-primary focus:ring-primary h-4 w-4" 
                    name="rating" type="radio" 
                    checked={rating === undefined}
                    onChange={() => {
                      setRating(undefined);
                      setPage(0);
                    }}
                  />
                  <span className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                    Tất cả
                  </span>
                </label>
              </div>
            </div>

            {/* Teaching method */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Hình thức dạy</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => { setMethod('ALL'); setPage(0); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${method === 'ALL' ? 'bg-primary text-white shadow-sm shadow-primary/25' : 'border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'}`}>
                  Tất cả
                </button>
                <button 
                  onClick={() => { setMethod('ONLINE'); setPage(0); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${method === 'ONLINE' ? 'bg-primary text-white shadow-sm shadow-primary/25' : 'border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'}`}>
                  Online
                </button>
                <button 
                  onClick={() => { setMethod('OFFLINE'); setPage(0); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${method === 'OFFLINE' ? 'bg-primary text-white shadow-sm shadow-primary/25' : 'border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'}`}>
                  Offline
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Tutor Grid ── */}
        <div className="flex-1">
          {/* Header row */}
          <div className="flex justify-between items-center mb-7">
            <p className="text-sm text-slate-500">
              Tìm thấy <span className="font-bold text-primary">{totalElements}</span> gia sư phù hợp
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Sắp xếp:</span>
              <CustomSelect
                options={[
                  { value: 'popular', label: 'Phổ biến nhất' },
                  { value: 'price_asc', label: 'Giá thấp → cao' },
                  { value: 'rating', label: 'Đánh giá cao nhất' },
                ]}
                value={sortBy}
                onChange={(val) => { setSortBy(val); setPage(0); }}
                size="sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tutors.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                <p className="text-slate-500">Không tìm thấy gia sư nào phù hợp với bộ lọc.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tutors.map((tutor) => (
                <div key={tutor.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-[0_12px_40px_rgba(0,61,155,0.1)] hover:-translate-y-1 transition-all duration-300 group shadow-sm flex gap-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img alt="Tutor" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white shadow-md" src={tutor.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(tutor.fullName) + '&background=003d9b&color=fff'} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">PR</span>
                        <h3 className="font-bold text-[#0f172a] text-base truncate group-hover:text-primary transition-colors">{tutor.fullName}</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg shrink-0">
                        <span className="material-symbols-outlined text-amber-500 text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold text-amber-700">{tutor.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-primary mb-2">{tutor.major ? `${tutor.major} - ` : ''}{tutor.universityName || 'Gia sư'}</p>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{tutor.introduction || 'Chưa có thông tin giới thiệu'}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tutor.subjects?.map(sub => (
                        <span key={sub.id} className="bg-primary/8 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold border border-primary/15">{sub.name}</span>
                      ))}
                      {tutor.teachingMethod && tutor.teachingMethod !== 'ALL' && (
                         <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200">{tutor.teachingMethod}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-lg font-extrabold text-primary">{tutor.price ? Math.round(tutor.price).toLocaleString('vi-VN') : 'Thỏa thuận'}</span>
                        <span className="text-xs text-slate-400 font-medium">{tutor.price ? 'đ/ca' : ''}</span>
                      </div>
                      <Link
                        to={`/tutors/${tutor.id}`}
                        className="px-4 py-2 border border-primary text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-95 hover:shadow-md hover:shadow-primary/25"
                      >
                        Xem hồ sơ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              {/* Page info */}
              <p className="text-xs text-slate-400 font-medium">
                Trang <span className="font-bold text-slate-600">{page + 1}</span> / <span className="font-bold text-slate-600">{totalPages}</span>
                <span className="ml-2 text-slate-300">·</span>
                <span className="ml-2">Tổng <span className="font-bold text-primary">{totalElements}</span> gia sư</span>
              </p>

              {/* Page buttons */}
              <div className="flex justify-center items-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {/* Smart page numbers */}
                {(() => {
                  const pages: (number | '...')[] = [];
                  if (totalPages <= 7) {
                    for (let i = 0; i < totalPages; i++) pages.push(i);
                  } else {
                    pages.push(0);
                    if (page > 3) pages.push('...');
                    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages - 2, page + 2); i++) pages.push(i);
                    if (page < totalPages - 4) pages.push('...');
                    pages.push(totalPages - 1);
                  }
                  return pages.map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm font-bold">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          p === page
                            ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                            : 'border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary shadow-sm'
                        }`}
                      >
                        {(p as number) + 1}
                      </button>
                    )
                  );
                })()}

                {/* Next */}
                <button
                  onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page >= totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorList;
