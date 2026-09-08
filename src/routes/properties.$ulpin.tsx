import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProperties } from "@/lib/property-store";
import { totalUnits } from "@/lib/ulpin";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { ClientScene } from "@/components/ClientScene";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/properties/$ulpin")({
  head: () => ({
    meta: [
      { title: "Property Details | 3D ULPIN" },
      {
        name: "description",
        content:
          "Complete property profile: identification, location, land information, building information and 3D model.",
      },
      { property: "og:title", content: "Property Details" },
      { property: "og:description", content: "Full parcel profile with an interactive 3D building model." },
    ],
  }),
  component: PropertyDetails,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function PropertyDetails() {
  const { ulpin } = Route.useParams();
  const { properties } = useProperties();
  const [floor, setFloor] = React.useState<number | null>(null);
  const p = properties.find((x) => x.ulpin === ulpin || x.plotNumber === ulpin);

  if (!p) {
    return (
      <div>
        <PageHeader title="Property Details" />
        <div className="p-8">
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No property found for this ULPIN or plot number.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Property Details"
        subtitle={`${p.plotNumber} · ${p.ulpin}`}
        actions={
          <Button asChild>
            <Link to="/map" search={{ ulpin: p.ulpin }}>
              Open Full 3D View
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 p-5 md:p-8 lg:grid-cols-2">
        <Card title="Identification">
          <Row label="ULPIN" value={<span className="font-mono text-xs">{p.ulpin}</span>} />
          <Row label="Plot Number" value={p.plotNumber} />
          <Row label="Registration Status" value={<StatusBadge status={p.status} />} />
        </Card>
        <Card title="Location">
          <Row label="Latitude" value={p.latitude} />
          <Row label="Longitude" value={p.longitude} />
          <Row label="Address" value={p.address} />
        </Card>
        <Card title="Land Information">
          <Row label="Plot Area" value={`${p.plotArea} sq.ft`} />
          <Row label="Land Type" value={p.landType} />
        </Card>
        <Card title="Building Information">
          <Row label="Building Type" value={p.buildingType} />
          <Row label="Height" value={`${p.height} m`} />
          <Row label="Number of Floors" value={p.floors} />
          <Row label="Units per Floor" value={p.unitsPerFloor} />
          <Row label="Total Units" value={totalUnits(p)} />
        </Card>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">3D Model</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: p.floors })
                .map((_, i) => p.floors - i)
                .map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFloor(floor === f ? null : f)}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                      floor === f
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    Floor {f}
                  </button>
                ))}
            </div>
          </div>
          <ClientScene
            className="h-[360px] w-full overflow-hidden rounded-lg border border-border"
            properties={[p]}
            single
            selectedId={p.id}
            activeFloor={floor}
            onFloor={(f) => setFloor(f)}
          />
        </section>
      </div>
    </div>
  );
}
