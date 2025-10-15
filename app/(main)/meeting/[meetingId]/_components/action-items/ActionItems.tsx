import { Button } from "@/components/ui/button";
import { IActionItem, useActionItems } from "@/hooks/useActionItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ActionItemsList from "./ActionItemsList";
import AddActionItemInput from "./AddActionItem";

export interface IActionItemProps {
  actionItems: IActionItem[];
  onDeleteItem: (id: number) => void;
  onAddItem: (text: string) => void;
  meetingId: string;
}

const ActionItems = ({
  actionItems,
  onDeleteItem,
  onAddItem,
  meetingId,
}: IActionItemProps) => {
  const {
    integrations,
    integrationsLoaded,
    loading,
    setLoading,
    showAddInput,
    setShowAddInput,
    newItemText,
    setNewItemText,
  } = useActionItems();

  const queryClient = useQueryClient();

  const { mutate: addToIntegrationMutate } = useMutation({
    mutationFn: async ({
      platform,
      actionItem,
    }: {
      platform: string;
      actionItem: IActionItem;
    }) => {
      setLoading((prev) => ({
        ...prev,
        [`${platform}-${actionItem.id}`]: true,
      }));

      const response = await fetch("/api/v1/integrations/action-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          actionItem,
          meetingId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add action item");
      }

      return response.json();
    },
    onMutate: ({ platform, actionItem }) => {
      toast.loading(`Adding ${actionItem} to ${platform}`, {
        id: "action-item-status",
      });
    },
    onSuccess: (_, { platform, actionItem }) => {
      toast.success(`Action item ${actionItem} added to ${platform}`, {
        id: "action-item-status",
        action: {
          label: "OK",
          onClick: () => {},
        },
      });
    },
    onError: (_, { platform }) => {
      toast.error(`Failed to add to ${platform}`, {
        id: "action-item-status",
      });
    },
  });

  const { mutate: handleAddNewItem } = useMutation({
    mutationFn: async () => {
      if (!newItemText.trim()) return;

      await fetch(`/api/v1/meetings/${meetingId}/action-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newItemText,
        }),
      });
    },
    onMutate: () => {
      toast.loading("Adding action item", {
        id: "action-item-status",
        action: {
          label: "OK",
          onClick: () => {},
        },
      });
    },
    onSuccess: () => {
      toast.success("Action item added", {
        id: "action-item-status",
        action: {
          label: "OK",
          onClick: () => {},
        },
      });

      queryClient.invalidateQueries({
        queryKey: ["fetch-action-items", meetingId],
      });

      setShowAddInput(false);
      setNewItemText("");
    },
    onError: (error) => {
      onAddItem(newItemText);
      setNewItemText("");
      setShowAddInput(false);

      console.error("Failed to add action item: ", error);

      toast.error("Failed to add action item", {
        id: "action-item-status",
        action: {
          label: "OK",
          onClick: () => {},
        },
      });
    },
  });

  const { mutate: handleDeleteActionItemMutate } = useMutation({
    mutationFn: async ({ id }: { id: number; actionItemText: string }) => {
      const response = await fetch(
        `/api/v1/meetings/${meetingId}/action-items/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        onDeleteItem(id);
      }
    },
    onMutate: ({ actionItemText }) => {
      toast.loading(`Deleting ${actionItemText}`, {
        id: "action-item-status",
      });
    },
    onSuccess: (_, { actionItemText }) => {
      toast.success(`Deleted ${actionItemText}`, {
        id: "action-item-status",
      });
    },
    onError: (error, { actionItemText }) => {
      console.error(`Failed to delete ${actionItemText}: `, error);
      toast.error(`Failed to delete ${actionItemText}`, {
        id: "action-item-status",
      });
    },
  });

  const addToIntegration = (platform: string, item: IActionItem) => {
    addToIntegrationMutate({ platform, actionItem: item });
  };

  const handleDeleteActionItem = (id: number, actionItemText: string) => {
    handleDeleteActionItemMutate({ id, actionItemText });
  };

  const hasConnectedIntegrations = integrations.length > 0;

  if (!integrationsLoaded) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Action Items
        </h3>

        <div className="space-y-4">
          {actionItems.map((item) => (
            <div key={item.id} className="group relative">
              <div className="flex items-center gap-3">
                <p className="flex-1 text-sm leading-relaxed text-foreground">
                  {item.text}
                </p>
                <div className="animate-pulse">
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>

                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 text-destructive rounded transition-all"
                ></Button>
              </div>
            </div>
          ))}

          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Action Items
      </h3>

      <ActionItemsList
        actionItems={actionItems}
        integrations={integrations}
        loading={loading}
        addToIntegration={addToIntegration}
        handleDeleteItem={handleDeleteActionItem}
      />

      <AddActionItemInput
        showAddInput={showAddInput}
        setShowAddInput={setShowAddInput}
        newItemText={newItemText}
        setNewItemText={setNewItemText}
        onAddItem={handleAddNewItem}
      />

      {!hasConnectedIntegrations && actionItems.length > 0 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
          <p className="text-xs text-muted-foreground text-center">
            <a href="/integrations" className="text-primary hover:underline">
              Connect Integrations
            </a>
            to add action items to your tools
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionItems;
