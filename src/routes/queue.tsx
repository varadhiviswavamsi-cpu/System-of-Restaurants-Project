import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queueParties } from "@/lib/mock-data";
import { Clock, Users } from "lucide-react";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Waiting queue · RestaurantOS" },
      { name: "description", content: "Join the waitlist and get notified when your table is ready." },
      { property: "og:title", content: "Waiting queue · RestaurantOS" },
      { property: "og:description", content: "Join the waitlist. We'll text when your table is ready." },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const totalWait = queueParties.at(-1)?.wait ?? 0;
  return (
    <PublicShell>
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="card-elevated p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-warm">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Join the waitlist</h1>
              <p className="text-sm text-muted-foreground">Estimated wait: ~{totalWait} min</p>
            </div>
          </div>
          <form
            className="mt-6 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert("You're on the list. We'll text you when it's ready!");
            }}
          >
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required placeholder="For SMS updates" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size">Party size</Label>
              <Input id="size" type="number" defaultValue={2} min={1} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
                Add me to the queue
              </Button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold">Live queue</h2>
          <p className="text-sm text-muted-foreground">Real-time positions from the host.</p>
          <div className="mt-4 space-y-3">
            {queueParties.map((p) => (
              <div key={p.id} className="card-elevated flex items-center gap-4 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-primary-foreground">
                  #{p.position}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.name} party</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {p.size}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> ~{p.wait} min</span>
                  </div>
                </div>
                <div className="text-xs font-medium text-primary">Waiting</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
