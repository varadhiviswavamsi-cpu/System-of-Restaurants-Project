import { UtensilsCrossed } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-warm">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight">RestaurantOS</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hospitality Suite</div>
        </div>
      )}
    </div>
  );
}
