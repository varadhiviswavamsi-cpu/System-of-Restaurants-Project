import { useSyncExternalStore } from "react";
import { orders as seedOrders, type Order, type OrderStatus } from "./mock-data";

// Initialize with seed orders so kitchen has tickets to work on immediately.
let orders: Order[] = [...seedOrders];
// Track which orders were placed by the current user (so the Orders page can highlight them).
const userOrderIds = new Set<string>();

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function nextId() {
  const n = 1050 + orders.filter((o) => o.id.startsWith("#1")).length;
  return `#${n}`;
}

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function addOrderItem(input: {
  name: string;
  price: number;
  table?: string;
}) {
  const table = input.table ?? "You";
  // Merge with an existing pending "You" order to keep the list tidy.
  const existingIdx = orders.findIndex(
    (o) => o.table === table && o.status === "pending" && userOrderIds.has(o.id),
  );
  if (existingIdx >= 0) {
    const existing = orders[existingIdx];
    const items = [...existing.items];
    const itemIdx = items.findIndex((it) => it.name === input.name);
    if (itemIdx >= 0) items[itemIdx] = { ...items[itemIdx], qty: items[itemIdx].qty + 1 };
    else items.push({ name: input.name, qty: 1 });
    const updated: Order = { ...existing, items, total: existing.total + input.price };
    orders = [updated, ...orders.filter((_, i) => i !== existingIdx)];
  } else {
    const created: Order = {
      id: nextId(),
      table,
      items: [{ name: input.name, qty: 1 }],
      status: "pending",
      placedAt: nowHM(),
      total: input.price,
    };
    userOrderIds.add(created.id);
    orders = [created, ...orders];
  }
  emit();
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return orders;
}

export function useAllOrders() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useUserOrders() {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return all.filter((o) => userOrderIds.has(o.id));
}

export function isUserOrder(id: string) {
  return userOrderIds.has(id);
}
