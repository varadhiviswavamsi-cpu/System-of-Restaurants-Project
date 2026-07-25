import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { menuItems } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu · RestaurantOS" },
      { name: "description", content: "Explore the seasonal menu with live availability." },
      { property: "og:title", content: "Menu · RestaurantOS" },
      { property: "og:description", content: "Seasonal menu with live availability." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const cats = useMemo(() => ["All", ...Array.from(new Set(menuItems.map((m) => m.category)))], []);
  const filtered = menuItems.filter(
    (m) =>
      (cat === "All" || m.category === cat) &&
      (q === "" || m.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold">Tonight's menu</h1>
            <p className="mt-1 text-muted-foreground">Fresh dishes, live availability, seasonal picks.</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" className="pl-9" />
          </div>
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
          {filtered.map((m) => (
            <div key={m.id} className="card-elevated overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-brand-gradient text-6xl">{m.emoji}</div>
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
                  <Button size="sm" disabled={!m.available} className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
                    Add to order
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
