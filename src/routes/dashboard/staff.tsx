import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SummaryCard } from "@/components/common/SummaryCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useReservations, useTables } from "@/lib/reservations-store";
import { useAllOrders } from "@/lib/orders-store";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Bell, ClipboardList, Users, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/dashboard/staff")({
  head: () => ({
    meta: [
      { title: "Staff floor · SoR" },
      { name: "description", content: "Floor map, table status, and open tickets for front-of-house staff." },
      { property: "og:title", content: "Staff floor · SoR" },
      { property: "og:description", content: "Floor map, tables and open tickets." },
    ],
  }),
  component: StaffDashboard,
});

const statusRing: Record<string, string> = {
  available: "ring-success/50 bg-success/10",
  occupied: "ring-primary/50 bg-primary/10",
  reserved: "ring-warning/50 bg-warning/10",
  cleaning: "ring-border bg-muted",
};

function StaffDashboard() {
  const allOrders = useAllOrders();
  const tables = useTables();
  const reservations = useReservations();
  const openOrders = allOrders.filter((o) => o.status !== "served" && o.status !== "cancelled");

  return (
    <DashboardShell
      title="Staff floor"
      subtitle="Sections A · B · Patio"
      actions={
        <Button
          size="sm"
          onClick={() =>
            toast.success("Runner called", {
              description: "A runner is on the way to your section.",
            })
          }
          className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95"
        >
          <Bell className="mr-1 h-4 w-4" /> Call runner
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Open tables" value={tables.filter((t) => t.status === "occupied").length} icon={Users} tone="brand" />
        <SummaryCard label="Available" value={tables.filter((t) => t.status === "available").length} icon={Utensils} tone="success" />
        <SummaryCard label="Open tickets" value={openOrders.length} icon={ClipboardList} tone="warning" />
        <SummaryCard label="Guests seated" value={12} icon={Users} tone="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg font-semibold">Floor map</div>
            <div className="flex gap-3 text-xs">
              {[
                { k: "available", label: "Open" },
                { k: "occupied", label: "Occupied" },
                { k: "reserved", label: "Reserved" },
                { k: "cleaning", label: "Cleaning" },
              ].map((l) => (
                <div key={l.k} className="flex items-center gap-1.5">
                  <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-offset-1", statusRing[l.k])} />
                  <span className="text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {tables.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  toast(`Table ${t.id}`, {
                    description: `${t.seats} seats · ${t.status}${t.guests ? ` · ${t.guests}` : ""}`,
                  })
                }
                className={cn(
                  "rounded-2xl p-4 text-left ring-2 transition-transform hover:-translate-y-0.5 hover:shadow-warm",
                  statusRing[t.status],
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl font-bold">{t.id}</div>
                  <div className="text-xs text-muted-foreground">{t.seats} seats</div>
                </div>
                <div className="mt-3">
                  <StatusBadge status={t.status} />
                </div>
                {t.guests && <div className="mt-2 text-xs text-muted-foreground">{t.guests}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="font-display text-lg font-semibold">Open tickets</div>
          <div className="mt-4 space-y-3">
            {openOrders.map((o) => (
              <div key={o.id} className="rounded-xl border bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.id} · {o.table}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
