export type PropertyStatus = "Verified" | "Pending" | "Draft";

export type Property = {
  id: string;
  ulpin: string;
  plotNumber: string;
  latitude: number;
  longitude: number;
  address: string;
  /** city / district */
  location: string;
  /** sector or colony inside Gurugram */
  locality: string;
  owner: string;
  registryDate: string;
  plotArea: number; // sq.ft
  builtUpArea: number; // sq.ft
  landValue: number; // INR crore (simulated)
  landType: string;
  buildingType: string;
  height: number; // meters
  floors: number;
  unitsPerFloor: number;
  status: PropertyStatus;
  createdAt: string;
  /** legacy grid slot (kept for older saved records) */
  gx: number;
  gz: number;
};

export const totalUnits = (p: Property) => p.floors * p.unitsPerFloor;

/* ------------------------------------------------------------------ */
/* Geography — Gurugram, Haryana                                       */
/* ------------------------------------------------------------------ */

export const GGM_CENTER = { lat: 28.4595, lon: 77.0266 };
export const GGM_BOUNDS = { minLat: 28.32, maxLat: 28.56, minLon: 76.88, maxLon: 77.16 };

/** metres represented by one scene unit (schematic, relative positions preserved) */
const METRES_PER_UNIT = 250;

export function project(lat: number, lon: number): [number, number] {
  const x =
    ((lon - GGM_CENTER.lon) * 111_320 * Math.cos((GGM_CENTER.lat * Math.PI) / 180)) /
    METRES_PER_UNIT;
  const z = -((lat - GGM_CENTER.lat) * 110_574) / METRES_PER_UNIT;
  return [x, z];
}

export function insideGurugram(lat: number, lon: number) {
  return (
    lat >= GGM_BOUNDS.minLat &&
    lat <= GGM_BOUNDS.maxLat &&
    lon >= GGM_BOUNDS.minLon &&
    lon <= GGM_BOUNDS.maxLon
  );
}

export function generateUlpin(state = "HR", district = "GGM"): string {
  const n = Math.floor(10_000_000 + Math.random() * 89_999_999);
  return `IN-${state}-${district}-${n}`;
}

/** deterministic 0..1 from a string */
export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** legacy helper kept for older saved records */
const slots: Array<[number, number]> = [
  [-2, -2],
  [0, -2],
  [2, -2],
  [-2, 0],
  [2, 0],
  [-2, 2],
];
export function nextSlot(count: number): [number, number] {
  return slots[count % slots.length] ?? [0, 0];
}

/* ------------------------------------------------------------------ */
/* Floors and units                                                    */
/* ------------------------------------------------------------------ */

export type Unit = {
  code: string;
  ulpin: string;
  carpetArea: number;
  usage: string;
  occupancy: "Occupied" | "Vacant" | "Leased";
};

export function unitsOnFloor(p: Property, floor: number): Unit[] {
  return Array.from({ length: p.unitsPerFloor }).map((_, i) => {
    const code = `${floor}${String(i + 1).padStart(2, "0")}`;
    const r = hash01(`${p.ulpin}-${code}`);
    const usage =
      p.buildingType === "Office" || p.buildingType === "Commercial"
        ? r > 0.6
          ? "Retail"
          : "Office suite"
        : p.buildingType === "Mixed Use" && floor <= 2
          ? "Retail"
          : "Dwelling unit";
    const occupancy: Unit["occupancy"] = r > 0.75 ? "Vacant" : r > 0.45 ? "Leased" : "Occupied";
    const base = Math.round((p.builtUpArea / (p.floors * p.unitsPerFloor)) * (0.85 + r * 0.3));
    return {
      code,
      ulpin: `${p.ulpin}-${code}`,
      carpetArea: base,
      usage,
      occupancy,
    };
  });
}

/** floor label: G, 1, 2 … */
export const floorLabel = (f: number) => (f === 1 ? "Ground" : `Floor ${f - 1}`);

/* ------------------------------------------------------------------ */
/* Land-use palette                                                    */
/* ------------------------------------------------------------------ */

