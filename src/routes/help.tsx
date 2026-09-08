import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help | 3D ULPIN" },
      { name: "description", content: "How to run the 2-3 minute demo flow of the 3D ULPIN prototype." },
      { property: "og:title", content: "Help & Demo Flow" },
      { property: "og:description", content: "Step-by-step walkthrough of the ULPIN prototype demo." },
    ],
  }),
  component: Help,
});

const steps = [
  "Open the Dashboard and review parcels, buildings and units.",
  "Go to Add Property and enter land details (plot, latitude, longitude, area).",
  "Enter building details (height, floors, units per floor).",
  "Click Generate ULPIN and review the verification checks.",
  "Click View 3D Property to jump into the 3D map.",
  "Rotate, zoom and select a floor to see its units.",
  "Use ULPIN Search to look the property up again.",
];

function Help() {
  return (
    <div>
      <PageHeader title="Help" subtitle="Demo walkthrough for judges and reviewers." />
      <div className="space-y-4 p-5 md:p-8">
        <ol className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-foreground">{s}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          This is a hackathon prototype using demo data and simulated ULPINs. There is no government
          database integration.{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
