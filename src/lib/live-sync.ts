import { useSyncExternalStore } from "react";

/**
 * Tiny cross-dashboard sync layer.
 *
 * Every store created here:
 *  - keeps an in-memory snapshot (instant updates inside the current tab)
 *  - persists to localStorage (state survives reloads / route changes)
 *  - broadcasts changes over a BroadcastChannel + `storage` events so every
 *    other open dashboard (menu, kitchen, staff, orders, queue, manager…)
 *    reacts in real time.
 *
 * Hydration is deferred to a microtask after mount so SSR markup and the first
 * client render always match.
 */

const CHANNEL_NAME = "sor-live-sync";
const PREFIX = "sor:";

type Message = { key: string; value: unknown; origin: string };

const TAB_ID = Math.random().toString(36).slice(2);

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

const remoteHandlers = new Map<string, (value: unknown) => void>();

let wired = false;
function wireGlobalListeners() {
  if (wired || typeof window === "undefined") return;
  wired = true;

  getChannel()?.addEventListener("message", (e: MessageEvent<Message>) => {
    const msg = e.data;
    if (!msg || msg.origin === TAB_ID) return;
    remoteHandlers.get(msg.key)?.(msg.value);
  });

  // Fallback for browsers/contexts without BroadcastChannel support.
  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith(PREFIX) || e.newValue == null) return;
    const key = e.key.slice(PREFIX.length);
    try {
      remoteHandlers.get(key)?.(JSON.parse(e.newValue));
    } catch {
      /* ignore malformed payloads */
    }
  });
}

export type SyncedStore<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  use: () => T;
};

export function createSyncedStore<T>(key: string, initial: T): SyncedStore<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  const storageKey = `${PREFIX}${key}`;

  const applyRemote = (value: unknown) => {
    state = value as T;
    emit();
  };

  let hydrated = typeof window === "undefined";
  function hydrateOnce() {
    if (hydrated) return;
    hydrated = true;
    wireGlobalListeners();
    remoteHandlers.set(key, applyRemote);
    // Defer to a microtask so the first client render matches SSR output.
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw != null) applyRemote(JSON.parse(raw));
      } catch {
        /* ignore unavailable / corrupt storage */
      }
    });
  }

  function set(next: T | ((prev: T) => T)) {
    state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
    emit();
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* storage may be full or blocked */
    }
    getChannel()?.postMessage({ key, value: state, origin: TAB_ID } satisfies Message);
  }

  function subscribe(listener: () => void) {
    hydrateOnce();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  const get = () => state;
  const getServer = () => initial;

  return {
    get,
    set,
    subscribe,
    use: () => useSyncExternalStore(subscribe, get, getServer),
  };
}