export const LAND_USE_COLORS: Record<string, string> = {
  Residential: "#4f7fd8",
  Commercial: "#f0a532",
  "Mixed Use": "#8b5cf6",
  Industrial: "#64748b",
  Institutional: "#0f9d8f",
  Agricultural: "#7cb342",
};

export const landColor = (t: string) => LAND_USE_COLORS[t] ?? "#8ea2c4";

/* ------------------------------------------------------------------ */
/* Simulated Gurugram registry                                         */
/* ------------------------------------------------------------------ */

type Seed = Omit<Property, "id" | "gx" | "gz" | "location" | "createdAt">;

const seeds: Seed[] = [
  {
    ulpin: "IN-HR-GGM-92837451",
    plotNumber: "P-001",
    latitude: 28.4949,
    longitude: 77.0895,
    address: "Tower B, Cyber City, DLF Phase II",
    locality: "DLF Cyber City",
    owner: "Meridian Estates Pvt Ltd",
    registryDate: "2019-04-11",
    plotArea: 48000,
    builtUpArea: 412000,
    landValue: 268,
    landType: "Commercial",
    buildingType: "Office",
    height: 112,
    floors: 28,
    unitsPerFloor: 4,
    status: "Verified",
  },
  {
    ulpin: "IN-HR-GGM-73625194",
    plotNumber: "P-002",
    latitude: 28.4903,
    longitude: 77.0932,
    address: "Block 9, DLF Phase II, Gurugram",
    locality: "DLF Phase 2",
    owner: "Anand Sharma",
    registryDate: "2016-08-22",
    plotArea: 5400,
    builtUpArea: 12800,
    landValue: 9.4,
    landType: "Residential",
    buildingType: "Residential",
    height: 14,
    floors: 4,
    unitsPerFloor: 1,
    status: "Verified",
  },
  {
    ulpin: "IN-HR-GGM-48291637",
    plotNumber: "P-003",
    latitude: 28.4795,
    longitude: 77.0872,
    address: "MG Road, near Sikanderpur, Gurugram",
    locality: "MG Road",
    owner: "Sikanderpur Retail LLP",
    registryDate: "2014-02-03",
    plotArea: 26000,
    builtUpArea: 158000,
    landValue: 96,
    landType: "Mixed Use",
    buildingType: "Mixed Use",
    height: 58,
    floors: 14,
    unitsPerFloor: 6,
    status: "Pending",
  },
  {
    ulpin: "IN-HR-GGM-56104728",
    plotNumber: "P-004",
    latitude: 28.4667,
    longitude: 77.0669,
    address: "Sector 29 Leisure District, Gurugram",
    locality: "Sector 29",
    owner: "Haryana Urban Development Authority",
    registryDate: "2011-11-19",
    plotArea: 19500,
    builtUpArea: 74000,
    landValue: 41,
    landType: "Commercial",
    buildingType: "Commercial",
    height: 26,
    floors: 6,
    unitsPerFloor: 8,
    status: "Verified",
  },
  {
    ulpin: "IN-HR-GGM-31947265",
    plotNumber: "P-005",
    latitude: 28.5015,
    longitude: 77.0854,
    address: "Plot 214, Udyog Vihar Phase IV",
    locality: "Udyog Vihar",
    owner: "Precision Components India Ltd",
    registryDate: "2009-06-30",
    plotArea: 62000,
    builtUpArea: 88000,
    landValue: 54,
    landType: "Industrial",
    buildingType: "Commercial",
    height: 16,
    floors: 3,
    unitsPerFloor: 4,
    status: "Draft",
  },
  {
    ulpin: "IN-HR-GGM-88452019",
    plotNumber: "P-006",
    latitude: 28.4452,
    longitude: 77.1021,
    address: "Golf Course Road, Sector 54, Gurugram",
    locality: "Golf Course Road",
    owner: "Aravalli Heights Owners Association",
    registryDate: "2021-03-15",
    plotArea: 38000,
    builtUpArea: 486000,
    landValue: 214,
    landType: "Residential",
    buildingType: "Apartment",
    height: 128,
    floors: 32,
    unitsPerFloor: 4,
    status: "Verified",
  },
  {
    ulpin: "IN-HR-GGM-20938471",
    plotNumber: "P-007",
    latitude: 28.4648,
    longitude: 77.0741,
    address: "C-Block, Sushant Lok Phase I",
    locality: "Sushant Lok 1",
    owner: "Rekha Malhotra",
    registryDate: "2018-09-02",
    plotArea: 4300,
    builtUpArea: 10200,
    landValue: 7.1,
    landType: "Residential",
    buildingType: "Residential",
    height: 15,
    floors: 4,
    unitsPerFloor: 2,
    status: "Verified",
  },
  {
    ulpin: "IN-HR-GGM-64518290",
    plotNumber: "P-008",
    latitude: 28.4241,
    longitude: 77.0417,
    address: "Sohna Road, Sector 48, Gurugram",
    locality: "Sohna Road",
    owner: "Southcity Developers Pvt Ltd",
    registryDate: "2020-01-27",
    plotArea: 29000,
    builtUpArea: 246000,
    landValue: 88,
    landType: "Mixed Use",
    buildingType: "Apartment",
    height: 74,
    floors: 18,
    unitsPerFloor: 4,
    status: "Pending",
  },
  {
    ulpin: "IN-HR-GGM-77103846",
    plotNumber: "P-009",
    latitude: 28.4684,
    longitude: 77.0312,
    address: "Civil Lines, Sector 14, Gurugram",
    locality: "Sector 14",
    owner: "District Municipal Corporation",
    registryDate: "2007-05-08",
    plotArea: 21000,
    builtUpArea: 46000,
    landValue: 33,
    landType: "Institutional",
    buildingType: "Office",
    height: 22,
    floors: 5,
    unitsPerFloor: 6,
    status: "Verified",
  },
  {
    ulpin: "IN-HR-GGM-15927304",
    plotNumber: "P-010",
    latitude: 28.5072,
    longitude: 76.9906,
    address: "Block D, Palam Vihar, Gurugram",
    locality: "Palam Vihar",
    owner: "Vikram Chauhan",
    registryDate: "2015-12-11",
    plotArea: 3600,
    builtUpArea: 8400,
    landValue: 4.8,
    landType: "Residential",
    buildingType: "Residential",
    height: 12,
    floors: 3,
    unitsPerFloor: 2,
    status: "Draft",
  },
  {
    ulpin: "IN-HR-GGM-39481750",
    plotNumber: "P-011",
    latitude: 28.4931,
    longitude: 77.0981,
    address: "DLF Phase III, U-Block, Gurugram",
    locality: "DLF Phase 3",
    owner: "Cyber Ridge Holdings",
    registryDate: "2017-07-21",
    plotArea: 16800,
    builtUpArea: 132000,
    landValue: 71,
    landType: "Commercial",
    buildingType: "Office",
    height: 66,
    floors: 16,
    unitsPerFloor: 3,
    status: "Verified",
  },
  {
    ulpin: "IN-HR-GGM-50283917",
    plotNumber: "P-012",
    latitude: 28.4372,
    longitude: 77.0993,
    address: "Sector 56, Golf Course Road Extension",
    locality: "Sector 56",
    owner: "Sunita Yadav",
    registryDate: "2022-02-18",
    plotArea: 6100,
    builtUpArea: 21000,
    landValue: 12.6,
    landType: "Residential",
    buildingType: "Apartment",
    height: 30,
    floors: 8,
    unitsPerFloor: 2,
    status: "Pending",
  },
  {
    ulpin: "IN-HR-GGM-82710465",
    plotNumber: "P-013",
    latitude: 28.4106,
    longitude: 76.9741,
    address: "Sector 84, New Gurugram (Manesar edge)",
    locality: "New Gurugram",
    owner: "Aravalli Agro Farms",
    registryDate: "2013-10-05",
    plotArea: 94000,
    builtUpArea: 18000,
    landValue: 29,
    landType: "Agricultural",
    buildingType: "Residential",
    height: 8,
    floors: 2,
    unitsPerFloor: 1,
    status: "Draft",
  },
  {
    ulpin: "IN-HR-GGM-46019283",
    plotNumber: "P-014",
    latitude: 28.4573,
    longitude: 77.0885,
    address: "DLF Phase IV, Galleria Market, Gurugram",
    locality: "DLF Phase 4",
    owner: "Galleria Commercial Trust",
    registryDate: "2012-04-25",
    plotArea: 14500,
    builtUpArea: 62000,
    landValue: 48,
    landType: "Mixed Use",
    buildingType: "Mixed Use",
    height: 34,
    floors: 8,
    unitsPerFloor: 5,
    status: "Verified",
  },
];

