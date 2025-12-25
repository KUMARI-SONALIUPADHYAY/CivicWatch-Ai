
import { Report, IssueStatus, DashboardStats, EmailLog, AuthorityDirectoryEntry, IssueCategory } from "../types";
import { updateUserTrustScore } from "./authService";

const STORAGE_KEY = 'civic_reports_db';
const LOG_KEY = 'civic_email_logs';
const AUTH_DIR_KEY = 'civic_authority_directory';
const VOTE_THRESHOLD = 3; // Number of "Yes" votes required for auto-resolution

// Thresholds in milliseconds for simulation
// Real world would be days, here we use shorter durations for demo/visibility if needed
// Let's use 3 days (3 * 24 * 60 * 60 * 1000)
const ESCALATION_THRESHOLD = 3 * 24 * 60 * 60 * 1000; 

export const saveReport = (report: Report) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === report.id);
  
  if (index !== -1) {
    reports[index] = report;
  } else {
    if (!report.authorityToken) {
      report.authorityToken = Math.random().toString(36).substring(2, 15);
    }
    if (!report.verificationVotes) {
      report.verificationVotes = { yes: [], no: [] };
    }
    reports.unshift(report);
    if (report.analysis?.isValidIssue && report.reportedBy !== "Anonymous") {
      updateUserTrustScore(report.reportedBy, 5);
    }
  }
  
  reports.sort((a, b) => b.createdAt - a.createdAt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const checkAndEscalateReports = () => {
  const reports = getReports();
  let changed = false;
  const now = Date.now();

  reports.forEach(report => {
    if (report.status === IssueStatus.RESOLVED || report.status === IssueStatus.REJECTED) return;

    const timeSinceCreation = now - report.createdAt;
    
    // Mark as overdue if past threshold
    if (timeSinceCreation > ESCALATION_THRESHOLD && !report.isOverdue) {
      report.isOverdue = true;
      changed = true;
    }

    // Escalate if status is stagnant
    if (timeSinceCreation > ESCALATION_THRESHOLD && report.status !== IssueStatus.ESCALATED) {
      report.status = IssueStatus.ESCALATED;
      report.escalatedAt = now;
      report.escalatedTo = "City Commissioner / Oversight Board";
      report.updatedBy = 'SYSTEM';
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
};

export const saveReInspectionResult = (reportId: string, image: string, isResolved: boolean, userId: string) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  
  if (index !== -1) {
    const report = reports[index];
    report.reInspectionImage = image;
    
    if (isResolved) {
      report.status = IssueStatus.RESOLVED;
      report.aiVerifiedResolution = true;
      report.resolvedAt = Date.now();
      report.updatedBy = 'SYSTEM';
      updateUserTrustScore(userId, 20);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
};

export const getReports = (): Report[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  const reports: Report[] = data ? JSON.parse(data) : [];
  return reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

export const castVerificationVote = (reportId: string, userId: string, isResolved: boolean) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  
  if (index !== -1) {
    const report = reports[index];
    if (!report.verificationVotes) {
      report.verificationVotes = { yes: [], no: [] };
    }

    if (report.verificationVotes.yes.includes(userId) || report.verificationVotes.no.includes(userId)) {
      return;
    }

    if (isResolved) {
      report.verificationVotes.yes.push(userId);
    } else {
      report.verificationVotes.no.push(userId);
    }

    if (report.verificationVotes.yes.length >= VOTE_THRESHOLD && report.status !== IssueStatus.RESOLVED) {
      updateStatus(reportId, IssueStatus.RESOLVED, 'SYSTEM');
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }

    updateUserTrustScore(userId, 2);
  }
};

export const getStats = (): DashboardStats => {
  const reports = getReports();
  const stats: DashboardStats = {
    totalReports: reports.length,
    resolvedCount: reports.filter(r => r.status === IssueStatus.RESOLVED).length,
    pendingCount: reports.filter(r => r.status === IssueStatus.REPORTED).length,
    escalatedCount: reports.filter(r => r.status === IssueStatus.ESCALATED).length,
    categoryDistribution: {}
  };

  reports.forEach(r => {
    if (r.analysis) {
      const cat = r.analysis.category;
      stats.categoryDistribution[cat] = (stats.categoryDistribution[cat] || 0) + 1;
    }
  });

  return stats;
};

export const updateStatus = (id: string, status: IssueStatus, updatedBy: 'USER' | 'AUTHORITY' | 'SYSTEM' = 'USER') => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === id);
  
  if (index !== -1) {
    const report = reports[index];
    const oldStatus = report.status;
    report.status = status;
    report.updatedBy = updatedBy;
    const now = Date.now();
    
    if (status === IssueStatus.ACKNOWLEDGED) report.acknowledgedAt = now;
    if (status === IssueStatus.IN_PROGRESS) report.startedAt = now;
    if (status === IssueStatus.RESOLVED) report.resolvedAt = now;

    if (report.reportedBy !== "Anonymous") {
      if (status === IssueStatus.REJECTED && oldStatus !== IssueStatus.REJECTED) {
        updateUserTrustScore(report.reportedBy, -25);
      } else if (status === IssueStatus.ACKNOWLEDGED && oldStatus !== IssueStatus.ACKNOWLEDGED) {
        updateUserTrustScore(report.reportedBy, 10);
      } else if (status === IssueStatus.RESOLVED && oldStatus !== IssueStatus.RESOLVED) {
        updateUserTrustScore(report.reportedBy, 15);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
};

export const updateStatusByToken = (id: string, token: string, status: IssueStatus): boolean => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === id && r.authorityToken === token);
  
  if (index !== -1) {
    updateStatus(id, status, 'AUTHORITY');
    return true;
  }
  return false;
};

export const getEmailLogs = (): EmailLog[] => {
  const data = localStorage.getItem(LOG_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmailLog = (log: EmailLog) => {
  const logs = getEmailLogs();
  logs.unshift(log);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
};

export const getPendingReports = (): Report[] => {
  return getReports().filter(r => !r.synced);
};

export const getAuthorityDirectory = (): AuthorityDirectoryEntry[] => {
  const data = localStorage.getItem(AUTH_DIR_KEY);
  return data ? JSON.parse(data) : [];
};
