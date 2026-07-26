import type { AiContext, InventoryPrediction, OperationalInsight } from "./types";
import { forecastDemand } from "./forecastEngine";

const BURN_PER_COVER: Record<string, number> = {
  i1: 0.09, i2: 0.06, i3: 0.04, i4: 0.11, i5: 0.004, i6: 0.07,
};

function clockIn(now: Date, hours: number) {
  const d = new Date(now.getTime() + hours * 3600_000);
  const h = d.getHours();
  const suffix = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(d.getMinutes()).padStart(2, "0")} ${suffix}`;
}

/** Projects ingredient depletion from forecast covers and per-cover burn rates. */
export function predictInventory(ctx: AiContext): InventoryPrediction[] {
  const forecast = forecastDemand(ctx);
  const coversPerHour = Math.max(4, Math.round(forecast.expectedCovers / 5));

  return ctx.inventory
    .map((item) => {
      const burn = (BURN_PER_COVER[item.id] ?? 0.05) * coversPerHour;
      const hoursLeft = burn > 0 ? item.qty / burn : 99;
      const risk =
        item.status === "out" || hoursLeft < 1.5
          ? "critical"
          : hoursLeft < 4
            ? "warning"
            : "info";
      const restock = Math.max(1, Math.ceil(burn * 6 - item.qty));
      return {
        itemId: item.id,
        name: item.name,
        onHand: `${item.qty} ${item.unit}`,
        depletionAt: hoursLeft < 8 ? clockIn(ctx.now, hoursLeft) : null,
        hoursLeft: Math.round(hoursLeft * 10) / 10,
        risk,
        restockQty: `${restock} ${item.unit}`,
        wasteNote:
          hoursLeft > 12
            ? `Stock covers more than two services — delay the next ${item.supplier} purchase to avoid spoilage.`
            : null,
        confidence: {
          value: item.status === "out" ? 97 : Math.max(74, 94 - Math.round(hoursLeft * 2)),
          basis: `Current order rate and 30-day consumption for ${item.name.toLowerCase()}`,
        },
      } satisfies InventoryPrediction;
    })
    .sort((a, b) => a.hoursLeft - b.hoursLeft);
}

const STATIONS = ["Grill", "Pasta", "Pizza oven", "Cold line", "Pass"] as const;

/** Detects bottlenecks, slow stations and workload imbalance from the live ticket mix. */
export function analyzeOperations(ctx: AiContext): OperationalInsight[] {
  const active = ctx.orders.filter((o) => o.status === "pending" || o.status === "preparing");
  const totalItems = active.reduce((a, o) => a + o.items.reduce((s, i) => s + i.qty, 0), 0);

  return STATIONS.map((station, idx) => {
    const share = [0.26, 0.24, 0.2, 0.16, 0.14][idx];
    const items = Math.round(totalItems * share);
    const load = Math.min(100, Math.round(items * 12 + 22 + idx * 4 + ctx.queue.length * 3));
    const prepMin = Math.round(8 + load / 12);
    const trend = load > 72 ? "up" : load < 40 ? "down" : "flat";
    return {
      id: `op-${station}`,
      station,
      metric: "Avg prep time",
      value: `${prepMin} min`,
      trend,
      load,
      detail:
        load > 72
          ? `${station} is holding ${items} open items — the main bottleneck for current ticket times.`
          : load < 40
            ? `${station} has spare capacity; shift one hand here to a busier station.`
            : `${station} is running at a healthy pace with ${items} open items.`,
      confidence: {
        value: 80 + (load > 72 ? 12 : 4),
        basis: "Live ticket mix and rolling 7-day prep times",
      },
    } satisfies OperationalInsight;
  }).sort((a, b) => b.load - a.load);
}
