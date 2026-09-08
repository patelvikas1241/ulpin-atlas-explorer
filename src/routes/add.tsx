import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useProperties } from "@/lib/property-store";
import { generateUlpin, type Property } from "@/lib/ulpin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/AppShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add New Property | 3D ULPIN" },
      {
        name: "description",
        content:
          "Register land and building information to generate a unique prototype ULPIN and 3D model.",
      },
      { property: "og:title", content: "Add New Property" },
      {
        property: "og:description",
        content: "Enter land and building details to generate a simulated ULPIN.",
      },
    ],
  }),
  component: AddProperty,
});

type FormState = {
  plotNumber: string;
  latitude: string;
  longitude: string;
  plotArea: string;
  landType: string;
  address: string;
  height: string;
  floors: string;
  unitsPerFloor: string;
  buildingType: string;
};

const initial: FormState = {
  plotNumber: "",
  latitude: "",
  longitude: "",
  plotArea: "",
  landType: "Residential",
  address: "",
  height: "",
  floors: "",
  unitsPerFloor: "",
  buildingType: "Residential",
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function AddProperty() {
  const { addProperty } = useProperties();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<FormState>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [created, setCreated] = React.useState<Property | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.plotNumber.trim()) e['plotNumber'] = "Please enter a plot number.";
    if (!form.latitude.trim()) e['latitude'] = "Please enter latitude.";
    else if (Number.isNaN(Number(form.latitude)) || Math.abs(Number(form.latitude)) > 90)
      e['latitude'] = "Latitude must be a number between -90 and 90.";
    if (!form.longitude.trim()) e['longitude'] = "Please enter longitude.";
    else if (Number.isNaN(Number(form.longitude)) || Math.abs(Number(form.longitude)) > 180)
      e['longitude'] = "Longitude must be a number between -180 and 180.";
    if (!form.plotArea.trim() || Number(form.plotArea) <= 0)
      e['plotArea'] = "Plot area must be greater than 0.";
    if (!form.height.trim() || Number(form.height) <= 0)
      e['height'] = "Building height must be greater than 0.";
    if (!form.floors.trim() || Number(form.floors) <= 0)
      e['floors'] = "Number of floors must be greater than 0.";
    if (!form.unitsPerFloor.trim() || Number(form.unitsPerFloor) <= 0)
      e['unitsPerFloor'] = "Units per floor must be greater than 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onGenerate(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const property = addProperty({
        ulpin: generateUlpin(),
        plotNumber: form.plotNumber.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address.trim() || "New Delhi",
        location: "Delhi",
        plotArea: Number(form.plotArea),
        landType: form.landType,
        buildingType: form.buildingType,
        height: Number(form.height),
        floors: Number(form.floors),
        unitsPerFloor: Number(form.unitsPerFloor),
        status: "Verified",
      });
      setLoading(false);
      setCreated(property);
      setForm(initial);
      toast.success("Prototype ULPIN generated");
    }, 1000);
  }

  return (
    <div>
      <PageHeader
        title="Add New Property"
        subtitle="Register land and building information to generate a unique ULPIN."
      />

      <form onSubmit={onGenerate} className="space-y-6 p-5 md:p-8">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-foreground">Section A — Land Details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field id="plotNumber" label="Plot Number" error={errors['plotNumber']}>
              <Input id="plotNumber" placeholder="P-001" value={form.plotNumber} onChange={set("plotNumber")} />
            </Field>
            <Field id="latitude" label="Latitude" error={errors['latitude']}>
              <Input id="latitude" placeholder="28.6139" value={form.latitude} onChange={set("latitude")} />
            </Field>
            <Field id="longitude" label="Longitude" error={errors['longitude']}>
              <Input id="longitude" placeholder="77.2090" value={form.longitude} onChange={set("longitude")} />
            </Field>
            <Field id="plotArea" label="Plot Area (sq.ft)" error={errors['plotArea']}>
              <Input id="plotArea" placeholder="2400" value={form.plotArea} onChange={set("plotArea")} />
            </Field>
            <Field id="landType" label="Land Type">
              <select
                id="landType"
                value={form.landType}
                onChange={set("landType")}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {["Residential", "Commercial", "Agricultural", "Industrial", "Mixed Use"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field id="address" label="Address (optional)">
              <Input id="address" placeholder="Sector 12, New Delhi" value={form.address} onChange={set("address")} />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-foreground">Section B — Building Details</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field id="height" label="Building Height (m)" error={errors['height']}>
              <Input id="height" placeholder="15" value={form.height} onChange={set("height")} />
            </Field>
            <Field id="floors" label="Number of Floors" error={errors['floors']}>
              <Input id="floors" placeholder="4" value={form.floors} onChange={set("floors")} />
            </Field>
            <Field id="unitsPerFloor" label="Units per Floor" error={errors['unitsPerFloor']}>
              <Input
                id="unitsPerFloor"
                placeholder="2"
                value={form.unitsPerFloor}
                onChange={set("unitsPerFloor")}
              />
            </Field>
            <Field id="buildingType" label="Building Type">
              <select
                id="buildingType"
                value={form.buildingType}
                onChange={set("buildingType")}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {["Residential", "Commercial", "Apartment", "Office", "Mixed Use"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating ULPIN…
              </>
            ) : (
              <>
                <KeyRound className="size-4" /> Generate ULPIN
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Prototype only — identifiers are simulated and are not official government ULPINs.
          </p>
        </div>
      </form>

      <Dialog open={!!created} onOpenChange={(o) => !o && setCreated(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-sm uppercase tracking-widest text-muted-foreground">
              ULPIN Generated
            </DialogTitle>
            <DialogDescription className="sr-only">Prototype ULPIN result</DialogDescription>
          </DialogHeader>
          <p className="text-center font-mono text-xl font-semibold text-primary">
            {created?.ulpin}
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {["Parcel Registered", "Coordinates Verified", "Building Data Verified", "3D Model Created"].map(
              (s) => (
                <li key={s} className="flex items-center gap-2 text-foreground">
                  <Check className="size-4 text-emerald-600" /> {s}
                </li>
              ),
            )}
          </ul>
          <Button
            className="mt-3 w-full"
            onClick={() => {
              const ulpin = created!.ulpin;
              setCreated(null);
              navigate({ to: "/map", search: { ulpin } });
            }}
          >
            View 3D Property
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/properties">Back to properties</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