export const demoProperties: Property[] = seeds.map((s, i) => ({
  ...s,
  id: `p${i + 1}`,
  location: "Gurugram",
  createdAt: s.registryDate,
  gx: 0,
  gz: 0,
}));

export const BASE_STATS = { parcels: 124, buildings: 58, units: 342 };

/* ------------------------------------------------------------------ */
/* City infrastructure (schematic, simulated)                          */
/* ------------------------------------------------------------------ */

export type LatLon = [number, number];

export const ROADS: Array<{ name: string; width: number; path: LatLon[] }> = [
  {
    name: "NH-48 Delhi–Jaipur Expressway",
    width: 1.5,
    path: [
      [28.5240, 77.1060],
      [28.4960, 77.0730],
      [28.4640, 77.0360],
      [28.4230, 76.9820],
      [28.3950, 76.9480],
    ],
  },
  {
    name: "Golf Course Road",
    width: 1.0,
    path: [
      [28.4985, 77.0838],
      [28.4760, 77.0965],
      [28.4520, 77.1010],
      [28.4270, 77.1040],
    ],
  },
  {
    name: "Sohna Road",
    width: 0.9,
    path: [
      [28.4560, 77.0455],
      [28.4330, 77.0410],
      [28.4050, 77.0470],
    ],
  },
  {
    name: "MG Road",
    width: 0.9,
    path: [
      [28.4712, 77.0942],
      [28.4860, 77.0842],
      [28.5010, 77.0736],
    ],
  },
  {
    name: "Old Delhi–Gurugram Road",
    width: 0.8,
    path: [
      [28.4640, 77.0210],
      [28.4860, 77.0470],
      [28.5090, 77.0720],
    ],
  },
  {
    name: "Sector Road 14–29",
    width: 0.7,
    path: [
      [28.4684, 77.0300],
      [28.4670, 77.0670],
      [28.4640, 77.0890],
    ],
  },
];

export const METRO: { name: string; path: LatLon[]; stations: Array<{ name: string; at: LatLon }> } =
  {
    name: "Rapid Metro / Yellow Line corridor",
    path: [
      [28.5040, 77.0730],
      [28.4880, 77.0870],
      [28.4680, 77.0955],
      [28.4460, 77.1005],
      [28.4290, 77.1035],
    ],
    stations: [
      { name: "Sikanderpur", at: [28.4813, 77.0925] },
      { name: "Cyber City", at: [28.4955, 77.0865] },
      { name: "Sector 42–43", at: [28.4570, 77.0985] },
      { name: "Sector 55–56", at: [28.4300, 77.1035] },
    ],
  };

export const PARKS: Array<{ name: string; at: LatLon; w: number; d: number; water?: boolean }> = [
  { name: "Leisure Valley Park", at: [28.4642, 77.0531], w: 6, d: 4 },
  { name: "Aravalli Biodiversity Park", at: [28.4585, 77.1130], w: 7, d: 6 },
  { name: "Tau Devi Lal Biodiversity Park", at: [28.4392, 77.0625], w: 5, d: 4 },
  { name: "Basai Wetland", at: [28.4520, 76.9820], w: 5, d: 3, water: true },
];
