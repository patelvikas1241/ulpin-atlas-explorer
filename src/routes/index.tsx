import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Building2, LandPlot, KeyRound, Layers, MapPin, ArrowRight } from "lucide-react";
import { useProperties } from "@/lib/property-store";
import { BASE_STATS, totalUnits, type Property } from "@/lib/ulpin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | 3D ULPIN Property Mapping" },
      {
        name: "description",
        content:
          "Digital property identification and 3D vertical mapping dashboard with parcel, building and unit statistics.",
      },
      { property: "og:title", content: "3D ULPIN Property Mapping Dashboard" },
      {
        property: "og:description",
        content: "Prototype dashboard for parcels, buildings, units and ULPIN generation.",
      },
    ],
  }),
  component: Dashboard,
});

export function StatusBadge({ status }: { status: Property["status"] }) {
  const map = {
    Verified: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Draft: "bg-slate-100 text-slate-600 border-slate-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Box;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const { properties } = useProperties();
  const added = Math.max(0, properties.length - 6);
  const stats = {
    parcels: BASE_STATS.parcels + added,
    buildings: BASE_STATS.buildings + added,
    units: BASE_STATS.units + properties.slice(0, added).reduce((s, p) => s + totalUnits(p), 0),
  };

  return (
    <div>
      <PageHeader
        title="3D ULPIN Property Mapping"
        subtitle="Digital property identification and 3D vertical mapping platform"
        actions={
          <>
            <Button asChild>
              <Link to="/map" search={{ ulpin: undefined }}>
                <Box className="size-4" /> Open 3D Map
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/add">+ Add Property</Link>
            </Button>
          </>
        }
      />

      <div className="space-y-8 p-5 md:p-8">
        {/* Landing / welcome */}
        <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-indigo-700 p-7 text-primary-foreground shadow-sm md:p-10">
          <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
            Hackathon Prototype · Demo Data
          </Badge>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Digitizing Property Mapping in 3D
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/80 md:text-base">
            A prototype platform for unique property identification, vertical building mapping, and
            interactive property visualization.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/map" search={{ ulpin: undefined }}>Explore 3D Map</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/add">Register Property</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={LandPlot}
            label="Total Parcels"
            value={stats.parcels}
            description="Mapped land parcels"
          />
          <StatCard
            icon={Building2}
            label="Buildings"
            value={stats.buildings}
            description="Registered buildings"
          />
          <StatCard
            icon={Layers}
            label="Units"
            value={stats.units}
            description="Mapped property units"
          />
          <StatCard
            icon={KeyRound}
            label="ULPINs Generated"
            value={stats.parcels}
            description="Unique property identifiers"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon: KeyRound, t: "Unique Property Identification", d: "Simulated ULPIN generated for every registered parcel." },
            { icon: MapPin, t: "Geospatial Mapping", d: "Latitude and longitude captured for each land parcel." },
            { icon: Layers, t: "Vertical Mapping", d: "Floor-by-floor and unit-level mapping of buildings." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <Icon className="size-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Properties</h2>
            <Link to="/properties" className="text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="inline size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Plot Number</th>
                  <th className="px-5 py-3 font-medium">ULPIN</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Building</th>
                  <th className="px-5 py-3 font-medium">Floors</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {properties.slice(0, 6).map((p) => (
                  <tr key={p.id} className="border-b border-border/70 last:border-0 hover:bg-muted/60">
                    <td className="px-5 py-3 font-medium text-foreground">{p.plotNumber}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.ulpin}</td>
                    <td className="px-5 py-3">{p.location}</td>
                    <td className="px-5 py-3">{p.buildingType}</td>
                    <td className="px-5 py-3">{p.floors}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to="/properties/$ulpin"
                        params={{ ulpin: p.ulpin }}
                        className="font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
