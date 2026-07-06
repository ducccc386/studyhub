import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const API_URL = `${BASE_URL}/public-documents`;

export interface PublicDocument {
  id: number;
  title: string;
  fileUrl: string;
  uploadedBy: number;
  uploadedAt: string;
  schoolLevel?: string;
  grade?: string;
  subject?: string;
  category?: string;
}

export const documentApi = {
  getAllDocuments: async (): Promise<PublicDocument[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  uploadDocument: async (uploaderId: number, title: string, schoolLevel: string, grade: string, subject: string, category: string, file: File): Promise<PublicDocument> => {
    const formData = new FormData();
    formData.append('uploaderId', uploaderId.toString());
    formData.append('title', title);
    formData.append('schoolLevel', schoolLevel);
    formData.append('grade', grade);
    formData.append('subject', subject);
    formData.append('category', category);
    formData.append('file', file);

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};
