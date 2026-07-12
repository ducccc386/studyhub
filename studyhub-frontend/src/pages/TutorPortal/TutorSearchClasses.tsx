import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UnifiedPost } from '../../types/shared';
import { apiFetch } from '../../utils/api';




interface ApplicantDTO {
  id: number;
  jobPostingId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

interface Subject {
  id: number;
  name: string;
}

const TutorSearchClasses: React.FC = () => {
  const { tutorId } = useAuth();
  const [posts, setPosts] = useState<UnifiedPost[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicantDTO[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<'Tất cả' | 'Online' | 'Offline'>('Tất cả');
  const [sortBy, setSortBy] = useState<'newest' | 'price_desc' | 'price_asc'>('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, appsRes, subjectsRes] = await Promise.all([
          apiFetch(`/posts`),
          tutorId ? apiFetch(`/posts/my-applications/${tutorId}`) : Promise.resolve(null),
          apiFetch(`/subjects`)
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts((Array.isArray(postsData) ? postsData : []).filter((p: any) => p.status === 'RECRUITING'));
        }

        if (appsRes && appsRes.ok) {
          const appsData = await appsRes.json();
          setMyApplications(Array.isArray(appsData) ? appsData : []);
        }

        if (subjectsRes.ok) {
          const subData = await subjectsRes.json();
          setSubjects(Array.isArray(subData) ? subData : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId]);

  const getApplicationStatus = (postId: number | string) => {
    const app = myApplications.find(a => a.jobPostingId === Number(postId));
    return app ? app.status : null;
  };

  const toggleSubject = (subjectName: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectName) ? prev.filter(s => s !== subjectName) : [...prev, subjectName]
    );
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by subject
    if (selectedSubjects.length > 0) {
      result = result.filter(p => selectedSubjects.includes(p.subject));
    }

    // Filter by mode
    if (selectedMode !== 'Tất cả') {
      result = result.filter(p => {
        if (selectedMode === 'Online') return p.learningMode === 'ONLINE' || (p.learningMode as string) === 'BOTH';
        if (selectedMode === 'Offline') return p.learningMode === 'OFFLINE' || (p.learningMode as string) === 'BOTH';
        return true;
      });
    }

    // Sort
    if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.pricePerSession || 0) - (a.pricePerSession || 0));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.pricePerSession || 0) - (b.pricePerSession || 0));
    } else {
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    return result;
  }, [posts, selectedSubjects, selectedMode, sortBy]);

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8 flex justify-between items-end animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Tìm kiếm yêu cầu tuyển gia sư của phụ huynh</h1>
          <p className="text-base font-normal text-on-surface-variant">Khám phá các cơ hội giảng dạy phù hợp với chuyên môn của bạn.</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-on-surface-variant">
          <span>Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-4 pr-10 focus:border-primary focus:ring-0 cursor-pointer outline-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_desc">Học phí cao nhất</option>
            <option value="price_asc">Học phí thấp nhất</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start animate-slide-up stagger-1">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-72 glass border border-white/20 rounded-2xl p-6 shrink-0 sticky top-[96px] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-on-background">Bộ lọc</h3>
            {(selectedSubjects.length > 0 || selectedMode !== 'Tất cả') && (
              <button
                onClick={() => { setSelectedSubjects([]); setSelectedMode('Tất cả'); }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Môn học */}
          <div className="mb-6 border-b border-outline-variant pb-6">
            <h4 className="text-sm font-semibold text-on-surface mb-3 flex items-center justify-between">
              Môn học
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">keyboard_arrow_up</span>
            </h4>
            <div className="space-y-3">
              {subjects.slice(0, 8).map(sub => (
                <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    checked={selectedSubjects.includes(sub.name)}
                    onChange={() => toggleSubject(sub.name)}
                  />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{sub.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Hình thức */}
          <div className="mb-6 border-b border-outline-variant pb-6">
            <h4 className="text-sm font-semibold text-on-surface mb-3">Hình thức học</h4>
            <div className="flex gap-2">
              {(['Tất cả', 'Online', 'Offline'] as const).map(format => (
                <label key={format} className="flex-1 text-center cursor-pointer">
                  <input
                    className="peer sr-only"
                    name="format"
                    type="radio"
                    checked={selectedMode === format}
                    onChange={() => setSelectedMode(format)}
                  />
                  <div className="px-3 py-2 rounded-lg border border-outline-variant text-xs text-on-surface-variant peer-checked:bg-primary-fixed peer-checked:text-on-primary-fixed peer-checked:border-primary peer-checked:font-semibold transition-all">
                    {format}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Active filters summary */}
          {(selectedSubjects.length > 0 || selectedMode !== 'Tất cả') && (
            <div className="text-xs text-primary font-medium">
              Đang lọc: {filteredPosts.length}/{posts.length} lớp
            </div>
          )}
        </div>

        {/* Class List Grid */}
        <div className="flex-1 w-full grid grid-cols-1 xl:grid-cols-2 gap-6 animate-slide-up stagger-2">
          {loading ? (
            <div className="col-span-1 xl:col-span-2 text-center py-20 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Đang tải danh sách lớp học...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="col-span-1 xl:col-span-2 text-center py-20 text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
              {selectedSubjects.length > 0 || selectedMode !== 'Tất cả'
                ? 'Không có lớp nào khớp với bộ lọc. Hãy thử điều chỉnh bộ lọc.'
                : 'Hiện tại không có lớp học nào đang tuyển gia sư.'
              }
            </div>
          ) : (
            filteredPosts.map((post) => {
              const status = getApplicationStatus(post.id);
              return (
                <div key={post.id} className="glass border border-white/20 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-1 rounded-md text-xs font-semibold">{post.subject}</span>
                        <span className="bg-surface-container-high text-on-surface px-2.5 py-1 rounded-md text-xs font-medium border border-outline-variant">{post.classLevel}</span>
                        <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-md text-xs font-medium border border-outline-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            {post.learningMode === 'ONLINE' ? 'videocam' : post.learningMode === 'OFFLINE' ? 'location_on' : 'devices'}
                          </span>
                          {post.learningMode === 'ONLINE' ? 'Online' : post.learningMode === 'OFFLINE' ? 'Offline' : 'Cả hai'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-on-background line-clamp-2 leading-tight">{post.title}</h3>
                      {(post.requirement || post.description) && (
                        <p className="mt-2 text-sm text-on-surface-variant line-clamp-2">
                          {post.requirement || post.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 mb-6 flex-1 mt-2">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-outline-variant text-[20px] mt-0.5">location_on</span>
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {post.learningMode === 'ONLINE'
                            ? 'Học Online'
                            : (post.learningMode as string) === 'BOTH'
                              ? `Online / Offline tại: ${post.detailedAddress ? `${post.detailedAddress}, ${post.location}` : post.location}`
                              : (post.detailedAddress ? `${post.detailedAddress}, ${post.location}` : post.location)}
                        </p>
                      </div>
                    </div>
                    {post.schedule && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-outline-variant text-[20px]">calendar_today</span>
                        <p className="text-sm font-medium text-on-surface">{post.schedule}</p>
                      </div>
                    )}
                    {post.studyDuration && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-outline-variant text-[20px]">hourglass_bottom</span>
                        <p className="text-sm font-medium text-on-surface">Thời hạn học: <span className="font-semibold text-primary">{post.studyDuration}</span></p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline-variant text-[20px]">payments</span>
                      <div>
                        <p className="text-sm font-bold text-primary">{post.pricePerSession?.toLocaleString('vi-VN')}đ <span className="text-on-surface-variant font-normal text-xs">/ ca</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant pt-5 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg">
                        {post.parentName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{post.parentName || 'Phụ huynh'}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(post.postedAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>

                    {status === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-sm">
                        <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                        Đang chờ duyệt
                      </span>
                    ) : status === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-sm">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Đã được nhận
                      </span>
                    ) : status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface-variant font-semibold text-sm">
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Bị từ chối
                      </span>
                    ) : (
                      <Link to={`/tutor/apply-class/${post.id}`} className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Ứng tuyển ngay
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorSearchClasses;
