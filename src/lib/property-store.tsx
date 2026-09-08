import * as React from "react";
import { demoProperties, nextSlot, type Property } from "./ulpin";

const KEY = "ulpin.properties.v1";

type Ctx = {
  properties: Property[];
  addProperty: (p: Omit<Property, "id" | "createdAt" | "gx" | "gz">) => Property;
  getByUlpin: (q: string) => Property | undefined;
  hydrated: boolean;
};

const PropertyContext = React.createContext<Ctx | null>(null);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = React.useState<Property[]>(demoProperties);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Property[];
        if (Array.isArray(parsed) && parsed.length) setProperties(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(properties));
    } catch {
      /* ignore */
    }
  }, [properties, hydrated]);

  const addProperty: Ctx["addProperty"] = React.useCallback((p) => {
    const created: Property = {
      ...p,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      gx: 0,
      gz: 0,
    };
    setProperties((prev) => {
      const [gx, gz] = nextSlot(prev.length);
      created.gx = gx;
      created.gz = gz;
      return [{ ...created }, ...prev];
    });
    return created;
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({
      properties,
      addProperty,
      hydrated,
      getByUlpin: (q: string) => {
        const s = q.trim().toLowerCase();
        return properties.find(
          (p) => p.ulpin.toLowerCase() === s || p.plotNumber.toLowerCase() === s,
        );
      },
    }),
    [properties, addProperty, hydrated],
  );

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function useProperties() {
  const ctx = React.useContext(PropertyContext);
  if (!ctx) throw new Error("useProperties must be used within PropertyProvider");
  return ctx;
}
