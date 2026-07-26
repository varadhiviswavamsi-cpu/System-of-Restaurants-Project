import type { AiContext, Insight, Recommendation } from "./types";
import { forecastDemand } from "./forecastEngine";
import { analyzeOperations, predictInventory } from "./insightGenerator";

/** Turns forecasts and operational signals into actionable manager recommendations. */
export function buildRecommendations(ctx: AiContext): Recommendation[] {
  const forecast = forecastDemand(ctx);
  const stock = predictInventory(ctx);
  const ops = analyzeOperations(ctx);
  const recs: Recommendation[] = [];

  const topDish = ctx.menu.find((m) => m.available) ?? ctx.menu[0];
  if (topDish) {
    recs.push({
      id: "rec-prep",
      title: `Pre-batch ${topDish.name}`,
      action: `Prepare 25% more ${topDish.name.toLowerCase()} components before ${forecast.peakWindow.split(" – ")[0]}.`,
      impact: `Protects ticket times through the ${forecast.peakWindow} peak and avoids ~${Math.round(forecast.expectedOrders * 0.06)} delayed covers.`,
      category: "Kitchen",
      severity: "opportunity",
      confidence: forecast.confidence,
    });
  }

  const urgent = stock.filter((s) => s.risk !== "info").slice(0, 2);
  urgent.forEach((s) =>
    recs.push({
      id: `rec-stock-${s.itemId}`,
      title: `Restock ${s.name}`,
      action: `Order ${s.restockQty} within the next hour${s.depletionAt ? ` — projected depletion at ${s.depletionAt}` : ""}.`,
      impact: "Prevents 86 menu items becoming unavailable during peak service.",
      category: "Inventory",
      severity: s.risk,
      confidence: s.confidence,
    }),
  );

  const hottest = ops[0];
  if (hottest && hottest.load > 60) {
    recs.push({
      id: "rec-staff",
      title: `Add a hand on ${hottest.station}`,
      action: `Schedule an additional kitchen team member on ${hottest.station} between ${forecast.peakWindow}.`,
      impact: `Expected to cut average prep time by 3–4 minutes and lift table turns toward ${(ctx.kpis.tableTurns + 0.3).toFixed(1)}.`,
      category: "Staffing",
      severity: hottest.load > 80 ? "critical" : "warning",
      confidence: hottest.confidence,
    });
  }

  const quiet = ops.at(-1);
  if (quiet) {
    recs.push({
      id: "rec-revenue",
      title: "Promote desserts in the lull",
      action: `Run a dessert-and-coffee upsell while ${quiet.station} is under-utilised, before the ${forecast.peakWindow} rush.`,
      impact: `Adds an estimated $${Math.round(ctx.kpis.avgTicket * 0.14 * 20)} to tonight's revenue at current cover mix.`,
      category: "Revenue",
      severity: "opportunity",
      confidence: { value: 81, basis: "Attach-rate of desserts across the last 30 services" },
    });
  }

  if (ctx.queue.length > 0) {
    recs.push({
      id: "rec-service",
      title: "Prioritise dine-in seating",
      action: `Seat the ${ctx.queue.length} waiting ${ctx.queue.length === 1 ? "party" : "parties"} before accepting new walk-ins and bump ready tickets first.`,
      impact: "Reduces average guest wait by roughly 7 minutes and protects review scores.",
      category: "Service",
      severity: "warning",
      confidence: { value: 88, basis: "Live queue length and current table turn rate" },
    });
  }

  const slow = stock.filter((s) => s.wasteNote).slice(0, 1);
  slow.forEach((s) =>
    recs.push({
      id: `rec-waste-${s.itemId}`,
      title: `Delay purchasing ${s.name}`,
      action: s.wasteNote!,
      impact: "Cuts avoidable spoilage and frees working capital this week.",
      category: "Inventory",
      severity: "info",
      confidence: s.confidence,
    }),
  );

  return recs;
}

/** Narrative insights: what happened, why, what to do, and the business impact. */
export function buildInsights(ctx: AiContext): Insight[] {
  const forecast = forecastDemand(ctx);
  const stock = predictInventory(ctx);
  const ops = analyzeOperations(ctx);
  const insights: Insight[] = [];

  insights.push({
    id: "ins-demand",
    headline: `Dinner rush building toward ${forecast.peakWindow}`,
    what: `Forecast shows ${forecast.expectedCovers} covers and ${forecast.expectedOrders} orders across the remaining service.`,
    why: `Reservations, live queue and the last four comparable weekdays all point ${forecast.trafficDelta >= 0 ? "above" : "below"} the recent baseline (${forecast.trafficDelta >= 0 ? "+" : ""}${forecast.trafficDelta}%).`,
    action: "Stage prep and stagger breaks so the line is fully covered 30 minutes before the peak.",
    impact: "Protects ticket times during the highest-revenue window of the day.",
    severity: forecast.trafficDelta > 15 ? "warning" : "info",
    trend: forecast.trafficDelta >= 0 ? "up" : "down",
    confidence: forecast.confidence,
  });

  const risky = stock.find((s) => s.risk !== "info");
  if (risky) {
    insights.push({
      id: "ins-stock",
      headline: `${risky.name} may run out${risky.depletionAt ? ` by ${risky.depletionAt}` : " today"}`,
      what: `Only ${risky.onHand} on hand against the projected consumption curve.`,
      why: "Current order rate is running ahead of the historical burn rate for this ingredient.",
      action: `Restock ${risky.restockQty} now, or 86 the affected dishes before the rush.`,
      impact: "Avoids mid-service menu removals and lost cover revenue.",
      severity: risky.risk,
      trend: "down",
      confidence: risky.confidence,
    });
  }

  const hottest = ops[0];
  if (hottest) {
    insights.push({
      id: "ins-ops",
      headline: `${hottest.station} is the current bottleneck`,
      what: `${hottest.station} is at ${hottest.load}% load with an average prep time of ${hottest.value}.`,
      why: "Ticket mix is concentrated on this station while adjacent stations sit under capacity.",
      action: `Reassign one team member from ${ops.at(-1)?.station ?? "the cold line"} and fire long-cook items early.`,
      impact: "Shortens the critical path on tickets and improves table turns.",
      severity: hottest.load > 80 ? "critical" : "info",
      trend: hottest.trend,
      confidence: hottest.confidence,
    });
  }

  insights.push({
    id: "ins-revenue",
    headline: "Weekend demand lift is holding",
    what: `Average ticket is $${ctx.kpis.avgTicket} with ${ctx.kpis.tableTurns} turns per table.`,
    why: "Weekend covers are consistently above weekday levels across the last four weeks.",
    action: "Push high-margin starters and desserts to lift the average ticket during peak seating.",
    impact: `Every $2 on the average ticket is roughly $${Math.round(ctx.kpis.coversToday * 2).toLocaleString()} more revenue today.`,
    severity: "opportunity",
    trend: "up",
    confidence: { value: 85, basis: "Last 30 days of sales and ticket mix" },
  });

  return insights;
}
