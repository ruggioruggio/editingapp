"use client";

import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

function Fur({ color, rough = 0.85 }: { color: string; rough?: number }) {
  return <meshPhysicalMaterial color={color} roughness={rough} sheen={1} sheenRoughness={0.55} sheenColor="#ffffff" />;
}

function Gloss({ color }: { color: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} clearcoatRoughness={0.08} />;
}

function blinkAt(t: number) {
  const u = (t % 3.8) / 3.8;
  if (u < 0.955) return 1;
  const k = (u - 0.955) / 0.045;
  return 1 - Math.sin(k * Math.PI) * 0.9;
}

function Tail() {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.45, -0.95),
      new THREE.Vector3(0, 0.25, -1.55),
      new THREE.Vector3(0.15, 0.7, -2.05),
      new THREE.Vector3(0.1, 1.2, -1.85),
      new THREE.Vector3(-0.05, 1.35, -1.5),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.06, 14, false);
  }, []);
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = Math.sin(t * 1.7) * 0.28;
      ref.current.rotation.x = Math.sin(t * 1.3 + 1) * 0.06;
    }
  });
  return (
    <group ref={ref} position={[0, 0.45, -0.95]}>
      <mesh geometry={geometry} position={[0, -0.45, 0.95]}>
        <meshPhysicalMaterial color={C.pink} roughness={0.45} sheen={0.6} />
      </mesh>
    </group>
  );
}

function Ear({ side }: { side: 1 | -1 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + (side > 0 ? 1.3 : 0);
    const twitch = (t % 5.2) / 5.2 > 0.93 ? Math.sin(((t % 5.2) / 5.2 - 0.93) / 0.07 * Math.PI * 2) * 0.18 : 0;
    if (ref.current) ref.current.rotation.z = -0.35 * side + Math.sin(t * 1.1) * 0.04 * side + twitch * side;
  });
  return (
    <group ref={ref} position={[0.58 * side, 0.58, -0.25]} rotation={[0.15, 0, -0.35 * side]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
        <cylinderGeometry args={[0.46, 0.44, 0.1, 48]} />
        <Fur color={C.furDark} rough={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.045]}>
        <cylinderGeometry args={[0.31, 0.3, 0.06, 48]} />
        <meshPhysicalMaterial color={C.pink} roughness={0.6} sheen={0.8} sheenColor="#ffd6e4" />
      </mesh>
    </group>
  );
}

function Arm({ side, refCb, children }: { side: 1 | -1; refCb: (g: THREE.Group | null) => void; children?: ReactNode }) {
  return (
    <group ref={refCb} position={[0.7 * side, 1.3, 0.35]}>
      <mesh position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.1, 0.32, 8, 20]} />
        <Fur color={C.fur} />
      </mesh>
      <mesh position={[0, -0.47, 0]}>
        <sphereGeometry args={[0.15, 32, 24]} />
        <meshPhysicalMaterial color={C.pink} roughness={0.5} sheen={0.6} />
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
  sleepy?: boolean;
  angry?: boolean;
  leftHand?: ReactNode;
  rightHand?: ReactNode;
  hat?: ReactNode;
  outfit?: ReactNode;
}) {
  const eyes = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const set = (key: keyof SqueakRig) => (g: THREE.Group | null) => {
    if (rig) rig.current[key] = g;
  };

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (eyes.current) eyes.current.scale.y = sleepy ? 0.12 : angry ? 0.72 * blinkAt(t) : blinkAt(t);
    if (torso.current) {
      const b = Math.sin(t * 2.1) * 0.014;
      torso.current.scale.set(1 - b * 0.5, 1 + b, 1 - b * 0.5);
    }
  });

  const eyeScale = wow ? 1.25 : 1;

  return (
    <group ref={set("body")}>
      <group ref={torso} position={[0, 0.1, 0]}>
        <mesh position={[0, 0.8, 0]} scale={[1, 0.88, 1.12]}>
          <sphereGeometry args={[1, 64, 48]} />
          <Fur color={C.fur} />
        </mesh>
        <mesh position={[0, 0.7, 0.55]} scale={[0.82, 0.78, 0.55]}>
          <sphereGeometry args={[0.8, 48, 32]} />
          <Fur color={C.belly} rough={0.9} />
        </mesh>
      </group>
      {outfit}

      {/* zampe: da seduto vanno in avanti */}
      {([-1, 1] as const).map((s) => (
        <group
          key={s}
          ref={set(s === -1 ? "footL" : "footR")}
          position={sitting ? [0.42 * s, 0.45, 1.0] : [0.42 * s, 0.1, 0.45]}
        >
          <mesh scale={[0.28, 0.13, 0.42]} rotation={sitting ? [-0.9, 0, 0] : [0, 0, 0]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshPhysicalMaterial color={C.pink} roughness={0.5} sheen={0.6} />
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
          <sphereGeometry args={[0.78, 64, 48]} />
          <Fur color={C.fur} />
        </mesh>
        <mesh position={[0, -0.16, 0.62]} scale={[0.82, 0.7, 1.05]}>
          <sphereGeometry args={[0.45, 48, 32]} />
          <Fur color={C.belly} rough={0.9} />
        </mesh>
        <mesh position={[0, -0.1, 1.1]}>
          <sphereGeometry args={[0.13, 32, 24]} />
          <Gloss color={C.nose} />
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
                <sphereGeometry args={[0.12, 32, 24]} />
                <Gloss color={C.eye} />
              </mesh>
              <mesh position={[-0.03 * s, 0.05, 0.07]}>
                <sphereGeometry args={[0.035, 16, 12]} />
                <meshBasicMaterial color="#fff" toneMapped={false} />
              </mesh>
              <mesh position={[0.035 * s, -0.05, 0.07]}>
                <sphereGeometry args={[0.016, 12, 8]} />
                <meshBasicMaterial color="#fff" toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
        {([-1, 1] as const).map((s) =>
          [-0.12, 0, 0.12].map((tilt) => (
            <mesh key={`w${s}${tilt}`} position={[0.42 * s, -0.15, 0.88]} rotation={[0, 0, Math.PI / 2 + tilt * s]}>
              <cylinderGeometry args={[0.006, 0.009, 0.6, 6]} />
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

let shadowTex: THREE.Texture | null = null;
function softShadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(0.45, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}

export function Shadow({ radius = 1.1, opacity = 0.3 }: { radius?: number; opacity?: number }) {
  const map = useMemo(softShadowTexture, []);
  return (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[radius * 2.6, radius * 2.6]} />
      <meshBasicMaterial map={map} transparent opacity={opacity * 1.6} depthWrite={false} toneMapped={false} color="#000" />
    </mesh>
  );
}

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const phase = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));

export function walkCycle(rig: SqueakRig, t: number, speed = 9, amount = 1) {
  const s = Math.sin(t * speed) * amount;
  if (rig.footL) rig.footL.position.z = 0.45 + s * 0.25;
  if (rig.footR) rig.footR.position.z = 0.45 - s * 0.25;
  if (rig.body) rig.body.position.y = Math.abs(Math.cos(t * speed)) * 0.08 * amount;
  if (rig.armL) rig.armL.rotation.x = -s * 0.4;
  if (rig.armR) rig.armR.rotation.x = s * 0.4;
}

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
