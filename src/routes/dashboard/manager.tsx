import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SummaryCard } from "@/components/common/SummaryCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { kpis, orders, reservations, salesTrend } from "@/lib/mock-data";
import { CalendarClock, DollarSign, TrendingUp, Users, Utensils } from "lucide-react";

export const Route = createFileRoute("/dashboard/manager")({
  head: () => ({
    meta: [
      { title: "Manager dashboard · RestaurantOS" },
      { name: "description", content: "Revenue, covers, reservations and service pulse at a glance." },
      { property: "og:title", content: "Manager dashboard · RestaurantOS" },
      { property: "og:description", content: "Revenue, covers and service pulse at a glance." },
    ],
  }),
  component: ManagerDashboard,
});

function ManagerDashboard() {
  const max = Math.max(...salesTrend.map((d) => d.sales));
  return (
    <DashboardShell
      title="Manager dashboard"
      subtitle="Today's service · Trattoria Sole"
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/analytics">Analytics</Link>
          </Button>
          <Button size="sm" className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
            New shift
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Revenue today" value={`$${kpis.revenueToday.toLocaleString()}`} icon={DollarSign} delta="+12% vs last week" />
        <SummaryCard label="Covers" value={kpis.coversToday} icon={Users} tone="warning" delta="+18 vs yesterday" />
        <SummaryCard label="Avg ticket" value={`$${kpis.avgTicket}`} icon={Utensils} tone="success" />
        <SummaryCard label="Table turns" value={kpis.tableTurns} icon={TrendingUp} tone="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-elevated p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-semibold">Weekly sales</div>
              <div className="text-xs text-muted-foreground">Revenue by day</div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">View details</Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-72 rounded-2xl border border-white/20 bg-card/35 p-4 shadow-warm backdrop-blur-2xl dark:bg-card/30"
              >
                <div className="font-display text-sm font-semibold">Revenue breakdown</div>
                <div className="mt-3 space-y-2">
                  {salesTrend.map((d) => (
                    <div key={d.day} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{d.day}</span>
                      <span className="font-medium">${d.sales.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-white/20 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total week</span>
                    <span className="font-semibold text-primary">
                      ${salesTrend.reduce((acc, d) => acc + d.sales, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="mt-6 flex h-52 gap-4">
            <div className="relative flex h-full flex-col justify-between text-xs text-muted-foreground">
              <span>${max.toLocaleString()}</span>
              <span>${Math.round(max * 0.75).toLocaleString()}</span>
              <span>${Math.round(max * 0.5).toLocaleString()}</span>
              <span>${Math.round(max * 0.25).toLocaleString()}</span>
              <span>$0</span>
            </div>
            <div className="grid flex-1 grid-cols-7 items-end gap-3">
              {salesTrend.map((d) => (
                <div key={d.day} className="flex h-full flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className="w-8 rounded-t-md bg-brand-gradient"
                      style={{ height: `${(d.sales / max) * 100}%` }}
                      title={`$${d.sales}`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <div className="font-display text-lg font-semibold">Next reservations</div>
          </div>
          <ul className="mt-4 divide-y">
            {reservations.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">Party {r.party} · {r.table}</div>
                </div>
                <div className="text-sm font-semibold text-primary">{r.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-elevated p-5">
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-semibold">Live orders</div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/kitchen">Open kitchen</Link>
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.table}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                  </TableCell>
                  <TableCell>{o.placedAt}</TableCell>
                  <TableCell>${o.total}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}
