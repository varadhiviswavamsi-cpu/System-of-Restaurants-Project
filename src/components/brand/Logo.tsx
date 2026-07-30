import logoUrl from "@/assets/sor-logo.jpeg";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-background shadow-warm">
        <img src={logoUrl} alt="System of Restaurants logo" className="h-full w-full object-contain" />
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
            System of Restaurants
          </div>
          <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
            Hospitality Suite
          </div>
        </div>
      )}
    </div>
  );
}
