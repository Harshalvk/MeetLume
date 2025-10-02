"use client";

import { GetIntegrationStatusAction } from "@/app/actions/integrations/getIntegrationStatus";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export interface IActionItem {
  id: number;
  text: string;
}

export interface IIntegration {
  platform: string;
  connected: boolean;
  name: string;
  logo: string;
}

export function useActionItems() {
  const { data: session } = useSession();

  const [integrations, setIntegrations] = useState<IIntegration[]>([]);
  const [integrationsLoaded, setIntegrationsLoaded] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [showAddInput, setShowAddInput] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    if (session) {
      fetchIntegrations();
    } else {
      setIntegrationsLoaded(true);
    }
  }, [session]);

  const fetchIntegrations = async () => {
    try {
      const integrationsStatus = await GetIntegrationStatusAction();
      const integrations = integrationsStatus.result;

      if (integrations) {
        const integrationsWithLogos = integrations
          .filter((d) => d.connected)
          .filter((d) => d.platform !== "slack")
          .map((integration) => ({
            logo: `/${integration.platform}.png`,
            name: integration.name,
            platform: integration.platform,
            connected: integration.connected,
          }));

        setIntegrations(integrationsWithLogos);
      }
    } catch {
      setIntegrations([]);
    } finally {
      setIntegrationsLoaded(true);
    }
  };

  return {
    integrations,
    integrationsLoaded,
    loading,
    setLoading,
    showAddInput,
    setShowAddInput,
    newItemText,
    setNewItemText,
  };
}
