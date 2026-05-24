export type UserRole = 'admin' | 'staff' | 'member';

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  email: string;
  contactNumber?: string;
  address?: string;
  age?: string;
  gender?: string;
  birthdate?: string;
  avatarUrl?: string;
  status: 'active' | 'deactivated';
  createdAt: any;
  updatedAt?: any;
}

export interface PWDProfile {
  id?: string;
  pwdNumber: string;
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  disabilityType: string;
  disabilityCause: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  contactNumber: string;
  email: string;
  dob: string;
  sex: string;
  civilStatus: string;
  educationalAttainment: string;
  employmentStatus: string;
  occupation: string;
  bloodType: string;
  orgAffiliated: string;
  idReferences: {
    sss?: string;
    gsis?: string;
    psn?: string;
    philhealth?: string;
  };
  familyBackground: {
    guardianName?: string;
    guardianContact?: string;
  };
  dateRegistered: any;
  status: string;
}

export type ApplicationStatus = 'draft' | 'pending' | 'for_review' | 'approved' | 'returned' | 'rejected' | 'completed';

export interface Application {
  id?: string;
  applicationId?: string;
  referenceNumber: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  contactNumber: string;
  address: string;
  disabilityType?: string;
  formType: 'pwd_burial_assistance' | 'doh_prpwd_registry' | 'burial_assistance_certificate' | 'cancellation_certificate';
  formTitle: string;
  category?: string;
  purpose?: string;
  formData: any;
  requirements?: Record<string, boolean>;
  status: ApplicationStatus;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: any;
  submittedAt: any;
  updatedAt: any;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  authorId: string;
}

export interface SystemNotification {
  id?: string;
  userId?: string;
  targetRole?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
  isReadBy?: string[];
  createdAt: any;
  link?: string;
}
