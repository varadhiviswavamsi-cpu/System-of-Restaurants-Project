import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Boxes,
  Clock,
  Flame,
  Gauge,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SummaryCard } from "@/components/common/SummaryCard";
import { Button } from "@/components/ui/button";
import {
  AlertBanner,
  ConfidenceChip,
  LoadBar,
  SectionHeading,
  SeverityBadge,
  TrendArrow,
} from "@/components/ai/AiPrimitives";
import { ManagerAssistant } from "@/components/ai/ManagerAssistant";
import { buildAiContext, generateBriefing } from "@/lib/ai/aiService";
import { useAllOrders } from "@/lib/orders-store";
import { useReservations } from "@/lib/reservations-store";
import { useQueue } from "@/lib/queue-store";

export const Route = createFileRoute("/dashboard/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights · SoR" },
      {
        name: "description",
        content:
          "Predictive demand forecasting, inventory risk and kitchen efficiency insights for restaurant managers.",
      },
      { property: "og:title", content: "AI Insights · SoR" },
      {
        property: "og:description",
        content: "Forecasts, inventory risk and operational recommendations for your service.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiInsightsPage,
});

function AiInsightsPage() {
  const orders = useAllOrders();
  const reservations = useReservations();
  const queue = useQueue();
  const [stamp, setStamp] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  const briefing = useMemo(() => {
    const ctxValue = buildAiContext({ orders, reservations, queue, now: stamp });
    return { ctx: ctxValue, data: generateBriefing(ctxValue) };
  }, [orders, reservations, queue, stamp]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setStamp(new Date());
      setRefreshing(false);
      toast.success("Analysis refreshed", {
        description: "Forecasts, inventory risk and station load recomputed from live data.",
      });
    }, 500);
  };

  const { ctx, data } = briefing;
  const updatedAt = stamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const maxCovers = Math.max(...data.demand.hourly.map((h) => h.covers));
  const criticalStock = data.inventory.filter((i) => i.risk !== "info");

  return (
    <DashboardShell
      title="AI Insights"
      subtitle={`Updated ${updatedAt} · ${data.headline}`}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {refreshing ? "Refreshing…" : "Refresh analysis"}
        </Button>

      }
    >
      {data.demand.spikeAlert && (
        <AlertBanner severity="warning" title="Order spike alert">
          {data.demand.spikeAlert}
        </AlertBanner>
      )}
      {criticalStock.length > 0 && (
        <AlertBanner severity={criticalStock[0].risk} title="Inventory shortage risk">
          {criticalStock[0].name} may run out
          {criticalStock[0].depletionAt ? ` by ${criticalStock[0].depletionAt}` : " today"} ·
          Confidence {criticalStock[0].confidence.value}% · {criticalStock[0].confidence.basis}.
        </AlertBanner>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Forecast covers"
          value={data.demand.expectedCovers}
          icon={Users}
          delta={`${data.demand.trafficDelta >= 0 ? "+" : ""}${data.demand.trafficDelta}% vs comparable day`}
        />
        <SummaryCard label="Forecast orders" value={data.demand.expectedOrders} icon={Activity} tone="warning" />
        <SummaryCard label="Peak window" value={data.demand.peakWindow} icon={Clock} tone="success" />
        <SummaryCard label="Stock alerts" value={criticalStock.length} icon={Boxes} tone="muted" />
      </div>

      {/* Demand forecasting */}
      <section className="space-y-4">
        <SectionHeading title="Demand forecasting" hint={data.demand.confidence.basis} />
        <div className="card-elevated p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-lg font-semibold">Predicted customer traffic</div>
              <div className="text-xs text-muted-foreground">Covers per hour across today's service</div>
            </div>
            <ConfidenceChip confidence={data.demand.confidence} />
          </div>
          <div className="mt-6 flex h-56 gap-4">
            <div className="flex h-full flex-col justify-between text-xs text-muted-foreground">
              <span>{maxCovers}</span>
              <span>{Math.round(maxCovers * 0.66)}</span>
              <span>{Math.round(maxCovers * 0.33)}</span>
              <span>0</span>
            </div>
            <div className="grid flex-1 grid-cols-12 items-end gap-1.5 sm:gap-2">
              {data.demand.hourly.map((h) => (
                <div key={h.hour} className="flex h-full flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      title={`${h.label}: ${h.covers} covers · ${h.orders} orders`}
                      className={
                        h.peak
                          ? "w-4 rounded-t-md bg-brand-gradient shadow-warm sm:w-5"
                          : "w-4 rounded-t-md bg-primary/25 sm:w-5"
                      }
                      style={{ height: `${(h.covers / maxCovers) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground sm:text-xs">{h.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Busiest period predicted at <span className="font-medium text-primary">{data.demand.peakWindow}</span>{" "}
            with {data.demand.expectedOrders} orders expected across the remaining service.
          </p>
        </div>
      </section>

      {/* Inventory prediction */}
      <section className="space-y-4">
        <SectionHeading title="Inventory prediction" hint="Projected depletion from live order rate" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.inventory.map((item) => (
            <div key={item.itemId} className="card-elevated space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-base font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">On hand: {item.onHand}</div>
                </div>
                <SeverityBadge
                  severity={item.risk}
                  label={item.risk === "info" ? "healthy" : item.risk === "warning" ? "low stock" : "shortage"}
                />
              </div>
              <div className="space-y-1.5">
                <LoadBar
                  value={Math.min(100, (item.hoursLeft / 8) * 100)}
                  tone={item.risk === "info" ? "brand" : "warning"}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {item.depletionAt ? `Depletes ~${item.depletionAt}` : "Covers full service"}
                  </span>
                  <span>{item.hoursLeft}h left</span>
                </div>
              </div>
              <p className="text-sm">
                Recommended restock: <span className="font-medium text-primary">{item.restockQty}</span>
              </p>
              {item.wasteNote && <p className="text-xs text-muted-foreground">{item.wasteNote}</p>}
              <ConfidenceChip confidence={item.confidence} />
            </div>
          ))}
        </div>
      </section>

      {/* Operational insights */}
      <section className="space-y-4">
        <SectionHeading title="Operational insights" hint="Station load, prep times and bottlenecks" />
        <div className="card-elevated divide-y p-5">
          {data.operations.map((op) => (
            <div key={op.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_1fr_auto] md:items-center">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="font-medium">{op.station}</span>
              </div>
              <div className="space-y-1.5">
                <LoadBar value={op.load} tone={op.load > 72 ? "warning" : "brand"} />
                <p className="text-xs text-muted-foreground">{op.detail}</p>
              </div>
              <div className="flex items-center gap-3 md:justify-end">
                <span className="text-sm font-semibold">{op.value}</span>
                <TrendArrow trend={op.trend} />
                <span className="text-xs text-muted-foreground">{op.load}% load</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Insights + recommendations */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <SectionHeading title="AI-generated insights" hint="What happened, why, and what to do" />
          <div className="space-y-4">
            {data.insights.map((ins) => (
              <div key={ins.id} className="card-elevated space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-display text-base font-semibold">{ins.headline}</span>
                  </div>
                  <TrendArrow trend={ins.trend} />
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">What</dt>
                    <dd>{ins.what}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Why</dt>
                    <dd>{ins.why}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Action</dt>
                    <dd className="font-medium text-primary">{ins.action}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Impact</dt>
                    <dd>{ins.impact}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={ins.severity} />
                  <ConfidenceChip confidence={ins.confidence} />
                </div>
                <p className="text-xs text-muted-foreground">Based on {ins.confidence.basis.toLowerCase()}.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading title="Recommended actions" hint="Prioritised for this service" />
          <div className="space-y-4">
            {data.recommendations.map((rec) => (
              <div key={rec.id} className="card-elevated space-y-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-display text-base font-semibold">{rec.title}</span>
                  </div>
                  <SeverityBadge severity={rec.severity} />
                </div>
                <p className="text-sm">{rec.action}</p>
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {rec.impact}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {rec.category}
                  </span>
                  <ConfidenceChip confidence={rec.confidence} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading title="Ask the assistant" hint="Answers reference the insights above" />
        <ManagerAssistant ctx={ctx} />
      </section>
    </DashboardShell>
  );
}
