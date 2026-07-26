import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useAllOrders, useUserOrders } from "@/lib/orders-store";
import { CheckCircle2, ChefHat, Clock, Utensils, UtensilsCrossed } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Track your order · SoR" },
      { name: "description", content: "Live status of your order from kitchen to table." },
      { property: "og:title", content: "Track your order · SoR" },
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
  const userOrders = useUserOrders();
  const all = useAllOrders();
  const active = userOrders[0] ?? all[0];
  const currentIdx = steps.findIndex((s) => s.key === active?.status);

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
        {userOrders.length === 0 && (
          <div className="card-elevated mb-6 p-5">
            <EmptyState
              icon={UtensilsCrossed}
              title="No orders yet"
              description="Add dishes from the menu — they'll appear here in real time."
              action={
                <Button asChild className="bg-brand-gradient text-primary-foreground shadow-warm">
                  <Link to="/menu">Browse menu</Link>
                </Button>
              }
            />
          </div>
        )}

        {active && (
          <div className="card-elevated p-5 md:p-8">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Order</div>
                <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{active.id}</h1>
                <div className="truncate text-sm text-muted-foreground">
                  Table {active.table} · Placed {active.placedAt}
                </div>
              </div>
              <StatusBadge status={active.status} />
            </div>

            <div className="relative mt-6 grid grid-cols-4 gap-2 md:mt-8">
              {/* progress track: spans from center of first step to center of last */}
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-5 h-1 -translate-y-1/2 rounded-full bg-muted sm:top-[1.375rem]">
                <div
                  className="h-full rounded-full bg-brand-gradient shadow-warm transition-[width] duration-500 ease-out"
                  style={{
                    width: `${(Math.max(0, Math.min(currentIdx, steps.length - 1)) / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>
              {steps.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <div key={s.key} className="relative flex flex-col items-center gap-2 text-center">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-full ring-2 transition-colors sm:h-11 sm:w-11 ${
                        done
                          ? "bg-brand-gradient text-primary-foreground ring-primary/40"
                          : "bg-muted text-muted-foreground ring-border"
                      }`}
                    >
                      <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-[11px] font-medium sm:text-xs">{s.label}</div>
                  </div>
                );
              })}
            </div>


            <div className="mt-6 rounded-xl border bg-background/60 p-4 md:mt-8 md:p-5">
              <div className="mb-3 font-display text-lg font-semibold">Items</div>
              <ul className="divide-y">
                {active.items.map((it) => (
                  <li key={it.name} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0 truncate">{it.name}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">× {it.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-xl font-bold">${active.total}</span>
              </div>
            </div>
          </div>
        )}

        {yourOthers.length > 0 && (
          <div className="mt-8 md:mt-10">
            <h2 className="font-display text-lg font-semibold sm:text-xl">Your orders</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {yourOthers.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div className="mt-8 md:mt-10">
            <h2 className="font-display text-lg font-semibold sm:text-xl">Recent tickets</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {recent.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          </div>
        )}

      </section>
    </PublicShell>
  );
}
