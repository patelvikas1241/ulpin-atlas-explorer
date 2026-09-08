import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | 3D ULPIN" },
      { name: "description", content: "Prototype settings for the 3D ULPIN property mapping demo." },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Demo settings for the ULPIN mapping prototype." },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="Settings" subtitle="Prototype preferences (demo only)." />
      <div className="p-5 md:p-8">
        <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          {[
            ["Jurisdiction code", "IN-DL-DEL"],
            ["Measurement unit", "sq.ft / metres"],
            ["Data source", "Local demo data (browser storage)"],
            ["Environment", "Hackathon prototype"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/60 py-2 last:border-0 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});
