"use client";

import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Squeak in 3D, costruito con primitive (niente file .glb da scaricare).
// Altezza ~3 unità, piedi a y=0, guarda verso +z (la camera).
// Le scene lo muovono tramite il "rig": gruppi per corpo, testa, braccia e gambe.

export const SQUEAK_COLORS = {
  fur: "#c3cad8",
  furDark: "#8e97ab",
  belly: "#e3e7ef",
  pink: "#ff9fbb",
  nose: "#ff6f9a",
  eye: "#111116",
};
const C = SQUEAK_COLORS;

export interface SqueakRig {
  body: THREE.Group | null;
  head: THREE.Group | null;
  armL: THREE.Group | null;
  armR: THREE.Group | null;
  footL: THREE.Group | null;
  footR: THREE.Group | null;
}

export const createRig = (): SqueakRig => ({ body: null, head: null, armL: null, armR: null, footL: null, footR: null });

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
    <group position={[0.58 * side, 0.58, -0.25]} rotation={[0.15, 0, -0.35 * side]}>
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

/** Braccio con perno sulla spalla: rotation.x negativa lo alza in avanti. */
function Arm({ side, refCb, children }: { side: 1 | -1; refCb: (g: THREE.Group | null) => void; children?: ReactNode }) {
  return (
    <group ref={refCb} position={[0.7 * side, 1.3, 0.35]}>
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.1, 0.11, 0.42, 12]} />
        <meshStandardMaterial color={C.fur} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.47, 0]}>
        <sphereGeometry args={[0.15, 20, 16]} />
        <meshStandardMaterial color={C.pink} roughness={0.55} />
      </mesh>
      {/* punto in cui la zampa tiene gli oggetti */}
      <group position={[0, -0.55, 0.05]}>{children}</group>
    </group>
  );
}

