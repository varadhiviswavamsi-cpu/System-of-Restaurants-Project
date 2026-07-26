// Single entry point for the app's AI features.
//
// Today this is a deterministic mock service built on local engines. To move to
// Google Gemini, keep these exported function signatures and swap the bodies for
// a `createServerFn` call that returns the same typed shapes — the UI stays the same.

import { inventory, kpis, menuItems, salesTrend } from "@/lib/mock-data";
import type { Order } from "@/lib/mock-data";
import type { Reservation } from "@/lib/reservations-store";
import type { QueueParty } from "@/lib/queue-store";
import { forecastDemand } from "./forecastEngine";
import { analyzeOperations, predictInventory } from "./insightGenerator";
import { buildInsights, buildRecommendations } from "./recommendationEngine";
import { askManagerAssistant, SUGGESTED_QUESTIONS } from "./managerAssistant";
import type { AiBriefing, AiContext, AssistantReply } from "./types";

export type { AiBriefing, AiContext, AssistantReply } from "./types";
export { SUGGESTED_QUESTIONS } from "./managerAssistant";

export function buildAiContext(live: {
  orders: Order[];
  reservations: Reservation[];
  queue: QueueParty[];
  now?: Date;
}): AiContext {
  return {
    now: live.now ?? new Date(),
    orders: live.orders,
    reservations: live.reservations,
    queue: live.queue,
    inventory,
    menu: menuItems,
    salesTrend,
    kpis,
  };
}

function timeLabel(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Full intelligence briefing for the AI Insights dashboard. */
export function generateBriefing(ctx: AiContext): AiBriefing {
  const demand = forecastDemand(ctx);
  return {
    generatedAt: timeLabel(ctx.now),
    headline: `Service outlook: ${demand.expectedCovers} covers forecast, peaking ${demand.peakWindow}.`,
    demand,
    inventory: predictInventory(ctx),
    operations: analyzeOperations(ctx),
    recommendations: buildRecommendations(ctx),
    insights: buildInsights(ctx),
  };
}

/** Ask the manager assistant an operational question. Async so a Gemini swap is drop-in. */
export async function askAssistant(question: string, ctx: AiContext): Promise<AssistantReply> {
  await new Promise((r) => setTimeout(r, 450));
  return askManagerAssistant(question, ctx);
}
