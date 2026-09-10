import raw from "@/data/properties.json";

export type DemoProperty = {
  parcelId: string;
  buildingId: string;
  ulpinBase: string;
  ulpin: string;
  sector: string;
  buildingName: string;
  latitude: number;
  longitude: number;
  height: number;
  floors: number;
  unitsPerFloor: number;
  units: number;
  propertyType: string;
  area: number;
  builtUpArea: number;
  owner: string;
  registryDate: string;
  landValue: number;
  status: string;
  recordStatus: "Verified" | "Pending" | "Draft";
  parcelPolygon: [number, number][];
};

export const demoProperties = raw as unknown as DemoProperty[];

export const GGM_CENTER: [number, number] = [77.0266, 28.4595];

export const TYPE_COLORS: Record<string, string> = {
  Commercial: "#f0a532",
  Residential: "#4f7fd8",
  "Mixed Use": "#8b5cf6",
  Industrial: "#64748b",
};
export const typeColor = (t: string) => TYPE_COLORS[t] ?? "#4f7fd8";

/** Floor labels: 1 => Ground, 2 => Floor 1 … */
export const floorLabel = (f: number) => (f === 1 ? "Ground" : `Floor ${f - 1}`);

export const pad2 = (n: number) => String(n).padStart(2, "0");

export function unitCode(floor: number, index: number) {
  return `${floor}${pad2(index + 1)}`;
}

export function unitUlpin(p: DemoProperty, floor: number, index: number) {
  return `${p.ulpinBase}-F${pad2(floor)}-U${unitCode(floor, index)}`;
}

export function composeUlpin(o: {
  area: string;
  parcel: string;
  building: string;
  floor: string;
  unit: string;
}) {
  const areaCode = (demoProperties.find((p) => p.sector === o.area)?.ulpinBase ?? "IN-HR-GGM-001")
    .split("-")[3];
  const parcelNum = o.parcel.replace(/\D/g, "").padStart(3, "0") || "001";
  const bldNum = pad2(Number(o.building.replace(/\D/g, "") || 1));
  return `IN-HR-GGM-${areaCode}-P${parcelNum}-B${bldNum}-F${pad2(Number(o.floor) || 1)}-U${
    o.unit || "101"
  }`;
}

export type UnitInfo = {
  code: string;
  ulpin: string;
  carpetArea: number;
  usage: string;
  occupancy: "Occupied" | "Vacant" | "Leased";
};

function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export function unitsOnFloor(p: DemoProperty, floor: number): UnitInfo[] {
  return Array.from({ length: p.unitsPerFloor }).map((_, i) => {
    const code = unitCode(floor, i);
    const r = hash01(`${p.buildingId}-${code}`);
    const usage =
      p.propertyType === "Residential"
        ? "Dwelling unit"
        : p.propertyType === "Mixed Use" && floor <= 2
          ? "Retail"
          : p.propertyType === "Industrial"
            ? "Workshop"
            : r > 0.6
              ? "Retail"
              : "Office suite";
    return {
      code,
      ulpin: unitUlpin(p, floor, i),
      carpetArea: Math.round(p.area * (0.85 + r * 0.35)),
      usage,
      occupancy: r > 0.75 ? "Vacant" : r > 0.45 ? "Leased" : "Occupied",
    };
  });
}

/* ---------------- GeoJSON sources (simulated) ---------------- */

export const parcelsGeoJSON = {
  type: "FeatureCollection" as const,
  features: demoProperties.map((p) => ({
    type: "Feature" as const,
    id: p.parcelId,
    properties: {
      parcelId: p.parcelId,
      buildingId: p.buildingId,
      sector: p.sector,
      buildingName: p.buildingName,
      propertyType: p.propertyType,
      color: typeColor(p.propertyType),
    },
    geometry: { type: "Polygon" as const, coordinates: [p.parcelPolygon] },
  })),
};

export const buildingsGeoJSON = {
  type: "FeatureCollection" as const,
  features: demoProperties.map((p) => {
    const [ring] = [p.parcelPolygon];
    // shrink the parcel ring by 25% to form the building footprint
    const cx = p.longitude;
    const cy = p.latitude;
    const shrunk = ring.map(([x, y]) => [cx + (x - cx) * 0.62, cy + (y - cy) * 0.62]);
    return {
      type: "Feature" as const,
      id: p.buildingId,
      properties: {
        buildingId: p.buildingId,
        parcelId: p.parcelId,
        buildingName: p.buildingName,
        height: p.height,
        color: typeColor(p.propertyType),
      },
      geometry: { type: "Polygon" as const, coordinates: [shrunk] },
    };
  }),
};

export const ulpinPointsGeoJSON = {
  type: "FeatureCollection" as const,
  features: demoProperties.map((p) => ({
    type: "Feature" as const,
    id: `pt-${p.buildingId}`,
    properties: {
      buildingId: p.buildingId,
      label: `${p.buildingName} · ${p.parcelId}`,
      sector: p.sector,
    },
    geometry: { type: "Point" as const, coordinates: [p.longitude, p.latitude] },
  })),
};

/** Simulated Rapid Metro / Yellow Line corridor for demonstration only. */
export const METRO_LINE: [number, number][] = [
  [77.0736, 28.5041],
  [77.0865, 28.4955],
  [77.0925, 28.4813],
  [77.0985, 28.457],
  [77.1035, 28.43],
];

export const METRO_STATIONS: Array<{ name: string; at: [number, number] }> = [
  { name: "Cyber City", at: [77.0865, 28.4955] },
  { name: "Sikanderpur", at: [77.0925, 28.4813] },
  { name: "Sector 42–43", at: [77.0985, 28.457] },
  { name: "Sector 55–56", at: [77.1035, 28.43] },
];

export const metroGeoJSON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Rapid Metro corridor (simulated)" },
      geometry: { type: "LineString" as const, coordinates: METRO_LINE },
    },
  ],
};

export const metroStationsGeoJSON = {
  type: "FeatureCollection" as const,
  features: METRO_STATIONS.map((s) => ({
    type: "Feature" as const,
    properties: { name: s.name },
    geometry: { type: "Point" as const, coordinates: s.at },
  })),
};

/* ---------------- search ---------------- */

export function searchProperties(q: string): DemoProperty[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return demoProperties
    .filter(
      (p) =>
        p.sector.toLowerCase().includes(s) ||
        p.parcelId.toLowerCase().includes(s) ||
        p.buildingId.toLowerCase().includes(s) ||
        p.buildingName.toLowerCase().includes(s) ||
        p.ulpinBase.toLowerCase().includes(s) ||
        p.ulpin.toLowerCase().includes(s),
    )
    .slice(0, 8);
}
