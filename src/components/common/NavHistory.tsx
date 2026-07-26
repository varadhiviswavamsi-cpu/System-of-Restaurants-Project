import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavHistory({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-full border border-white/50 bg-gradient-to-b from-white/40 to-white/5 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65),0_8px_28px_-14px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/20 dark:from-white/15 dark:to-white/5 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_28px_-14px_rgba(0,0,0,0.6)]",
        className,
      )}
      role="group"
      aria-label="Navigation history"
    >
      <button
        type="button"
        onClick={() => window.history.back()}
        aria-label="Go back"
        className="grid h-8 w-8 place-items-center rounded-full text-foreground/80 transition-all duration-200 hover:bg-white/25 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75),0_0_18px_-2px_rgba(255,255,255,0.7)] active:scale-95 dark:hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="mx-0.5 h-5 w-px bg-white/40 dark:bg-white/15" />
      <button
        type="button"
        onClick={() => router.history.forward()}
        aria-label="Go forward"
        className="grid h-8 w-8 place-items-center rounded-full text-foreground/80 transition-all duration-200 hover:bg-white/25 hover:text-foreground hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75),0_0_18px_-2px_rgba(255,255,255,0.7)] active:scale-95 dark:hover:bg-white/10"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
