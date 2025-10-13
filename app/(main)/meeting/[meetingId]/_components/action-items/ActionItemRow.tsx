import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IActionItem, IIntegration } from "@/hooks/useActionItems";
import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";

interface IActionItemRowProps {
  item: IActionItem;
  integrations: IIntegration[];
  loading: { [key: string]: boolean };
  addToIntegration: (platform: string, actionItem: IActionItem) => void;
  handleDeleteItem: (id: number, actionItemText: string) => void;
}

const ActionItemRow = ({
  item,
  integrations,
  loading,
  addToIntegration,
  handleDeleteItem,
}: IActionItemRowProps) => {
  const handleConnectedIntegrations = integrations.length > 0;

  return (
    <div className="group relative">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />

        <p className="flex-1 text-sm leading-relaxed text-foreground">
          {item.text}
        </p>
        <p>{handleConnectedIntegrations}</p>
        {handleConnectedIntegrations && (
          <div className="transition-opacity relative flex gap-2">
            {integrations.length === 1 ? (
              <Button
                onClick={() => addToIntegration(integrations[0].platform, item)}
                disabled={loading[`${integrations[0].platform}-${item.id}`]}
                size={"sm"}
                className="px-3 py-1 text-xs flex items-center gap-1"
              >
                {loading[`${integrations[0].platform}-${item.id}`] ? (
                  "Adding..."
                ) : (
                  <>
                    Add to {integrations[0].name}
                    <ExternalLink className="h-3 w-3" />
                  </>
                )}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size={"sm"}
                    variant={"default"}
                    className="px-3 py-1 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Add to <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {integrations.map((integration) => (
                    <DropdownMenuItem
                      key={integration.platform}
                      onClick={() =>
                        addToIntegration(integration.platform, item)
                      }
                    >
                      <div className="w-4 h-4 relative flex-shrink-0">
                        <img
                          src={integration.logo}
                          alt={integration.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>

                      <span>
                        {loading[`${integration.platform}-${item.id}`]
                          ? "Adding..."
                          : `Add to ${integration.name}`}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => handleDeleteItem(item.id, item.text)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructiv text-destructive rounded-md transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionItemRow;
