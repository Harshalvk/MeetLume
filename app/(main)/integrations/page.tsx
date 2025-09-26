"use client";

import { useIntegrations } from "@/hooks/useIntegrations";
import React from "react";
import SetupForm, { ISetupFormData } from "./_components/SetupForm";
import IntegrationCard from "./_components/IntegrationCard";

const IntegrationsPage = () => {
  const {
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
  } = useIntegrations();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading Integrations...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Integrations
          </h1>

          <p className="text-muted-foreground">
            Connect your favourite tools to automatically add action item from
            meetings
          </p>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-8 bg-card rounded-lg p-6 border border-border">
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
