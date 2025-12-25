
import { Report, IssueCategory, EmailLog, IssueStatus } from "../types";
import { generateAuthorityEmail } from "./geminiService";
import { getAuthorityForIssue } from "./authorityDirectory";
import { saveEmailLog, updateStatus, saveReport } from "./mockDatabase";

export interface EmailDispatchResult {
  success: boolean;
  recipients: string[];
  content: string;
}

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

/**
 * CivicWatch Full-Flow Orchestrator
 * This function simulates the entire backend logic from analysis to dispatch.
 */
export const executeCompleteBackendFlow = async (report: Report): Promise<EmailDispatchResult> => {
  if (!report.analysis) throw new Error("Backend Flow requires initial AI Analysis");

  console.log(`[System Flow] Initializing Pipeline for Report: ${report.id}`);

  try {
    // 1. Database-Driven Authority Selection
    const authority = await getAuthorityForIssue(report.location, report.analysis.category);
    const recipients = [...authority.emails];

    // 2. AI Content Generation (Formal Liasion Persona)
    const emailBody = await generateAuthorityEmail(report);
    const subject = `[URGENT] ${report.analysis.severity} Hazard: ${report.analysis.category} | Area: ${authority.region}`;

    // 3. Persistent Audit Logging
    const log: EmailLog = {
      id: crypto.randomUUID(),
      reportId: report.id,
      timestamp: Date.now(),
      recipients,
      subject,
      content: emailBody,
      status: 'SENT',
      authorityName: authority.name
    };

    saveEmailLog(log);

    // 4. Update Report with Authority Dispatch Info
    // status: EMAILED shows the user that the "real" email phase is done.
    const updatedReport: Report = {
      ...report,
      status: IssueStatus.EMAILED,
      emailSent: true,
      emailStatus: 'SENT',
      emailedTo: `${authority.name} (${maskEmail(recipients[0])})`,
      emailedAt: Date.now()
    };
    
    saveReport(updatedReport);

    console.group(`[Backend Dispatch Successful]`);
    console.log(`Authority: ${authority.name}`);
    console.log(`Notification: Dispatched to ${recipients.length} endpoints`);
    console.groupEnd();

    // Simulated latency for high-stakes processing
    await new Promise(r => setTimeout(r, 1500));

    return {
      success: true,
      recipients,
      content: emailBody
    };
  } catch (err) {
    console.error("[Backend Flow] Pipeline Failed:", err);
    
    // Track failure in the report record
    const failedReport: Report = {
      ...report,
      status: IssueStatus.REJECTED,
      emailSent: false,
      emailStatus: 'FAILED'
    };
    saveReport(failedReport);
    
    throw err;
  }
};

// Keeping for backward compatibility with existing components
export const dispatchAutomatedNotification = executeCompleteBackendFlow;
