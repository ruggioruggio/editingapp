"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stage } from "../Stage";
import {
  Barrier,
  Bricks,
  Cheese,
  Clapperboard,
  DiscordLogo3D,
  GraphPanel,
  Hammer,
  HardHat,
  KeyframeDiamond,
  SafetyVest,
  TrafficCone,
  WorkSign,
} from "../props";
import { createRig, easeInOut, easeOut, lerp, phase, resetRig, Shadow, SqueakModel, walkCycle } from "../SqueakModel";

// Scene del sito: "diorami" in 3D visti di lato, con la camera che oscilla
// piano per dare profondità. Squeak si muove di profilo e si gira verso di noi.

const PROFILE_RIGHT = Math.PI / 2; // guarda verso +x

/** Gruppo radice che ondeggia lentamente: rende evidente la prospettiva 3D. */
function Diorama({ children, tilt = -0.22 }: { children: ReactNode; tilt?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = tilt + Math.sin(state.clock.elapsedTime * 0.35) * 0.08 + state.pointer.x * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

// 1. Lo scivolo d'acqua: Squeak scende lungo una curva del Graph Editor di After Effects
function SlideScene() {
  const curve = useMemo(
    () =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(-3, 3.1, 0),
        new THREE.Vector3(-1.1, 3.1, 0),
        new THREE.Vector3(0.3, 0.45, 0),
        new THREE.Vector3(2.1, 0.45, 0),
      ),
    [],
  );
  const rail = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.12, 12), [curve]);
  const water = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.22, 20), [curve]);
  // maniglie di Bézier come nel Graph Editor
  const handles = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([curve.v0, curve.v1, curve.v3, curve.v2]);
    const line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: "#ffc93c" }));
    return line;
  }, [curve]);

  const POOL = new THREE.Vector3(2.95, 0.12, 0);
  const slider = useRef<THREE.Group>(null);
  const turn = useRef<THREE.Group>(null);
  const drops = useRef<(THREE.Mesh | null)[]>([]);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime % 5.4;
    const s = slider.current;
    const y = turn.current;
    const r = rig.current;
    if (!s || !y) return;
    resetRig(r);

    if (t < 2.7) {
      // in cima saluta, poi si gira e scivola sempre più veloce (ease-in, come la curva)
      const u = t < 0.9 ? 0 : phase(t, 0.9, 2.7) ** 2;
      const pos = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);
      s.position.set(pos.x, pos.y + 0.2, pos.z);
      s.rotation.z = Math.atan2(tan.y, tan.x);
      y.rotation.y = t < 0.9 ? lerp(0.3, PROFILE_RIGHT, easeInOut(phase(t, 0.5, 0.9))) : PROFILE_RIGHT;
      if (t < 0.6 && r.armR) r.armR.rotation.set(-2.6, 0, 0.3 + Math.sin(t * 14) * 0.35);
      if (t > 0.9 && r.armL && r.armR) {
        r.armL.rotation.set(-2.7, 0, -0.3);
        r.armR.rotation.set(-2.7, 0, 0.3);
      }
    } else {
      // splash nella piscina, poi si gira e ci saluta
      const p = easeOut(phase(t, 2.7, 3.1));
      const end = curve.getPointAt(1);
      s.position.set(lerp(end.x, POOL.x, p), lerp(end.y + 0.2, POOL.y, p) + Math.sin(t * 3) * 0.04, 0);
      s.rotation.z = lerp(s.rotation.z, 0, 0.2);
      y.rotation.y = lerp(PROFILE_RIGHT, 0.15, easeInOut(phase(t, 3.3, 3.8)));
      if (t > 3.8 && r.armR) r.armR.rotation.set(-2.6, 0, 0.3 + Math.sin(t * 14) * 0.35);
    }

    drops.current.forEach((d, i) => {
      if (!d) return;
      const k = t - 2.8;
      if (k < 0 || k > 0.75) {
        d.scale.setScalar(0.001);
        return;
      }
      const a = (i / drops.current.length) * Math.PI * 2;
      d.position.set(POOL.x + Math.cos(a) * k * 1.6, 0.3 + 2.4 * k - 4.8 * k * k, Math.sin(a) * k * 1.1);
      d.scale.setScalar(1);
    });
  });

  return (
    <Diorama tilt={-0.18}>
      {/* tutto un po' più piccolo e spostato a sinistra, così la piscina resta in quadro */}
      <group scale={0.78} position={[-0.45, 0.35, 0]}>
      {/* il grafico sta ben dietro la piscina, così non la taglia */}
      <group position={[0, 1.75, -1.8]}>
        <GraphPanel />
      </group>
      <mesh geometry={rail}>
        <meshStandardMaterial color="#ffc93c" roughness={0.35} />
      </mesh>
      <mesh geometry={water}>
        <meshStandardMaterial color="#5ccfff" transparent opacity={0.45} roughness={0.1} />
      </mesh>
      <primitive object={handles} />
      {[curve.v0, curve.v3].map((v, i) => (
        <mesh key={`k${i}`} position={v} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#ffc93c" emissive="#ffc93c" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {[curve.v1, curve.v2].map((v, i) => (
        <mesh key={`h${i}`} position={v}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshBasicMaterial color="#ffc93c" />
        </mesh>
      ))}
      {/* piscina d'arrivo */}
      <mesh position={[POOL.x, 0.1, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.2, 40]} />
        <meshStandardMaterial color="#5ccfff" transparent opacity={0.75} roughness={0.1} />
      </mesh>
      <mesh position={[POOL.x, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.07, 10, 40]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={`d${i}`}
          ref={(el) => {
            drops.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#9be3ff" transparent opacity={0.85} />
        </mesh>
      ))}
      <group ref={slider}>
        <group ref={turn} scale={0.52}>
          <SqueakModel rig={rig} sitting />
        </group>
      </group>
      </group>
    </Diorama>
  );
}

