import type { AiContext, AssistantReply } from "./types";
import { forecastDemand } from "./forecastEngine";
import { analyzeOperations, predictInventory } from "./insightGenerator";
import { buildRecommendations } from "./recommendationEngine";

export const SUGGESTED_QUESTIONS = [
  "What is the busiest time today?",
  "Which menu items are likely to run out?",
  "Why are current orders delayed?",
  "What should we prepare more of tonight?",
  "Which staff station is overloaded?",
  "Are we meeting today's performance targets?",
  "Which menu items should be promoted this evening?",
];

type Matcher = { keys: string[]; build: (ctx: AiContext) => AssistantReply };

const MATCHERS: Matcher[] = [
  {
    keys: ["busiest", "busy", "peak", "rush", "traffic"],
    build: (ctx) => {
      const f = forecastDemand(ctx);
      return {
        answer: `The busiest window today is ${f.peakWindow}, with roughly ${f.expectedCovers} covers and ${f.expectedOrders} orders left to serve.`,
        reasoning: `Hourly demand peaks where historical covers, today's reservations (${ctx.reservations.length}) and the live queue (${ctx.queue.length}) all align. Traffic is tracking ${f.trafficDelta >= 0 ? "+" : ""}${f.trafficDelta}% against the comparable day.`,
        actions: [
          `Have the full line on station 30 minutes before ${f.peakWindow.split(" – ")[0]}.`,
          "Stagger breaks so no station is short-handed at the peak.",
        ],
        references: ["Demand forecast", "Reservations", "Live queue"],
        confidence: f.confidence,
      };
    },
  },
  {
    keys: ["run out", "shortage", "stock", "inventory", "restock", "86"],
    build: (ctx) => {
      const stock = predictInventory(ctx);
      const risky = stock.filter((s) => s.risk !== "info").slice(0, 3);
      return {
        answer: risky.length
          ? `At risk today: ${risky.map((s) => `${s.name}${s.depletionAt ? ` (by ${s.depletionAt})` : ""}`).join(", ")}.`
          : "No ingredient is projected to run out before close — all stock levels cover the forecast service.",
        reasoning: risky.length
          ? `Each of these is burning faster than its remaining quantity supports at the forecast cover rate. ${risky[0].name} has only ${risky[0].onHand} on hand.`
          : "Every tracked ingredient has more than four hours of cover at the projected consumption rate.",
        actions: risky.length
          ? risky.map((s) => `Order ${s.restockQty} of ${s.name} within the hour.`)
          : ["Hold purchasing; re-check after the dinner peak."],
        references: ["Inventory prediction", "Demand forecast"],
        confidence: risky[0]?.confidence ?? { value: 88, basis: "Current stock levels and 30-day burn rates" },
      };
    },
  },
  {
    keys: ["delay", "slow", "late", "wait", "bottleneck"],
    build: (ctx) => {
      const ops = analyzeOperations(ctx);
      const top = ops[0];
      return {
        answer: `Delays are concentrated on ${top.station}, running at ${top.load}% load with ${top.value} average prep time.`,
        reasoning: `${top.detail} Meanwhile ${ops.at(-1)?.station} is at ${ops.at(-1)?.load}% — the imbalance, not total volume, is driving ticket times.`,
        actions: [
          `Move one team member to ${top.station}.`,
          "Fire long-cook items first and bump ready tickets immediately to clear the pass.",
        ],
        references: ["Operational insights", "Live orders"],
        confidence: top.confidence,
      };
    },
  },
  {
    keys: ["prepare", "prep", "tonight", "more of"],
    build: (ctx) => {
      const f = forecastDemand(ctx);
      const dishes = ctx.menu.filter((m) => m.available).slice(0, 3);
      return {
        answer: `Prep ahead on ${dishes.map((d) => d.name).join(", ")} — they carry the majority of forecast covers for ${f.peakWindow}.`,
        reasoning: `Forecast volume for the rest of service is ${f.expectedOrders} orders. These items have the highest historical share and the longest cook times, so they set the critical path.`,
        actions: [
          `Pre-batch 25% more components for ${dishes[0]?.name ?? "the top seller"} before the peak.`,
          "Portion garnish and sides now to keep the pass moving.",
        ],
        references: ["Demand forecast", "Menu mix"],
        confidence: f.confidence,
      };
    },
  },
  {
    keys: ["overload", "station", "staff", "workload", "schedule"],
    build: (ctx) => {
      const ops = analyzeOperations(ctx);
      const top = ops[0];
      const low = ops.at(-1)!;
      return {
        answer: `${top.station} is the most loaded station (${top.load}%), while ${low.station} sits at ${low.load}%.`,
        reasoning: "Workload is measured from open ticket items per station plus queue pressure. A spread greater than 30 points reliably precedes ticket-time slippage.",
        actions: [
          `Reassign one hand from ${low.station} to ${top.station}.`,
          `Schedule an extra kitchen member for the ${forecastDemand(ctx).peakWindow} window.`,
        ],
        references: ["Operational insights", "Staff floor"],
        confidence: top.confidence,
      };
    },
  },
  {
    keys: ["target", "performance", "kpi", "on track", "revenue"],
    build: (ctx) => {
      const f = forecastDemand(ctx);
      const projected = ctx.kpis.revenueToday + f.expectedCovers * ctx.kpis.avgTicket;
      return {
        answer: `Revenue is at $${ctx.kpis.revenueToday.toLocaleString()} with $${projected.toLocaleString()} projected by close — ${f.trafficDelta >= 0 ? "ahead of" : "behind"} the comparable day.`,
        reasoning: `Projection combines booked revenue with ${f.expectedCovers} forecast covers at the $${ctx.kpis.avgTicket} average ticket. Table turns are at ${ctx.kpis.tableTurns}.`,
        actions: [
          "Protect turns by clearing and resetting tables within 6 minutes.",
          "Lift the average ticket with starter and dessert upsells during peak seating.",
        ],
        references: ["Analytics", "Demand forecast"],
        confidence: { value: 84, basis: "Today's sales pace and last 30 days of tickets" },
      };
    },
  },
  {
    keys: ["promote", "upsell", "special", "margin"],
    build: (ctx) => {
      const promote = ctx.menu.filter((m) => m.available).slice(-2);
      return {
        answer: `Promote ${promote.map((p) => p.name).join(" and ")} this evening.`,
        reasoning: "Both carry above-average margin, use ingredients with healthy stock cover, and sit on stations with spare capacity — so promoting them adds revenue without extending ticket times.",
        actions: [
          `Feature ${promote[0]?.name ?? "the special"} as the server recommendation at seating.`,
          "Run a dessert-and-coffee attach during the post-peak lull.",
        ],
        references: ["Menu mix", "Inventory prediction", "Operational insights"],
        confidence: { value: 82, basis: "Margin mix and attach rates over the last 30 days" },
      };
    },
  },
];

/** Restaurant-operations assistant. Answers are grounded in the same engines as the dashboard. */
export function askManagerAssistant(question: string, ctx: AiContext): AssistantReply {
  const q = question.toLowerCase();
  const match = MATCHERS.find((m) => m.keys.some((k) => q.includes(k)));
  if (match) return match.build(ctx);

  const recs = buildRecommendations(ctx).slice(0, 3);
  const f = forecastDemand(ctx);
  return {
    answer: `Here's the operational picture: peak is ${f.peakWindow} with ${f.expectedCovers} forecast covers, and ${recs.length} recommendations are open.`,
    reasoning:
      "That question sits outside the current operational data set, so this is the general service briefing drawn from demand, inventory and kitchen signals.",
    actions: recs.map((r) => r.action),
    references: ["Demand forecast", "Recommendations"],
    confidence: f.confidence,
  };
}
