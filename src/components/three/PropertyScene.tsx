import * as React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import type { Property } from "@/lib/ulpin";

const FLOOR_H = 0.55;
const PLOT = 1.6;

function FloorStack({
  property,
  selected,
  activeFloor,
  onSelect,
  onFloor,
  position,
}: {
  property: Property;
  selected: boolean;
  activeFloor: number | null;
  onSelect?: () => void;
  onFloor?: (f: number) => void;
  position: [number, number, number];
}) {
  const w = PLOT * 0.62;
  return (
    <group position={position}>
      {/* plot boundary */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[PLOT, PLOT]} />
        <meshStandardMaterial color={selected ? "#c7d7f5" : "#d9dde5"} />
      </mesh>
      <lineSegments position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <edgesGeometry args={[new THREE.PlaneGeometry(PLOT, PLOT)]} />
        <lineBasicMaterial color={selected ? "#2f5fd0" : "#9aa4b5"} />
      </lineSegments>

      {Array.from({ length: property.floors }).map((_, i) => {
        const isActive = activeFloor === i + 1;
        return (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[0, FLOOR_H * i + FLOOR_H / 2 + 0.02, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
              onFloor?.(i + 1);
            }}
            scale={isActive ? [1.06, 1, 1.06] : [1, 1, 1]}
          >
            <boxGeometry args={[w, FLOOR_H * 0.92, w]} />
            <meshStandardMaterial
              color={isActive ? "#f0a532" : selected ? "#3b6fe0" : "#8ea2c4"}
              roughness={0.55}
              metalness={0.08}
            />
          </mesh>
        );
      })}

      {/* roof */}
      <mesh position={[0, FLOOR_H * property.floors + 0.06, 0]} castShadow>
        <boxGeometry args={[w * 1.06, 0.08, w * 1.06]} />
        <meshStandardMaterial color={selected ? "#1e3a72" : "#5c6b85"} />
      </mesh>

      {selected && (
        <Html center distanceFactor={12} position={[0, FLOOR_H * property.floors + 0.7, 0]}>
          <div className="whitespace-nowrap rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow">
            {property.plotNumber}
          </div>
        </Html>
      )}
    </group>
  );
}



function Ground() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#eef1f6" />
      </mesh>
      {/* roads */}
      {[-1, 1].map((s) => (
        <mesh key={`h${s}`} rotation-x={-Math.PI / 2} position={[0, 0.005, s * 1.15]}>
          <planeGeometry args={[30, 0.7]} />
          <meshStandardMaterial color="#c3c9d4" />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`v${s}`} rotation-x={-Math.PI / 2} position={[s * 1.15, 0.005, 0]}>
          <planeGeometry args={[0.7, 30]} />
          <meshStandardMaterial color="#c3c9d4" />
        </mesh>
      ))}
    </>
  );
}

export default function PropertyScene({
  properties,
  selectedId,
  activeFloor,
  onSelect,
  onFloor,
  single = false,
}: {
  properties: Property[];
  selectedId?: string | null;
  activeFloor?: number | null;
  onSelect?: (id: string) => void;
  onFloor?: (f: number) => void;
  single?: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: single ? [4, 4, 5] : [8, 7, 9], fov: 45 }}
      onPointerMissed={() => onSelect?.("")}
    >
      <color attach="background" args={["#f4f6fa"]} />
      <fog attach="fog" args={["#f4f6fa", 22, 45]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Environment>
        <Lightformer intensity={1.6} position={[0, 6, 0]} scale={[12, 12, 1]} />
        <Lightformer
          intensity={0.8}
          color="#a8c0e8"
          position={[-6, 2, -2]}
          rotation-y={Math.PI / 2}
          scale={[16, 2, 1]}
        />
      </Environment>

      {!single && <Ground />}
      {single && (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color="#eef1f6" />
        </mesh>
      )}

      {properties.map((p) => (
        <FloorStack
          key={p.id}
          property={p}
          position={single ? [0, 0, 0] : [p.gx * 1.35, 0, p.gz * 1.35]}
          selected={single || selectedId === p.id}
          activeFloor={single || selectedId === p.id ? (activeFloor ?? null) : null}
          onSelect={() => onSelect?.(p.id)}
          onFloor={onFloor}
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan={!single}
        minDistance={3}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
