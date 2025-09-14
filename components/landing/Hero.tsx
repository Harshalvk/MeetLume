import { spectral } from "@/lib/fonts";
import React from "react";
import { Button } from "../ui/button";

const Hero = () => {
  return (
    <div className="w-full h-full">
      <div className="border w-full h-full rounded-xl bg-primary/2 flex flex-col items-center">
        <div className="w-full h-1/2 flex flex-col items-center justify-center gap-4">
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-semibold ${spectral.className} italic text-center tracking-tight`}
          >
            Never Miss a Meeting <br className="" /> Moment, insight, or action
            item.
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-center max-w-3xl text-muted-foreground/95">
            MeetLume is the AI assistant that records, transcribes, and
            summarizes your conversations so you can focus on the discussion.
          </p>
          <div className="space-x-3">
            <Button className="rounded-lg" variant={"outline"}>
              Get Started
            </Button>
            <Button className="rounded-lg" variant={"secondary"}>
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
