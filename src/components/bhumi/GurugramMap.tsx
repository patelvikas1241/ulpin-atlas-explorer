import * as React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  GGM_CENTER,
  buildingsGeoJSON,
  demoProperties,
  metroGeoJSON,
  metroStationsGeoJSON,
  parcelsGeoJSON,
  ulpinPointsGeoJSON,
  type DemoProperty,
} from "@/lib/bhumi";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export type LayerKey =
  | "buildings"
  | "parcels"
  | "roads"
  | "metro"
  | "boundaries"
  | "water"
  | "ulpin"
  | "labels";

export type MapHandle = {
  flyToProperty: (p: DemoProperty, opts?: { zoom?: number; pitch?: number }) => void;
  overview: () => void;
  zoomBy: (d: number) => void;
  resetView: () => void;
  north: () => void;
  rotate: () => void;
  setMode: (mode: "2d" | "3d") => void;
};

const DEFAULT_VIEW = { center: GGM_CENTER, zoom: 12.6, pitch: 60, bearing: -22 };

export default function GurugramMap({
  selectedId,
  onSelect,
  onStation,
  layers,
  mode,
  onReady,
  onError,
  handleRef,
}: {
  selectedId: string | null;
  onSelect: (buildingId: string | null) => void;
  onStation: (name: string) => void;
  layers: Record<LayerKey, boolean>;
  mode: "2d" | "3d";
  onReady: () => void;
  onError: () => void;
  handleRef: React.MutableRefObject<MapHandle | null>;
}) {
  const container = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const selectRef = React.useRef(onSelect);
  const stationRef = React.useRef(onStation);
  selectRef.current = onSelect;
  stationRef.current = onStation;

  React.useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: STYLE_URL,
      ...DEFAULT_VIEW,
      attributionControl: { compact: true },
686:
    });
    mapRef.current = map;

    const failTimer = window.setTimeout(() => {
      if (!map.isStyleLoaded()) onError();
    }, 12000);

    map.on("error", (e) => {
      if ((e as { error?: { status?: number } }).error?.status) onError();
    });

    map.on("load", () => {
      window.clearTimeout(failTimer);

      // real OSM buildings, extruded
      try {
        map.addLayer({
          id: "osm-3d-buildings",
          source: "openmaptiles",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": "#c9d3e4",
            "fill-extrusion-height": ["coalesce", ["get", "render_height"], 12],
            "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
            "fill-extrusion-opacity": 0.85,
          },
        });
      } catch {
        /* style without building source */
      }

      map.addSource("parcels", { type: "geojson", data: parcelsGeoJSON });
      map.addSource("demo-buildings", { type: "geojson", data: buildingsGeoJSON });
      map.addSource("ulpin-points", { type: "geojson", data: ulpinPointsGeoJSON });
      map.addSource("metro", { type: "geojson", data: metroGeoJSON });
      map.addSource("metro-stations", { type: "geojson", data: metroStationsGeoJSON });

      map.addLayer({
        id: "parcel-fill",
        type: "fill",
        source: "parcels",
        paint: { "fill-color": ["get", "color"], "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: "parcel-line",
        type: "line",
        source: "parcels",
        paint: {
          "line-color": ["case", ["==", ["get", "buildingId"], ""], "#1e3a72", "#1e3a72"],
          "line-width": 1.6,
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "parcel-selected",
        type: "line",
        source: "parcels",
        filter: ["==", ["get", "buildingId"], "__none__"],
        paint: { "line-color": "#f0a532", "line-width": 4, "line-blur": 1 },
      });

      map.addLayer({
        id: "demo-building-extrusion",
        type: "fill-extrusion",
        source: "demo-buildings",
        paint: {
          "fill-extrusion-color": [
            "case",
            ["==", ["get", "buildingId"], "__none__"],
            "#f0a532",
            ["get", "color"],
          ],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.94,
        },
      });

      map.addLayer({
        id: "metro-line",
        type: "line",
        source: "metro",
        paint: { "line-color": "#e0245e", "line-width": 4, "line-dasharray": [2, 1] },
      });
      map.addLayer({
        id: "metro-station",
        type: "circle",
        source: "metro-stations",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#e0245e",
          "circle-stroke-width": 3,
        },
      });

      map.addLayer({
        id: "ulpin-point",
        type: "circle",
        source: "ulpin-points",
        paint: {
          "circle-radius": 4,
          "circle-color": "#1e3a72",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      });
      map.addLayer({
        id: "property-label",
        type: "symbol",
        source: "ulpin-points",
        minzoom: 13,
        layout: {
          "text-field": ["get", "label"],
          "text-size": 11,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
        },
        paint: { "text-color": "#1e3a72", "text-halo-color": "#ffffff", "text-halo-width": 1.4 },
      });

      const pick = (e: maplibregl.MapMouseEvent) => {
        const feats = map.queryRenderedFeatures(e.point, {
          layers: ["demo-building-extrusion", "parcel-fill", "ulpin-point"],
        });
        const id = feats[0]?.properties?.["buildingId"] as string | undefined;
        if (id) selectRef.current(id);
        else selectRef.current(null);
      };
      map.on("click", pick);
      map.on("click", "metro-station", (e) => {
        const name = e.features?.[0]?.properties?.["name"] as string | undefined;
        if (name) stationRef.current(name);
      });
      for (const l of ["demo-building-extrusion", "parcel-fill", "metro-station"]) {
        map.on("mouseenter", l, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", l, () => (map.getCanvas().style.cursor = ""));
      }

      setLoaded(true);
      onReady();
    });

    return () => {
      window.clearTimeout(failTimer);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* imperative controls */
  React.useEffect(() => {
    handleRef.current = {
      flyToProperty: (p, opts) =>
        mapRef.current?.flyTo({
          center: [p.longitude, p.latitude],
          zoom: opts?.zoom ?? 16.6,
          pitch: opts?.pitch ?? 62,
          bearing: -20,
          duration: 2200,
          essential: true,
        }),
      overview: () =>
        mapRef.current?.flyTo({ ...DEFAULT_VIEW, duration: 2600, essential: true }),
      zoomBy: (d) => mapRef.current?.easeTo({ zoom: (mapRef.current.getZoom() ?? 12) + d }),
      resetView: () => mapRef.current?.easeTo({ ...DEFAULT_VIEW, duration: 1200 }),
      north: () => mapRef.current?.easeTo({ bearing: 0, duration: 800 }),
      rotate: () =>
        mapRef.current?.easeTo({
          bearing: (mapRef.current.getBearing() ?? 0) + 45,
          duration: 900,
        }),
      setMode: (m) =>
        mapRef.current?.easeTo({
          pitch: m === "3d" ? 60 : 0,
          bearing: m === "3d" ? -22 : 0,
          duration: 1200,
        }),
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  /* selection highlight */
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const id = selectedId ?? "__none__";
    const parcelId = demoProperties.find((p) => p.buildingId === selectedId)?.parcelId ?? "__none__";
    map.setFilter("parcel-selected", ["==", ["get", "parcelId"], parcelId]);
    map.setPaintProperty("demo-building-extrusion", "fill-extrusion-color", [
      "case",
      ["==", ["get", "buildingId"], id],
      "#f0a532",
      ["get", "color"],
    ]);
  }, [selectedId, loaded]);

  /* mode */
  React.useEffect(() => {
    if (loaded) handleRef.current?.setMode(mode);
  }, [mode, loaded, handleRef]);

  /* layer visibility */
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const style = map.getStyle();
    const set = (ids: string[], on: boolean) => {
      for (const id of ids) {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
      }
    };
    const byPrefix = (test: (id: string) => boolean) =>
      (style.layers ?? []).map((l) => l.id).filter(test);

    set(["osm-3d-buildings", "demo-building-extrusion"], layers.buildings);
    set(byPrefix((id) => id.startsWith("building")), layers.buildings);
    set(["parcel-fill", "parcel-line", "parcel-selected"], layers.parcels);
    set(
      byPrefix((id) => /^(highway|road|bridge|tunnel)/.test(id) && !/label|name/.test(id)),
      layers.roads,
    );
    set(["metro-line", "metro-station"], layers.metro);
    set(
      byPrefix((id) => /boundary|admin/.test(id)),
      layers.boundaries,
    );
    set(
      byPrefix((id) => /water|waterway/.test(id) && !/label|name/.test(id)),
      layers.water,
    );
    set(["ulpin-point"], layers.ulpin);
    set(["property-label"], layers.labels);
    set(
      byPrefix((id) => /label|place|poi/.test(id)),
      layers.labels,
    );
  }, [layers, loaded]);

  return <div ref={container} className="h-full w-full" />;
}
