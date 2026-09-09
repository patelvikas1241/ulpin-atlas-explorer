import * as React from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { hash01, landColor, type Property } from "@/lib/ulpin";

export const FLOOR_H = 0.5;

export function footprint(p: Property): [number, number] {
  const r = hash01(p.ulpin);
  const base = Math.min(4.2, Math.max(1.1, Math.sqrt(p.plotArea) / 62));
  return [base, base * (0.78 + r * 0.42)];
}

export function Building({
  property,
  position,
  selected,
  activeFloor,
  onSelect,
  onFloor,
  showLabel,
  showParcel,
  windowTexture,
}: {
  property: Property;
  position: [number, number, number];
  selected: boolean;
  activeFloor: number | null;
  onSelect?: (() => void) | undefined;
  onFloor?: ((f: number) => void) | undefined;
  showLabel: boolean;
  showParcel: boolean;
  windowTexture: THREE.Texture | null;
}) {
  const [hovered, setHovered] = React.useState(false);
  const [w, d] = footprint(property);
  const h = property.floors * FLOOR_H;
  const color = landColor(property.landType);
  const isolate = selected && activeFloor != null;

  const tex = React.useMemo(() => {
    if (!windowTexture) return null;
    const t = windowTexture.clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(2, Math.round(w * 2)), Math.max(2, property.floors / 2));
    return t;
  }, [windowTexture, w, property.floors]);

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {showParcel && (
        <>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.035, 0]} receiveShadow>
            <planeGeometry args={[w * 1.5, d * 1.5]} />
            <meshStandardMaterial color={color} transparent opacity={selected ? 0.5 : 0.24} />
          </mesh>
          <lineSegments position={[0, 0.045, 0]} rotation-x={-Math.PI / 2}>
            <edgesGeometry args={[new THREE.PlaneGeometry(w * 1.5, d * 1.5)]} />
            <lineBasicMaterial color={selected ? "#1e3a72" : "#94a3b8"} />
          </lineSegments>
        </>
      )}

      {/* tower */}
      <mesh
        castShadow
        receiveShadow
        position={[0, h / 2 + 0.05, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={selected ? "#3b6fe0" : hovered ? "#7f9fd8" : color}
          {...(tex ? { map: tex } : {})}
          transparent={isolate}
          opacity={isolate ? 0.28 : 1}
          roughness={0.55}
          metalness={0.12}
          emissive={selected ? "#1d4ed8" : "#000000"}
          emissiveIntensity={selected ? 0.22 : 0}
        />
      </mesh>

      {/* floor bands (clickable slabs, sampled for tall towers) */}
      {selected &&
        Array.from({ length: property.floors }).map((_, i) => {
          const f = i + 1;
          const active = activeFloor === f;
          return (
            <mesh
              key={f}
              position={[0, i * FLOOR_H + FLOOR_H / 2 + 0.05, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onFloor?.(f);
              }}
              scale={active ? [1.16, 1, 1.16] : [1.005, 1, 1.005]}
              castShadow={active}
            >
              <boxGeometry args={[w, FLOOR_H * 0.86, d]} />
              <meshStandardMaterial
                color={active ? "#f0a532" : "#3b6fe0"}
                transparent
                opacity={active ? 1 : 0.001}
                emissive={active ? "#f0a532" : "#000000"}
                emissiveIntensity={active ? 0.35 : 0}
              />
            </mesh>
          );
        })}

      {/* roof + services */}
      <mesh position={[0, h + 0.11, 0]} castShadow>
        <boxGeometry args={[w * 1.05, 0.12, d * 1.05]} />
        <meshStandardMaterial color={selected ? "#1e3a72" : "#59657d"} />
      </mesh>
      <mesh position={[w * 0.18, h + 0.28, d * 0.14]} castShadow>
        <boxGeometry args={[w * 0.28, 0.22, d * 0.24]} />
        <meshStandardMaterial color="#7c8798" />
      </mesh>

      {(selected || hovered) && showLabel && (
        <Html center distanceFactor={34} position={[0, h + 0.95, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow">
            {property.plotNumber} · {property.ulpin.slice(-8)}
          </div>
        </Html>
      )}
    </group>
  );
}
