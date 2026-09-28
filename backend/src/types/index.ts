export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  accountTier: 'Starter' | 'Pro' | 'Enterprise';
  environment: {
    os: string;
    browser: string;
    authMethod: 'Password' | 'SSO' | 'Google OAuth';
    paymentMethod: string;
  };
  createdAt: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  issueType: 'Payment' | 'Login/MFA' | 'Dashboard' | 'SSO' | 'Account Config';
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolutionSummary?: string;
}

export interface Message {
  id: string;
  ticketId: string;
  customerId: string;
  sender: 'customer' | 'agent' | 'ai';
  message: string;
  timestamp: string;
  recalledMemoriesUsed?: HindsightMemory[];
  memoryOperationStatus?: 'recalled' | 'no_memory' | 'unavailable' | 'bypassed';
}

export interface HindsightMemory {
  id: string;
  bankId: string;
  content: string;
  relevanceScore?: number;
  relevanceReason?: string;
  type?: 'experience' | 'observation' | 'fact' | 'preference' | 'model';
  category?: 'successful_solution' | 'repeated_issue' | 'preference' | 'environment' | 'context';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  customerId: string;
  ticketId?: string;
  message: string;
  useMemory?: boolean; // For Before vs After Demonstration toggle
}

export interface SupportRecommendation {
  detectedIssue: string;
  relevantPreviousExperience?: string | null;
  suggestedAction: string;
  escalation?: {
    recommended: boolean;
    reason?: string;
    targetTeam?: string;
    urgency?: 'low' | 'medium' | 'high';
  } | null;
}

export interface ChatResponse {
  message: string;
  ticketId: string;
  customerId: string;
  recalledMemories: HindsightMemory[];
  newlyRetainedMemories: HindsightMemory[];
  suggestedAction?: string;
  recommendation?: SupportRecommendation;
  memoryStatus: 'active' | 'empty' | 'unavailable' | 'bypassed_without_memory';
  llmModel: string;
  executionTimeMs: number;
  observability: {
    promptContext: string;
    hindsightBankId: string;
    memoryRecallQuery: string;
    retentionDecision: string;
    errorDetails?: string;
  };
}

export interface SystemStatus {
  hindsight: {
    status: 'connected' | 'disconnected' | 'error';
    baseUrl: string;
    details: string;
  };
  llm: {
    provider: 'Groq' | 'Fallback';
    model: string;
    configured: boolean;
  };
  database: {
    customersCount: number;
    ticketsCount: number;
    messagesCount: number;
  };
}

export interface IssueTypeMetric {
  type: string;
  count: number;
  percentage: number;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  repeatedIssues: number;
  customersWithHistory: number;
  memoryEnabledConversations: number;
  commonIssueTypes: IssueTypeMetric[];
}

