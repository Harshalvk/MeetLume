"use client";

import { useMeetings } from "@/hooks/useMeetings";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import PastMeetings from "./_components/PastMeetings";
import UpcomingMeetings from "./_components/UpcomingMeetings";

const Home = () => {
  const {
    userId,
    upcomingEvents,
    pastMeetings,
    loading,
    pastLoading,
    connected,
    error,
    botToggles,
    initialLoading,
    fetchUpcomingEvents,
    fetchPastMeetings,
    toggleBot,
    directOAuth,
    getAttendeeList,
    getInitials,
  } = useMeetings();

  const router = useRouter();
  const handleMeetingClick = (meetingId: string) => {
    router.push(`/meeting/${meetingId}`);
  };

  useEffect(() => {
    fetchPastMeetings();
  }, []);

  return (
    <div className="h-full">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-2xl text-foreground">Past Meetings</h2>
          </div>
          <PastMeetings
            pastMeetings={pastMeetings}
            pastLoading={pastLoading}
            onMeetingClick={handleMeetingClick}
            getAttendeeList={getAttendeeList}
            getInitials={getInitials}
          />
        </div>
        <div className="w-px bg-border"></div>
        <div className="w-96">
          <div className="sticky top-6">
            <UpcomingMeetings
              upcomingEvents={upcomingEvents}
              connected={connected}
              error={error}
              loading={loading}
              initialLoading={initialLoading}
              botToggles={botToggles}
              onRefresh={fetchUpcomingEvents}
              onToggleBot={toggleBot}
              onConnectCalendar={directOAuth}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
