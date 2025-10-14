"use client";

import { GetIntegrationStatusAction } from "@/app/actions/integrations/getIntegrationStatus";
import { CalendarStatusAction } from "@/app/actions/user/calendarStatus";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export interface Integration {
  platform: "google-calendar" | "trello" | "jira" | "asana" | "slack";
  name: string;
  description: string;
  connected: boolean;
  boardName?: string | null | undefined;
  projectName?: string | null | undefined;
  channelName?: string;
  logo: string;
  type: string;
}

export function useIntegrations() {
  const { data: session } = useSession();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      platform: "slack",
      name: "Slack",
      description: "Post meeting summaries to your Slack channels",
      connected: false,
      channelName: undefined,
      logo: "/icons/slack.svg",
      type: "Communication",
    },
    {
      platform: "trello",
      name: "Trello",
      description: "Add action items to your Trello boards",
      connected: false,
      logo: "/icons/trello.svg",
      type: "Task Management",
    },
    {
      platform: "jira",
      name: "Jira",
      description: "Create tickets for development tasks",
      connected: false,
      logo: "/icons/jira.svg",
      type: "Project Management",
    },
    {
      platform: "asana",
      name: "Asana",
      description: "Sync tasks with your team projects",
      connected: false,
      logo: "/icons/asana.svg",
      type: "Task Management",
    },
    {
      platform: "google-calendar",
      name: "Google Calendar",
      description: "Auto-Sync meetings",
      connected: false,
      logo: "/icons/google-calendar.svg",
      type: "Scheduling",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<unknown>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    if (session && session.user.id) {
      fetchIntegration();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const setup = urlParams.get("setup");
    if (setup && ["trello", "jira", "asana", "slack"].includes(setup)) {
      setSetupMode(setup);
      fetchSetupData(setup);
    }
  }, [session, session?.user.id]);

  const fetchIntegration = async () => {
    try {
      const integrationStatus = await GetIntegrationStatusAction();

      const calendarStatus = await CalendarStatusAction();

      setIntegrations((prev) =>
        prev.map((integration) => {
          if (integration.platform === "google-calendar") {
            return {
              ...integration,
              connected: calendarStatus.connected || false,
            };
          }

          const status = integrationStatus.result?.find(
            (d) => d.platform === integration.platform
          );

          return {
            ...integration,
            connected: status?.connected || false,
            boardName: status?.boardName,
            projectName: status?.projectName,
            channelName: status?.channelName,
          };
        })
      );
    } catch (error) {
      console.error("error fetching integrations", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSetupData = async (platform: string) => {
    try {
      const integrationSetupDataResponse = await fetch(
        `/api/v1/integrations/${platform}/setup`
      );
      const integrationSetupData = await integrationSetupDataResponse.json();
      setSetupData(integrationSetupData);
    } catch (error) {
      console.error(`Error fetching ${platform} setup data: `, error);
    }
  };

  const handleConnect = (platform: string) => {
    if (platform === "slack") {
      window.location.href = "/api/v1/slack/install?return=integrations";
    } else if (platform === "google-calendar") {
      window.location.href = "/api/v1/google/direct-connect";
    } else {
      window.location.href = `/api/v1/integrations/${platform}/auth`;
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      if (platform === "google-calendar") {
        await fetch("/api/v1/google/disconnect", {
          method: "POST",
        });
      } else {
        await fetch(`/api/v1/integrations/${platform}/disconnect`, {
          method: "POST",
        });
      }
      fetchIntegration();
    } catch (error) {
      console.error("error disconnecting:", error);
    }
  };

  const handleSetupSubmit = async (platform: string, config: unknown) => {
    setSetupLoading(true);
    try {
      const response = await fetch(`/api/v1/integrations/${platform}/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        setSetupMode(null);
        setSetupData(null);

        fetchIntegration();
        window.history.replaceState({}, "", "/integrations");
      }
    } catch (error) {
      console.error("Error saving setup: ", error);
    } finally {
      setSetupLoading(false);
    }
  };

  return {
    loading,
    setupMode,
    setSetupMode,
    setupData,
    setSetupData,
    integrations,
    setupLoading,
    setSetupLoading,
    fetchIntegration,
    fetchSetupData,
    handleConnect,
    handleDisconnect,
    handleSetupSubmit,
  };
}
