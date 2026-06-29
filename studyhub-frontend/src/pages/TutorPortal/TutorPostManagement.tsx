import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import toast from 'react-hot-toast';
import { toastConfirm } from '../../utils/toastConfirm';

interface CourseDTO {
  id: number;
  title: string;
  description: string;
  price: string;
  locationType: string;
  status: string;
  createdAt: string;
}

const TutorPostManagement: React.FC = () => {
  const { tutorId } = useAuth();
  const [posts, setPosts] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<CourseDTO | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    locationType: ''
  });

  const loadPosts = () => {
    if (!tutorId) return;
    setLoading(true);
    apiFetch(`/courses/tutor/${tutorId}`)
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPosts();
  }, [tutorId]);

  const handleDelete = (id: number) => {
    toastConfirm('Bạn có chắc chắn muốn xóa bài đăng này không?', async () => {
      try {
        const res = await apiFetch(`/courses/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Xóa bài đăng thành công');
          loadPosts();
        } else {
          toast.error('Có lỗi xảy ra khi xóa');
        }
      } catch (err) {
        toast.error('Có lỗi xảy ra');
      }
    });
  };

  const openEditModal = (post: CourseDTO) => {
    setPostToEdit(post);
    setEditForm({
      title: post.title || '',
      description: post.description || '',
      price: post.price ? post.price.replace(/[^0-9]/g, '') : '',
      locationType: post.locationType || 'Online & Offline'
    });
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setPostToEdit(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postToEdit) return;

    try {
      const payload = {
        ...postToEdit,
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        locationType: editForm.locationType
      };

      const res = await apiFetch(`/courses/${postToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Cập nhật bài đăng thành công');
        closeEditModal();
        loadPosts();
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Quản lý Bài đăng (PR)</h1>
          <p className="text-on-surface-variant mt-1">Danh sách các bài đăng tìm học viên của bạn.</p>
        </div>
        <Link 
          to="/tutor/create-post" 
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Tạo bài đăng mới
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">post_add</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Chưa có bài đăng nào</h2>
          <p className="text-on-surface-variant mb-6">Hãy tạo bài đăng PR để học viên có thể tìm thấy bạn!</p>
          <Link 
            to="/tutor/create-post" 
            className="inline-flex px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Đăng bài ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${
                post.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                post.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface'
              }`}>
                {post.status === 'ACTIVE' ? 'Đã duyệt' : post.status === 'PENDING_APPROVAL' ? 'Chờ duyệt' : post.status}
              </div>

              <h3 className="font-bold text-lg text-on-surface mb-2 mt-2 line-clamp-2 pr-16" title={post.title}>
                {post.title}
              </h3>
              
              <div className="space-y-2 mb-6 flex-grow">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  <span className="font-semibold text-primary">{Number(post.price?.replace(/[^0-9]/g, '') || 0).toLocaleString('vi-VN')}đ/ca</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>{post.locationType}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-outline-variant">
                <button 
                  onClick={() => openEditModal(post)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Sửa
                </button>
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="flex-none flex items-center justify-center w-10 py-2 bg-error-container text-error rounded-lg text-sm font-semibold hover:bg-error/20 transition-colors"
                  title="Xóa bài đăng"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModalVisible && postToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in">
          <div className="bg-surface w-full max-w-xl rounded-2xl p-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Chỉnh sửa Bài PR</h3>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">Tiêu đề tin đăng <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  required
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface text-on-surface" 
                  value={editForm.title} 
                  onChange={handleEditChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-medium text-on-surface mb-1">Học phí (VNĐ/ca) <span className="text-error">*</span></label>
                  <input 
                    type="number" 
                    name="price"
                    required
                    min="50000"
                    max="1000000"
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface text-on-surface" 
                    value={editForm.price} 
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <label className="block text-label-md font-medium text-on-surface mb-1">Hình thức dạy</label>
                  <select 
                    name="locationType"
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface text-on-surface" 
                    value={editForm.locationType} 
                    onChange={handleEditChange}
                  >
                    <option value="Online & Offline">Online & Offline</option>
                    <option value="Chỉ Online">Chỉ Online</option>
                    <option value="Chỉ Offline">Chỉ Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-md font-medium text-on-surface mb-1">Mô tả thêm</label>
                <textarea 
                  name="description"
                  rows={4}
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface text-on-surface" 
                  value={editForm.description} 
                  onChange={handleEditChange}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4 mt-6">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="flex-1 py-3 border border-outline text-on-surface rounded-xl hover:bg-surface-variant font-label-md transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl hover:bg-primary/90 font-label-md transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorPostManagement;
