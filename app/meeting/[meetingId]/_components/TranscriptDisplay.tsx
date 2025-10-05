import { ScrollArea } from "@/components/ui/scroll-area";
import { ITranscriptSegment } from "@/lib/types";
import React from "react";

interface TranscriptDisplayProps {
  transcript: ITranscriptSegment[];
}

const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getSpeakerSegmentTime = (segment: ITranscriptSegment) => {
    const startTime = segment.offset;
    const endtTime = segment.words[segment.words.length - 1]?.end;
    return `${formatTime(startTime)} - ${formatTime(endtTime)}`;
  };

  const getSegmentText = (segment: ITranscriptSegment) => {
    return segment.words.map((word) => word.word).join(" ");
  };

  if (!transcript || transcript.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border text-center">
        <p className="text-muted-foreground">No transcript available</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Meeting transcript
      </h3>

      <ScrollArea className="space-y-4 h-96">
        {transcript.map((segment, index) => (
          <div
            key={index}
            className="py-4 border-b border-border last:border-b-0 text-wrap w-fit"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-medium text-foreground">
                {segment.speaker}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {getSpeakerSegmentTime(segment)}
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed pl-4">
              {getSegmentText(segment)}
            </p>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default TranscriptDisplay;
