import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { orders } from "@/lib/mock-data";
import { CheckCircle2, ChefHat, Clock, Utensils } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Track your order · RestaurantOS" },
      { name: "description", content: "Live status of your order from kitchen to table." },
      { property: "og:title", content: "Track your order · RestaurantOS" },
      { property: "og:description", content: "Live status of your order from kitchen to table." },
    ],
  }),
  component: OrdersPage,
});

const steps = [
  { key: "pending", label: "Received", icon: Clock },
  { key: "preparing", label: "In kitchen", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Utensils },
  { key: "served", label: "Served", icon: CheckCircle2 },
];

function OrdersPage() {
  const active = orders[0];
  const currentIdx = steps.findIndex((s) => s.key === active.status);
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="card-elevated p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Order</div>
              <h1 className="font-display text-3xl font-bold">{active.id}</h1>
              <div className="text-sm text-muted-foreground">Table {active.table} · Placed {active.placedAt}</div>
            </div>
            <StatusBadge status={active.status} />
          </div>

          <div className="mt-8 grid grid-cols-4 gap-2">
            {steps.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <div key={s.key} className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-full ring-2 transition-colors ${
                      done
                        ? "bg-brand-gradient text-primary-foreground ring-primary/40"
                        : "bg-muted text-muted-foreground ring-border"
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl border bg-background/60 p-5">
            <div className="mb-3 font-display text-lg font-semibold">Items</div>
            <ul className="divide-y">
              {active.items.map((it) => (
                <li key={it.name} className="flex items-center justify-between py-3">
                  <span>{it.name}</span>
                  <span className="text-sm text-muted-foreground">× {it.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-xl font-bold">${active.total}</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Recent orders</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {orders.slice(1).map((o) => (
              <div key={o.id} className="card-elevated flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-xs text-muted-foreground">Table {o.table} · {o.placedAt}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
