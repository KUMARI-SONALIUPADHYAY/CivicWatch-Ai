
export enum IssueStatus {
  REPORTED = 'Reported',
  EMAILED = 'Emailed to Authority',
  ACKNOWLEDGED = 'Acknowledged',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected',
  ESCALATED = 'Escalated'
}

export enum UserRole {
  CITIZEN = 'CITIZEN',
  AUTHORITY = 'AUTHORITY',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: number;
  trustScore: number; // 0 to 100
}

export enum IssueCategory {
  POTHOLE = 'POTHOLE',
  CRACK = 'CRACK',
  WATERLOGGING = 'WATERLOGGING',
  ACCIDENT = 'ACCIDENT',
  VEHICLE_DAMAGE = 'VEHICLE_DAMAGE',
  FALLEN_OBJECT = 'FALLEN_OBJECT',
  OTHER = 'OTHER'
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface AIAnalysis {
  category: IssueCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  estimatedRepairCost: string;
  publicSafetyImpact: string;
  safetyInsight: string;
  confidenceScore: number;
  isValidIssue: boolean;
  rejectionReason?: string;
}

export interface Report {
  id: string;
  timestamp: number;
  createdAt: number;
  image: string;
  city: string;
  location: Location;
  analysis: AIAnalysis | null;
  description: string;
  status: IssueStatus;
  reportedBy: string;
  synced: boolean;
  mediaType: 'image' | 'video';
  emailSent: boolean;
  emailStatus?: 'SENT' | 'FAILED';
  emailedTo?: string;
  emailedAt?: number;
  acknowledgedAt?: number;
  startedAt?: number;
  resolvedAt?: number;
  escalatedAt?: number;
  escalatedTo?: string;
  isOverdue?: boolean;
  authorityToken?: string; // Secure token for one-click status updates
  updatedBy?: 'USER' | 'AUTHORITY' | 'SYSTEM';
  verificationVotes?: {
    yes: string[]; // User IDs who voted "Resolved"
    no: string[];  // User IDs who voted "Still active"
  };
  reInspectionImage?: string;
  aiVerifiedResolution?: boolean;
}

export interface DashboardStats {
  totalReports: number;
  resolvedCount: number;
  pendingCount: number;
  escalatedCount: number;
  categoryDistribution: { [key: string]: number };
}

export interface EmailLog {
  id: string;
  reportId: string;
  timestamp: number;
  recipients: string[];
  subject: string;
  content: string;
  status: 'SENT' | 'FAILED';
  authorityName: string;
}

export interface AuthorityDirectoryEntry {
  id: string;
  region: string;
  category: IssueCategory | 'ALL';
  authorityName: string;
  emails: string[];
}