export function SqueakModel({
  rig,
  sitting = false,
  wow = false,
  sleepy = false,
  angry = false,
  leftHand,
  rightHand,
  hat,
  outfit,
}: {
  rig?: MutableRefObject<SqueakRig>;
  sitting?: boolean;
  wow?: boolean;
  /** occhi chiusi (dorme) */
  sleepy?: boolean;
  /** sopracciglia aggrottate e guance rosse */
  angry?: boolean;
  leftHand?: ReactNode;
  rightHand?: ReactNode;
  /** accessorio in testa (coordinate della testa, centro a y=0) */
  hat?: ReactNode;
  /** accessorio sul corpo (es. gilet) */
  outfit?: ReactNode;
}) {
  const eyes = useRef<THREE.Group>(null);
  const set = (key: keyof SqueakRig) => (g: THREE.Group | null) => {
    if (rig) rig.current[key] = g;
  };

  // battito di ciglia ogni ~3.5 s
  useFrame((state) => {
    if (eyes.current) eyes.current.scale.y = sleepy ? 0.12 : angry ? 0.72 : state.clock.elapsedTime % 3.5 > 3.38 ? 0.15 : 1;
  });

  const eyeScale = wow ? 1.25 : 1;

  return (
    <group ref={set("body")}>
      {/* corpo */}
      <mesh position={[0, 0.9, 0]} scale={[1, 0.88, 1.12]}>
        <sphereGeometry args={[1, 40, 32]} />
        <meshStandardMaterial color={C.fur} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.8, 0.55]} scale={[0.82, 0.78, 0.55]}>
        <sphereGeometry args={[0.8, 32, 24]} />
        <meshStandardMaterial color={C.belly} roughness={0.8} />
      </mesh>
      {outfit}

      {/* zampe: da seduto vanno in avanti */}
      {([-1, 1] as const).map((s) => (
        <group
          key={s}
          ref={set(s === -1 ? "footL" : "footR")}
          position={sitting ? [0.42 * s, 0.45, 1.0] : [0.42 * s, 0.1, 0.45]}
        >
          <mesh scale={[0.28, 0.13, 0.42]} rotation={sitting ? [-0.9, 0, 0] : [0, 0, 0]}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color={C.pink} roughness={0.55} />
          </mesh>
        </group>
      ))}

      <Arm side={-1} refCb={set("armL")}>
        {leftHand}
      </Arm>
      <Arm side={1} refCb={set("armR")}>
        {rightHand}
      </Arm>

      <Tail />

      {/* testa: gruppo separato così può girarsi e annuire */}
      <group ref={set("head")} position={[0, 1.9, 0.3]}>
        <mesh scale={[1, 0.94, 0.98]}>
          <sphereGeometry args={[0.78, 40, 32]} />
          <meshStandardMaterial color={C.fur} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.16, 0.62]} scale={[0.82, 0.7, 1.05]}>
          <sphereGeometry args={[0.45, 32, 24]} />
          <meshStandardMaterial color={C.belly} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.1, 1.1]}>
          <sphereGeometry args={[0.13, 20, 16]} />
          <meshStandardMaterial color={C.nose} roughness={0.35} />
        </mesh>
        {([-1, 1] as const).map((s) => (
          <mesh key={`c${s}`} position={[0.42 * s, -0.18, 0.68]} scale={angry ? 1.6 : 1}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={angry ? "#ff4d5e" : C.pink} transparent opacity={angry ? 0.75 : 0.6} />
          </mesh>
        ))}
        {/* sopracciglia arrabbiate */}
        {angry &&
          ([-1, 1] as const).map((s) => (
            <mesh key={`b${s}`} position={[0.27 * s, 0.36, 0.7]} rotation={[0.2, 0, 0.55 * s]}>
              <boxGeometry args={[0.3, 0.07, 0.06]} />
              <meshStandardMaterial color={C.eye} roughness={0.4} />
            </mesh>
          ))}
        <group ref={eyes} position={[0, 0.13, 0]}>
          {([-1, 1] as const).map((s) => (
            <group key={`e${s}`} position={[0.29 * s, 0, 0.63]} scale={eyeScale}>
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
        {([-1, 1] as const).map((s) =>
          [-0.12, 0, 0.12].map((tilt) => (
            <mesh key={`w${s}${tilt}`} position={[0.42 * s, -0.15, 0.88]} rotation={[0, 0, Math.PI / 2 + tilt * s]}>
              <cylinderGeometry args={[0.008, 0.008, 0.6, 4]} />
              <meshBasicMaterial color="#6b7286" />
            </mesh>
          )),
        )}
        <Ear side={-1} />
        <Ear side={1} />
        {hat}
      </group>
    </group>
  );
}

/** Ombra morbida a terra sotto Squeak. */
export function Shadow({ radius = 1.1, opacity = 0.3 }: { radius?: number; opacity?: number }) {
  return (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 40]} />
      <meshBasicMaterial color="#000" transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

// --- piccole funzioni di animazione condivise dalle scene ---
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Avanzamento 0→1 di t dentro la finestra [from, to]. */
export const phase = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));

/** Passo di camminata: piedi alternati e corpo che sobbalza. */
export function walkCycle(rig: SqueakRig, t: number, speed = 9, amount = 1) {
  const s = Math.sin(t * speed) * amount;
  if (rig.footL) rig.footL.position.z = 0.45 + s * 0.25;
  if (rig.footR) rig.footR.position.z = 0.45 - s * 0.25;
  if (rig.body) rig.body.position.y = Math.abs(Math.cos(t * speed)) * 0.08 * amount;
  if (rig.armL) rig.armL.rotation.x = -s * 0.4;
  if (rig.armR) rig.armR.rotation.x = s * 0.4;
}

/** Riporta il rig in posa neutra (in piedi, braccia giù). */
export function resetRig(rig: SqueakRig) {
  if (rig.footL) rig.footL.position.z = 0.45;
  if (rig.footR) rig.footR.position.z = 0.45;
  if (rig.body) {
    rig.body.position.set(0, 0, 0);
    rig.body.rotation.set(0, 0, 0);
    rig.body.scale.set(1, 1, 1);
  }
  rig.armL?.rotation.set(0, 0, 0);
  rig.armR?.rotation.set(0, 0, 0);
  rig.head?.rotation.set(0, 0, 0);
}