// 2. Ciak: Squeak alza il ciak, lo batte e guarda verso di noi
function ClapScene() {
  const mouse = useRef<THREE.Group>(null);
  const stick = useRef<THREE.Group>(null);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime % 3.4;
    const r = rig.current;
    if (!mouse.current) return;
    resetRig(r);
    mouse.current.rotation.y = lerp(0.9, 0.25, easeInOut(phase(t, 0, 0.6)));
    if (r.armR) r.armR.rotation.set(-1.5, 0, 0.15);
    if (r.head) r.head.rotation.y = t < 1.2 ? 0.5 : lerp(0.5, -0.3, easeInOut(phase(t, 1.2, 1.6)));
    if (stick.current) {
      const open = t < 0.3 ? 0 : t < 0.9 ? easeOut(phase(t, 0.3, 0.9)) : t < 1.02 ? 1 - phase(t, 0.9, 1.02) : 0;
      stick.current.rotation.z = open * 0.65;
    }
    if (r.body) r.body.position.y = t > 1.02 && t < 1.4 ? Math.sin(phase(t, 1.02, 1.4) * Math.PI) * 0.25 : 0;
  });

  return (
    <Diorama tilt={-0.12}>
      <group ref={mouse} position={[-0.5, 0, 0]} scale={0.8}>
        <Shadow />
        <SqueakModel
          rig={rig}
          rightHand={
            <group position={[0.35, 0.1, 0.35]} rotation={[Math.PI / 2, 0, -0.2]} scale={1.1}>
              <Clapperboard ref={stick} />
            </group>
          }
        />
      </group>
    </Diorama>
  );
}

