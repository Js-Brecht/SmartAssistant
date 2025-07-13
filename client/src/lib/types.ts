export interface DashboardStats {
  unreadEmails: number;
  pendingTasks: number;
  todayMeetings: number;
  aiDrafts: number;
  urgentTasks: number;
  highPriorityEmails: number;
}

export interface EmailWithAnalysis {
  id: number;
  userId: number;
  sender: string;
  senderEmail: string;
  subject: string;
  content: string;
  priority: "high" | "medium" | "low";
  category: string;
  isRead: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  receivedAt: Date;
  responseNeeded: boolean;
  aiSummary?: string;
  tags?: string[];
}

export interface TaskWithSource {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low" | "urgent";
  status: "pending" | "completed" | "in_progress";
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  sourceType?: "email" | "calendar" | "manual";
  sourceId?: number;
  estimatedDuration?: number;
}

export interface CalendarEventDetails {
  id: number;
  userId: number;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  eventType: string;
  priority: "high" | "medium" | "low";
  attendees?: string[];
  meetingLink?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface AiDraftDetails {
  id: number;
  userId: number;
  emailId?: number;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  tone: "professional" | "friendly" | "formal" | "casual";
  status: "draft" | "approved" | "sent" | "discarded";
  createdAt: Date;
  approvedAt?: Date;
  sentAt?: Date;
  aiModel: string;
  confidence: number;
}

export interface ContactDetails {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  tags?: string[];
  lastContactDate?: Date;
  createdAt: Date;
  relationship: "professional" | "personal" | "vendor" | "client";
}

export type Priority = "high" | "medium" | "low" | "urgent";
export type TaskStatus = "pending" | "completed" | "in_progress";
export type DraftStatus = "draft" | "approved" | "sent" | "discarded";
