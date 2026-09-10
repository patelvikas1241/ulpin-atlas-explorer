import * as React from "react";
import { MousePointerClick } from "lucide-react";
import type { Property } from "@/lib/ulpin";
import "maplibre-gl/dist/maplibre-gl.css";

declare global {
  interface Window {
    maplibregl: any;
  }
}

type Props = {
  properties: Property[];
  selectedId?: string | null;
  activeFloor?: number | null;
  onSelect?: (id: string | null) => void;
  onFloor?: (floor: number) => void;
  className?: string;
};

const TYPE_COLOR: Record<string, string> = {
  Residential: "#4fbf82",
  Commercial: "#4a9bff",
  Office: "#f2a53c",
  "Mixed Use": "#b98cff",
  Retail: "#ff6f8e",
};

const SIZE = 0.00055;

export function Bhumi3DMapWrapper({
  properties,
  selectedId,
  onSelect,
  className = "",
}: Props) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const selectedSeqRef = React.useRef<number | null>(null);

  // Load MapLibre GL from CDN
  React.useEffect(() => {
    if (window.maplibregl) return;

    const link = document.createElement("link");
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.1.3/maplibre-gl.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.1.3/maplibre-gl.min.js";
    script.async = true;
    script.onload = () => {
      // Script loaded
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize map
  React.useEffect(() => {
    if (!mapContainer.current || !window.maplibregl) return;

    try {
      map.current = new window.maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: "bg",
              type: "background",
              paint: { "background-color": "#0b121a" },
            },
          ],
        },
        center: [77.0266, 28.4595],
        zoom: 12.4,
        pitch: 60,
        bearing: -17,
        antialias: true,
        attributionControl: false,
      });

      map.current.on("load", () => {
        initializeMapLayers();
      });

      map.current.on("error", (e: any) => {
        console.warn("maplibre error", e);
      });
    } catch (err) {
      console.error("Map init failed:", err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Initialize map layers
  const initializeMapLayers = () => {
    if (!map.current) return;

    // Grid backdrop
    map.current.addSource("grid", {
      type: "geojson",
      data: makeGrid(),
    });
    map.current.addLayer({
      id: "grid",
      type: "line",
      source: "grid",
      paint: {
        "line-color": "#1c2c3a",
        "line-width": 1,
        "line-opacity": 0.5,
      },
    });

    // Properties/Parcels
    const parcelsFC = createFeatureCollection(properties);
    map.current.addSource("parcels", {
      type: "geojson",
      data: parcelsFC,
    });

    map.current.addLayer({
      id: "parcels",
      type: "fill",
      source: "parcels",
      paint: {
        "fill-color": ["get", "color"],
        "fill-opacity": 0.12,
      },
    });

    map.current.addLayer({
      id: "parcels-outline",
      type: "line",
      source: "parcels",
      paint: {
        "line-color": ["get", "color"],
        "line-width": 1.2,
      },
    });

    // 3D Buildings
    map.current.addLayer({
      id: "buildings",
      type: "fill-extrusion",
      source: "parcels",
      paint: {
        "fill-extrusion-color": ["get", "color"],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.92,
      },
    });

    // Highlight layer
    map.current.addSource("highlight", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    map.current.addLayer({
      id: "highlight-line",
      type: "line",
      source: "highlight",
      paint: {
        "line-color": "#f2a53c",
        "line-width": 3.5,
      },
    });

    // Add labels
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = properties.map((p) => {
      const el = document.createElement("div");
      el.style.cssText =
        "font-size:9.5px;color:#dfe8ec;background:rgba(7,11,16,.7);padding:2px 5px;border-radius:2px;white-space:nowrap;border:1px solid #1f2e3a;transform:translateY(-8px);font-family:monospace;";
      el.textContent = p.plotNumber;
      return new window.maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([p.longitude, p.latitude + SIZE * 1.3])
        .addTo(map.current);
    });

    // Click handler
    map.current.on("click", "buildings", (e: any) => {
      const feature = e.features?.[0];
      if (feature) {
        const propId = feature.properties?.id;
        if (propId) {
          selectedSeqRef.current = feature.properties?.seq;
          onSelect?.(propId || null);
        }
      }
    });

    map.current.on("mouseenter", "buildings", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "buildings", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });

    // Coordinate readout
    map.current.on("mousemove", (e: any) => {
      const coordRead = document.getElementById("coordread");
      if (coordRead) {
        coordRead.textContent = `lat ${e.lngLat.lat.toFixed(4)} · lng ${e.lngLat.lng.toFixed(4)} · zoom ${map.current.getZoom().toFixed(1)}`;
      }
    });
  };

  // Update highlight when selection changes
  React.useEffect(() => {
    if (!map.current || !selectedId) {
      map.current?.getSource("highlight")?.setData({
        type: "FeatureCollection",
        features: [],
      });
      return;
    }

    const prop = properties.find((p) => p.id === selectedId);
    if (prop) {
      const footprintCoords = createFootprint(prop);
      map.current.getSource("highlight")?.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [footprintCoords],
            },
          },
        ],
      });

      // Fly to
      map.current.flyTo({
        center: [prop.longitude, prop.latitude],
        zoom: 16.5,
        pitch: 60,
        duration: 1400,
      });
    }
  }, [selectedId, properties]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow">
        <MousePointerClick className="mr-1 inline size-3.5" />
        Drag to rotate · Scroll to zoom · Right-drag to pan
      </div>
    </div>
  );
}

function createFootprint(prop: Property) {
  const s = SIZE * (0.6 + prop.floors / 40);
  return [
    [prop.longitude - s, prop.latitude - s],
    [prop.longitude + s, prop.latitude - s],
    [prop.longitude + s, prop.latitude + s],
    [prop.longitude - s, prop.latitude + s],
    [prop.longitude - s, prop.latitude - s],
  ];
}

function createFeatureCollection(properties: Property[]) {
  return {
    type: "FeatureCollection" as const,
    features: properties.map((p) => ({
      type: "Feature" as const,
      properties: {
        id: p.id,
        seq: p.id, // For click handler
        ulpin: p.ulpin,
        plotNumber: p.plotNumber,
        name: p.plotNumber,
        type: p.buildingType,
        height: p.height,
        floors: p.floors,
        color:
          TYPE_COLOR[p.buildingType as keyof typeof TYPE_COLOR] || "#4a9bff",
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [createFootprint(p)],
      },
    })),
  };
}

function makeGrid() {
  const features: any[] = [];
  const c = [77.06, 28.46];
  for (let i = -6; i <= 6; i++) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [c[0] + i * 0.01, c[1] - 0.08],
          [c[0] + i * 0.01, c[1] + 0.08],
        ],
      },
    });
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [c[0] - 0.08, c[1] + i * 0.01],
          [c[0] + 0.08, c[1] + i * 0.01],
        ],
      },
    });
  }
  return { type: "FeatureCollection", features };
}
