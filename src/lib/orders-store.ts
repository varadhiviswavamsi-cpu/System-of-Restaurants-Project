import { orders as seedOrders, type Order, type OrderStatus } from "./mock-data";
import { createSyncedStore } from "./live-sync";

// Shared across every dashboard and every open tab (see live-sync).
const ordersStore = createSyncedStore<Order[]>("orders", [...seedOrders]);
// Track which orders were placed by the current user (so the Orders page can highlight them).
const userIdsStore = createSyncedStore<string[]>("user-order-ids", []);

function nextId(orders: Order[]) {
  // Pick a number strictly greater than any existing "#NNNN" id so we never collide with seeds.
  const maxN = orders.reduce((max, o) => {
    const n = Number(o.id.replace(/^#/, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1050);
  return `#${maxN + 1}`;
}

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function addOrderItem(input: { name: string; price: number; table?: string }) {
  const table = input.table ?? "You";
  const orders = ordersStore.get();
  const userIds = userIdsStore.get();

  // Merge with an existing pending "You" order to keep the list tidy.
  const existingIdx = orders.findIndex(
    (o) => o.table === table && o.status === "pending" && userIds.includes(o.id),
  );
  if (existingIdx >= 0) {
    const existing = orders[existingIdx];
    const items = [...existing.items];
    const itemIdx = items.findIndex((it) => it.name === input.name);
    if (itemIdx >= 0) items[itemIdx] = { ...items[itemIdx], qty: items[itemIdx].qty + 1 };
    else items.push({ name: input.name, qty: 1 });
    const updated: Order = { ...existing, items, total: existing.total + input.price };
    ordersStore.set([updated, ...orders.filter((_, i) => i !== existingIdx)]);
  } else {
    const created: Order = {
      id: nextId(orders),
      table,
      items: [{ name: input.name, qty: 1 }],
      status: "pending",
      placedAt: nowHM(),
      total: input.price,
    };
    userIdsStore.set([...userIds, created.id]);
    ordersStore.set([created, ...orders]);
  }
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  ordersStore.set((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
}

export function useAllOrders() {
  return ordersStore.use();
}

export function useUserOrders() {
  const all = ordersStore.use();
  const ids = userIdsStore.use();
  return all.filter((o) => ids.includes(o.id));
}

export function isUserOrder(id: string) {
  return userIdsStore.get().includes(id);
}
