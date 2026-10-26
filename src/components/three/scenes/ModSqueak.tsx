"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stage } from "../Stage";
import { Shadow, SqueakModel, createRig, easeInOut, phase, type SqueakRig } from "../SqueakModel";

// Squeak "moderatore": ciccione, sdraiato come Snorlax con la pancia al
// vento, barba storta, briciole intorno alla bocca e maglietta strappata.
// Ogni tanto si mette a rotolare avanti e indietro.

const CYCLE = 10;
const IDENTITY = new THREE.Quaternion();

function useShirtTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#f1e7c4";
    g.fillRect(0, 0, 256, 256);
    // macchie di unto e di bibita
    const stains: [number, number, number, string][] = [
      [60, 120, 22, "rgba(150,105,50,.45)"],
      [170, 150, 30, "rgba(120,80,40,.4)"],
      [120, 80, 14, "rgba(190,120,40,.5)"],
      [210, 70, 18, "rgba(140,95,45,.35)"],
      [40, 190, 16, "rgba(120,90,50,.4)"],
    ];
    for (const [x, y, r, col] of stains) {
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(x, y, r, r * 0.7, x * 0.03, 0, Math.PI * 2);
      g.fill();
    }
    // strappi: buchi trasparenti dai bordi frastagliati
    g.globalCompositeOperation = "destination-out";
    const hole = (cx: number, cy: number, r: number) => {
      g.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rr = r * (0.55 + ((i * 37) % 10) / 18);
        g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8);
      }
      g.fill();
    };
    hole(95, 165, 20);
    hole(185, 105, 14);
    hole(140, 205, 18);
    hole(30, 90, 10);
    // orlo in basso tutto sfilacciato
    g.beginPath();
    g.moveTo(0, 256);
    for (let x = 0; x <= 256; x += 14) g.lineTo(x, 236 - ((x * 13) % 30));
    g.lineTo(256, 256);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/** Maglietta strappata e pancione che esce di sotto. */
