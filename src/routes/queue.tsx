import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queueParties as seedQueue } from "@/lib/mock-data";
import { Clock, Users } from "lucide-react";
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

type QueueParty = {
  id: string;
  name: string;
  size: number;
  wait: number;
  position: number;
  userAdded?: boolean;
};

function QueuePage() {
  const [list, setList] = useState<QueueParty[]>(seedQueue as QueueParty[]);
  const [hasMine, setHasMine] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalWait = list.at(-1)?.wait ?? 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim() || "Guest";
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value || "";
    const sizeRaw = (form.elements.namedItem("size") as HTMLInputElement)?.value || "2";
    const size = Number(sizeRaw) || 2;

    setList((prev) => {
      const nextPosition = prev.length + 1;
      const lastWait = prev.at(-1)?.wait ?? 0;
      const newParty: QueueParty = {
        id: `q-${Date.now()}`,
        name,
        size,
        wait: lastWait + 10,
        position: nextPosition,
        userAdded: true,
      };
      return [...prev, newParty];
    });
    setHasMine(true);
    toast.success("You're on the list!", {
      description: `Thanks ${name} — party of ${size}. We'll text ${phone || "you"} when your table is ready.`,
    });
    form.reset();
  };

  const handleCancelClick = () => {
    if (!hasMine) {
      toast.error("You're not in the queue...", {
        description: "There's no active queue entry to cancel. Please join the queue first.",
      });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmCancellation = () => {
    setList((prev) => {
      const filtered = prev.filter((p) => !p.userAdded);
      return filtered.map((p, i) => ({ ...p, position: i + 1 }));
    });
    setHasMine(false);
    toast.success("Queue cancelled", {
      description: "You've been removed from the waitlist. We hope to see you soon.",
    });
  };

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
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required placeholder="For SMS updates" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size">Party size</Label>
              <Input id="size" name="size" type="number" defaultValue={2} min={1} />
            </div>
            <div className="sm:col-span-2 space-y-3">
              <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
                Add me to the queue
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
                    Cancel queue
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-white/40 bg-card/35 backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Are you sure you want to cancel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove you from the waitlist and release your spot.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3 sm:gap-3">
                    <AlertDialogCancel
                      onClick={() =>
                        toast("Cancellation dismissed", {
                          description: "You're still in the queue.",
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
          <h2 className="font-display text-xl font-semibold">Live queue</h2>
          <p className="text-sm text-muted-foreground">Real-time positions from the host.</p>
          <div className="mt-4 space-y-3">
            {list.map((p) => (
              <div key={p.id} className="card-elevated flex items-center gap-4 p-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-primary-foreground">
                  #{p.position}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {p.name} party
                    {p.userAdded && (
                      <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        You
                      </span>
                    )}
                  </div>
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
