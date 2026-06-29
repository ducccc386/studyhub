import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomSelect from '../../components/CustomSelect';
import { ClassDto } from '../../types/class';

const ClassList: React.FC = () => {
  const [sortBy, setSortBy] = useState('newest');
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [subjects, setSubjects] = useState<{id: number, name: string}[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [teachingMethod, setTeachingMethod] = useState<string>('ALL');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Pagination
  const PAGE_SIZE = 4;
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Fetch subjects
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch subjects:', err));
  }, []);

  useEffect(() => {
    // Fetch courses with filter
    const queryParams = new URLSearchParams();
    if (selectedSubjectIds.length > 0) {
      queryParams.append('subjectIds', selectedSubjectIds.join(','));
    }
    if (maxPrice < 1000000) {
      queryParams.append('maxPrice', maxPrice.toString());
    }
    if (teachingMethod !== 'ALL') {
      queryParams.append('teachingMethod', teachingMethod);
    }
    if (selectedGrades.length > 0) {
      queryParams.append('grades', selectedGrades.join(','));
    }
    if (searchKeyword.trim() !== '') {
      queryParams.append('keyword', searchKeyword);
    }
    
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/courses?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        let sortedData = [...data];
        if (sortBy === 'price_asc') {
           sortedData.sort((a, b) => {
               const pA = parseInt(a.price?.replace(/[^0-9]/g, '') || '0');
               const pB = parseInt(b.price?.replace(/[^0-9]/g, '') || '0');
               return pA - pB;
           });
        } else if (sortBy === 'price_desc') {
           sortedData.sort((a, b) => {
               const pA = parseInt(a.price?.replace(/[^0-9]/g, '') || '0');
               const pB = parseInt(b.price?.replace(/[^0-9]/g, '') || '0');
               return pB - pA;
           });
        } else if (sortBy === 'rating') {
           sortedData.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        } else if (sortBy === 'newest') {
           sortedData.reverse();
        }
        setClasses(sortedData);
        setPage(0); // reset to first page on new data
      })
      .catch(err => console.error('Failed to fetch courses:', err))
      .finally(() => setLoading(false));
  }, [selectedSubjectIds, maxPrice, teachingMethod, selectedGrades, searchKeyword, sortBy]);

  const toggleSubject = (id: number) => {
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const clearAllFilters = () => {
      setSelectedSubjectIds([]);
      setMaxPrice(1000000);
      setTeachingMethod('ALL');
      setSelectedGrades([]);
      setSearchKeyword('');
      setKeyword('');
      setPage(0);
  };

  // Derived pagination values
  const totalPages = Math.ceil(classes.length / PAGE_SIZE);
  const pagedClasses = classes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-[#f7f9ff] text-on-surface min-h-screen">
      {/* ===== HERO / SEARCH SECTION ===== */}
      <section className="relative bg-gradient-to-br from-primary via-[#0052cc] to-indigo-700 pt-[132px] pb-24 px-6 md:px-16 overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/8 blur-[80px] animate-float" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full bg-indigo-300/15 blur-[80px] animate-float-slow" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            Tất cả lớp học
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Tìm kiếm yêu cầu tuyển gia sư của phụ huynh
          </h1>
          <p className="text-white/75 mb-10 text-lg max-w-xl mx-auto">
            Hàng nghìn lớp học chất lượng đang chờ bạn khám phá
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
              <input
                className="w-full border-none outline-none text-sm placeholder:text-slate-400 text-slate-700 bg-transparent"
                placeholder="Tìm kiếm tên lớp, môn học, từ khóa..."
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchKeyword(keyword)}
              />
            </div>
            <button 
              onClick={() => setSearchKeyword(keyword)}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Tìm kiếm
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-white/50 text-sm">Gợi ý:</span>
            {['Luyện thi đại học', 'Tiếng Anh Giao tiếp', 'Toán 12'].map(s => (
              <button 
                key={s} 
                onClick={() => { setKeyword(s); setSearchKeyword(s); }}
                className="px-3 py-1 bg-white/15 border border-white/20 hover:bg-white/25 text-white text-xs rounded-full font-medium transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className="w-full md:w-[260px] shrink-0">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-[#0f172a] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                Bộ lọc
              </h2>
              <button 
                onClick={clearAllFilters}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Xóa hết
              </button>
            </div>

            {/* Môn học */}
            <div className="mb-7">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Môn học</h3>
              <div className="space-y-2.5">
                {subjects.map(subject => (
                  <label key={subject.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      checked={selectedSubjectIds.includes(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                      type="checkbox" 
                    />
                    <span className="text-sm text-slate-600 group-hover:text-primary transition-colors font-medium">{subject.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Học phí */}
            <div className="mb-7">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Học phí (VNĐ/ca)</h3>
              <input 
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary" 
                max="1000000" min="50000" step="50000" type="range" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                <span>50k</span><span className="text-primary font-bold">{maxPrice.toLocaleString()}đ</span>
              </div>
            </div>

            {/* Hình thức */}
            <div className="mb-7">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Hình thức học</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setTeachingMethod(teachingMethod === 'ONLINE' ? 'ALL' : 'ONLINE')}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${teachingMethod === 'ONLINE' ? 'bg-primary text-white shadow-sm shadow-primary/25 border border-primary' : 'border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'}`}
                >
                  Online
                </button>
                <button 
                  onClick={() => setTeachingMethod(teachingMethod === 'OFFLINE' ? 'ALL' : 'OFFLINE')}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${teachingMethod === 'OFFLINE' ? 'bg-primary text-white shadow-sm shadow-primary/25 border border-primary' : 'border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'}`}
                >
                  Offline
                </button>
              </div>
            </div>

            {/* Lớp học */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lớp học</h3>
              <div className="space-y-2.5">
                {['Lớp 10', 'Lớp 11', 'Lớp 12'].map((grade) => (
                  <label key={grade} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      checked={selectedGrades.includes(grade)}
                      onChange={() => toggleGrade(grade)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                      type="checkbox" 
                    />
                    <span className="text-sm text-slate-600 group-hover:text-primary transition-colors font-medium">{grade}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Class Grid ── */}
        <div className="flex-1">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-7 gap-4">
            <p className="text-sm text-slate-500">
              Tìm thấy <span className="font-bold text-[#0f172a]">{classes.length}</span> lớp học phù hợp
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Sắp xếp:</span>
              <CustomSelect
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'price_asc', label: 'Học phí thấp → cao' },
                  { value: 'price_desc', label: 'Học phí cao → thấp' },
                  { value: 'rating', label: 'Đánh giá cao nhất' },
                ]}
                value={sortBy}
                onChange={setSortBy}
                size="sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
              <p className="text-slate-500">Không tìm thấy lớp học nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {pagedClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(0,61,155,0.12)] hover:-translate-y-1 transition-all duration-300 group flex flex-col shadow-sm"
              >
                <div className="relative h-44 overflow-hidden">
                  <img alt={cls.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={cls.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-bold text-slate-700">{cls.rating}</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-[#0f172a] text-base group-hover:text-primary transition-colors line-clamp-2 flex-1">{cls.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                    <span className="material-symbols-outlined text-[15px]">{cls.locationType === 'computer' || cls.locationType === 'videocam' || cls.locationType === 'Online' ? 'videocam' : 'location_on'}</span>
                    {cls.location}
                  </div>

                  {/* Tutor row */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                    <img alt="Tutor" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" src={cls.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cls.tutorName || 'T')}&background=003d9b&color=fff`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0f172a] truncate">{cls.tutorName}</p>
                      {cls.tutorAddress ? (
                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {cls.tutorAddress}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{cls.tutorDesc}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="block text-xs text-slate-400 font-medium mb-0.5">Học phí</span>
                      <span className="text-lg font-extrabold text-primary">{cls.price}<span className="text-xs font-normal text-slate-400">/ca</span></span>
                    </div>
                    <Link
                      to={`/classes/${cls.id}`}
                      className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                    >
                      Chi tiết
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
                <span className="ml-2">Tổng <span className="font-bold text-primary">{classes.length}</span> lớp học</span>
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

export default ClassList;
