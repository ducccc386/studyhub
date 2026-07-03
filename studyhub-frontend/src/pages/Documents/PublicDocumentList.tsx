import React, { useEffect, useState } from 'react';
import { PublicDocument, documentApi } from '../../services/documentApi';

const PublicDocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLevel, setActiveLevel] = useState<string>('Tất cả');
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');

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

  const filteredDocuments = documents.filter((doc) => {
    const matchesLevel = activeLevel === 'Tất cả' || (doc.schoolLevel || 'Cấp 3') === activeLevel;
    const matchesCategory = activeCategory === 'Tất cả' || (doc.category || 'Tài liệu') === activeCategory;
    return matchesLevel && matchesCategory;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
            Tài liệu <span className="text-primary">Công khai</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Khám phá kho tài liệu học tập đa dạng, được phân chia cấp học rõ ràng và cung cấp hoàn toàn miễn phí bởi đội ngũ StudyHub.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8 space-y-4">
          {/* Cấp học */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-sm font-bold text-slate-700 w-24 shrink-0">Cấp học:</span>
            <div className="flex flex-wrap gap-2">
              {['Tất cả', 'Cấp 1', 'Cấp 2', 'Cấp 3'].map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveLevel(level)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeLevel === level
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {level === 'Tất cả' ? 'Tất cả cấp học' : level === 'Cấp 1' ? 'Cấp 1 (Tiểu học)' : level === 'Cấp 2' ? 'Cấp 2 (THCS)' : 'Cấp 3 (THPT)'}
                </button>
              ))}
            </div>
          </div>

          {/* Phân loại */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 border-t border-slate-100 pt-4">
            <span className="text-sm font-bold text-slate-700 w-24 shrink-0">Phân loại:</span>
            <div className="flex flex-wrap gap-2">
              {['Tất cả', 'Đề thi', 'Sách giáo khoa', 'Tài liệu chuyên đề'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'Tất cả' ? 'Tất cả phân loại' : cat}
                </button>
              ))}
            </div>
          </div>
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
            <p className="text-slate-500">Hãy thử đổi bộ lọc cấp học hoặc phân loại khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-red-500 text-[24px]">picture_as_pdf</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="px-2.5 py-1 bg-primary/5 text-primary border border-primary/10 rounded-lg text-[10px] font-bold">
                        {doc.schoolLevel || 'Cấp 3'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        doc.category === 'Đề thi' ? 'bg-red-50 text-red-600 border-red-100' :
                        doc.category === 'Sách giáo khoa' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {doc.category || 'Tài liệu'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 h-14" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-6 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Xem & Tải xuống
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDocumentList;
