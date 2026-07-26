// Shared contracts for the SoR AI layer.
// The UI only ever depends on these types, so the mock engines below can be
// swapped for a Google Gemini implementation without touching components.

import type { InventoryItem, MenuItem, Order } from "@/lib/mock-data";
import type { Reservation } from "@/lib/reservations-store";
import type { QueueParty } from "@/lib/queue-store";

export type Trend = "up" | "down" | "flat";
export type Severity = "info" | "opportunity" | "warning" | "critical";

/** Everything the engines are allowed to reason about. */
export interface AiContext {
  now: Date;
  orders: Order[];
  inventory: InventoryItem[];
  menu: MenuItem[];
  reservations: Reservation[];
  queue: QueueParty[];
  salesTrend: { day: string; sales: number; covers: number }[];
  kpis: { revenueToday: number; coversToday: number; avgTicket: number; tableTurns: number };
}

export interface Confidence {
  /** 0-100 */
  value: number;
  /** Where the number came from, e.g. "Last 30 days of sales". */
  basis: string;
}

export interface HourForecast {
  hour: number;
  label: string;
  covers: number;
  orders: number;
  peak: boolean;
}

export interface DemandForecast {
  hourly: HourForecast[];
  peakWindow: string;
  expectedOrders: number;
  expectedCovers: number;
  trafficDelta: number;
  spikeAlert: string | null;
  confidence: Confidence;
}

export interface InventoryPrediction {
  itemId: string;
  name: string;
  onHand: string;
  depletionAt: string | null;
  hoursLeft: number;
  risk: Severity;
  restockQty: string;
  wasteNote: string | null;
  confidence: Confidence;
}

export interface OperationalInsight {
  id: string;
  station: string;
  metric: string;
  value: string;
  trend: Trend;
  /** 0-100 load index. */
  load: number;
  detail: string;
  confidence: Confidence;
}

export interface Recommendation {
  id: string;
  title: string;
  action: string;
  impact: string;
  category: "Kitchen" | "Inventory" | "Staffing" | "Revenue" | "Service";
  severity: Severity;
  confidence: Confidence;
}

export interface Insight {
  id: string;
  headline: string;
  what: string;
  why: string;
  action: string;
  impact: string;
  severity: Severity;
  trend: Trend;
  confidence: Confidence;
}

export interface AssistantReply {
  answer: string;
  reasoning: string;
  actions: string[];
  references: string[];
  confidence: Confidence;
}

export interface AiBriefing {
  generatedAt: string;
  headline: string;
  demand: DemandForecast;
  inventory: InventoryPrediction[];
  operations: OperationalInsight[];
  recommendations: Recommendation[];
  insights: Insight[];
}
