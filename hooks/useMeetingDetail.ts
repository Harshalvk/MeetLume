"use client";

import { useSession } from "@/lib/auth-client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useChatCore } from "./useChatCore";
import { IActionItem } from "./useActionItems";

export interface MeetingData {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  transcript?: unknown;
  summary?: string;
  actionItems?: Array<{
    id: number;
    text: string;
  }>;
  processed: boolean;
  processedAt?: string;
  recordingUrl?: string;
  emailSent: boolean;
  emailSentAt?: string;
  userId?: string;
  user?: {
    name?: string;
    email?: string;
  };
  ragProcessed?: boolean;
}

type TranscriptSegment = {
  speaker: string;
  words: { word: string }[];
};

type Transcript = string | TranscriptSegment[];

interface IMeeting {
  transcript: Transcript;
  ragProcessed: boolean;
  userId: string;
  title: string;
}

export function useMeetingDetail() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const { data: session } = useSession();

  const [isOwner, setIsOwner] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  const [activeTab, setActiveTab] = useState<"summary" | "transcript">(
    "summary"
  );
  const [localActionItems, setLocalActionItems] = useState<IActionItem[]>([]);

  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);

  const chat = useChatCore({
    apiEndpoint: "/api/rag/chat-meeting",
    getRequestBody: (input) => ({
      meetingId,
      quesion: input,
    }),
  });

  const handleSendMessage = async () => {
    if (!chat.chatInput.trim() || !isOwner) {
      return;
    }

    await chat.handleSendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isOwner) {
      return;
    }

    chat.handleSuggestionClick(suggestion);
  };

  const handleInputChange = (value: string) => {
    if (!isOwner) {
      return;
    }

    chat.handleInputChange(value);
  };

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await fetch(`/api/meetings/${meetingId}`);

        if (response.ok) {
          const data = await response.json();

          setMeetingData(data);

          if (session) {
            const ownerStatus = session.user.id === data.userId;

            setIsOwner(ownerStatus);
            setUserChecked(true);
          }

          if (data.actionItems && data.actionItems.length > 0) {
            setLocalActionItems(data.actionItems);
          } else {
            setLocalActionItems([]);
          }
        }
      } catch (error) {
        console.error("Error fetching meeting:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchMeeting();
    }
  }, [meetingId, session]);

  useEffect(() => {
    const processTranscript = async () => {
      try {
        const meetingResponse = await fetch(`/api/meetings/${meetingId}`);

        if (!meetingResponse.ok) {
          return;
        }

        const meeting: IMeeting = await meetingResponse.json();

        if (
          meeting.transcript &&
          !meeting.ragProcessed &&
          session?.user.id == meeting.userId
        ) {
          let transcriptText = "";

          if (typeof meeting.transcript === "string") {
            transcriptText = meeting.transcript;
          } else if (Array.isArray(meeting.transcript)) {
            transcriptText = meeting.transcript
              .map(
                (segment) =>
                  `${segment.speaker}: ${segment.words
                    .map((w) => w.word)
                    .join(" ")}`
              )
              .join("\n");
          }

          await fetch("/api/rag/process", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              meetingId,
              transcript: transcriptText,
              meetingtitle: meeting.title,
            }),
          });
        }
      } catch (error) {
        console.error("Error checking RAG processing: ", error);
      }
    };

    if (session) {
      processTranscript();
    }
  }, [meetingId, session]);

  const deleteActionItem = async (id: number) => {
    if (!isOwner) {
      return;
    }

    setLocalActionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addActionItem = async (text: string) => {
    if (!isOwner) {
      return;
    }

    try {
      const response = await fetch(`/api/meetings/${meetingId}`);
      if (response.ok) {
        const data = await response.json();

        setMeetingData(data);
        setLocalActionItems(data || []);
      }
    } catch (error) {
      console.error("Error refetching meeting data: ", error);
    }
  };

  const displayActionItems =
    localActionItems.length > 0
      ? localActionItems.map((actionItem) => ({
          id: actionItem.id,
          text: actionItem.text,
        }))
      : [];

  const meetingInfoData = meetingData
    ? {
        title: meetingData.title,
        date: new Date(meetingData.startTime).toLocaleString(),
        time: `${new Date(meetingData.startTime).toLocaleTimeString()} - ${new Date(meetingData.endTime).toLocaleTimeString()}`,
        userName: meetingData.user?.name || "User",
      }
    : {
        title: "loading...",
        date: "loading...",
        time: "loading...",
        userName: "loading...",
      };

  return {
    meetingId,
    isOwner,
    userChecked,
    activeTab,
    setActiveTab,
    localActionItems,
    setLocalActionItems,
    meetingData,
    setMeetingData,
    loading,
    setLoading,
    chatInput: chat.chatInput,
    setChatInput: chat.setChatInput,
    messages: chat.messages,
    setMessages: chat.setMessages,
    showSuggestions: chat.showSuggestions,
    setShowSuggestions: chat.setShowSuggestions,
    isLoading: chat.isLoading,
    setIsLoading: chat.setIsLoading,
    handleSendMessage,
    handleSuggestionClick,
    handleInputChange,
    deleteActionItem,
    addActionItem,
    displayActionItems,
    meetingInfoData,
  };
}
