import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavHistory({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      aria-label="Go back"
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/50 bg-gradient-to-b from-white/40 to-white/5 px-4 text-sm font-medium text-foreground/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65),0_8px_28px_-14px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-200 hover:bg-white/25 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75),0_0_18px_-2px_rgba(255,255,255,0.7)] active:scale-95 dark:border-white/20 dark:from-white/15 dark:to-white/5 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_28px_-14px_rgba(0,0,0,0.6)] dark:hover:bg-white/10",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}
