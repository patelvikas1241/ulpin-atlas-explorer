import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProperties } from "@/lib/property-store";
import { totalUnits } from "@/lib/ulpin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/properties/")({
  head: () => ({
    meta: [
      { title: "Properties | 3D ULPIN" },
      {
        name: "description",
        content: "Browse all registered land parcels, buildings, floors and units in the prototype registry.",
      },
      { property: "og:title", content: "Registered Properties" },
      { property: "og:description", content: "All mapped parcels with ULPIN, floors and status." },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const { properties } = useProperties();
  const [q, setQ] = React.useState("");
  const filtered = properties.filter((p) =>
    `${p.plotNumber} ${p.ulpin} ${p.buildingType} ${p.landType}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle={`${properties.length} registered parcels in the prototype registry`}
        actions={
          <Button asChild>
            <Link to="/add">+ Add Property</Link>
          </Button>
        }
      />
      <div className="space-y-4 p-5 md:p-8">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by plot number, ULPIN or type"
          className="max-w-md"
        />

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No property found for this ULPIN or plot number.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to="/properties/$ulpin"
                params={{ ulpin: p.ulpin }}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{p.plotNumber}</p>
                    <p className="font-mono text-xs text-primary">{p.ulpin}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{p.buildingType}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Area</dt>
                    <dd className="font-medium">{p.plotArea} sq.ft</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Floors</dt>
                    <dd className="font-medium">{p.floors}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Units</dt>
                    <dd className="font-medium">{totalUnits(p)}</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
