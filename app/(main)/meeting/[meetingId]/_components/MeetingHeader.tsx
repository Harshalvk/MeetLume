/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

import { useMutation } from "@tanstack/react-query";
import { Check, Eye, Loader, Menu, Share2, Trash2 } from "lucide-react";
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
  const [confirmDeleteMeetingDialogOpen, setConfirmDeleteMeetingDialogOpen] =
    useState(false);

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
    <div>
      <div className="bg-sidebar border-b border-border px-3 py-1.5 flex justify-between items-center sticky top-0 z-30">
        <div className="flex gap-1 items-center">
          <SidebarTrigger />
          <h1 className="border-l pl-2 md:text-xl font-semibold text-foreground max-w-fit truncate">
            {title}
          </h1>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 ">
              <Loader className="h-4 w-4" />
            </div>
          </div>
        ) : isOwner ? (
          <div>
            <div className="hidden lg:flex gap-3">
              <Button
                onClick={() => handlePostToSlack()}
                disabled={isPosting || !meetingId}
                variant={"outline"}
                className="border cursor-pointer disabled:cursor-not-allowed"
              >
                <img
                  src={"/icons/slack.svg"}
                  alt="Slack"
                  className="w-4 h-4 mr-1"
                />
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
                onClick={() => setConfirmDeleteMeetingDialogOpen(true)}
                disabled={isDeletingMeeting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-white hover:bg-descructive/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                {isDeletingMeeting ? "Deleting Meeting..." : "Delete Meeting"}
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="lg:hidden">
                <Menu className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  disabled={isPosting || !meetingId}
                  onClick={() => handlePostToSlack()}
                >
                  <img
                    src={"/icons/slack.svg"}
                    alt="Slack"
                    className="w-4 h-4 mr-1"
                  />
                  {isPosting ? "Posting..." : "Post to Slack"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleShare}>
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
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteMeeting()}
                  disabled={isDeletingMeeting}
                  className="text-destructive flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  {isDeletingMeeting ? "Deleting Meeting..." : "Delete Meeting"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            Viewing shared meeting
          </div>
        )}
      </div>
      <Dialog
        open={confirmDeleteMeetingDialogOpen}
        onOpenChange={setConfirmDeleteMeetingDialogOpen}
      >
        <DialogContent className="bg-sidebar">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              meeting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={() => handleDeleteMeeting()}
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant={"secondary"}
              onClick={() => setConfirmDeleteMeetingDialogOpen(false)}
            >
              Cancle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingHeader;
