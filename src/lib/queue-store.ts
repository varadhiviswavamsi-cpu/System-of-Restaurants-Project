import { queueParties as seedQueue } from "./mock-data";
import { createSyncedStore } from "./live-sync";

export type QueueParty = {
  id: string;
  name: string;
  size: number;
  wait: number;
  position: number;
  userAdded?: boolean;
};

const queueStore = createSyncedStore<QueueParty[]>(
  "queue",
  (seedQueue as QueueParty[]).map((p) => ({ ...p })),
);

export function useQueue() {
  return queueStore.use();
}

export function hasUserInQueue() {
  return queueStore.get().some((p) => p.userAdded);
}

export function joinQueue(input: { name: string; size: number }): QueueParty {
  const prev = queueStore.get();
  const party: QueueParty = {
    id: `q-${Date.now()}`,
    name: input.name,
    size: input.size,
    wait: (prev.at(-1)?.wait ?? 0) + 10,
    position: prev.length + 1,
    userAdded: true,
  };
  queueStore.set([...prev, party]);
  return party;
}

export function leaveQueue() {
  queueStore.set((prev) =>
    prev.filter((p) => !p.userAdded).map((p, i) => ({ ...p, position: i + 1 })),
  );
}
