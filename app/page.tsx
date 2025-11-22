"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { instrumentSerif, instrumentSerifItalic } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  CircleStop,
  Menu,
  MessageCircle,
  Volume2,
  VolumeXIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Home = () => {
  const router = useRouter();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [open, setOpen] = useState(false);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    audioRef.current.muted = newMuteState;

    if (!newMuteState) {
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.09;
    }
  }, []);

  return (
    <section className="w-full h-screen text-white p-4 bg-no-repeat bg-cover bg-center bg-[url(/landing-bg-sm.png)] sm:bg-[url(/landing-bg.png)]">
      <audio ref={audioRef} src={"/halo.mp3"} autoPlay loop muted />
      <div className="w-full flex justify-between">
        <div>
          <p
            className={cn(
              instrumentSerifItalic.className,
              "text-2xl flex items-center gap-1"
            )}
          >
            <span>
              <CircleStop />
            </span>
            MeetLume
          </p>
        </div>
        <div className="list-none gap-6 text-shadow-md text-lg hidden md:flex [&>li:hover]:underline underline-offset-3 [&>li]:cursor-pointer">
          <li>Resources</li>
          <li>Contact Us</li>
          <li
            onClick={() => {
              signIn.social({
                provider: "google",
              });
            }}
          >
            Sign in
          </li>
        </div>
        <div
          className="list-none md:hidden"
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        >
          {open ? <X /> : <Menu />}
        </div>
      </div>
      {open && (
        <div className="list-none absolute [&>li:hover]:underline">
          <li>Resources</li>
          <li>Contact Us</li>
          <li
            onClick={() => {
              signIn.social({
                provider: "google",
              });
            }}
          >
            Sign in
          </li>
        </div>
      )}
      <div className=" w-full h-[calc(100vh-160px)] flex flex-col items-center justify-center text-shadow-xs gap-4">
        <div className="max-w-sm px-2 py-1 rounded-full bg-black/10 flex items-center justify-center gap-2">
          <span>
            <MessageCircle className="fill-white" size={18} />
          </span>
          <p className="flex items-center">
            Introducing AI Chat
            <ChevronRight className="text-sm" size={18} />
          </p>
        </div>
        <p
          className={cn(
            instrumentSerif.className,
            "text-5xl md:text-6xl lg:text-7xl font-semibold"
          )}
        >
          Supercharge your meetings <br className="" /> with intelligent
          summaries
        </p>
        <p className="text-sm sm:text-base text-center max-w-xl">
          MeetLume is the AI assistant that records, transcribes, and summarizes
          your conversations so you can focus on the discussion.
        </p>

        <div className="space-x-4">
          <Button
            onClick={() => {
              router.push("/home");
            }}
            className="p-6 bg-white/90 text-black hover:bg-white/80"
          >
            Get Started
          </Button>
          <Button className="p-6 bg-black/70 hover:bg-black/60">
            How it works?
          </Button>
        </div>
      </div>
      <button
        onClick={handleToggleAudio}
        className="absolute bottom-6 left-6 hover:scale-110 transition-all rounded-lg bg-white/20 p-2"
      >
        {isMuted ? <VolumeXIcon size={22} /> : <Volume2 size={22} />}
      </button>
    </section>
  );
};

export default Home;
