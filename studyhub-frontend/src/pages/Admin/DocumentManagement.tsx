import React, { useEffect, useState, useRef } from 'react';
import { PublicDocument, documentApi } from '../../services/documentApi';
import { useAuth } from '../../context/AuthContext';

const DocumentManagement: React.FC = () => {
  const { userId } = useAuth();
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('Lớp 12');
  const [subject, setSubject] = useState('Toán');
  const [category, setCategory] = useState('Đề thi');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adminId = userId || parseInt(localStorage.getItem('userId') || '1');

  const exportToCSV = () => {
    const headers = ['ID', 'Tên tài liệu', 'Lớp', 'Môn học', 'Cấp học', 'Phân loại', 'Ngày tải lên', 'Link tài liệu'];
    const rows = documents.map(doc => [
      doc.id,
      `"${doc.title.replace(/"/g, '""')}"`,
      doc.grade || '',
      doc.subject || '',
      doc.schoolLevel || '',
      doc.category || '',
      doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('vi-VN') : '',
      doc.fileUrl || '',
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const bom = '\uFEFF'; // UTF-8 BOM for Excel/Sheets Vietnamese support
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh-sach-tai-lieu-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentApi.getAllDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Vui lòng chỉ chọn file PDF');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      alert('Vui lòng nhập tên và chọn file tài liệu');
      return;
    }

    try {
      setUploading(true);
      
      // Tự động xác định Cấp học từ Lớp
      let determinedLevel = 'Cấp 3';
      const match = grade.match(/\d+/);
      if (match) {
        const gradeNum = parseInt(match[0]);
        if (gradeNum >= 1 && gradeNum <= 5) determinedLevel = 'Cấp 1';
        else if (gradeNum >= 6 && gradeNum <= 9) determinedLevel = 'Cấp 2';
        else if (gradeNum >= 10 && gradeNum <= 12) determinedLevel = 'Cấp 3';
      } else {
        determinedLevel = 'Khác';
      }

      await documentApi.uploadDocument(adminId, title, determinedLevel, grade, subject, category, file);
      setTitle('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Lỗi khi upload tài liệu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      try {
        await documentApi.deleteDocument(id);
        fetchDocuments();
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa tài liệu');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tài liệu Công khai</h1>
          <p className="text-slate-500">Tải lên và quản lý các tài liệu miễn phí cho người dùng.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm transition-all shrink-0"
          title="Tải file CSV rồi vào Google Sheets → File → Import để xem"
        >
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
          Xuất Google Sheets (.csv)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">upload_file</span>
          Tải lên tài liệu mới (PDF)
        </h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên tài liệu</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề thi thử Đại học môn Toán 2024"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <option key={n} value={`Lớp ${n}`}>{`Lớp ${n}`}</option>
              ))}
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            >
              {["Toán", "Vật lý", "Hóa học", "Tiếng Anh", "Ngữ văn", "Sinh học", "Lịch sử", "Địa lý", "Tin học", "Khác"].map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Phân loại</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            >
              <option value="Đề thi">Đề thi</option>
              <option value="Sách giáo khoa">Sách giáo khoa</option>
              <option value="Tài liệu chuyên đề">Tài liệu chuyên đề</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">File PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer text-slate-500"
              required
            />
          </div>
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-2.5 rounded-xl font-semibold text-white transition-all ${
                uploading ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-md shadow-primary/20'
              }`}
            >
              {uploading ? '...' : 'Tải'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Danh sách tài liệu đã tải lên ({documents.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Tên tài liệu</th>
                <th className="px-6 py-4">Lớp</th>
                <th className="px-6 py-4">Môn học</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Ngày tải lên</th>
                <th className="px-6 py-4">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Đang tải...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Chưa có tài liệu nào.</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate">
                      {doc.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.grade || 'Lớp 12'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.subject || 'Toán'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        doc.category === 'Đề thi' ? 'bg-red-50 text-red-600 border border-red-100' :
                        doc.category === 'Sách giáo khoa' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {doc.category || 'Tài liệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(doc.uploadedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        Xem
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
