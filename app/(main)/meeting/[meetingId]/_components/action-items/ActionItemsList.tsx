import { IActionItem, IIntegration } from "@/hooks/useActionItems";
import ActionItemRow from "./ActionItemRow";

interface ActionItemsListProps {
  actionItems: IActionItem[];
  integrations: IIntegration[];
  loading: { [key: string]: boolean };
  addToIntegration: (platform: string, actionItem: IActionItem) => void;
  handleDeleteItem: (id: number, actionItemText: string) => void;
}

const ActionItemsList = ({
  actionItems,
  integrations,
  loading,
  addToIntegration,
  handleDeleteItem,
}: ActionItemsListProps) => {
  return (
    <div className="space-y-4">
      {actionItems.map((item) => (
        <ActionItemRow
          key={item.id}
          item={item}
          integrations={integrations}
          loading={loading}
          addToIntegration={addToIntegration}
          handleDeleteItem={handleDeleteItem}
        />
      ))}
    </div>
  );
};

export default ActionItemsList;
