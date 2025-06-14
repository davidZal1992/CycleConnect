export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  profileImage?: string;
  bikeModel: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileCreationData {
  fullName: string;
  phoneNumber: string;
  email: string;
  profileImage?: string | null;
  bikeModel: string;
  location: string;
} 