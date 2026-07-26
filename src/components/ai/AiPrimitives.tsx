import { ArrowDownRight, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Confidence, Severity, Trend } from "@/lib/ai/types";

const severityTone: Record<Severity, string> = {
  info: "bg-primary/10 text-primary ring-primary/25",
  opportunity: "bg-success/15 text-success ring-success/30",
  warning: "bg-warning/25 text-warning-foreground ring-warning/40",
  critical: "bg-destructive/15 text-destructive ring-destructive/30",
};

export function SeverityBadge({ severity, label }: { severity: Severity; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        severityTone[severity],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? severity}
    </span>
  );
}

export function ConfidenceChip({ confidence, className }: { confidence: Confidence; className?: string }) {
  return (
    <span
      title={confidence.basis}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm",
        className,
      )}
    >
      <Sparkles className="h-3 w-3 text-primary" />
      Confidence {confidence.value}%
    </span>
  );
}

export function TrendArrow({ trend, className }: { trend: Trend; className?: string }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : ArrowRight;
  return (
    <Icon
      className={cn(
        "h-4 w-4",
        trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground",
        className,
      )}
    />
  );
}

export function LoadBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "warning" | "muted" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          tone === "brand" && "bg-brand-gradient",
          tone === "warning" && "bg-warning",
          tone === "muted" && "bg-muted-foreground/40",
        )}
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </div>
  );
}

export function AlertBanner({
  severity,
  title,
  children,
}: {
  severity: Severity;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-warm backdrop-blur-xl",
        severity === "critical"
          ? "border-destructive/30 bg-destructive/10"
          : severity === "warning"
            ? "border-warning/40 bg-warning/15"
            : "border-primary/25 bg-primary/10",
      )}
    >
      <div className="flex items-center gap-2 font-display text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        {title}
      </div>
      {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
