import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useProperties } from "@/lib/property-store";
import { BASE_STATS, totalUnits } from "@/lib/ulpin";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | 3D ULPIN" },
      {
        name: "description",
        content: "Prototype analytics on parcels, buildings, units, property types and floor distribution.",
      },
      { property: "og:title", content: "Property Analytics" },
      { property: "og:description", content: "Charts for property types and buildings by floor count." },
    ],
  }),
  component: Analytics,
});

const COLORS = ["#2f5fd0", "#0f9d8f", "#f0a532", "#8b5cf6", "#64748b"];

function Analytics() {
  const { properties } = useProperties();

  const byType = Object.entries(
    properties.reduce<Record<string, number>>((acc, p) => {
      acc[p.landType] = (acc[p.landType] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const buckets = { "1–2 floors": 0, "3–4 floors": 0, "5–6 floors": 0, "7+ floors": 0 };
  properties.forEach((p) => {
    if (p.floors <= 2) buckets["1–2 floors"]++;
    else if (p.floors <= 4) buckets["3–4 floors"]++;
    else if (p.floors <= 6) buckets["5–6 floors"]++;
    else buckets["7+ floors"]++;
  });
  const byFloors = Object.entries(buckets).map(([name, count]) => ({ name, count }));

  const added = Math.max(0, properties.length - 6);
  const stats = [
    { label: "Total Parcels", value: BASE_STATS.parcels + added },
    { label: "Buildings", value: BASE_STATS.buildings + added },
    {
      label: "Units",
      value: BASE_STATS.units + properties.slice(0, added).reduce((s, p) => s + totalUnits(p), 0),
    },
    { label: "Verified Properties", value: properties.filter((p) => p.status === "Verified").length },
  ];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Prototype insights based on demo and locally added data." />
      <div className="space-y-6 p-5 md:p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">Properties by Type</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byType} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                    {byType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">Buildings by Floors</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byFloors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ef" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: "#f1f4f9" }} />
                  <Bar dataKey="count" fill="#2f5fd0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
