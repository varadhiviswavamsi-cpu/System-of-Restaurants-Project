import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inventory } from "@/lib/mock-data";
import { AlertTriangle, Check, PackagePlus, SearchX } from "lucide-react";
import { SummaryCard } from "@/components/common/SummaryCard";
import { EmptyState } from "@/components/common/EmptyState";


export const Route = createFileRoute("/dashboard/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory · RestaurantOS" },
      { name: "description", content: "Stock levels, low-item alerts and one-click reorders." },
      { property: "og:title", content: "Inventory · RestaurantOS" },
      { property: "og:description", content: "Stock levels and low-item alerts." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const [q, setQ] = useState("");
  const [actioned, setActioned] = useState<Record<string, "reordered" | "adjusted">>({});
  const low = inventory.filter((i) => i.status !== "in-stock").length;
  const total = inventory.length;
  const filtered = inventory.filter((i) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      i.name.toLowerCase().includes(s) ||
      i.supplier.toLowerCase().includes(s) ||
      i.status.toLowerCase().includes(s)
    );
  });

  const handleAction = (id: string, name: string, kind: "reorder" | "adjust") => {
    if (actioned[id]) return;
    setActioned((prev) => ({ ...prev, [id]: kind === "reorder" ? "reordered" : "adjusted" }));
    if (kind === "reorder") {
      toast.success(`Reorder placed for ${name}`, {
        description: "Supplier notified. Estimated delivery in 24–48 hours.",
        className:
          "backdrop-blur-2xl bg-card/40 border border-white/50 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)]",
      });
    } else {
      toast.success(`${name} stock adjusted`, {
        description: "Inventory count updated successfully.",
        className:
          "backdrop-blur-2xl bg-card/40 border border-white/50 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)]",
      });
    }
  };
  return (
    <DashboardShell
      title="Inventory"
      subtitle="Pantry & supply overview"
      actions={
        <Button size="sm" className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
          <PackagePlus className="mr-1 h-4 w-4" /> Add item
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="SKUs tracked" value={total} icon={PackagePlus} tone="brand" />
        <SummaryCard label="Needs attention" value={low} icon={AlertTriangle} tone="warning" />
        <SummaryCard label="Suppliers" value={new Set(inventory.map((i) => i.supplier)).size} icon={PackagePlus} tone="muted" />
      </div>

      <div className="card-elevated p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-display text-lg font-semibold">Stock levels</div>
          <SearchInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items, suppliers, status"
            className="w-full max-w-xs"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState icon={SearchX} title="No matches" description={`Nothing matches "${q}". Try a different search.`} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.qty} {i.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{i.supplier}</TableCell>
                    <TableCell><StatusBadge status={i.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant={i.status === "in-stock" ? "ghost" : "default"} className={i.status !== "in-stock" ? "bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95" : ""}>
                        {i.status === "in-stock" ? "Adjust" : "Reorder"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

