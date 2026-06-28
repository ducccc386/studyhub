import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

interface ClassSessionDTO {
  id: number;
  className: string;
  status: string;
  pricePerSession: number;
  progress: number;
  price: number;
}

const ParentDashboard: React.FC = () => {
  const { userId, name } = useAuth();
  const [classes, setClasses] = useState<ClassSessionDTO[]>([]);
  const [pendingLogsCount, setPendingLogsCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [classesRes, logsRes, transactionsRes] = await Promise.all([
          apiFetch(`/class-sessions/parent/${userId}`),
          apiFetch(`/lesson-logs/parent/${userId}/pending`),
          apiFetch(`/payment/history/parent/${userId}`)
        ]);

        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(Array.isArray(data) ? data : []);
        }

        if (logsRes.ok) {
          const data = await logsRes.json();
          setPendingLogsCount(Array.isArray(data) ? data.length : 0);
        }

        if (transactionsRes.ok) {
          const data = await transactionsRes.json();
          if (Array.isArray(data)) {
            const sum = data.filter((t: any) => t.status === 'SUCCESS').reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
            setTotalSpent(sum);
          }
        }
      } catch (err) {
        console.error('Failed to fetch parent dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const activeClassesCount = classes.filter(c => ['CONFIRMED', 'TRIAL'].includes(c.status)).length;
  const completedClassesCount = classes.filter(c => ['COMPLETED', 'DISBURSED'].includes(c.status)).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-20">
      <div>
        <h1 className="font-bold text-3xl text-on-surface mb-2">Xin chào, {name}! 👋</h1>
        <p className="font-normal text-lg text-on-surface-variant">Chào mừng bạn trở lại với StudyHub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-on-surface-variant">Lớp đang học</h3>
            <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-lg">school</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-on-surface">{activeClassesCount}</span>
            <span className="text-sm font-medium text-blue-600 mb-1">lớp</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-on-surface-variant">Chờ xác nhận</h3>
            <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-2 rounded-lg">pending_actions</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-on-surface">{pendingLogsCount}</span>
            <span className="text-sm font-medium text-orange-600 mb-1">buổi học</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-on-surface-variant">Đã hoàn thành</h3>
            <span className="material-symbols-outlined text-emerald-500 bg-emerald-50 p-2 rounded-lg">task_alt</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-on-surface">{completedClassesCount}</span>
            <span className="text-sm font-medium text-emerald-600 mb-1">lớp</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-on-surface-variant">Tổng chi tiêu</h3>
            <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-2 rounded-lg">payments</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-on-surface">{totalSpent.toLocaleString('vi-VN')}</span>
            <span className="text-sm font-medium text-purple-600 mb-1">VNĐ</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Lối tắt */}
        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-xl text-on-surface mb-6">Truy cập nhanh</h2>
          <div className="space-y-4">
            <Link to="/parent/posts/create" className="flex items-center justify-between p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface group-hover:text-primary transition-colors">Đăng tin tìm gia sư</h4>
                  <p className="text-sm text-on-surface-variant">Tìm gia sư mới cho con</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary">arrow_forward</span>
            </Link>

            <Link to="/parent/classes" className="flex items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface">Quản lý lớp học</h4>
                  <p className="text-sm text-on-surface-variant">Xem lịch học, thanh toán</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
            </Link>

            <Link to="/parent/feedback" className="flex items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center relative">
                  <span className="material-symbols-outlined">rate_review</span>
                  {pendingLogsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface">Đánh giá gia sư</h4>
                  <p className="text-sm text-on-surface-variant">
                    {pendingLogsCount > 0 ? `Bạn có ${pendingLogsCount} buổi học chờ xác nhận` : 'Xem lịch sử đánh giá'}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
