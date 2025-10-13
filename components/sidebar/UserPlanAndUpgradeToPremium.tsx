import { IPlanLimits, IUsageData } from "@/lib/types";
import React from "react";
import CircularProgressBar from "./CircularProgress";
import Link from "next/link";
import { Button } from "../ui/button";

interface IUserPlanAndUpgradeToPremiumProps {
  upgradeInfo: {
    title: string;
    description: string;
    showButton: boolean;
  };
  usage: IUsageData;
  limits: IPlanLimits;
  meetingProgress: number;
  chatProgress: number;
}

const UserPlanAndUpgradeToPremium = ({
  usage,
  limits,
  meetingProgress,
  chatProgress,
  upgradeInfo,
}: IUserPlanAndUpgradeToPremiumProps) => {
  return (
    <div className="rounded-lg bg-sidebar-accent/50 p-1 outline relative">
      <p className="text-sm font-medium text-sidebar-accent-foreground m-3 absolute text-end right-0 top-0">
        {usage.currentPlan.toUpperCase()}
      </p>
      <div className="flex gap-3 p-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-accent-foreground/70">
              Meetings
            </span>
          </div>
          {limits.meetings !== -1 && (
            <CircularProgressBar color="#1e1e1e" value={meetingProgress}>
              <span className="text-xs text-sidebar-accent-foreground/70">
                {usage.meetingsThisMonth}/
                {limits.meetings === -1 ? "∞" : limits.meetings}
              </span>
            </CircularProgressBar>
          )}
          {limits.meetings === -1 && (
            <div className="text-xs text-sidebar-accent-foreground/50 italic">
              Unlimited
            </div>
          )}
        </div>
        <div className="space-y-2 mb-3 flex flex-col items-center">
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-accent-foreground/70">
              Chat Messages
            </span>
          </div>
          {limits.chatMessages !== -1 && (
            <CircularProgressBar color="#1e1e1e" value={chatProgress}>
              <span className="text-xs text-sidebar-accent-foreground/70">
                {usage.chatMessagesToday}/
                {limits.chatMessages === -1 ? "∞" : limits.chatMessages}
              </span>
            </CircularProgressBar>
          )}
        </div>
        {limits.chatMessages === -1 && (
          <div className="text-xs text-sidebar-accent-foreground/50 italic">
            Unlimited
          </div>
        )}
      </div>

      <div className="rounded-lg bg-sidebar-accent p-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-sidebar-accent-foreground">
              {upgradeInfo.title}
            </p>
            <p className="text-xs text-sidebar-accent-foreground/70">
              {upgradeInfo.description}
            </p>
          </div>
          {upgradeInfo.showButton && (
            <Link href="/pricing">
              <Button className="w-full rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer">
                {upgradeInfo.title}
              </Button>
            </Link>
          )}
          {!upgradeInfo.showButton && (
            <div className="text-center py-2">
              <span className="text-xs text-sidebar-accent-foreground/60">
                🎉 Thank you for your support!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPlanAndUpgradeToPremium;
