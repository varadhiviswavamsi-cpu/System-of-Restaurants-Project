import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-elevated flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="font-display text-lg font-semibold">{title}</div>
        {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
