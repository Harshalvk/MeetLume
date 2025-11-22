"use client";

import { useMeetingDetail } from "@/hooks/useMeetingDetail";
import React from "react";
import MeetingHeader from "./_components/MeetingHeader";
import { useSearchParams } from "next/navigation";
import MeetingInfo from "./_components/MeetingInfo";
import ActionItems from "./_components/action-items/ActionItems";
import TranscriptDisplay from "./_components/TranscriptDisplay";
import ChatSidebar from "./_components/ChatSidebar";
import CustomAudioPlayer from "./_components/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatSidebarTrigger from "@/components/ChatSidebarTrigger";

const MeetingPage = () => {
  const {
    meetingId,
    isOwner,
    userChecked,
    chatInput,
    messages,
    showSuggestions,
    meetingData,
    loading,
    handleSendMessage,
    handleSuggestionClick,
    handleInputChange,
    deleteActionItem,
    addActionItem,
    displayActionItems,
    meetingInfoData,
  } = useMeetingDetail();

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <MeetingHeader
        title={meetingData?.title || "Meeting"}
        meetingId={meetingId}
        summary={meetingData?.summary}
        actionItems={
          meetingData?.actionItems
            ?.map((item) => `» ${item.text}`)
            .join("\n") || ""
        }
        isOwner={isOwner}
        isLoading={!userChecked}
      />

      <div className="flex h-full overflow-y-auto">
        <div className="flex-1 flex flex-col justify-between">
          <div
            className={`p-6 overflow-y-auto ${!useSearchParams ? "" : !isOwner ? "max-w-4xl mx-auto" : ""}`}
          >
            <div className="w-full flex justify-between">
              <MeetingInfo meetingData={meetingInfoData} />
              <ChatSidebarTrigger />
            </div>
            <div className="mb-8">
              <div className="flex">
                <Tabs defaultValue="summary">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary">
                    <div>
                      {loading ? (
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Loading meeting data...
                          </p>
                        </div>
                      ) : meetingData?.processed ? (
                        <div className="space-y-6">
                          {meetingData.summary && (
                            <div className="bg-card border border-border rounded-lg p-6">
                              <h3 className="text-lg font-semibold text-foreground mb-3">
                                Meeting Summary
                              </h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {meetingData.summary}
                              </p>
                            </div>
                          )}
                          {!userChecked ? (
                            <div className="bg-card border border-border rounded-lg p-6">
                              <div className="animate-spin">
                                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                                <div className="space-y-2">
                                  <div className="h-3 bg-muted rounded w-3/4" />
                                  <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {isOwner && displayActionItems.length > 0 && (
                                <ActionItems
                                  actionItems={displayActionItems}
                                  onDeleteItem={deleteActionItem}
                                  onAddItem={addActionItem}
                                  meetingId={meetingId}
                                />
                              )}
                              {!isOwner && displayActionItems.length > 0 && (
                                <div className="bg-card rounded-lg p-6 border border-border">
                                  <h3 className="text-lg font-semibold text-foreground mb-4">
                                    Action Items
                                  </h3>
                                  <div className="space-y-3">
                                    {displayActionItems.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-3"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <p className="text-sm text-foreground">
                                          {item.text}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Processing meeting with AI...
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            You&apos;ll recieve an email when ready
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="transcript" className="h-full w-full">
                    {loading ? (
                      <div className="bg-card border border-border rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Loading meeting data...
                        </p>
                      </div>
                    ) : meetingData?.transcript ? (
                      <TranscriptDisplay transcript={meetingData.transcript} />
                    ) : (
                      <div className="bg-card rounded-lg p-6 border border-border text-center">
                        <p className="text-muted-foreground">
                          No transcript available
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          <CustomAudioPlayer
            recordingUrl={meetingData?.recordingUrl}
            isOwner={isOwner}
          />
        </div>
        {!userChecked ? (
          <div className="w-90 border-l border-border p-4 bg-card">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4">
                <div className="space-y-3">
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChatSidebar
            messages={messages}
            chatInput={chatInput}
            showSuggestions={showSuggestions}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
      </div>
    </div>
  );
};

export default MeetingPage;
