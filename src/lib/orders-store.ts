import { useSyncExternalStore } from "react";
import type { Order } from "./mock-data";

let orders: Order[] = [];
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
  const existingIdx = orders.findIndex((o) => o.table === table && o.status === "pending");
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
    orders = [created, ...orders];
  }
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return orders;
}

export function useUserOrders() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
