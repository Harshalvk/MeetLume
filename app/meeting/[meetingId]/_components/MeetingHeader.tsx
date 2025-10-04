"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Check, Eye, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface IMeetingHeaderProps {
  title: string;
  meetingId?: string;
  summary?: string;
  actionItems?: string;
  isOwner: boolean;
  isLoading?: boolean;
}

const MeetingHeader = ({
  title,
  meetingId,
  summary,
  actionItems,
  isOwner,
  isLoading = false,
}: IMeetingHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  const { mutate: handlePostToSlack, isPending: isPosting } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/slack/post-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          summary: summary || "Meeting summary not available",
          actionItems: actionItems || "No action items created",
        }),
      });

      return await response.json();
    },
    onError: () => {
      toast.error("Meeting details not posted", { id: "meeting-post-status" });
    },
    onSuccess: () => {
      toast.success("Meeting details posted successfully", {
        id: "meeting-post-status",
      });
    },
  });

  const handleShare = async () => {
    if (!meetingId) return;

    try {
      const shareUrl = `${window.location.origin}/meeting/${meetingId}`;
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      toast.success("Meeting link copied!", {
        id: "meeting-post-status",
        action: {
          label: "OK",
          onClick: () => {},
        },
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy meeting url: ", error);
    }
  };

  const { mutate: handleDeleteMeeting, isPending: isDeletingMeeting } =
    useMutation({
      mutationFn: async () => {
        if (!meetingId) return;

        await fetch(`/api/v1/meetings/${meetingId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
      onSuccess: () => {
        toast.success("Meeting deleted!", { id: "meeting-post-status" });
        router.push("/home");
      },
      onError: () => {
        toast.error("Meeting not deleted", { id: "meeting-post-status" });
      },
    });

  return (
    <div className="bg-card border-b border-border px-6 py-3.5 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground">
            Loading...
          </div>
        </div>
      ) : isOwner ? (
        <div className="flex gap-3">
          <Button
            onClick={() => handlePostToSlack()}
            disabled={isPosting || !meetingId}
            variant={"outline"}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer disabled:cursor-not-allowed"
          >
            <img src={"/slack.png"} alt="Slack" className="w-4 h-4 mr-2" />
            {isPosting ? "Posting..." : "Post to Slack"}
          </Button>

          <Button
            onClick={handleShare}
            variant={"outline"}
            className="flex items-center gap-2 px-4 bg-muted rounded-lg hover:bg-muted/800 transition-colors text-foreground text-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share
              </>
            )}
          </Button>

          <Button
            onClick={() => handleDeleteMeeting()}
            disabled={isDeletingMeeting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-white hover:bg-descructive/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            {isDeletingMeeting ? "Deleting Meeting..." : "Delete Meeting"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          Viewing shared meeting
        </div>
      )}
    </div>
  );
};

export default MeetingHeader;
