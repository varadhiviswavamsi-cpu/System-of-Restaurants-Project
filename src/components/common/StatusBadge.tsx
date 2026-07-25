import { cn } from "@/lib/utils";
import type { OrderStatus, StockStatus, TableStatus } from "@/lib/mock-data";

type Status = OrderStatus | StockStatus | TableStatus | string;

const styles: Record<string, string> = {
  // orders
  pending: "bg-warning/20 text-warning-foreground ring-warning/30",
  preparing: "bg-primary/15 text-primary ring-primary/30",
  ready: "bg-success/20 text-success ring-success/30",
  served: "bg-muted text-muted-foreground ring-border",
  cancelled: "bg-destructive/15 text-destructive ring-destructive/30",
  // tables
  available: "bg-success/20 text-success ring-success/30",
  occupied: "bg-primary/15 text-primary ring-primary/30",
  reserved: "bg-accent text-accent-foreground ring-accent",
  cleaning: "bg-muted text-muted-foreground ring-border",
  // stock
  "in-stock": "bg-success/20 text-success ring-success/30",
  low: "bg-warning/25 text-warning-foreground ring-warning/40",
  out: "bg-destructive/15 text-destructive ring-destructive/30",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = styles[status] ?? "bg-muted text-muted-foreground ring-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        s,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status.replace("-", " ")}
    </span>
  );
}
