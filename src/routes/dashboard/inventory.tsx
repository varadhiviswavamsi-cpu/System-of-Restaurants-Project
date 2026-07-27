import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { inventory as initialInventory, type InventoryItem, type StockStatus } from "@/lib/mock-data";
import { AlertTriangle, Check, PackagePlus, SearchX } from "lucide-react";
import { SummaryCard } from "@/components/common/SummaryCard";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export const Route = createFileRoute("/dashboard/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory · SoR" },
      { name: "description", content: "Stock levels, low-item alerts and one-click reorders." },
      { property: "og:title", content: "Inventory · SoR" },
      { property: "og:description", content: "Stock levels and low-item alerts." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InventoryPage,
});

function AddItemDialog({ onAdd }: { onAdd: (item: InventoryItem) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState<StockStatus>("in-stock");

  const reset = () => {
    setName(""); setQty(""); setUnit(""); setSupplier(""); setStatus("in-stock");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !supplier.trim() || !qty) {
      toast.error("Please fill all fields");
      return;
    }
    const item: InventoryItem = {
      id: `i${Date.now()}`,
      name: name.trim(),
      qty: Number(qty),
      unit: unit.trim() || "units",
      status,
      supplier: supplier.trim(),
    };
    onAdd(item);
    toast.success(`${item.name} added to stock`, {
      description: `${item.qty} ${item.unit} · ${item.supplier}`,
      className:
        "backdrop-blur-2xl bg-card/40 border border-white/50 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)]",
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
          <PackagePlus className="mr-1 h-4 w-4" /> Add item
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/40 bg-white/15 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.6)] sm:rounded-3xl">
        <div className="pointer-events-none absolute inset-x-6 top-1 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add inventory item</DialogTitle>
          <DialogDescription>Track a new SKU in your pantry.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Item name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Extra virgin olive oil" className="bg-white/30 backdrop-blur-md border-white/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min="0" step="any" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="12" className="bg-white/30 backdrop-blur-md border-white/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, cans, pcs" className="bg-white/30 backdrop-blur-md border-white/50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplier">Supplier</Label>
            <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Bella Foods" className="bg-white/30 backdrop-blur-md border-white/50" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StockStatus)}>
              <SelectTrigger className="bg-white/30 backdrop-blur-md border-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-stock">In stock</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="out">Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-brand-gradient text-primary-foreground shadow-warm transition-all hover:opacity-95 hover:shadow-[0_0_28px_-4px_rgba(255,255,255,0.9)] active:shadow-[0_0_36px_-4px_rgba(255,255,255,1)]"
            >
              Enter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InventoryPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [actioned, setActioned] = useState<Record<string, "reordered" | "adjusted">>({});
  const low = items.filter((i) => i.status !== "in-stock").length;
  const total = items.length;
  const filtered = items.filter((i) => {
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
      actions={<AddItemDialog onAdd={(it) => setItems((prev) => [it, ...prev])} />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="SKUs tracked" value={total} icon={PackagePlus} tone="brand" />
        <SummaryCard label="Needs attention" value={low} icon={AlertTriangle} tone="warning" />
        <SummaryCard label="Suppliers" value={new Set(items.map((i) => i.supplier)).size} icon={PackagePlus} tone="muted" />
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
                      {(() => {
                        const done = actioned[i.id];
                        const kind: "reorder" | "adjust" = i.status === "in-stock" ? "adjust" : "reorder";
                        const label = done
                          ? done === "reordered"
                            ? "Reordered"
                            : "Adjusted"
                          : kind === "reorder"
                            ? "Reorder"
                            : "Adjust";
                        return (
                          <Button
                            size="sm"
                            disabled={!!done}
                            onClick={() => handleAction(i.id, i.name, kind)}
                            className={
                              done
                                ? "bg-green-600 text-white shadow-warm hover:bg-green-600 disabled:opacity-100"
                                : kind === "reorder"
                                  ? "bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95"
                                  : ""
                            }
                            variant={done || kind === "reorder" ? "default" : "ghost"}
                          >
                            {done ? (
                              <>
                                <Check className="mr-1 h-4 w-4" strokeWidth={3} />
                                {label}
                              </>
                            ) : (
                              label
                            )}
                          </Button>
                        );
                      })()}
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
