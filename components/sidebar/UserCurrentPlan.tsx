import { IPlanLimits, IUsageData } from "@/lib/types";
import React from "react";

interface IUserCurrentPlanProps {
  usage: IUsageData;
  limits: IPlanLimits;
  meetingProgress: number;
  chatProgress: number;
}

const UserCurrentPlan = ({
  usage,
  limits,
  meetingProgress,
  chatProgress,
}: IUserCurrentPlanProps) => {
  return (
    <div className="rounded-lg bg-sidebar-accent/50 p-3  outline">
      <p className="text-xs font-medium text-sidebar-accent-foreground mb-3">
        Current Plan: {usage.currentPlan.toUpperCase()}
      </p>
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-sidebar-accent-foreground/70">
            Meetings
          </span>
          <span className="text-xs text-sidebar-accent-foreground/70">
            {usage.meetingsThisMonth}/
            {limits.meetings === -1 ? "∞" : limits.meetings}
          </span>
        </div>
        {limits.meetings !== -1 && (
          <div className="w-full bg-sidebar-accent/30 rounded-full h-2">
            <div
              className="dark:bg-white bg-black h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${meetingProgress}%` }}
            >
              {" "}
            </div>
          </div>
        )}
        {limits.meetings === -1 && (
          <div className="text-xs text-sidebar-accent-foreground/50 italic">
            Unlimited
          </div>
        )}
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-sidebar-accent-foreground/70">
            Chat Messages
          </span>
          <span className="text-xs text-sidebar-accent-foreground/70">
            {usage.chatMessagesToday}/
            {limits.chatMessages === -1 ? "∞" : limits.chatMessages}
          </span>
        </div>
        {limits.chatMessages !== -1 && (
          <div className="w-full bg-sidebar-accent/30 rounded-full h-2">
            <div
              className="dark:bg-white bg-black h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${chatProgress}%` }}
            >
              {" "}
            </div>
          </div>
        )}
        {limits.chatMessages === -1 && (
          <div className="text-xs text-sidebar-accent-foreground/50 italic">
            Unlimited
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCurrentPlan;
