import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { orders as initialOrders, type Order, type OrderStatus } from "@/lib/mock-data";
import { CheckCircle2, ChefHat, Check, Flame, Timer } from "lucide-react";
import { toast } from "sonner";

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
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const advance = (order: Order, from: "pending" | "preparing" | "ready") => {
    const next = nextStatus[from];
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next.status } : o)));
    toast.success(`Order ${order.id} ${next.label}`, {
      description: `Table ${order.table}`,
    });
  };

  return (
    <DashboardShell
      title="Kitchen display"
      subtitle="Live tickets · Station: pass"
      actions={
        <Button size="sm" variant="outline">
          <ChefHat className="mr-1 h-4 w-4" /> Change station
        </Button>
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