// 3. Merenda: tre morsi al formaggio, poi si gira soddisfatto
function CheeseScene() {
  const mouse = useRef<THREE.Group>(null);
  const cheese = useRef<THREE.Group>(null);
  const rig = useRef(createRig());
  const bites = [0.5, 1.2, 1.9];

  useFrame((state) => {
    const t = state.clock.elapsedTime % 4.6;
    const r = rig.current;
    if (!mouse.current || !cheese.current) return;
    resetRig(r);

    const eaten = bites.filter((b) => t > b + 0.15).length;
    cheese.current.scale.x = Math.max(0.001, 1 - eaten * 0.2);

    if (t < 2.4) {
      mouse.current.rotation.y = PROFILE_RIGHT;
      const lunge = bites.reduce((acc, b) => acc + Math.max(0, Math.sin(phase(t, b, b + 0.35) * Math.PI)), 0);
      if (r.body) r.body.position.z = lunge * 0.35;
      if (r.head) r.head.rotation.x = lunge * 0.25;
    } else {
      mouse.current.rotation.y = lerp(PROFILE_RIGHT, 0.2, easeInOut(phase(t, 2.4, 2.8)));
      const pat = Math.sin(t * 12) * 0.12;
      if (r.armL) r.armL.rotation.set(-0.7 + pat, 0, 0.5);
      if (r.armR) r.armR.rotation.set(-0.7 - pat, 0, -0.5);
    }
  });

  return (
    <Diorama>
      <group ref={mouse} position={[-1.0, 0, 0]} scale={0.8}>
        <Shadow />
        <SqueakModel rig={rig} />
      </group>
      {/* il formaggio si "accorcia" dal lato del morso (il perno è sul lato destro) */}
      <group ref={cheese} position={[2.0, 0, 0]}>
        <group position={[-0.8, 0, 0]}>
          <Cheese />
        </group>
      </group>
    </Diorama>
  );
}

// 4. Keyframe: salta da un rombo all'altro e li accende
function KeyframeScene() {
  const xs = [-1.8, -0.6, 0.6, 1.8];
  const mouse = useRef<THREE.Group>(null);
  const diamonds = useRef<(THREE.Mesh | null)[]>([]);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime % 4.6;
    const r = rig.current;
    const m = mouse.current;
    if (!m || !r.body) return;
    resetRig(r);

    // salto "da cartone": carica schiacciandosi, vola allungato, atterra con un rimbalzo elastico
    const HOP = 0.9;
    const squash = (k: number) => r.body!.scale.set(1 + (1 - k) * 0.8, k, 1 + (1 - k) * 0.8);
    const hopIndex = Math.min(2, Math.floor(t / HOP));
    const f = t < HOP * 3 ? (t - hopIndex * HOP) / HOP : 1;
    let x = xs[3];
    let y = 0;

    if (t < HOP * 3) {
      const from = xs[hopIndex];
      const to = xs[hopIndex + 1];
      if (f < 0.18) {
        x = from;
        squash(1 - Math.sin((f / 0.18) * Math.PI * 0.5) * 0.25);
      } else if (f < 0.82) {
        const g = (f - 0.18) / 0.64;
        x = lerp(from, to, g * g * (3 - 2 * g));
        y = 4 * 1.25 * g * (1 - g);
        const stretch = 1 + 0.18 * Math.abs(1 - 2 * g);
        r.body.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
        r.body.rotation.x = (0.5 - g) * 0.5; // si sporge in avanti salendo, indietro scendendo
        if (r.armL && r.armR) {
          r.armL.rotation.set(-2.3 * Math.sin(g * Math.PI), 0, -0.3);
          r.armR.rotation.set(-2.3 * Math.sin(g * Math.PI), 0, 0.3);
        }
      } else {
        x = to;
        const l = (f - 0.82) / 0.18;
        squash(1 - 0.28 * Math.sin(l * Math.PI) * (1 - l * 0.5));
      }
      m.rotation.y = PROFILE_RIGHT;
    } else {
      // arrivato: si gira verso di noi e fa un saltello di gioia
      m.rotation.y = lerp(PROFILE_RIGHT, 0, easeInOut(phase(t, 2.7, 3.1)));
      const joy = phase(t, 3.2, 3.75);
      if (joy > 0 && joy < 1) {
        y = Math.sin(joy * Math.PI) * 0.6;
        squash(joy < 0.15 || joy > 0.85 ? 0.82 : 1.08);
      }
      if (t > 3.1 && r.armL && r.armR) {
        const up = easeOut(phase(t, 3.1, 3.35));
        r.armL.rotation.set(-2.7 * up, 0, -0.2);
        r.armR.rotation.set(-2.7 * up, 0, 0.2);
      }
    }
    m.position.set(x, 0.56 + y, 0);

    diamonds.current.forEach((d, k) => {
      if (!d) return;
      const lit = t >= k * HOP + (k === 0 ? 0 : -0.15);
      const mat = d.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = lit ? 0.9 : 0;
      mat.color.set(lit ? "#ffc93c" : "#555");
      d.rotation.y = state.clock.elapsedTime * 0.8;
    });
  });

  return (
    <Diorama>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.6, 0.12]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {xs.map((x, k) => (
        <KeyframeDiamond
          key={x}
          position={[x, 0.3, 0]}
          ref={(el) => {
            diamonds.current[k] = el;
          }}
        />
      ))}
      <group ref={mouse} scale={0.55}>
        <SqueakModel rig={rig} wow />
      </group>
    </Diorama>
  );
}

