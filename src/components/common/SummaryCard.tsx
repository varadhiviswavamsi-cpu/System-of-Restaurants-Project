import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  tone?: "brand" | "success" | "warning" | "muted";
}

const tones = {
  brand: "bg-brand-gradient text-primary-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/25 text-warning-foreground",
  muted: "bg-muted text-muted-foreground",
} as const;

export function SummaryCard({ label, value, icon: Icon, delta, tone = "brand" }: Props) {
  return (
    <div className="card-elevated flex items-start justify-between gap-3 p-5">
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</div>
        {delta && <div className="mt-1 text-xs text-success">{delta}</div>}
      </div>
      <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
