
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type SignalSeverity = "INFO" | "WARNING" | "CRITICAL";
export type SignalType = 
  | "STALE_REGISTRATIONS"
  | "LOW_TEAM_FORMATION"
  | "LOW_SUBMISSION"
  | "NO_RECENT_ANNOUNCEMENT"
  | "JUDGE_ACCEPTANCE_LOW"
  | "REGISTRATION_LOW"
  | "SUBMISSION_LOW";

export type AnomalyType = "INACTIVE_PERIOD" | "SPIKE" | "DROP" | "UNUSUAL_PATTERN";
export type AnomalySeverity = "INFO" | "WARNING" | "CRITICAL";



// ============================================================================
// TYPES & INTERFACES health overview 
// ============================================================================

export interface KeySignal {
  type: SignalType;
  message: string;
  severity: SignalSeverity;
  affectedCount: number;
}

export interface HealthOverview {
  overallHealthScore: number;
  riskLevel: RiskLevel;
  totalActiveHackathons: number;
  totalRegistrations: number;
  totalSubmissions: number;
  totalAnnouncements: number;
  totalJudges: number;
  keySignals: KeySignal[];
  timestamp: string;
}

// ============================================================================
// TYPES & INTERFACES   diagnostics
// ============================================================================

export interface RegistrationMetrics {
  targetRegistrations: number;
  actualRegistrations: number;
  approvalRate: number;
  registrationGap: number;
  registrationHealthPercent: number;
}

export interface SubmissionMetrics {
  totalTeams: number;
  totalSubmissions: number;
  submissionRate: number;
  draftSubmissions: number;
  submittedSubmissions: number;
  underReviewSubmissions: number;
  rejectedSubmissions: number;
  submissionHealthPercent: number;
}

export interface JudgeMetrics {
  totalInvited: number;
  totalAccepted: number;
  acceptanceRate: number;
  pendingInvitations: number;
  judgeHealthPercent: number;
}

export interface ActivitySignal {
  type: SignalType;
  message: string;
  severity: SignalSeverity;
  recommendation: string;
}

export interface HackathonDiagnostic {
  hackathonId: string;
  hackathonTitle: string;
  status: string;
  healthScore: number;
  riskLevel: RiskLevel;
  registrationMetrics: RegistrationMetrics;
  submissionMetrics: SubmissionMetrics;
  judgeMetrics: JudgeMetrics;
  activitySignals: ActivitySignal[];
  recentAnnouncementsCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TYPES & INTERFACES Organizers At-Risk
// ============================================================================



export interface AtRiskOrganizer {
  organizerId: string;
  organizerName: string;
  hackathonId: string;
  hackathonTitle: string;
  riskScore: number;
  riskLevel: RiskLevel;
  primaryConcerns: string[];
  secondaryConcerns: string[];
  recommendedActions: string[];
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AtRiskOrganizersResponse {
  organizers: AtRiskOrganizer[];
  totalCount: number;
  page: number;
  limit: number;
  timestamp: string;
}

// ============================================================================
// TYPES & INTERFACES Anomalies
// ============================================================================

export interface Anomaly {
  id: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  hackathonId: string;
  hackathonTitle: string;
  detectedAt: string;
  metric: string;
  expectedValue: string;
  actualValue: string;
  deviation: number;
  description: string;
  possibleCauses: string[];
  recommendedActions: string[];
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnomaliesResponse {
  anomalies: Anomaly[];
  totalCount: number;
  severitySummary: {
    critical: number;
    warning: number;
    info: number;
  };
  page: number;
  limit: number;
  timestamp: string;
}
