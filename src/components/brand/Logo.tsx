import logoAsset from "@/assets/sor-logo.jpeg.asset.json";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-background shadow-warm">
        <img src={logoAsset.url} alt="System of Restaurants logo" className="h-full w-full object-contain" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight">System of Restaurants</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hospitality Suite</div>
        </div>
      )}
    </div>
  );
}
