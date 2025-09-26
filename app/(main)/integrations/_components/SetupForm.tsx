"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ISetupFormProps {
  platform: string;
  data: ISetupFormData;
  onSubmit: (platform: string, config: unknown) => void;
  onCancle: () => void;
  loading: boolean;
}

export interface ISetupFormData {
  boards: string[];
  channels: string[];
  projects: string[];
  workspaceId: string;
}

const SetupForm = ({
  platform,
  data,
  onSubmit,
  onCancle,
  loading,
}: ISetupFormProps) => {
  const [selectedId, setSelectedId] = useState("");
  const [selectedName, setSelectedname] = useState("");
  const [createNew, setCreateNew] = useState(false);
  const [newName, setNewName] = useState("");

  const items =
    platform === "trello"
      ? data?.boards
      : platform === "slack"
        ? data?.channels
        : data?.projects;

  const itemsLabel =
    platform === "trello"
      ? "board"
      : platform === "slack"
        ? "channel"
        : "project";

  const handleSubmit = () => {
    if (createNew) {
      onSubmit(platform, {
        createNew: true,
        [`${itemsLabel}Name`]: newName,
        workspaceId: data?.workspaceId,
      });
    } else {
      onSubmit(platform, {
        [`${itemsLabel}Id`]: selectedId,
        [`${itemsLabel}Name`]: selectedName,
        projectKey: selectedId,
        workspaceId: data?.workspaceId,
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Label className="block text-sm font-medium text-foreground mb-2">
          Select {itemsLabel} from action item:
        </Label>

        {!createNew ? (
          <Select
            value={selectedId}
            onValueChange={(value) => {
              const selected = items.find(
                (item) =>
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  item.id === value || item.key === value || item.gid === value
              );
              setSelectedId(value);
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              setSelectedname(selected?.name || "");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`choose existing ${itemsLabel}...`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>
                  {itemsLabel.charAt(0).toUpperCase() + itemsLabel.slice(1)}
                </SelectLabel>
                {items?.map((item) => (
                  <SelectItem
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    key={item.id || item.key || item.gid}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    value={item.id || item.key || item.gid}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-expect-error */}
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Enter new ${itemsLabel} name...`}
          />
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            id="create-new"
            checked={createNew}
            onCheckedChange={(checked) => setCreateNew(!!checked)}
          />
          <Label htmlFor="create-new">Create new {itemsLabel}</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant={"outline"}
          onClick={onCancle}
          className="flex-1 cursor-pointer"
          type="button"
        >
          Cancle
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            loading || (!createNew && !selectedId) || (createNew && !newName)
          }
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default SetupForm;
