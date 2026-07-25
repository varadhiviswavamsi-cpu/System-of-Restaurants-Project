import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends React.ComponentProps<"input"> {
  iconSize?: number;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, iconSize = 18, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", className)}>
        <input
          ref={ref}
          type="text"
          className={cn(
            "peer h-11 w-full rounded-full border border-white/25 bg-white/15 px-5 py-2 pr-12 text-sm text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_8px_32px_-12px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all placeholder:text-muted-foreground/80 focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40 dark:border-white/15 dark:bg-white/8 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_32px_-12px_rgba(0,0,0,0.5)] dark:focus-visible:bg-white/12",
          )}
          {...props}
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/80 transition-colors peer-focus:text-primary">
          <Search size={iconSize} strokeWidth={2} />
        </div>
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
