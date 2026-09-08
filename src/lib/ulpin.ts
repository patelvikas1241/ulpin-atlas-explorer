export type PropertyStatus = "Verified" | "Pending" | "Draft";

export type Property = {
  id: string;
  ulpin: string;
  plotNumber: string;
  latitude: number;
  longitude: number;
  address: string;
  location: string;
  plotArea: number; // sq.ft
  landType: string;
  buildingType: string;
  height: number; // meters
  floors: number;
  unitsPerFloor: number;
  status: PropertyStatus;
  createdAt: string;
  /** grid slot in the demo 3D city */
  gx: number;
  gz: number;
};

export const totalUnits = (p: Property) => p.floors * p.unitsPerFloor;

export function generateUlpin(state = "DL", district = "DEL"): string {
  const n = Math.floor(10_000_000 + Math.random() * 89_999_999);
  return `IN-${state}-${district}-${n}`;
}

const slots: Array<[number, number]> = [
  [-2, -2],
  [0, -2],
  [2, -2],
  [-2, 0],
  [2, 0],
  [-2, 2],
  [0, 2],
  [2, 2],
  [0, 0],
  [-4, -2],
  [4, 2],
  [4, -2],
];

export function nextSlot(count: number): [number, number] {
  return slots[count % slots.length] ?? [0, 0];
}

export const demoProperties: Property[] = [
  {
    id: "p1",
    ulpin: "IN-DL-DEL-92837451",
    plotNumber: "P-001",
    latitude: 28.6139,
    longitude: 77.209,
    address: "Sector 12, Connaught Place, New Delhi",
    location: "Delhi",
    plotArea: 2400,
    landType: "Residential",
    buildingType: "Residential",
    height: 15,
    floors: 4,
    unitsPerFloor: 2,
    status: "Verified",
    createdAt: "2026-01-12",
    gx: -2,
    gz: -2,
  },
  {
    id: "p2",
    ulpin: "IN-DL-DEL-73625194",
    plotNumber: "P-002",
    latitude: 28.6215,
    longitude: 77.2151,
    address: "Block A, Karol Bagh, New Delhi",
    location: "Delhi",
    plotArea: 1800,
    landType: "Residential",
    buildingType: "Apartment",
    height: 11,
    floors: 3,
    unitsPerFloor: 2,
    status: "Verified",
    createdAt: "2026-01-18",
    gx: 0,
    gz: -2,
  },
  {
    id: "p3",
    ulpin: "IN-DL-DEL-48291637",
    plotNumber: "P-003",
    latitude: 28.6045,
    longitude: 77.2273,
    address: "Plot 9, Daryaganj, New Delhi",
    location: "Delhi",
    plotArea: 3200,
    landType: "Mixed Use",
    buildingType: "Mixed Use",
    height: 22,
    floors: 6,
    unitsPerFloor: 2,
    status: "Pending",
    createdAt: "2026-02-02",
    gx: 2,
    gz: -2,
  },
  {
    id: "p4",
    ulpin: "IN-DL-DEL-56104728",
    plotNumber: "P-004",
    latitude: 28.5921,
    longitude: 77.2183,
    address: "Commercial Row, Lajpat Nagar, New Delhi",
    location: "Delhi",
    plotArea: 4100,
    landType: "Commercial",
    buildingType: "Office",
    height: 30,
    floors: 8,
    unitsPerFloor: 4,
    status: "Verified",
    createdAt: "2026-02-09",
    gx: -2,
    gz: 0,
  },
  {
    id: "p5",
    ulpin: "IN-DL-DEL-31947265",
    plotNumber: "P-005",
    latitude: 28.5812,
    longitude: 77.2401,
    address: "Industrial Estate, Okhla Phase II, New Delhi",
    location: "Delhi",
    plotArea: 6800,
    landType: "Industrial",
    buildingType: "Commercial",
    height: 8,
    floors: 2,
    unitsPerFloor: 3,
    status: "Draft",
    createdAt: "2026-02-14",
    gx: 2,
    gz: 0,
  },
  {
    id: "p6",
    ulpin: "IN-DL-DEL-88452019",
    plotNumber: "P-006",
    latitude: 28.6331,
    longitude: 77.2199,
    address: "Green Field, Civil Lines, New Delhi",
    location: "Delhi",
    plotArea: 5200,
    landType: "Agricultural",
    buildingType: "Residential",
    height: 7,
    floors: 2,
    unitsPerFloor: 1,
    status: "Pending",
    createdAt: "2026-02-20",
    gx: -2,
    gz: 2,
  },
];

export const BASE_STATS = { parcels: 124, buildings: 58, units: 342 };
