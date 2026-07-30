// Central mock data for the SoR scaffold.
// Replace with real Supabase queries in later prompts.

import margherita from "@/assets/wood-fired-margherita.jpg";
import truffle from "@/assets/truffle-pasta.jpg";
import branzino from "@/assets/branzino.jpg";
import burrata from "@/assets/burrata-peach.jpg";
import tiramisu from "@/assets/tiramisu.jpg";
import octopus from "@/assets/octopus.jpg";



export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";
export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";
export type StockStatus = "in-stock" | "low" | "out";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  emoji: string;
  image?: string;
}

export const menuItems: MenuItem[] = [
  { id: "m1", name: "Wood-fired Margherita", description: "San Marzano tomato, fior di latte, basil", price: 14, category: "Pizza", available: true, emoji: "🍕", image: margherita },
  { id: "m2", name: "Truffle Tagliatelle", description: "Fresh pasta, black truffle, parmigiano", price: 22, category: "Pasta", available: true, emoji: "🍝", image: truffle },

  { id: "m3", name: "Grilled Branzino", description: "Whole sea bass, lemon, herbs, olive oil", price: 28, category: "Mains", available: true, emoji: "🐟", image: branzino },
  { id: "m4", name: "Burrata & Peach", description: "Creamy burrata, grilled peach, prosciutto", price: 16, category: "Starters", available: true, emoji: "🧀", image: burrata },
  { id: "m5", name: "Tiramisu Classico", description: "Espresso, mascarpone, cocoa", price: 9, category: "Desserts", available: true, emoji: "🍰", image: tiramisu },
  { id: "m6", name: "Charred Octopus", description: "Smoked paprika, potato, salsa verde", price: 19, category: "Starters", available: false, emoji: "🐙", image: octopus },
];

export interface Order {
  id: string;
  table: string;
  items: { name: string; qty: number }[];
  status: OrderStatus;
  placedAt: string;
  total: number;
}

export const orders: Order[] = [];

export interface RestaurantTable {
  id: string;
  seats: number;
  status: TableStatus;
  guests?: string;
}

export const tables: RestaurantTable[] = [
  { id: "T-01", seats: 2, status: "available" },
  { id: "T-02", seats: 4, status: "available" },
  { id: "T-03", seats: 2, status: "available" },
  { id: "T-04", seats: 6, status: "available" },
  { id: "T-05", seats: 4, status: "available" },
  { id: "T-06", seats: 2, status: "available" },
  { id: "T-07", seats: 4, status: "available" },
  { id: "T-08", seats: 8, status: "available" },
];

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  status: StockStatus;
  supplier: string;
}

export const inventory: InventoryItem[] = [
  { id: "i1", name: "San Marzano Tomatoes", qty: 24, unit: "cans", status: "in-stock", supplier: "Bella Foods" },
  { id: "i2", name: "Fior di Latte", qty: 3, unit: "kg", status: "low", supplier: "Latteria Verde" },
  { id: "i3", name: "Fresh Basil", qty: 0, unit: "bunches", status: "out", supplier: "Local Farm Co" },
  { id: "i4", name: "Tagliatelle (fresh)", qty: 18, unit: "kg", status: "in-stock", supplier: "Pasta Nonna" },
  { id: "i5", name: "Black Truffle", qty: 0.4, unit: "kg", status: "low", supplier: "Alba Imports" },
  { id: "i6", name: "Branzino (whole)", qty: 12, unit: "pcs", status: "in-stock", supplier: "Coastal Fish" },
];

export const queueParties: { id: string; name: string; size: number; wait: number; position: number }[] = [];

export const reservations: { id: string; name: string; time: string; party: number; table: string; note: string }[] = [];

export const salesTrend = [
  { day: "Mon", sales: 1240, covers: 88 },
  { day: "Tue", sales: 1380, covers: 96 },
  { day: "Wed", sales: 1620, covers: 112 },
  { day: "Thu", sales: 1780, covers: 124 },
  { day: "Fri", sales: 2450, covers: 168 },
  { day: "Sat", sales: 2890, covers: 202 },
  { day: "Sun", sales: 2210, covers: 156 },
];

export const kpis = {
  revenueToday: 2890,
  coversToday: 202,
  avgTicket: 43,
  tableTurns: 2.4,
};
