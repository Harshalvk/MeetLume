"use client";

interface IMeetingData {
  title: string;
  date: string;
  time: string;
  userName: string;
}

interface MeetingInfoProps {
  meetingData: IMeetingData;
}

import { useSession } from "@/lib/auth-client";
import { CalendarDays, Clock } from "lucide-react";
import React from "react";

const MeetingInfo = ({ meetingData }: MeetingInfoProps) => {
  const { data: session } = useSession();

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-foreground mb-3">
        {meetingData.title}
      </h2>

      <div className="text-sm text-muted-foreground mb-8 flex items-center gap-4 flex-wrap">
        <span className="flex item-center gap-2">
          <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-border">
            {session?.user.image ? (
              <img
                src={session.user.image}
                alt={`${meetingData.userName}'s profile`}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs text-primary font-medium">
                  {meetingData.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {meetingData.userName}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays />
          {meetingData.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock />
          {meetingData.time}
        </span>
      </div>
    </div>
  );
};

export default MeetingInfo;
