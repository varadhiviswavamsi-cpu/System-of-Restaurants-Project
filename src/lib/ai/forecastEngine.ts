import type { AiContext, DemandForecast, HourForecast } from "./types";

/** Deterministic pseudo-random so a demo looks stable within the same hour. */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const SHAPE: Record<number, number> = {
  11: 0.35, 12: 0.72, 13: 0.86, 14: 0.5, 15: 0.22, 16: 0.2,
  17: 0.38, 18: 0.66, 19: 0.94, 20: 1, 21: 0.78, 22: 0.42,
};

function label(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${hour < 12 ? "AM" : "PM"}`;
}

/** Predicts covers/orders per remaining service hour from historical trend + live signals. */
export function forecastDemand(ctx: AiContext): DemandForecast {
  const rand = seeded(ctx.now.getDate() * 97 + ctx.now.getHours() * 13 + 7);
  const weekday = ctx.now.getDay();
  const weekendLift = weekday === 5 || weekday === 6 ? 1.28 : weekday === 0 ? 1.12 : 1;

  const avgCovers = ctx.salesTrend.reduce((a, d) => a + d.covers, 0) / ctx.salesTrend.length;
  const liveLoad = ctx.orders.length + ctx.queue.length * 1.5 + ctx.reservations.length * 2;

  const hours = Object.keys(SHAPE).map(Number);
  const hourly: HourForecast[] = hours.map((hour) => {
    const base = SHAPE[hour] * (avgCovers / 6) * weekendLift;
    const noise = 0.9 + rand() * 0.2;
    const covers = Math.max(2, Math.round(base * noise + liveLoad * SHAPE[hour] * 0.2));
    return { hour, label: label(hour), covers, orders: Math.round(covers * 0.78), peak: false };
  });

  const peakCovers = Math.max(...hourly.map((h) => h.covers));
  hourly.forEach((h) => (h.peak = h.covers >= peakCovers * 0.92));
  const peaks = hourly.filter((h) => h.peak);
  const peakWindow = peaks.length
    ? `${peaks[0].label} – ${label(peaks[peaks.length - 1].hour + 1)}`
    : "7PM – 9PM";

  const upcoming = hourly.filter((h) => h.hour >= ctx.now.getHours());
  const scope = upcoming.length ? upcoming : hourly;
  const expectedCovers = scope.reduce((a, h) => a + h.covers, 0);
  const expectedOrders = scope.reduce((a, h) => a + h.orders, 0);

  const lastWeekCovers = ctx.salesTrend.at(-2)?.covers ?? avgCovers;
  const trafficDelta = Math.round(((expectedCovers - lastWeekCovers) / lastWeekCovers) * 100);

  const nextHour = hourly.find((h) => h.hour === ctx.now.getHours() + 1);
  const thisHour = hourly.find((h) => h.hour === ctx.now.getHours());
  const spike =
    nextHour && thisHour && nextHour.covers > thisHour.covers * 1.35
      ? `Order spike expected at ${nextHour.label}: volume up ~${Math.round(
          ((nextHour.covers - thisHour.covers) / thisHour.covers) * 100,
        )}% versus the current hour.`
      : ctx.queue.length >= 3
        ? `${ctx.queue.length} parties waiting — expect a short-notice surge within 30 minutes.`
        : null;

  return {
    hourly,
    peakWindow,
    expectedOrders,
    expectedCovers,
    trafficDelta,
    spikeAlert: spike,
    confidence: {
      value: Math.min(96, 78 + Math.round(rand() * 10) + (ctx.reservations.length ? 4 : 0)),
      basis: "Last 30 days of covers, today's reservations and live queue",
    },
  };
}
