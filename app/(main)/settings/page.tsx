"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { Bot, Save, Upload, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { data: userSession } = useSession();
  const [botName, setBotName] = useState("Lumi");
  const [botImageUrl, setBotImageUrl] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (userSession?.user.id) {
      fetchBotSettings();
    }
  }, [userSession?.user.id]);

  const fetchBotSettings = async () => {
    try {
      const response = await fetch("/api/v1/user/bot-settings");

      if (response.ok) {
        const data = await response.json();
        setBotName(data.botName || "Lumi");
        setBotImageUrl(data.botImageUrl || null);
        setUserPlan(data.plan || "free");
      }
    } catch (error) {
      console.error("error fetching bot settings: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlebotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBotName(e.target.value);
    setHasChanges(true);
  };

  const { mutate: handleImageUploadMutate, isPending: isBotImageUploading } =
    useMutation({
      mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/v1/upload/bot-avatar", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setBotImageUrl(data.url);
          setHasChanges(true);
        } else {
          console.error("Image upload failed: ", data.error);
        }
      },
      onError: (error) => {
        console.error("Image upload failed: ", error);
        toast.error("Bot image upload failed", { id: "bot-image-upload" });
      },
      onSuccess: () => {
        toast.success("Bot image uploaded", { id: "image-upload-status" });
      },
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    handleImageUploadMutate(file);
  };

  const { mutate: saveBotSettingsMutate, isPending: isBotSettingsSaving } =
    useMutation({
      mutationFn: async () => {
        const response = await fetch("/api/v1/user/bot-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            botName,
            botImageUrl,
          }),
        });

        if (response.ok) {
          setHasChanges(false);
        }
      },
      onError: (error) => {
        console.error("Error saving bot settings: ", error);
        toast.error("Error saving bot settings.", { id: "save-bot-settings" });
      },
      onSuccess: () => {
        toast.success("Bot settings saved!", { id: "save-bot-settings" });
      },
    });

  const getPlanDisplayName = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "free":
        return "Free Plan";
      case "starter":
        return "Starter Plan";
      case "pro":
        return "Pro Plan";
      case "premium":
        return "Premium Plan";
      default:
        return "Invalid Plan";
    }
  };

  const getPlanColor = (plan: string) => {
    return plan.toLowerCase() === "free"
      ? "bg-gray-500/20 text-gray-400"
      : "bg-green-500/20 text-green-400";
  };

  if (isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground mb-4" />
          <div className="text-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8 text-center">
          Settings
        </h1>
        <div className="relative bg-card/80 backdrop-blur-sm rounded-lg p-6 border border-border/50 mb-8 shadow-xl shadow-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-primary/20">
                {userSession?.user.image ? (
                  <img
                    src={userSession.user.image}
                    alt="profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {userSession?.user.name || "User"}
              </h2>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm bg-muted/80 text-muted-foreground px-2 py-1 rounded-full">
                  Email
                </span>
                <p className="text-sm text-foreground mt-1">
                  {userSession?.user.email || "No email"}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getPlanColor(userPlan)}`}
              >
                {getPlanDisplayName(userPlan)}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Bot Customization
          </h3>
          <div className="mb-6">
            <Label
              htmlFor="bot-name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Bot Name
            </Label>
            <Input
              id="bot-name"
              type="text"
              value={botName}
              onChange={handlebotNameChange}
              placeholder="Enter Bot Name"
            />
          </div>

          <div className="mb-6">
            <Label
              htmlFor="bot-image-upload"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Bot Avatar
            </Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {botImageUrl ? (
                  <img
                    src={botImageUrl}
                    alt="Bot Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <Bot className="h-10 w-10 text-primary" />
                )}
              </div>

              <div>
                <Input
                  type="file"
                  id="bot-image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isBotImageUploading}
                  className="hidden"
                />
                <Label
                  htmlFor="bot-image-upload"
                  className={`inline-flex items-center gap-2 px-3 py-2 bg-muted-foreground/20 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer ${isBotImageUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Upload className="h-4 w-4" />
                  {isBotImageUploading ? "Uploading.." : "Upload image"}
                </Label>

                <p className="text-xs text-muted-foreground mt-1">JPG or PNG</p>
              </div>
            </div>
          </div>
          {hasChanges && (
            <Button
              onClick={() => saveBotSettingsMutate()}
              disabled={isBotSettingsSaving}
              className="inline-flex items-center gap-2 mb-6 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {isBotSettingsSaving ? "Saving..." : "Save changes"}
            </Button>
          )}

          <div className="pt-4 border-t border-border"></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
