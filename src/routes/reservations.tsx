import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addReservation,
  cancelUserReservation,
  useReservations,
  type Reservation,
} from "@/lib/reservations-store";

import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations · SoR" },
      { name: "description", content: "Book a table with instant confirmation." },
      { property: "og:title", content: "Reservations · SoR" },
      { property: "og:description", content: "Book a table with instant confirmation." },
      { property: "og:url", content: "/reservations" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/reservations" }],
  }),
  component: ReservationsPage,
});

function ReservationsPage() {
  const list = useReservations();
  const [hasMine, setHasMine] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim() || "Guest";
    const time = (form.elements.namedItem("time") as HTMLInputElement)?.value || "";
    const date = (form.elements.namedItem("date") as HTMLInputElement)?.value || "";
    const partyRaw = (form.elements.namedItem("party") as HTMLInputElement)?.value || "2";
    const note = (form.elements.namedItem("note") as HTMLInputElement)?.value || "";

    const created = addReservation({
      name,
      time,
      party: Number(partyRaw) || 2,
      note,
    });
    setHasMine(true);
    toast.success("Reservation requested...", {
      description: `Thanks ${name} — table ${created.table} is held for ${date}${time ? ` at ${time}` : ""}.`,
    });
    form.reset();
  };

  const handleCancelClick = () => {
    if (!hasMine) {
      toast.error("You didn't reserve...", {
        description: "There's no active reservation to cancel. Please confirm a reservation first.",
      });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmCancellation = () => {
    cancelUserReservation();
    setHasMine(false);
    toast.success("Reservation cancelled", {
      description: "Your reservation has been cancelled. We hope to see you soon.",
    });
  };


  return (
    <PublicShell>
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="card-elevated p-6 md:p-8">
          <h1 className="font-display text-3xl font-bold">Reserve a table</h1>
          <p className="mt-1 text-muted-foreground">Instant confirmation. Free to cancel up to 2h ahead.</p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required placeholder="+1 555 555 5555" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" type="time" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="party">Party size</Label>
              <Input id="party" name="party" type="number" min={1} defaultValue={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Occasion / notes</Label>
              <Input id="note" name="note" placeholder="Birthday, allergies..." />
            </div>
            <div className="sm:col-span-2 space-y-3">
              <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
                Confirm reservation
              </Button>

              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCancelClick();
                    }}
                    className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-warm"
                  >
                    Request reservation cancellation
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-white/40 bg-card/35 backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Are you sure you want to cancel the reservation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will notify the host stand and release your table.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3 sm:gap-3">
                    <AlertDialogCancel
                      onClick={() =>
                        toast("Cancellation dismissed", {
                          description: "Your reservation is still active.",
                        })
                      }
                      className="btn-jelly rounded-full border-white/60 hover:shadow-[0_0_22px_-2px_rgba(255,255,255,0.75)]"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmCancellation}
                      className="btn-jelly rounded-full border-white/60 bg-transparent text-foreground hover:shadow-[0_0_22px_-2px_rgba(255,255,255,0.75)]"
                    >
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">Upcoming reservations</h2>
          <p className="text-sm text-muted-foreground">Live from the host stand.</p>
          <div className="mt-4 space-y-3">
            {list.map((r) => (
              <div key={r.id} className="card-elevated flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {r.name}
                      {r.userAdded && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          You
                        </span>
                      )}
                    </div>
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