function Outfit() {
  const shirt = useShirtTexture();
  return (
    <group>
      <mesh position={[0, 0.98, 0]} scale={[1.04, 0.92, 1.16]}>
        <sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, Math.PI * 0.12, Math.PI * 0.5]} />
        <meshStandardMaterial map={shirt} transparent alphaTest={0.4} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* pancione */}
      <mesh position={[0, 0.62, 0.62]} scale={[0.9, 0.72, 0.62]}>
        <sphereGeometry args={[1, 36, 28]} />
        <meshStandardMaterial color="#e3e7ef" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.55, 1.23]} scale={[1, 1.3, 0.5]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial color="#9aa1b3" />
      </mesh>
      {/* briciole sulla pancia */}
      {[
        [0.25, 0.95, 1.12],
        [-0.3, 0.8, 1.15],
        [0.1, 0.7, 1.22],
        [-0.12, 1.05, 1.05],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color="#e9b04a" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Barba storta a ciuffi (coordinate della testa) e briciole intorno alla bocca. */
function Beard() {
  const tufts: [number, number, number, number][] = [
    // x, lunghezza, inclinazione, spessore
    [-0.36, 0.38, -0.2, 0.12],
    [-0.22, 0.62, -0.1, 0.14],
    [-0.06, 0.82, -0.04, 0.15],
    [0.1, 0.7, 0.05, 0.14],
    [0.26, 0.48, 0.14, 0.12],
    [0.4, 0.28, 0.25, 0.1],
  ];
  return (
    <group>
      <group position={[0.14, -0.4, 0.9]} rotation={[0.1, 0, 0.32]}>
        {tufts.map(([x, len, tilt, w], i) => (
          <mesh key={i} position={[x, -len / 2, Math.abs(x) * -0.3]} rotation={[Math.PI, 0, tilt]}>
            <coneGeometry args={[w, len, 7]} />
            <meshStandardMaterial color="#6b5038" roughness={1} />
          </mesh>
        ))}
        {/* peli sparsi sulle guance (a chiazze) */}
        {[
          [-0.48, 0.18],
          [0.5, 0.25],
          [-0.42, 0.32],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, -0.1]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#6b5038" roughness={1} />
          </mesh>
        ))}
      </group>
      {/* briciole intorno alla bocca */}
      {[
        [-0.18, -0.3, 1.0],
        [0.15, -0.34, 1.0],
        [0.05, -0.42, 0.97],
        [-0.28, -0.22, 0.95],
        [0.3, -0.24, 0.95],
        [-0.06, -0.24, 1.07],
        [0.22, -0.12, 1.02],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.03 + (i % 3) * 0.008, 8, 6]} />
          <meshStandardMaterial color="#e9b04a" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function ModSqueak() {
  const rig = useRef<SqueakRig>(createRig());
  const pos = useRef<THREE.Group>(null);
  const roll = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Group>(null);
  const walk = useRef({ mode: "rest" as "rest" | "roll", wait: 1.5, pos: new THREE.Vector3(1, 0, 0), target: new THREE.Vector3(), q: new THREE.Quaternion() });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime % CYCLE;
    void easeInOut;
    void phase;
    const r = rig.current;
    // respiro profondo da dormiglione
    const breath = Math.sin(state.clock.elapsedTime * 1.6);
    if (r.body) {
      r.body.rotation.x = -0.32;
      r.body.scale.set(1 + breath * 0.015, 1 + breath * 0.025, 1 + breath * 0.02);
    }
    if (r.head) r.head.rotation.set(0.15, 0, 0.22 + breath * 0.03);
    // braccia sulla pancia, una si gratta
    if (r.armL) r.armL.rotation.set(-0.7, 0, -0.55);
    if (r.armR) r.armR.rotation.set(-0.85 + Math.max(0, Math.sin(state.clock.elapsedTime * 6)) * 0.25 * (t > 3 && t < 5 ? 1 : 0), 0, 0.5);

    // rotola in giro a caso: sceglie un punto, ci arriva rotolando, si riassesta e riposa
    const w = walk.current;
    const dt = Math.min(0.05, delta || 1 / 60);
    if (w.mode === "rest") {
      w.wait -= dt;
      w.q.slerp(IDENTITY, Math.min(1, dt * 4));
      if (w.wait <= 0) {
        w.target.set(-2.2 + Math.random() * 6.6, 0, -1.6 + Math.random() * 2.8);
        w.mode = "roll";
      }
    } else {
      const to = w.target.clone().sub(w.pos);
      const dist = to.length();
      if (dist < 0.05) {
        w.mode = "rest";
        w.wait = 1.2 + Math.random() * 2.5;
      } else {
        const step = Math.min(dist, (1.2 + Math.min(dist, 2) * 0.6) * dt);
        to.normalize();
        w.pos.addScaledVector(to, step);
        // asse di rotolamento: perpendicolare alla direzione, sul pavimento
        const axis = new THREE.Vector3(to.z, 0, -to.x).normalize();
        w.q.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, step / 1.05));
      }
    }
    const rolling = w.mode === "roll";
    const bounce = rolling ? Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.08 : 0;
    if (pos.current) pos.current.position.set(w.pos.x, 1.05 + bounce, w.pos.z);
    if (roll.current) roll.current.quaternion.copy(w.q);
    if (shadow.current) shadow.current.position.set(w.pos.x, 0, w.pos.z);
  });

  return (
    <>
      <group ref={pos}>
        <group ref={roll}>
          {/* ciccione: più largo e più profondo */}
          <group position={[0, -1.05, 0]} scale={[1.32, 1.02, 1.28]}>
            <SqueakModel rig={rig} sitting sleepy outfit={<Outfit />} hat={<Beard />} />
          </group>
        </group>
      </group>
      <group ref={shadow}>
        <Shadow radius={1.6} opacity={0.35} />
      </group>
    </>
  );
}

export default function ModSqueakScene({ className }: { className?: string }) {
  return (
    <Stage eager className={className} camera={[0.2, 2.6, 8.6]} target={[1.2, 1.35, 0]} fov={32}>
      <ModSqueak />
    </Stage>
  );
}
