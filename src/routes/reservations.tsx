import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reservations } from "@/lib/mock-data";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations · RestaurantOS" },
      { name: "description", content: "Book a table with instant confirmation." },
      { property: "og:title", content: "Reservations · RestaurantOS" },
      { property: "og:description", content: "Book a table with instant confirmation." },
    ],
  }),
  component: ReservationsPage,
});

function ReservationsPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="card-elevated p-6 md:p-8">
          <h1 className="font-display text-3xl font-bold">Reserve a table</h1>
          <p className="mt-1 text-muted-foreground">Instant confirmation. Free to cancel up to 2h ahead.</p>
          <form
            className="mt-6 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Reservation requested — you'll get a confirmation shortly.");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required placeholder="+1 555 555 5555" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="party">Party size</Label>
              <Input id="party" type="number" min={1} defaultValue={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Occasion / notes</Label>
              <Input id="note" placeholder="Birthday, allergies..." />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
                Confirm reservation
              </Button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">Upcoming reservations</h2>
          <p className="text-sm text-muted-foreground">Live from the host stand.</p>
          <div className="mt-4 space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="card-elevated flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Party of {r.party} · Table {r.table}
                      {r.note && ` · ${r.note}`}
                    </div>
                  </div>
                </div>
                <div className="font-display text-lg font-bold text-primary">{r.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
