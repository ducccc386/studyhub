import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

interface KPIsData {
  activeTutors: number;
  activeTutorsGrowth: number;
  averageRating: number;
}

interface GrowthData {
  month: string;
  newUsers: number;
}

interface TutorQualityData {
  tutorId: number;
  tutorName: string;
  tutorAvatar: string;
  rating: number;
  reportCount: number;
  status: string;
}

interface PopularSubjectData {
  subject: string;
  count: number;
  percentage: number;
}

const AdminReports: React.FC = () => {
  const [kpis, setKpis] = useState<KPIsData | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [tutorQuality, setTutorQuality] = useState<TutorQualityData[]>([]);
  const [popularSubjects, setPopularSubjects] = useState<PopularSubjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const [kpiRes, growthRes, tutorRes, subjectRes] = await Promise.all([
          apiFetch('/admin/reports/kpis'),
          apiFetch('/admin/reports/growth'),
          apiFetch('/admin/reports/tutor-quality'),
          apiFetch('/admin/reports/popular-subjects')
        ]);

        if (kpiRes.ok) setKpis(await kpiRes.json());
        if (growthRes.ok) setGrowthData(await growthRes.json());
        if (tutorRes.ok) setTutorQuality(await tutorRes.json());
        if (subjectRes.ok) setPopularSubjects(await subjectRes.json());
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportsData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define colors for the chart
  const blueColor = "#0052cc";

  return (
    <div className="max-w-[1440px] mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Báo cáo &amp; Phân tích</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Hiệu suất nền tảng, chất lượng gia sư và hoạt động của hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            6 tháng qua
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPIs */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Gia sư Đang hoạt động</span>
              <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-1.5 rounded-md">school</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface">{kpis?.activeTutors?.toLocaleString() || '0'}</span>
              <span className="font-body-sm text-body-sm text-secondary font-medium flex items-center">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> {kpis?.activeTutorsGrowth}%
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Đánh giá Trung bình</span>
              <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-1.5 rounded-md">star</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface">{kpis?.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Main Chart: Growth */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Tăng trưởng nền tảng (Người dùng mới)</h3>
            <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-md transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="flex-1 w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={blueColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={blueColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="newUsers" name="Người dùng mới" stroke={blueColor} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quality Evaluation Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Đánh giá Chất lượng Gia sư</h3>
            <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-outline-variant">
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium">Gia sư</th>
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium">Rating</th>
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium">Report</th>
                  <th className="py-3 px-5 font-label-md text-label-md text-on-surface-variant font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm">
                {tutorQuality.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-on-surface-variant">Chưa có dữ liệu đánh giá.</td>
                  </tr>
                ) : (
                  tutorQuality.map((tutor) => (
                    <tr key={tutor.tutorId} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-5 flex items-center gap-3">
                        <img 
                          src={tutor.tutorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.tutorName)}&background=random`} 
                          alt={tutor.tutorName} 
                          className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                        />
                        <span className="font-medium text-on-surface">{tutor.tutorName}</span>
                      </td>
                      <td className="py-3 px-5"><span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" style={{fontVariationSettings: "'FILL' 1"}}>star</span> {tutor.rating?.toFixed(1) || '0.0'}</span></td>
                      <td className={`py-3 px-5 font-medium ${tutor.reportCount > 0 ? 'text-error' : 'text-on-surface-variant'}`}>{tutor.reportCount}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                          tutor.status === 'XUẤT SẮC' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 
                          tutor.status === 'CẦN DUYỆT' ? 'bg-error-container text-on-error-container' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {tutor.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject Popularity Bar Chart */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm flex flex-col">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Môn học phổ biến</h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {popularSubjects.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant">Chưa có dữ liệu lớp học.</div>
            ) : (
              popularSubjects.map((sub, index) => {
                const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-error', 'bg-amber-500'];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-24 font-body-sm text-body-sm text-on-surface-variant truncate">{sub.subject}</div>
                    <div className="flex-1 bg-surface-container-high rounded-full h-3 overflow-hidden">
                      <div className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${sub.percentage}%` }}></div>
                    </div>
                    <div className="w-10 text-right font-label-md text-label-md text-on-surface">{sub.percentage}%</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
