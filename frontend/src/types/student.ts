export interface StudentProfile {
  id: string;
  academyId: string;
  userId: string;
  admissionNumber: string;
  admissionDate: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWithUser extends StudentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
}
