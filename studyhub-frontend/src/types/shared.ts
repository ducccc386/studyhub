export enum PostStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  RECRUITING = 'RECRUITING',
  CLOSED = 'CLOSED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum ClassStatus {
  TRIAL_WAITING = 'TRIAL_WAITING',
  TRIAL_PROGRESS = 'TRIAL_PROGRESS',
  OFFICIAL = 'OFFICIAL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface UnifiedPost {
  id: string;
  parentId: string;
  parentName: string;
  parentAvatar: string;
  title: string;
  subject: string;
  classLevel?: string;
  description: string;
  postedAt: string;
  status: PostStatus;
  location: string;
  detailedAddress?: string;
  schedule: string;
  pricePerSession: number;
  learningMode: 'ONLINE' | 'OFFLINE';
  requirement: string;
  studyDuration?: string;
}

export interface UnifiedApplication {
  id: string;
  postId: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  tutorTitle: string;
  tutorRating: number;
  appliedAt: string;
  status: ApplicationStatus;
  message?: string;
}

export interface UnifiedClass {
  id: string;
  postId?: string;
  className: string;
  parentId: string;
  parentName: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  schedule: string;
  status: ClassStatus;
  progress: number;
  pricePerSession: number;
  learningMode: 'ONLINE' | 'OFFLINE';
}

export interface UnifiedOffer {
  id: string;
  tutorId: string;
  parentId: string;
  parentName: string;
  parentAvatar: string;
  className: string;
  schedule: string;
  pricePerSession: number;
  learningMode: 'ONLINE' | 'OFFLINE';
  location: string;
  message: string;
  status: OfferStatus;
  receivedAt: string;
}
