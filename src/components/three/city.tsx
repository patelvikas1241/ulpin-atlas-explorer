import * as React from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { METRO, PARKS, ROADS, project, type LatLon } from "@/lib/ulpin";

const pts = (path: LatLon[]) => path.map(([la, lo]) => project(la, lo));

function Ribbon({
  path,
  width,
  color,
  y,
  dashed,
}: {
  path: LatLon[];
  width: number;
  color: string;
  y: number;
  dashed?: boolean;
}) {
  const p = React.useMemo(() => pts(path), [path]);
  return (
    <group>
      {p.slice(0, -1).map((a, i) => {
        const b = p[i + 1]!;
        const dx = b[0] - a[0];
        const dz = b[1] - a[1];
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dz, dx);
        return (
          <group key={i} position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation-y={-angle}>
            <mesh rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[len, width]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
            {dashed && (
              <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
                <planeGeometry args={[len * 0.94, width * 0.05]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function Roads({ labels }: { labels: boolean }) {
  return (
    <group>
      {ROADS.map((r) => {
        const mid = r.path[Math.floor(r.path.length / 2)]!;
        const [mx, mz] = project(mid[0], mid[1]);
        return (
          <group key={r.name}>
            <Ribbon path={r.path} width={r.width} color="#b9c0cc" y={0.03} dashed />
            {labels && (
              <Html
                center
                position={[mx, 0.5, mz]}
                distanceFactor={40}
                style={{ pointerEvents: "none" }}
              >
                <span className="whitespace-nowrap rounded bg-background/85 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shadow-sm">
                  {r.name}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function Metro({ labels }: { labels: boolean }) {
  const p = React.useMemo(() => pts(METRO.path), []);
  return (
    <group>
      {/* elevated viaduct */}
      {p.slice(0, -1).map((a, i) => {
        const b = p[i + 1]!;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        return (
          <group key={i} position={[(a[0] + b[0]) / 2, 1.5, (a[1] + b[1]) / 2]} rotation-y={-angle}>
            <mesh castShadow>
              <boxGeometry args={[len, 0.16, 0.5]} />
              <meshStandardMaterial color="#5b6b86" roughness={0.6} metalness={0.2} />
            </mesh>
          </group>
        );
      })}
      {/* piers */}
      {p.map((a, i) => (
        <mesh key={`pier-${i}`} position={[a[0], 0.75, a[1]]} castShadow>
          <cylinderGeometry args={[0.11, 0.14, 1.5, 8]} />
          <meshStandardMaterial color="#8a94a6" />
        </mesh>
      ))}
      {METRO.stations.map((s) => {
        const [x, z] = project(s.at[0], s.at[1]);
        return (
          <group key={s.name} position={[x, 0, z]}>
            <mesh position={[0, 1.85, 0]} castShadow>
              <boxGeometry args={[1.1, 0.5, 0.85]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
            </mesh>
            <mesh position={[0, 2.16, 0]}>
              <boxGeometry args={[1.25, 0.08, 1.0]} />
              <meshStandardMaterial color="#e0393e" />
            </mesh>
            {labels && (
              <Html center position={[0, 2.7, 0]} distanceFactor={40} style={{ pointerEvents: "none" }}>
                <span className="whitespace-nowrap rounded bg-[#e0393e] px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
                  M · {s.name}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.25, 5]} />
        <meshStandardMaterial color="#7a5c3e" />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <icosahedronGeometry args={[0.19, 0]} />
        <meshStandardMaterial color="#4a7c4a" flatShading />
      </mesh>
    </group>
  );
}

export function Parks({ labels }: { labels: boolean }) {
  return (
    <group>
      {PARKS.map((park) => {
        const [x, z] = project(park.at[0], park.at[1]);
        const trees = React.Children.toArray(
          Array.from({ length: park.water ? 0 : 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <Tree
                key={i}
                position={[
                  x + Math.cos(a) * park.w * 0.32,
                  0,
                  z + Math.sin(a * 1.7) * park.d * 0.3,
                ]}
              />
            );
          }),
        );
        return (
          <group key={park.name}>
            <mesh rotation-x={-Math.PI / 2} position={[x, 0.02, z]} receiveShadow>
              <planeGeometry args={[park.w, park.d]} />
              <meshStandardMaterial
                color={park.water ? "#8ec5e8" : "#cfe4c2"}
                roughness={park.water ? 0.15 : 0.95}
                metalness={park.water ? 0.35 : 0}
              />
            </mesh>
            {trees}
            {labels && (
              <Html center position={[x, 0.6, z]} distanceFactor={40} style={{ pointerEvents: "none" }}>
                <span className="whitespace-nowrap rounded bg-background/85 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 shadow-sm">
                  {park.name}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[220, 220]} />
      <meshStandardMaterial color="#eceff5" roughness={1} />
    </mesh>
  );
}

export function makeWindowTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "#33415577";
  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 4; col++) {
      ctx.fillRect(col * 16 + 4, r * 16 + 5, 9, 7);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
