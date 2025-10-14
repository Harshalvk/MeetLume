"use client";

import { useIntegrations } from "@/hooks/useIntegrations";
import React from "react";
import SetupForm, { ISetupFormData } from "./_components/SetupForm";
import IntegrationCard from "./_components/IntegrationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const IntegrationsPage = () => {
  const {
    loading,
    setupMode,
    setSetupMode,
    setupData,
    setSetupData,
    integrations,
    fetchSetupData,
    handleConnect,
    handleDisconnect,
    handleSetupSubmit,
  } = useIntegrations();

  if (loading) {
    return (
      <div className="h-full bg-background p-6">
        <div className="max-w-6xl mx-auto ">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-48" />
            ))}
          </div>
          <Skeleton className="h-40 w-full mt-5" />
        </div>
      </div>
    );
  }

  return (
    <section className="h-full bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-3">
        <div className="">
          <p className="text-muted-foreground text-md">
            Connect your favourite tools to automatically add action item from
            meetings
          </p>
        </div>

        <div className="w-full flex justify-between">
          <Input placeholder="Search integration" className="w-fit" />
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="task-management">Task Management</SelectItem>
              <SelectItem value="project-management">
                Project Management
              </SelectItem>
              <SelectItem value="scheduling">Scheduling</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {setupMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 border border-border max-w-md w-full mx-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Setup {setupMode.charAt(0).toUpperCase() + setupMode.slice(1)}
              </h2>

              <SetupForm
                platform={setupMode}
                data={setupData as ISetupFormData}
                loading={loading}
                onSubmit={handleSetupSubmit}
                onCancle={() => {
                  setSetupMode(null);
                  setSetupData(null);
                  window.history.replaceState({}, "", "/integrations");
                }}
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.platform}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSetup={(platform) => {
                setSetupMode(platform);
                fetchSetupData(platform);
              }}
            />
          ))}
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-2">How it works?</h3>
          <ol className="list-decimal text-sm text-muted-foreground space-y-2 pl-4">
            <li>Connect your preffered tools above</li>
            <li>Choose where to send action items during setup</li>
            <li>
              In meetings, hover over action items and click &ldquo;Add
              to&ldquo;
            </li>
            <li>Select which tool(s) to add the task to from the dropdown</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsPage;
