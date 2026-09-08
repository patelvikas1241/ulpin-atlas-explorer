import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, SearchX } from "lucide-react";
import { useProperties } from "@/lib/property-store";
import { totalUnits, type Property } from "@/lib/ulpin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "ULPIN Search | 3D ULPIN" },
      {
        name: "description",
        content: "Search registered properties by ULPIN or plot number and open them in the 3D map.",
      },
      { property: "og:title", content: "ULPIN Search" },
      { property: "og:description", content: "Find a parcel by its simulated ULPIN or plot number." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { properties, getByUlpin } = useProperties();
  const [q, setQ] = React.useState("");
  const [result, setResult] = React.useState<Property | null | undefined>(undefined);

  const suggestions = q.trim()
    ? properties
        .filter((p) => `${p.ulpin} ${p.plotNumber}`.toLowerCase().includes(q.trim().toLowerCase()))
        .slice(0, 5)
    : [];

  function run(value = q) {
    setResult(getByUlpin(value) ?? null);
  }

  return (
    <div>
      <PageHeader title="ULPIN Search" subtitle="Look up any registered parcel by its identifier." />
      <div className="space-y-5 p-5 md:p-8">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              run();
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Enter ULPIN or Plot Number"
              className="sm:flex-1"
            />
            <Button type="submit">
              <SearchIcon className="size-4" /> Search
            </Button>
          </form>

          {suggestions.length > 0 && result === undefined && (
            <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQ(s.ulpin);
                      run(s.ulpin);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span className="font-mono text-xs">{s.ulpin}</span>
                    <span className="text-muted-foreground">{s.plotNumber}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Example: <span className="font-mono">IN-DL-DEL-92837451</span>
          </p>
        </div>

        {result === undefined && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Start typing a ULPIN or plot number to search the prototype registry.
          </p>
        )}

        {result === null && (
          <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
            <SearchX className="mx-auto size-8 text-destructive" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No property found for this ULPIN or plot number.
            </p>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{result.plotNumber}</p>
                <p className="font-mono text-xs text-primary">{result.ulpin}</p>
              </div>
              <StatusBadge status={result.status} />
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Location", `${result.location} (${result.latitude}, ${result.longitude})`],
                ["Building Type", result.buildingType],
                ["Floors", result.floors],
                ["Units", totalUnits(result)],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/map" search={{ ulpin: result.ulpin }}>
                  Open in 3D Map
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/properties/$ulpin" params={{ ulpin: result.ulpin }}>
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
