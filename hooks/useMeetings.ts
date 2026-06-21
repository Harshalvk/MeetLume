"use client";

import { BotToggleAction } from "@/app/actions/meetings/botToggle";
import { PastMeetingsAction } from "@/app/actions/meetings/pastMeeting";
import { UpcomingMeetingsAction } from "@/app/actions/meetings/upcomingMeeting";
import { CalendarStatusAction } from "@/app/actions/user/calendarStatus";
import { useSession } from "@/lib/auth-client";
import { ICalendarEvent, IPastMeeting } from "@/lib/types";
import { useEffect, useState } from "react";

export function useMeetings() {
  const { data: session } = useSession();

  const [upcomingEvents, setUpcomingEvents] = useState<ICalendarEvent[]>([]);
  const [pastMeetings, setPastMeetings] = useState<IPastMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [pastLoading, setPastLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>("");
  const [botToggles, setBotToggles] = useState<{ [key: string]: boolean }>({});
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (session?.user.id) {
      fetchUpcomingEvents();
    }
  }, [session?.user.id]);

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const calendarStatus = await CalendarStatusAction();

      if (!calendarStatus.connected) {
        setConnected(false);
        setUpcomingEvents([]);
        setError(
          "Calendar not connected for auto-sync. Connect to enable auto syncing."
        );
        setLoading(false);
        setInitialLoading(false);
        return;
      }

      const upcomingMeetings = await UpcomingMeetingsAction();

      if (!upcomingMeetings.success) {
        setError(upcomingMeetings.error || "Failed to fetch meetings");
        setConnected(false);
        setInitialLoading(false);
        return;
      }

      setUpcomingEvents(upcomingMeetings.events as ICalendarEvent[]);
      setConnected(upcomingMeetings.connected);

      const toggles: { [key: string]: boolean } = {};
      upcomingMeetings.events.forEach((event) => {
        toggles[event.id] = event.botScheduled ?? true;
      });

      setBotToggles(toggles);
    } catch {
      setError("Failed to fetch calendar events. Please try again");
      setConnected(false);
    }

    setLoading(false);
    setInitialLoading(false);
  };

  const fetchPastMeetings = async () => {
    try {
      const previousMeetings = await PastMeetingsAction();

      if (!previousMeetings.success) {
        console.error(
          "Failed to fetch past meetings: ",
          previousMeetings.error
        );
      }

      if (previousMeetings.error) {
        return;
      }

      setPastMeetings(previousMeetings.meetings as IPastMeeting[]);
    } catch (error) {
      console.error("Failed to fetch past meetings: ", error);
    }

    setPastLoading(false);
  };

  const toggleBot = async (eventId: string) => {
    try {
      const event = upcomingEvents.find((event) => event.id === eventId);

      if (!event?.meetingId) {
        return;
      }

      setBotToggles((prev) => ({
        ...prev,
        [eventId]: !prev[eventId],
      }));

      const toggleBotActionResponse = await BotToggleAction({
        meetingId: event.meetingId,
        botScheduled: !botToggles[eventId],
      });

      if (!toggleBotActionResponse.success) {
        setBotToggles((prev) => ({
          ...prev,
          [eventId]: !prev[eventId],
        }));
      }
    } catch {
      setBotToggles((prev) => ({
        ...prev,
        [eventId]: !prev[eventId],
      }));
    }
  };

  const directOAuth = async () => {
    setLoading(true);

    try {
      window.location.href = "/api/v1/google/direct-connect";
    } catch {
      setError("Failed to start direct OAuth");
      setLoading(false);
    }
  };

  type Attendee = { name: string; image: string };
  type AttendeesInput = Attendee | Attendee[] | string;

  const getAttendeeList = (attendees: AttendeesInput): string[] => {
    if (!attendees) {
      return [];
    }

    if (Array.isArray(attendees)) {
      return attendees.map((a) => a.name.trim()).filter(Boolean);
    }

    if (typeof attendees === "string") {
      try {
        const parsed: Attendee | Attendee[] = JSON.parse(attendees);

        if (Array.isArray(parsed)) {
          return parsed.map((a) => a.name.trim()).filter(Boolean);
        }

        return parsed.name ? [parsed.name.trim()] : [];
      } catch {
        return attendees
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);
      }
    }

    return attendees.name ? [attendees.name.trim()] : [];
  };
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return {
    userId: session?.user.id,
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
  };
}
