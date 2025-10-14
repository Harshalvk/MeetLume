import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Integration } from "@/hooks/useIntegrations";
import { Check, ExternalLink, Settings } from "lucide-react";
import Image from "next/image";
import React from "react";

interface IIntegrationCardProps {
  integration: Integration;
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
  onSetup: (platform: string) => void;
}

const IntegrationCard = ({
  integration,
  onConnect,
  onDisconnect,
  onSetup,
}: IIntegrationCardProps) => {
  return (
    <div className="h-full">
      <div className="bg-card rounded-lg p-6 flex flex-col justify-between h-full gap-4 border border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative flex-shrink-0 border p-2 rounded-md">
              <div className="relative w-full h-full">
                <Image
                  src={integration.logo}
                  alt={`${integration.name} logo`}
                  fill
                  className="object-contain rounded"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {integration.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {integration.type}
              </p>
            </div>
          </div>
          {integration.connected && (
            <div className="flex items-center bg-green-500/20 rounded-full px-2">
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 px-1 py-1 rounded-full">
                Connected
              </span>
            </div>
          )}
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          {integration.description}
        </p>
        {integration.connected &&
          integration.platform !== "google-calendar" &&
          (integration.boardName ||
            integration.projectName ||
            integration.channelName) && (
            <div className="mb-4 p-3 bg-muted-/50 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">
                Destination:
              </div>
              <div className="text-sm font-medium text-foreground">
                {integration.platform === "slack" &&
                  integration.channelName &&
                  `#${integration.channelName}`}
                {integration.platform === "trello" && integration.boardName}
                {integration.platform === "jira" && integration.projectName}
                {integration.platform === "asana" && integration.projectName}
              </div>
            </div>
          )}

        {integration.connected &&
          integration.platform === "google-calendar" && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Status:</div>
              <div className="text-sm font-medium text-foreground">
                Lambda auto-sync enabled
              </div>
            </div>
          )}

        <div className="flex gap-2">
          {integration.connected ? (
            integration.platform === "google-calendar" ? (
              <Button
                variant={"outline"}
                onClick={() => onDisconnect(integration.platform)}
                className="flex-1 cursor-pointer"
                type="button"
              >
                Disconnect
              </Button>
            ) : (
              <>
                <Button
                  variant={"outline"}
                  onClick={() => onDisconnect(integration.platform)}
                  className="flex-1 cursor-pointer"
                  type="button"
                >
                  Disconnect
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => onSetup(integration.platform)}
                  className="px-3 py-2 cursor-pointer"
                  type="button"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            )
          ) : (
            <Button
              onClick={() => onConnect(integration.platform)}
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              Connect
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;
