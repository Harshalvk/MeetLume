"use client";

import { useSession } from "@/lib/auth-client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useChatCore } from "./useChatCore";
import { IActionItem } from "./useActionItems";
import { ITranscriptSegment } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface MeetingData {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  transcript?: ITranscriptSegment[];
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
    apiEndpoint: "/api/v1/rag/chat-meeting",
    getRequestBody: (input) => ({
      meetingId,
      question: input,
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

  const { data: meetingDataQuery } = useQuery({
    queryKey: ["fetch-action-items", meetingId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/meetings/${meetingId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch action items");
      }

      setLoading(false);

      return response.json();
    },
    enabled: !!session && !!meetingId,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (meetingDataQuery && session) {
      const ownerStatus = session.user.id === meetingDataQuery.userId;
      setIsOwner(ownerStatus);
      setUserChecked(true);
    }

    if (meetingDataQuery?.actionItems?.length > 0) {
      setLocalActionItems(meetingDataQuery.actionItems);
    } else {
      setLocalActionItems([]);
    }

    setMeetingData(meetingDataQuery);
  }, [meetingData, meetingDataQuery, meetingId, session]);

  const { data: meetingQuery } = useQuery({
    queryKey: ["fetch-meeting", meetingId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/meetings/${meetingId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch meeting details");
      }

      const data: IMeeting = await response.json();

      return data;
    },
  });

  const { mutate: processTranscriptionMutate } = useMutation({
    mutationFn: async ({
      meetingId,
      transcript,
      meetingTitle,
    }: {
      meetingId: string;
      transcript: string;
      meetingTitle: string;
    }) => {
      await fetch("/api/v1/rag/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          transcript,
          meetingTitle,
        }),
      });
    },
  });

  useEffect(() => {
    if (
      meetingQuery?.transcript &&
      meetingQuery.ragProcessed &&
      session?.user.id === meetingQuery.userId
    ) {
      let transcriptText = "";

      if (typeof meetingQuery.transcript === "string") {
        transcriptText = meetingQuery.transcript;
      } else if (Array.isArray(meetingQuery.transcript)) {
        transcriptText = meetingQuery.transcript
          .map(
            (segment) =>
              `${segment.speaker}: ${segment.words.map((w) => w.word).join(" ")}`
          )
          .join("\n");
      }

      processTranscriptionMutate({
        meetingId,
        transcript: transcriptText,
        meetingTitle: meetingQuery.title,
      });
    }
  }, [meetingId, session, meetingQuery]);

  const deleteActionItem = async (id: number) => {
    if (!isOwner) {
      return;
    }

    setLocalActionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addActionItem = async () => {
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
