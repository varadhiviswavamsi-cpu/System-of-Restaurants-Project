import { useSyncExternalStore } from "react";
import {
  reservations as seedReservations,
  tables as seedTables,
  type RestaurantTable,
  type TableStatus,
} from "./mock-data";

export type Reservation = {
  id: string;
  name: string;
  time: string;
  party: number;
  table: string;
  note: string;
  userAdded?: boolean;
};

let reservations: Reservation[] = (seedReservations as Reservation[]).map((r) => ({ ...r }));
let tables: RestaurantTable[] = seedTables.map((t) => ({ ...t }));

const listeners = new Set<() => void>();
function emit() {
  reservations = [...reservations];
  tables = [...tables];
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Pick a table that can fit the party and isn't taken. */
function pickTable(party: number) {
  const free = tables
    .filter((t) => t.status === "available" && t.seats >= party)
    .sort((a, b) => a.seats - b.seats);
  return free[0]?.id;
}

function setTable(id: string, status: TableStatus, guests?: string) {
  tables = tables.map((t) => (t.id === id ? { ...t, status, guests } : t));
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
  reservations = [created, ...reservations];
  if (tableId) {
    setTable(tableId, "reserved", `${input.name} • ${created.time}`);
  }
  emit();
  return created;
}

export function cancelUserReservation(): Reservation | undefined {
  const idx = reservations.findIndex((r) => r.userAdded);
  if (idx === -1) return undefined;
  const removed = reservations[idx];
  reservations = reservations.filter((_, i) => i !== idx);
  if (removed.table !== "—") {
    setTable(removed.table, "available", undefined);
  }
  emit();
  return removed;
}

function getReservations() {
  return reservations;
}
function getTables() {
  return tables;
}

export function useReservations() {
  return useSyncExternalStore(subscribe, getReservations, getReservations);
}

export function useTables() {
  return useSyncExternalStore(subscribe, getTables, getTables);
}
