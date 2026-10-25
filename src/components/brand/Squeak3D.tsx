"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Squeak in 3D, costruito con primitive (niente file .glb da scaricare).
 * - "showcase": si dondola, segue il puntatore e si gira trascinandolo
 * - "turntable": ruota su sé stesso
 * - "flip": salta, fa una capriola e atterra (splash, una volta)
 * - "spin": piroetta e saluta con la zampa (splash, una volta)
 */
export type Squeak3DMode = "showcase" | "turntable" | "flip" | "spin";

const C = {
  fur: "#c3cad8",
  furDark: "#8e97ab",
  belly: "#e3e7ef",
  pink: "#ff9fbb",
  nose: "#ff6f9a",
  eye: "#111116",
};

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function Tail() {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.45, -0.95),
      new THREE.Vector3(0, 0.25, -1.55),
      new THREE.Vector3(0.15, 0.7, -2.05),
      new THREE.Vector3(0.1, 1.2, -1.85),
      new THREE.Vector3(-0.05, 1.35, -1.5),
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.06, 10, false);
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={C.pink} roughness={0.5} />
    </mesh>
  );
}

function Ear({ side }: { side: 1 | -1 }) {
  return (
    <group position={[0.58 * side, 2.48, 0.05]} rotation={[0.15, 0, -0.35 * side]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.1, 32]} />
        <meshStandardMaterial color={C.furDark} roughness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 32]} />
        <meshStandardMaterial color={C.pink} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Model({ mode }: { mode: Squeak3DMode }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Mesh>(null);
  const drag = useRef({ active: false, lastX: 0, velocity: 0, yaw: 0 });
  const start = useRef<number | null>(null);

  useFrame((state, dt) => {
    if (!root.current || !body.current) return;
    const t = state.clock.elapsedTime;
    start.current ??= t;
    const local = t - start.current;

    // battito di ciglia ogni ~3.5 s
    const blink = (t % 3.5) > 3.38 ? 0.15 : 1;
    if (eyes.current) eyes.current.scale.y = blink;
    if (arm.current) arm.current.rotation.z = 0;

    if (mode === "showcase") {
      const d = drag.current;
      if (!d.active) {
        // inerzia dopo il trascinamento
        d.yaw += d.velocity;
        d.velocity *= 0.94;
      }
      // guarda un po' verso il puntatore e ondeggia
      root.current.rotation.y = d.yaw + state.pointer.x * 0.45 + Math.sin(t * 0.6) * 0.15;
      body.current.position.y = Math.sin(t * 2) * 0.05;
      body.current.rotation.z = Math.sin(t * 1.2) * 0.04;
      root.current.rotation.x = -state.pointer.y * 0.12;
    } else if (mode === "turntable") {
      root.current.rotation.y += dt * 1.1;
      body.current.position.y = Math.abs(Math.sin(t * 3)) * 0.12;
    } else if (mode === "flip") {
      // 0-0.4s carica, 0.4-1.3s salto con capriola, poi atterraggio e saluto
      const squash = local < 0.4 ? Math.sin((local / 0.4) * Math.PI) * 0.18 : 0;
      const p = clamp01((local - 0.4) / 0.9);
      const jump = Math.sin(p * Math.PI) * 1.6;
      body.current.position.y = jump;
      body.current.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
      body.current.rotation.x = -easeOut(p) * Math.PI * 2;
      root.current.rotation.y = 0.5 + easeOut(clamp01((local - 1.3) / 0.8)) * -0.5;
      if (arm.current && local > 1.6) arm.current.rotation.z = Math.sin(local * 14) * 0.5 + 0.8;
    } else {
      // spin: piroetta completa con un saltello, poi saluto
      const p = clamp01(local / 1.4);
      root.current.rotation.y = easeOut(p) * Math.PI * 2;
      body.current.position.y = Math.sin(p * Math.PI) * 0.5;
      if (arm.current && local > 1.4) arm.current.rotation.z = Math.sin(local * 14) * 0.5 + 0.8;
    }
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (mode !== "showcase") return;
    e.stopPropagation();
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = (e.clientX - d.lastX) * 0.012;
    d.lastX = e.clientX;
    d.yaw += dx;
    d.velocity = dx;
  };
  const onUp = () => {
    drag.current.active = false;
  };

  return (
    <group ref={root} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      {/* ombra a terra */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 40]} />
        <meshBasicMaterial color="#000" transparent opacity={0.28} />
      </mesh>

      <group ref={body}>
        <group position={[0, 0, 0]}>
          {/* corpo */}
          <mesh position={[0, 0.9, 0]} scale={[1, 0.88, 1.12]}>
            <sphereGeometry args={[1, 40, 32]} />
            <meshStandardMaterial color={C.fur} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.8, 0.55]} scale={[0.82, 0.78, 0.55]}>
            <sphereGeometry args={[0.8, 32, 24]} />
            <meshStandardMaterial color={C.belly} roughness={0.8} />
          </mesh>

          {/* zampe */}
          {[-1, 1].map((s) => (
            <mesh key={`f${s}`} position={[0.42 * s, 0.1, 0.45]} scale={[0.28, 0.13, 0.42]}>
              <sphereGeometry args={[1, 20, 16]} />
              <meshStandardMaterial color={C.pink} roughness={0.55} />
            </mesh>
          ))}
          <mesh position={[-0.78, 1.05, 0.45]}>
            <sphereGeometry args={[0.16, 20, 16]} />
            <meshStandardMaterial color={C.pink} roughness={0.55} />
          </mesh>
          <group position={[0.74, 1.12, 0.42]}>
            <mesh ref={arm} position={[0, 0, 0]}>
              <sphereGeometry args={[0.16, 20, 16]} />
              <meshStandardMaterial color={C.pink} roughness={0.55} />
            </mesh>
          </group>

          <Tail />

          {/* testa */}
          <mesh position={[0, 1.9, 0.3]} scale={[1, 0.94, 0.98]}>
            <sphereGeometry args={[0.78, 40, 32]} />
            <meshStandardMaterial color={C.fur} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.74, 0.92]} scale={[0.82, 0.7, 1.05]}>
            <sphereGeometry args={[0.45, 32, 24]} />
            <meshStandardMaterial color={C.belly} roughness={0.75} />
          </mesh>
          <mesh position={[0, 1.8, 1.4]}>
            <sphereGeometry args={[0.13, 20, 16]} />
            <meshStandardMaterial color={C.nose} roughness={0.35} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={`c${s}`} position={[0.42 * s, 1.72, 0.98]}>
              <sphereGeometry args={[0.1, 16, 12]} />
              <meshStandardMaterial color={C.pink} transparent opacity={0.6} />
            </mesh>
          ))}
          <group ref={eyes} position={[0, 2.03, 0]}>
            {[-1, 1].map((s) => (
              <group key={`e${s}`} position={[0.29 * s, 0, 0.93]}>
                <mesh scale={[1, 1.25, 0.6]}>
                  <sphereGeometry args={[0.12, 20, 16]} />
                  <meshStandardMaterial color={C.eye} roughness={0.2} />
                </mesh>
                <mesh position={[-0.03 * s, 0.05, 0.07]}>
                  <sphereGeometry args={[0.035, 10, 8]} />
                  <meshBasicMaterial color="#fff" />
                </mesh>
              </group>
            ))}
          </group>
          {/* baffi */}
          {[-1, 1].map((s) =>
            [-0.12, 0, 0.12].map((tilt) => (
              <mesh key={`w${s}${tilt}`} position={[0.42 * s, 1.75, 1.18]} rotation={[0, 0, Math.PI / 2 + tilt * s]}>
                <cylinderGeometry args={[0.008, 0.008, 0.6, 4]} />
                <meshBasicMaterial color="#6b7286" />
              </mesh>
            )),
          )}
          <Ear side={-1} />
          <Ear side={1} />
        </group>
      </group>
    </group>
  );
}

export default function Squeak3D({ mode = "showcase", className }: { mode?: Squeak3DMode; className?: string }) {
  return (
    <div className={className} style={{ touchAction: mode === "showcase" ? "pan-y" : undefined }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.7, 6.4], fov: 34 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ camera }) => camera.lookAt(0, 1.25, 0)}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 6, 5]} intensity={1.7} />
        <directionalLight position={[-4, 3, -4]} intensity={0.9} color="#9999ff" />
        <pointLight position={[0, 1, 4]} intensity={6} color="#ffd9e6" distance={8} />
        <Model mode={mode} />
      </Canvas>
    </div>
  );
}
