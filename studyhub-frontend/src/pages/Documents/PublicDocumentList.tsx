import React, { useEffect, useState } from 'react';
import { PublicDocument, documentApi } from '../../services/documentApi';

const SUBJECTS = ['Tất cả môn', 'Toán', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Ngữ văn', 'Sinh học', 'Lịch sử', 'Địa lý', 'Tin học', 'Khác'];
const CATEGORIES = ['Tất cả', 'Đề thi', 'Sách giáo khoa', 'Tài liệu chuyên đề'];

const GRADE_MAP: Record<string, string[]> = {
  'Tất cả': [],
  'Cấp 1 (Tiểu học)': ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
  'Cấp 2 (THCS)': ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'],
  'Cấp 3 (THPT)': ['Lớp 10', 'Lớp 11', 'Lớp 12'],
};

const LEVEL_KEY_MAP: Record<string, string> = {
  'Cấp 1 (Tiểu học)': 'Cấp 1',
  'Cấp 2 (THCS)': 'Cấp 2',
  'Cấp 3 (THPT)': 'Cấp 3',
};

const categoryColor: Record<string, string> = {
  'Đề thi': 'bg-red-50 text-red-600 border-red-100',
  'Sách giáo khoa': 'bg-blue-50 text-blue-600 border-blue-100',
  'Tài liệu chuyên đề': 'bg-purple-50 text-purple-600 border-purple-100',
};

const PublicDocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const [activeLevel, setActiveLevel] = useState<string>('Tất cả');
  const [activeGrade, setActiveGrade] = useState<string>('Tất cả');
  const [activeSubject, setActiveSubject] = useState<string>('Tất cả môn');
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    'Cấp 1 (Tiểu học)': false,
    'Cấp 2 (THCS)': false,
    'Cấp 3 (THPT)': false,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentApi.getAllDocuments();
      setDocuments(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelClick = (levelLabel: string) => {
    if (levelLabel === 'Tất cả') {
      setActiveLevel('Tất cả');
      setActiveGrade('Tất cả');
      setExpandedLevels({ 'Cấp 1 (Tiểu học)': false, 'Cấp 2 (THCS)': false, 'Cấp 3 (THPT)': false });
    } else {
      setExpandedLevels(prev => ({
        ...prev,
        [levelLabel]: !prev[levelLabel],
      }));
      setActiveLevel(LEVEL_KEY_MAP[levelLabel] || levelLabel);
      setActiveGrade('Tất cả');
    }
  };

  const handleGradeClick = (grade: string) => {
    setActiveGrade(activeGrade === grade ? 'Tất cả' : grade);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = !searchText || doc.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesLevel = activeLevel === 'Tất cả' || (doc.schoolLevel || 'Cấp 3') === activeLevel;
    const matchesGrade = activeGrade === 'Tất cả' || doc.grade === activeGrade;
    const matchesSubject = activeSubject === 'Tất cả môn' || doc.subject === activeSubject;
    const matchesCategory = activeCategory === 'Tất cả' || (doc.category || 'Tài liệu') === activeCategory;
    return matchesSearch && matchesLevel && matchesGrade && matchesSubject && matchesCategory;
  });

  const totalResults = filteredDocuments.length;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 py-8 mb-8">
        <div className="max-w-[1280px] mx-auto px-6">
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            Tài liệu <span className="text-primary">Công khai</span>
          </h1>
          <p className="text-slate-500">Khám phá kho tài liệu học tập miễn phí, phân chia theo Lớp và Môn học.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 flex gap-8">
        {/* ===== SIDEBAR FILTER ===== */}
        <aside className="w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Tìm tài liệu..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Cấp học + Lớp */}
            <div className="p-4 border-b border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Cấp học & Lớp</p>
              <button
                onClick={() => handleLevelClick('Tất cả')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all mb-1 ${activeLevel === 'Tất cả' ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-[16px]">layers</span>
                Tất cả cấp học
              </button>
              {Object.entries(GRADE_MAP).filter(([k]) => k !== 'Tất cả').map(([levelLabel, grades]) => (
                <div key={levelLabel}>
                  <button
                    onClick={() => handleLevelClick(levelLabel)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all mb-1 ${
                      LEVEL_KEY_MAP[levelLabel] === activeLevel && activeLevel !== 'Tất cả'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">school</span>
                      {levelLabel}
                    </div>
                    <span className="material-symbols-outlined text-[16px]">
                      {expandedLevels[levelLabel] ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {expandedLevels[levelLabel] && (
                    <div className="ml-4 mb-1 space-y-0.5">
                      {grades.map(grade => (
                        <button
                          key={grade}
                          onClick={() => handleGradeClick(grade)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activeGrade === grade ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Môn học */}
            <div className="p-4 border-b border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Môn học</p>
              <div className="space-y-0.5">
                {SUBJECTS.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubject(sub)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeSubject === sub ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">menu_book</span>
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Phân loại */}
            <div className="p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Phân loại</p>
              <div className="space-y-0.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {cat === 'Đề thi' ? 'quiz' : cat === 'Sách giáo khoa' ? 'auto_stories' : cat === 'Tài liệu chuyên đề' ? 'description' : 'folder'}
                    </span>
                    {cat === 'Tất cả' ? 'Tất cả loại' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 min-w-0">
          {/* Result count bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              Tìm thấy <span className="font-bold text-slate-800">{totalResults}</span> tài liệu phù hợp
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-red-50 text-red-600 rounded-2xl">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p>{error}</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-300">folder_open</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy tài liệu phù hợp</h3>
              <p className="text-slate-500">Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.10)] hover:-translate-y-0.5 transition-all group flex flex-col">
                  {/* Card header */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-red-500 text-[22px]">picture_as_pdf</span>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {doc.grade && (
                          <span className="px-2 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded-md text-[10px] font-bold">{doc.grade}</span>
                        )}
                        {doc.subject && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-md text-[10px] font-bold">{doc.subject}</span>
                        )}
                        {doc.category && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryColor[doc.category] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                            {doc.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mb-3 line-clamp-2 leading-snug" title={doc.title}>
                      {doc.title}
                    </h3>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                        <span>Đăng ngày: {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      {doc.schoolLevel && (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px]">school</span>
                          <span>{doc.schoolLevel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-5 pb-5">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/8 text-primary font-semibold text-sm rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Xem & Tải xuống
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicDocumentList;

