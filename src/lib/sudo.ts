import { useEffect, useState } from "react";

const KEY = "restaurantos:sudo";

export function enterSudo() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {}
  }
}

export function exitSudo() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
    } catch {}
  }
}

export function isSudo(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Hook returning `null` until hydrated, then `true`/`false`. */
export function useSudo(): boolean | null {
  const [state, setState] = useState<boolean | null>(null);
  useEffect(() => {
    setState(isSudo());
  }, []);
  return state;
}
