export interface ClassDto {
  id: number;
  title: string;
  rating: string;
  reviewCount?: number;
  totalReviews?: number;
  location: string;
  locationType: string; // e.g. 'location_on', 'videocam'
  tutorId: number;
  tutorName: string;
  tutorDesc: string;
  tutorAvatar: string;
  tutorAddress?: string;
  price: string; // e.g. '350.000đ/ca'
  image: string;
  description?: string;
  schedule?: string; // e.g. '3 ca/tuần (T2-4-6)'
  requirements?: string[];
  tutorExperience?: string;
  tutorVerified?: boolean;
  tutorUniversity?: string;
  tutorMajor?: string;
  duration?: string; // e.g. '120 phút'
  sessionTime?: string; // e.g. '18:30 - 20:30'
  totalSessions?: string; // e.g. '24 ca'
  maxStudents?: number;
  currentStudents?: number;
  subject?: string;
}
