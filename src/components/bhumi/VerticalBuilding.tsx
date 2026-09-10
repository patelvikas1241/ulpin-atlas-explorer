import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { floorLabel, typeColor, type DemoProperty } from "@/lib/bhumi";

const SLAB_H = 0.34;

function Slab({
  y,
  target,
  w,
  d,
  color,
  active,
  label,
  onClick,
  showLabel,
}: {
  y: number;
  target: number;
  w: number;
  d: number;
  color: string;
  active: boolean;
  label: string;
  onClick: () => void;
  showLabel: boolean;
}) {
  const ref = React.useRef<THREE.Group>(null);
  const [hover, setHover] = React.useState(false);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.position.y += (target - g.position.y) * Math.min(1, dt * 4);
  });
  return (
    <group ref={ref} position={[0, y, 0]}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
        scale={active ? [1.12, 1, 1.12] : [1, 1, 1]}
      >
        <boxGeometry args={[w, SLAB_H, d]} />
        <meshStandardMaterial
          color={active ? "#f0a532" : hover ? "#7f9fd8" : color}
          roughness={0.5}
          metalness={0.15}
          emissive={active ? "#f0a532" : "#000000"}
          emissiveIntensity={active ? 0.4 : 0}
        />
      </mesh>
      {showLabel && (
        <Html
          center
          distanceFactor={9}
          position={[w * 0.95, 0, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold shadow ${
              active ? "bg-amber-500 text-white" : "bg-card text-foreground"
            }`}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function VerticalBuilding({
  property,
  exploded,
  activeFloor,
  onFloor,
}: {
  property: DemoProperty;
  exploded: boolean;
  activeFloor: number | null;
  onFloor: (f: number) => void;
}) {
  const floors = Math.min(property.floors, 24);
  const gap = exploded ? SLAB_H * 1.9 : SLAB_H * 1.02;
  const color = typeColor(property.propertyType);
  const totalH = floors * gap;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [4.5, totalH * 0.55 + 2.2, 5.5], fov: 45 }}
      onCreated={({ camera }) => camera.lookAt(0, totalH * 0.4, 0)}
    >
      <color attach="background" args={["#f4f6fa"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 12, 6]} intensity={1.4} castShadow />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#e7ebf2" />
      </mesh>

      {Array.from({ length: floors }).map((_, i) => {
        const f = i + 1;
        return (
          <Slab
            key={f}
            y={SLAB_H * 1.02 * i + 0.25}
            target={gap * i + 0.25}
            w={2.2}
            d={1.7}
            color={color}
            active={activeFloor === f}
            label={floorLabel(f)}
            showLabel={exploded || activeFloor === f}
            onClick={() => onFloor(f)}
          />
        );
      })}

      <OrbitControls
        makeDefault
        target={[0, totalH * 0.4, 0]}
        minDistance={3}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
