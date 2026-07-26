import {
  reservations as seedReservations,
  tables as seedTables,
  type RestaurantTable,
  type TableStatus,
} from "./mock-data";
import { createSyncedStore } from "./live-sync";

export type Reservation = {
  id: string;
  name: string;
  time: string;
  party: number;
  table: string;
  note: string;
  userAdded?: boolean;
};

const reservationsStore = createSyncedStore<Reservation[]>(
  "reservations",
  (seedReservations as Reservation[]).map((r) => ({ ...r })),
);
const tablesStore = createSyncedStore<RestaurantTable[]>(
  "tables",
  seedTables.map((t) => ({ ...t })),
);

/** Pick a table that can fit the party and isn't taken. */
function pickTable(party: number) {
  const free = tablesStore
    .get()
    .filter((t) => t.status === "available" && t.seats >= party)
    .sort((a, b) => a.seats - b.seats);
  return free[0]?.id;
}

function setTable(id: string, status: TableStatus, guests?: string) {
  tablesStore.set((prev) => prev.map((t) => (t.id === id ? { ...t, status, guests } : t)));
}

/** Change a table's status from the floor map, keeping any guest/reservation label. */
export function setTableStatus(id: string, status: TableStatus) {
  tablesStore.set((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
}

export function addReservation(input: {
  name: string;
  time: string;
  party: number;
  note: string;
}): Reservation {
  const tableId = pickTable(input.party);
  const created: Reservation = {
    id: `r-${Date.now()}`,
    name: input.name,
    time: input.time || "—",
    party: input.party,
    table: tableId ?? "—",
    note: input.note,
    userAdded: true,
  };
  reservationsStore.set((prev) => [created, ...prev]);
  if (tableId) {
    setTable(tableId, "reserved", `${input.name} • ${created.time}`);
  }
  return created;
}

export function cancelUserReservation(): Reservation | undefined {
  const current = reservationsStore.get();
  const idx = current.findIndex((r) => r.userAdded);
  if (idx === -1) return undefined;
  const removed = current[idx];
  reservationsStore.set(current.filter((_, i) => i !== idx));
  if (removed.table !== "—") {
    setTable(removed.table, "available", undefined);
  }
  return removed;
}

export function useReservations() {
  return reservationsStore.use();
}

export function useTables() {
  return tablesStore.use();
}
