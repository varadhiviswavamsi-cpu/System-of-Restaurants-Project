import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Order, type OrderStatus } from "@/lib/mock-data";
import { useAllOrders, updateOrderStatus } from "@/lib/orders-store";
import { CheckCircle2, ChefHat, Check, Flame, Timer } from "lucide-react";
import { toast } from "sonner";

// Stable per-ticket prep minutes so the badge doesn't jump on re-render.
function stableMinutes(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 8) + 3;
}

const STATIONS = ["Pass", "Grill", "Sauté", "Cold", "Pastry", "Expo"] as const;
type Station = (typeof STATIONS)[number];

export const Route = createFileRoute("/dashboard/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen display · RestaurantOS" },
      { name: "description", content: "Live ticket rail with prep timers and station routing." },
      { property: "og:title", content: "Kitchen display · RestaurantOS" },
      { property: "og:description", content: "Live ticket rail with prep timers." },
    ],
  }),
  component: KitchenDashboard,
});

const columns: { key: "pending" | "preparing" | "ready"; label: string; icon: typeof ChefHat }[] = [
  { key: "pending", label: "Incoming", icon: Timer },
  { key: "preparing", label: "On the fire", icon: Flame },
  { key: "ready", label: "Ready to run", icon: CheckCircle2 },
];

const nextStatus: Record<"pending" | "preparing" | "ready", { status: OrderStatus; label: string }> = {
  pending: { status: "preparing", label: "started" },
  preparing: { status: "ready", label: "marked ready" },
  ready: { status: "served", label: "bumped to pass" },
};

function KitchenDashboard() {
  const orders = useAllOrders();
  const [station, setStation] = useState<Station>("Pass");
  const [stationOpen, setStationOpen] = useState(false);

  const advance = (order: Order, from: "pending" | "preparing" | "ready") => {
    const next = nextStatus[from];
    updateOrderStatus(order.id, next.status);
    toast.success(`Order ${order.id} ${next.label}`, {
      description: `Table ${order.table}`,
    });
  };

  const pickStation = (s: Station) => {
    setStation(s);
    setStationOpen(false);
    toast.success(`Station changed to ${s}`, {
      className:
        "border border-white/40 bg-white/15 text-foreground shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-2xl",
    });
  };

  return (
    <DashboardShell
      title="Kitchen display"
      subtitle={`Live tickets · Station: ${station.toLowerCase()}`}
      actions={
        <Popover open={stationOpen} onOpenChange={setStationOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              <ChefHat className="mr-1 h-4 w-4" /> Change station
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 border border-white/40 bg-white/15 p-2 text-foreground shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/15 dark:bg-white/10"
          >
            <div className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Select station
            </div>
            <div className="space-y-1">
              {STATIONS.map((s) => {
                const active = s === station;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => pickStation(s)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white/25 dark:hover:bg-white/10"
                  >
                    <span>{s}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const items = orders.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="card-elevated p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
                    <col.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold">{col.label}</div>
                    <div className="text-xs text-muted-foreground">{items.length} tickets</div>
                  </div>
                </div>
                <StatusBadge status={col.key} />
              </div>

              <div className="mt-4 space-y-3">
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No tickets in this station.
                  </div>
                )}
                {items.map((o) => (
                  <div key={o.id} className="rounded-xl border bg-background/70 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-display text-lg font-bold">{o.id}</div>
                        <div className="text-xs text-muted-foreground">Table {o.table} · {o.placedAt}</div>
                      </div>
                      <div className="rounded-md bg-warning/25 px-2 py-0.5 text-xs font-medium text-warning-foreground">
                        {Math.floor(Math.random() * 8) + 3}m
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm">
                      {o.items.map((it) => (
                        <li key={it.name} className="flex items-center justify-between">
                          <span>{it.name}</span>
                          <span className="text-muted-foreground">× {it.qty}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      {col.key !== "ready" && (
                        <Button
                          size="sm"
                          onClick={() => advance(o, col.key)}
                          className="w-full bg-brand-gradient text-primary-foreground shadow-warm"
                        >
                          {col.key === "pending" ? "Start" : "Mark ready"}
                        </Button>
                      )}
                      {col.key === "ready" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => advance(o, col.key)}
                          className="w-full"
                        >
                          Bump to pass
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
