import * as React from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Layers, MousePointerClick } from "lucide-react";
import { useProperties } from "@/lib/property-store";
import { totalUnits } from "@/lib/ulpin";
import { Bhumi3DMapWrapper } from "@/components/Bhumi3DMapWrapper";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/map")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    ulpin: typeof s['ulpin'] === "string" ? (s['ulpin'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "3D Property Map | 3D ULPIN" },
      {
        name: "description",
        content:
          "Interactive 3D map of mapped land parcels and vertical buildings with floor-level selection.",
      },
      { property: "og:title", content: "3D Property Map" },
      {
        property: "og:description",
        content: "Rotate, zoom and select buildings to explore floors and units in 3D.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { properties } = useProperties();
  const search = useSearch({ from: "/map" });
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [floor, setFloor] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (search.ulpin) {
      const match = properties.find((p) => p.ulpin === search.ulpin);
      if (match) setSelectedId(match.id);
    }
  }, [search.ulpin, properties]);

  const selected = properties.find((p) => p.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader
        title="3D Property Map"
        subtitle="Rotate, zoom and pan the scene. Click a building to inspect its floors and units."
      />
      <div className="grid gap-4 p-5 md:p-8 lg:grid-cols-[1fr_340px]">
        <div className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:h-[74vh]">
          <Bhumi3DMapWrapper
            className="h-full w-full"
            properties={properties}
            selectedId={selectedId}
            activeFloor={floor}
            onSelect={(id) => {
              setSelectedId(id || null);
              setFloor(null);
            }}
            onFloor={(f) => setFloor(f)}
          />
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow">
            <MousePointerClick className="mr-1 inline size-3.5" />
            Drag to rotate · Scroll to zoom · Right-drag to pan
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-5 shadow-sm">
          {!selected ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center">
              <Layers className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">No property selected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click any building in the 3D scene to view its property information.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Property Information</h2>
                <p className="mt-1 font-mono text-xs text-primary">{selected.ulpin}</p>
              </div>
              <dl className="space-y-2 text-sm">
                {[
                  ["Plot Number", selected.plotNumber],
                  ["Latitude", selected.latitude],
                  ["Longitude", selected.longitude],
                  ["Plot Area", `${selected.plotArea} sq.ft`],
                  ["Building Height", `${selected.height} m`],
                  ["Floors", selected.floors],
                  ["Units", totalUnits(selected)],
                  ["Property Type", selected.buildingType],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between gap-3 border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-foreground">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between pt-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={selected.status} />
                  </dd>
                </div>
              </dl>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Floor selector</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: selected.floors })
                    .map((_, i) => selected.floors - i)
                    .map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFloor(floor === f ? null : f)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          floor === f
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        Floor {f}
                      </button>
                    ))}
                </div>
                {floor && (
                  <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Floor {floor}</span> ·{" "}
                    {selected.unitsPerFloor} unit(s):{" "}
                    {Array.from({ length: selected.unitsPerFloor })
                      .map((_, i) => `${floor}0${i + 1}`)
                      .join(", ")}
                  </p>
                )}
              </div>

              <Button asChild className="w-full">
                <Link to="/properties/$ulpin" params={{ ulpin: selected.ulpin }}>
                  View Full Details
                </Link>
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