const TRACK_COLORS = ["#6f66e0", "#2f8a57", "#2d8ceb"];

// 5. Corsa: Squeak insegue il playhead lungo la timeline
function RunScene() {
  const runner = useRef<THREE.Group>(null);
  const rig = useRef(createRig());
  const clips = useMemo(
    () =>
      [0, 1, 2].flatMap((lane) =>
        [-4, -2.2, -0.6, 1.1, 2.8].map((x, k) => ({ lane, x: x + lane * 0.4, w: 1.1 + ((k + lane) % 3) * 0.35 })),
      ),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime % 3;
    if (!runner.current) return;
    runner.current.position.x = lerp(-4.5, 4.5, t / 3);
    walkCycle(rig.current, state.clock.elapsedTime, 18, 1.2);
  });

  return (
    <Diorama tilt={-0.3}>
      {clips.map((c, i) => (
        <mesh key={i} position={[c.x, 0.06, 0.5 + c.lane * 0.55]}>
          <boxGeometry args={[c.w, 0.12, 0.45]} />
          <meshStandardMaterial color={TRACK_COLORS[c.lane]} roughness={0.5} />
        </mesh>
      ))}
      <group ref={runner}>
        <mesh position={[0.9, 1.4, 1.05]}>
          <boxGeometry args={[0.04, 2.8, 0.04]} />
          <meshBasicMaterial color="#2d8ceb" />
        </mesh>
        <mesh position={[0.9, 2.85, 1.05]}>
          <boxGeometry args={[0.28, 0.2, 0.06]} />
          <meshBasicMaterial color="#2d8ceb" />
        </mesh>
        <group position={[0, 0.12, 1.05]} rotation={[0, PROFILE_RIGHT, 0]} scale={0.6}>
          <SqueakModel rig={rig} />
        </group>
      </group>
    </Diorama>
  );
}

// 6. Pro in arrivo: Squeak al cantiere, col caschetto, martella il cartello
function ConstructionScene() {
  const mouse = useRef<THREE.Group>(null);
  const rig = useRef(createRig());
  const hits = [0.55, 1.25, 1.95];

  useFrame((state) => {
    const t = state.clock.elapsedTime % 4.8;
    const r = rig.current;
    if (!mouse.current) return;
    resetRig(r);

    if (t < 2.4) {
      mouse.current.rotation.y = PROFILE_RIGHT * 0.85;
      // martellate: carica il colpo, poi giù veloce
      let arm = -1.3;
      for (const h of hits) {
        if (t > h - 0.4 && t <= h) arm = lerp(-1.3, -2.8, easeOut(phase(t, h - 0.4, h - 0.1)));
        if (t > h && t < h + 0.12) arm = lerp(-2.8, -1.0, phase(t, h, h + 0.08));
      }
      if (r.armR) r.armR.rotation.set(arm, 0, 0.15);
    } else {
      mouse.current.rotation.y = lerp(PROFILE_RIGHT * 0.85, 0.1, easeInOut(phase(t, 2.4, 2.8)));
      if (t > 2.8 && t < 4.4) {
        // si asciuga la fronte e saluta
        if (r.armL) r.armL.rotation.set(-2.6, 0, -0.3 - Math.sin(t * 12) * 0.35);
        if (r.head) r.head.rotation.z = Math.sin(t * 3) * 0.1;
      }
      if (t >= 4.4) mouse.current.rotation.y = lerp(0.1, PROFILE_RIGHT * 0.85, easeInOut(phase(t, 4.4, 4.8)));
    }
  });

  return (
    <Diorama tilt={-0.15}>
      <group position={[0, 0, -1.3]}>
        <Barrier width={3.4} />
      </group>
      <group position={[1.7, 0, -0.2]} rotation={[0, -0.45, 0]}>
        <WorkSign lines={["SQUEAKEDIT PRO", "IN ARRIVO"]} />
      </group>
      <group position={[-2.3, 0, 0.4]}>
        <TrafficCone />
      </group>
      <group position={[2.7, 0, 0.7]} scale={0.85}>
        <TrafficCone />
      </group>
      <group position={[-1.5, 0, -0.5]} scale={0.8}>
        <Bricks />
      </group>
      <group ref={mouse} position={[0.15, 0, 0.35]} scale={0.72}>
        <Shadow />
        <SqueakModel
          rig={rig}
          hat={<HardHat />}
          outfit={<SafetyVest />}
          rightHand={
            <group rotation={[0, 0, 0]}>
              <Hammer />
            </group>
          }
        />
      </group>
    </Diorama>
  );
}

