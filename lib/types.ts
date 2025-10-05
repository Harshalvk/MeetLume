export interface IPlanLimits {
  meetings: number;
  chatMessages: number;
}

export const PLAN_LIMITS: Record<string, IPlanLimits> = {
  free: { meetings: 0, chatMessages: 0 },
  starter: { meetings: 10, chatMessages: 30 },
  pro: { meetings: 30, chatMessages: 100 },
  premium: { meetings: -1, chatMessages: -1 },
};

export interface IUsageData {
  currentPlan: string;
  subscriptionStatus: string;
  meetingsThisMonth: number;
  chatMessagesToday: number;
  billingPeriodStart: string | null;
}

export interface ICalendarEvent {
  id: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{ email: string }>;
  location?: string;
  hangoutLink?: string;
  conferenceData?: unknown;
  botScheduled?: boolean;
  meetingId?: string;
}

export interface IPastMeeting {
  id: string;
  title: string;
  description?: string | null;
  meetingUrl: string | null;
  startTime: Date;
  endTime: Date;
  attendees?: unknown;
  transcriptReady: boolean;
  recordingUrl?: string | null;
  speakers?: unknown;
}

export interface ITranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface ITranscriptSegment {
  words: ITranscriptWord[];
  offset: number;
  speaker: string;
}
