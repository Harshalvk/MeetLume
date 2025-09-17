import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

interface IUpgradeToPremiumProps {
  upgradeInfo: {
    title: string;
    description: string;
    showButton: boolean;
  };
}

const UpgradeToPremium = ({ upgradeInfo }: IUpgradeToPremiumProps) => {
  return (
    <div className="rounded-lg bg-sidebar-accent p-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-sidebar-accent-foreground">
            {upgradeInfo.title}
          </p>
          <p className="text-xs text-sidebar-accent-foreground/70">
            {upgradeInfo.description}
          </p>
        </div>
        {upgradeInfo.showButton && (
          <Link href="/pricing">
            <Button className="w-full rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer">
              {upgradeInfo.title}
            </Button>
          </Link>
        )}

        {!upgradeInfo.showButton && (
          <div className="text-center py-2">
            <span className="text-xs text-sidebar-accent-foreground/60">
              🎉 Thank you for your support!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeToPremium;
