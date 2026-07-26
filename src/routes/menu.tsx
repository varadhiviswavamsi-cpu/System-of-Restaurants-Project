import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { menuItems } from "@/lib/mock-data";
import { addOrderItem } from "@/lib/orders-store";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu · SoR" },
      { name: "description", content: "Explore the seasonal menu with live availability." },
      { property: "og:title", content: "Menu · SoR" },
      { property: "og:description", content: "Seasonal menu with live availability." },
    ],
  }),
  component: MenuPage,
});

function estimateMinutes(category: string) {
  const map: Record<string, number> = {
    Pizza: 15,
    Pasta: 18,
    Mains: 25,
    Starters: 10,
    Desserts: 8,
  };
  return map[category] ?? 15;
}

function MenuPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [ordered, setOrdered] = useState<Record<string, boolean>>({});
  const [showGreeting, setShowGreeting] = useState(false);
  const cats = useMemo(() => ["All", ...Array.from(new Set(menuItems.map((m) => m.category)))], []);
  const filtered = menuItems.filter(
    (m) =>
      (cat === "All" || m.category === cat) &&
      (q === "" || m.name.toLowerCase().includes(q.toLowerCase())),
  );

  useEffect(() => {
    if (window.sessionStorage.getItem("sor-customer-greeting") === "true") {
      window.sessionStorage.removeItem("sor-customer-greeting");
      setShowGreeting(true);
    }
  }, []);

  const handleOrder = (id: string, name: string, category: string, price: number) => {
    if (ordered[id]) return;
    setOrdered((prev) => ({ ...prev, [id]: true }));
    addOrderItem({ name, price });
    const mins = estimateMinutes(category);
    toast.success(
      `You have ordered ${name} and will be on your table in the estimated time of ${mins} minutes.`,
    );
  };

  return (
    <PublicShell>
      {showGreeting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/10 p-4 backdrop-blur-[2px] animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-6 shadow-warm backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/70 before:to-transparent after:absolute after:inset-0 after:pointer-events-none after:bg-gradient-to-br after:from-primary/10 after:via-background/5 after:to-accent/10">
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary shadow-warm backdrop-blur-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-bold">Welcome to System of Restaurants</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your customer portal is ready. Explore the menu, add dishes to your order, and track everything live.
              </p>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowGreeting(false)}
                  className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95"
                >
                  Enter menu
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold">Tonight's menu</h1>
            <p className="mt-1 text-muted-foreground">Fresh dishes, live availability, seasonal picks.</p>
          </div>
          <SearchInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dishes"
            className="w-full max-w-sm"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                c === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const isOrdered = !!ordered[m.id];
            return (
              <div
                key={m.id}
                className="card-elevated overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-warm"
              >
                <div className="flex h-32 items-center justify-center overflow-hidden bg-brand-gradient text-6xl">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    m.emoji
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-lg font-semibold">{m.name}</div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.category}</div>
                    </div>
                    <div className="font-display text-lg font-bold text-primary">${m.price}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge status={m.available ? "available" : "out"} />
                    <Button
                      size="sm"
                      disabled={!m.available || isOrdered}
                      onClick={() => handleOrder(m.id, m.name, m.category, m.price)}
                      className={
                        isOrdered
                          ? "bg-green-600 text-white shadow-warm hover:bg-green-600 disabled:opacity-100"
                          : "bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95"
                      }
                    >
                      {isOrdered ? (
                        <>
                          <Check className="mr-1 h-4 w-4" strokeWidth={3} />
                          Ordered
                        </>
                      ) : (
                        "Add to order"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PublicShell>
  );
}
