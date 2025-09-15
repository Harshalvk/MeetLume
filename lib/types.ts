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
