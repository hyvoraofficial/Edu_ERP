export interface TeacherProfile {
  id: string;
  academyId: string;
  userId: string;
  employeeId: string;
  specialization: string[];
  qualification: string;
  joiningDate: string;
  salary?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherWithUser extends TeacherProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
}
