import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SummaryCard } from "@/components/common/SummaryCard";
import { kpis, menuItems, salesTrend } from "@/lib/mock-data";
import { DollarSign, LineChart as LineChartIcon, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · SoR" },
      { name: "description", content: "Trends across revenue, covers, tickets and top menu items." },
      { property: "og:title", content: "Analytics · SoR" },
      { property: "og:description", content: "Trends across revenue, covers, tickets and menu items." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const maxSales = Math.max(...salesTrend.map((d) => d.sales));
  const maxCovers = Math.max(...salesTrend.map((d) => d.covers));
  const top = [...menuItems]
    .map((m, i) => ({ ...m, sold: 60 - i * 8 }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);
  const topMax = Math.max(...top.map((t) => t.sold));

  return (
    <DashboardShell title="Analytics" subtitle="Last 7 days">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Revenue" value="$13,570" icon={DollarSign} tone="brand" delta="+9% WoW" />
        <SummaryCard label="Covers" value="946" icon={Users} tone="warning" delta="+6% WoW" />
        <SummaryCard label="Avg ticket" value={`$${kpis.avgTicket}`} icon={TrendingUp} tone="success" />
        <SummaryCard label="Turns" value={kpis.tableTurns} icon={LineChartIcon} tone="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-5">
          <div className="font-display text-lg font-semibold">Revenue trend</div>
          <div className="mt-6 grid grid-cols-7 items-end gap-3 h-56">
            {salesTrend.map((d) => (
              <div key={d.day} className="flex h-full flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-brand-gradient" style={{ height: `${(d.sales / maxSales) * 100}%` }} />
                </div>
                <div className="text-xs text-muted-foreground">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="font-display text-lg font-semibold">Covers per day</div>
          <div className="mt-6 relative h-56">
            <svg viewBox="0 0 700 200" className="h-full w-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="url(#g)"
                strokeWidth="3"
                points={salesTrend
                  .map((d, i) => `${(i * 700) / (salesTrend.length - 1)},${200 - (d.covers / maxCovers) * 180}`)
                  .join(" ")}
              />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.17 65)" />
                  <stop offset="100%" stopColor="oklch(0.65 0.2 35)" />
                </linearGradient>
              </defs>
              {salesTrend.map((d, i) => (
                <circle
                  key={d.day}
                  cx={(i * 700) / (salesTrend.length - 1)}
                  cy={200 - (d.covers / maxCovers) * 180}
                  r="5"
                  fill="oklch(0.65 0.2 35)"
                />
              ))}
            </svg>
          </div>
          <div className="mt-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
            {salesTrend.map((d) => <div key={d.day}>{d.day}</div>)}
          </div>
        </div>
      </div>

      <div className="card-elevated p-5">
        <div className="font-display text-lg font-semibold">Top menu items</div>
        <div className="mt-4 space-y-3">
          {top.map((t) => (
            <div key={t.id} className="flex items-center gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-xl">{t.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.sold} sold</div>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-brand-gradient" style={{ width: `${(t.sold / topMax) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