// 7. Community: Squeak tiene in mano il logo di Discord in 3D
function DiscordScene() {
  const mouse = useRef<THREE.Group>(null);
  const logo = useRef<THREE.Group>(null);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const u = t % 4.4;
    const r = rig.current;
    if (!mouse.current || !logo.current) return;
    resetRig(r);
    // ogni tanto lo alza sopra la testa, passando davanti al muso (mai attraverso)
    const lift = u > 2.6 && u < 4.0 ? Math.sin(phase(u, 2.6, 4.0) * Math.PI) : 0;
    if (r.armL && r.armR) {
      r.armL.rotation.set(-1.45 - lift * 1.2, 0, -0.35);
      r.armR.rotation.set(-1.45 - lift * 1.2, 0, 0.35);
    }
    if (r.body) r.body.position.y = lift * 0.25;
    if (r.head) r.head.rotation.x = -lift * 0.35;
    mouse.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    logo.current.position.set(0, 1.05 + lift * 2.1 + Math.sin(t * 2.2) * 0.04, 1.42 + Math.sin(lift * Math.PI) * 0.45);
    logo.current.rotation.set(-0.08 - lift * 0.3, Math.sin(t * 1.3) * 0.25, Math.sin(t * 2) * 0.06);
  });

  return (
    <Diorama tilt={0}>
      <group ref={mouse} scale={0.85}>
        <Shadow />
        <SqueakModel rig={rig} wow />
        <group ref={logo}>
          <group scale={0.6}>
            <DiscordLogo3D />
          </group>
        </group>
      </group>
    </Diorama>
  );
}

type V3 = [number, number, number];

const SCENES: Record<string, { Component: () => ReactNode; camera: V3; target: V3 }> = {
  slide: { Component: SlideScene, camera: [0, 2.1, 9.6], target: [0, 1.65, 0] },
  clap: { Component: ClapScene, camera: [0, 2.3, 8.2], target: [0, 1.55, 0] },
  cheese: { Component: CheeseScene, camera: [0, 2.4, 8.6], target: [0, 1.3, 0] },
  keyframe: { Component: KeyframeScene, camera: [0, 2.3, 8.4], target: [0, 1.2, 0] },
  run: { Component: RunScene, camera: [0, 3, 9.5], target: [0, 0.9, 0.6] },
  construction: { Component: ConstructionScene, camera: [0, 2.4, 9], target: [0, 1.25, 0] },
  discord: { Component: DiscordScene, camera: [0, 2.0, 7.4], target: [0, 1.5, 0] },
};

export type SiteSceneName = "slide" | "clap" | "cheese" | "keyframe" | "run" | "construction" | "discord";

export default function SiteScene({ name, className }: { name: SiteSceneName; className?: string }) {
  const { Component, camera, target } = SCENES[name];
  return (
    <Stage className={className} camera={camera} target={target} fade>
      <Component />
    </Stage>
  );
}
