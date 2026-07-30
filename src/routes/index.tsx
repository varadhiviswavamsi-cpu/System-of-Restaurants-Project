import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChefHat,
  ClipboardList,
  LineChart,
  Loader2,
  Package,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { DEFAULT_ROUTE_FOR_ROLE, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SoR — Smart operations for modern restaurants" },
      {
        name: "description",
        content:
          "SoR is the all-in-one hospitality suite for reservations, live queues, kitchen flow, inventory, and analytics.",
      },
      { property: "og:title", content: "SoR — Smart operations for modern restaurants" },
      { property: "og:description", content: "SoR is the all-in-one hospitality suite for reservations, live queues, kitchen flow, inventory, and analytics." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const features = [
  {
    icon: CalendarClock,
    title: "Reservations & queue",
    body: "Live waitlist, SMS-ready callbacks, and smart table matching.",
    detail:
      "Reduce no-shows with automated reminders, let guests join a digital queue from their phones, and match party sizes to the right tables in real time.",
  },
  {
    icon: ChefHat,
    title: "Kitchen display",
    body: "Ticket flow with prep timers, station routing, and rush alerts.",
    detail:
      "Replace printed tickets with a live KDS. Route orders by station, highlight rush times, and notify servers the moment a dish is ready.",
  },
  {
    icon: Users,
    title: "Front-of-house",
    body: "Floor map, table turns, guest notes and section assignments.",
    detail:
      "Visualize the dining room, track table status, assign sections, and store guest preferences so every visit feels personal.",
  },
  {
    icon: Package,
    title: "Inventory",
    body: "Real-time stock, low-item alerts, and supplier reorder in a click.",
    detail:
      "Count stock as it moves, get low-inventory alerts before 86s happen, and generate purchase orders for suppliers with one click.",
  },
  {
    icon: LineChart,
    title: "Analytics",
    body: "Covers, revenue, average ticket, and menu performance.",
    detail:
      "See daily covers, revenue trends, average ticket size, and top-performing menu items in a clean dashboard built for managers.",
  },
  {
    icon: Sparkles,
    title: "AI-ready",
    body: "Plug in AI for demand forecasts, menu tuning, and guest recall.",
    detail:
      "Connect forecasting models to predict busy periods, optimize menus, and surface guest insights that help you plan smarter service.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const { user, role, profile, loading } = useAuth();

  // The landing page is for signed-out visitors only.
  useEffect(() => {
    if (loading || !user) return;
    if (!role || !profile?.onboarded) navigate({ to: "/onboarding", replace: true });
    else navigate({ to: DEFAULT_ROUTE_FOR_ROLE[role], replace: true });
  }, [loading, user, role, profile?.onboarded, navigate]);

  if (loading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <PublicShell showBack={false}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Hospitality, reimagined
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Run a warmer, <span className="text-brand-gradient">smarter</span> restaurant.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SoR unites reservations, floor, kitchen, inventory, and analytics in one calm,
              beautiful workspace — so your team can focus on the guest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
                <Link to="/auth/signup">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/login">Sign in</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div><span className="font-display text-2xl font-bold text-foreground">1,200+</span> venues</div>
              <div><span className="font-display text-2xl font-bold text-foreground">4.9★</span> team rating</div>
              <div><span className="font-display text-2xl font-bold text-foreground">30%</span> faster turns</div>
            </div>
          </div>

          {/* Visual dashboard mock */}
          <div className="relative">
            <div className="card-elevated relative overflow-hidden p-5 shadow-warm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Tonight</div>
                  <div className="font-display text-2xl font-bold">Service at a glance</div>
                </div>
                <div className="rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success ring-1 ring-success/30">
                  On pace
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { k: "Covers", v: "202" },
                  { k: "Revenue", v: "$2,890" },
                  { k: "Avg wait", v: "12m" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-accent/60 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</div>
                    <div className="font-display text-xl font-bold">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-6 gap-2">
                {[70, 55, 82, 40, 90, 68].map((h, i) => (
                  <div key={i} className="flex h-24 items-end">
                    <div
                      className="w-full rounded-t-md bg-brand-gradient opacity-90"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { t: "#1043 · T-11", s: "ready", tone: "bg-success/20 text-success" },
                  { t: "#1044 · T-02", s: "pending", tone: "bg-warning/25 text-warning-foreground" },
                  { t: "#1042 · T-04", s: "preparing", tone: "bg-primary/15 text-primary" },
                ].map((o) => (
                  <div key={o.t} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                    <span className="font-medium">{o.t}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${o.tone}`}>
                      {o.s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-brand-gradient p-4 text-primary-foreground shadow-warm sm:block">
              <UtensilsCrossed className="h-6 w-6" />
              <div className="mt-1 text-xs opacity-90">Kitchen synced</div>
              <div className="font-display text-lg font-bold">18 tickets live</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Everything your team needs. Nothing they don't.</h2>
          <p className="mt-3 text-muted-foreground">
            Built around real hospitality workflows — from the host stand to the pass to the back office.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Dialog key={f.title}>
              <HoverCard openDelay={150} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <DialogTrigger asChild>
                    <div className="card-elevated cursor-pointer p-6 transition-all hover:-translate-y-0.5 hover:shadow-warm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-warm">
                        <f.icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 font-display text-lg font-semibold">{f.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                    </div>
                  </DialogTrigger>
                </HoverCardTrigger>
                <HoverCardContent
                  side="top"
                  align="start"
                  className="w-72 border border-white/20 bg-card/35 text-card-foreground shadow-warm backdrop-blur-2xl dark:border-white/10 dark:bg-card/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <span className="font-display text-sm font-semibold">{f.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.detail}</p>
                </HoverCardContent>
              </HoverCard>
              <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-warm">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <DialogTitle className="font-display text-xl">{f.title}</DialogTitle>
                  </div>
                  <DialogDescription className="text-muted-foreground">{f.detail}</DialogDescription>
                </DialogHeader>
                <div className="mt-2">
                  <Button asChild className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
                    <Link to="/auth/signup">Get started with {f.title}</Link>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24">
        <div className="card-elevated relative overflow-hidden bg-brand-gradient p-10 text-primary-foreground shadow-warm md:p-14">
          <div className="max-w-2xl">
            <h3 className="font-display text-3xl font-bold md:text-4xl">Ready for a calmer service?</h3>
            <p className="mt-2 opacity-90">
              Spin up a demo restaurant in seconds. Bring the team when you're ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth/signup">Create account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20" asChild>
                <Link to="/auth/login">
                  <ClipboardList className="mr-2 h-4 w-4" /> Sign in
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
