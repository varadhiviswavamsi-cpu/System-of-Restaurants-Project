// Central mock data for the RestaurantOS scaffold.
// Replace with real Supabase queries in later prompts.

import margheritaAsset from "@/assets/wood-fired-margherita.jpg.asset.json";
import truffleAsset from "@/assets/truffle-pasta.jpg.asset.json";
import branzinoAsset from "@/assets/branzino.jpg.asset.json";
import burrataAsset from "@/assets/burrata-peach.jpg.asset.json";
import tiramisuAsset from "@/assets/tiramisu.jpg.asset.json";




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
  { id: "m1", name: "Wood-fired Margherita", description: "San Marzano tomato, fior di latte, basil", price: 14, category: "Pizza", available: true, emoji: "🍕", image: margheritaAsset.url },
  { id: "m2", name: "Truffle Tagliatelle", description: "Fresh pasta, black truffle, parmigiano", price: 22, category: "Pasta", available: true, emoji: "🍝", image: truffleAsset.url },

  { id: "m3", name: "Grilled Branzino", description: "Whole sea bass, lemon, herbs, olive oil", price: 28, category: "Mains", available: true, emoji: "🐟", image: branzinoAsset.url },
  { id: "m4", name: "Burrata & Peach", description: "Creamy burrata, grilled peach, prosciutto", price: 16, category: "Starters", available: true, emoji: "🧀", image: burrataAsset.url },
  { id: "m5", name: "Tiramisu Classico", description: "Espresso, mascarpone, cocoa", price: 9, category: "Desserts", available: true, emoji: "🍰" },
  { id: "m6", name: "Charred Octopus", description: "Smoked paprika, potato, salsa verde", price: 19, category: "Starters", available: false, emoji: "🐙" },
];

export interface Order {
  id: string;
  table: string;
  items: { name: string; qty: number }[];
  status: OrderStatus;
  placedAt: string;
  total: number;
}

export const orders: Order[] = [
  { id: "#1042", table: "T-04", items: [{ name: "Margherita", qty: 2 }, { name: "Burrata", qty: 1 }], status: "preparing", placedAt: "12:14", total: 44 },
  { id: "#1043", table: "T-11", items: [{ name: "Tagliatelle", qty: 1 }, { name: "Tiramisu", qty: 2 }], status: "ready", placedAt: "12:18", total: 40 },
  { id: "#1044", table: "T-02", items: [{ name: "Branzino", qty: 1 }], status: "pending", placedAt: "12:22", total: 28 },
  { id: "#1045", table: "T-07", items: [{ name: "Octopus", qty: 1 }, { name: "Margherita", qty: 1 }], status: "served", placedAt: "11:55", total: 33 },
  { id: "#1046", table: "T-09", items: [{ name: "Tagliatelle", qty: 2 }], status: "preparing", placedAt: "12:25", total: 44 },
];

export interface RestaurantTable {
  id: string;
  seats: number;
  status: TableStatus;
  guests?: string;
}

export const tables: RestaurantTable[] = [
  { id: "T-01", seats: 2, status: "available" },
  { id: "T-02", seats: 4, status: "occupied", guests: "Rivera, 3" },
  { id: "T-03", seats: 2, status: "reserved", guests: "Chen • 12:45" },
  { id: "T-04", seats: 6, status: "occupied", guests: "Nguyen, 5" },
  { id: "T-05", seats: 4, status: "cleaning" },
  { id: "T-06", seats: 2, status: "available" },
  { id: "T-07", seats: 4, status: "occupied", guests: "Alvarez, 4" },
  { id: "T-08", seats: 8, status: "reserved", guests: "Patel • 13:15" },
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

export const queueParties = [
  { id: "q1", name: "Johnson", size: 2, wait: 5, position: 1 },
  { id: "q2", name: "Kim", size: 4, wait: 15, position: 2 },
  { id: "q3", name: "Okafor", size: 3, wait: 20, position: 3 },
  { id: "q4", name: "Silva", size: 6, wait: 35, position: 4 },
];

export const reservations = [
  { id: "r1", name: "Chen", time: "12:45", party: 2, table: "T-03", note: "Anniversary" },
  { id: "r2", name: "Patel", time: "13:15", party: 8, table: "T-08", note: "Birthday" },
  { id: "r3", name: "Muller", time: "19:00", party: 4, table: "—", note: "" },
  { id: "r4", name: "Ito", time: "19:30", party: 2, table: "—", note: "Window seat" },
];

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
