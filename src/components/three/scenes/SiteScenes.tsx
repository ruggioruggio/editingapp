"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stage } from "../Stage";
import { Cheese, Clapperboard, DiscordBadge, FilmStrip, KeyframeDiamond, Scissors, TextSprite } from "../props";
import { createRig, easeInOut, easeOut, lerp, phase, resetRig, Shadow, SqueakModel, walkCycle } from "../SqueakModel";

// Scene del sito: "diorami" in 3D visti di lato, con la camera che oscilla
// piano per dare profondità. Squeak cammina di profilo e si gira verso di noi.

const PROFILE_RIGHT = Math.PI / 2; // guarda verso +x

/** Gruppo radice che ondeggia lentamente: rende evidente la prospettiva 3D. */
function Diorama({ children, tilt = -0.28 }: { children: ReactNode; tilt?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = tilt + Math.sin(state.clock.elapsedTime * 0.35) * 0.12 + state.pointer.x * 0.12;
  });
  return <group ref={ref}>{children}</group>;
}

/** Comparsa "a pop" di una scritta tra due istanti. */
function popScale(t: number, from: number, to: number) {
  if (t < from || t > to) return 0.001;
  const p = phase(t, from, from + 0.3);
  const out = phase(t, to - 0.3, to);
  return (p < 1 ? easeOut(p) * 1.15 : 1) * (1 - out);
}

// 1. Squeak arriva, si gira, taglia la pellicola con le forbici ed esulta
function CutScene() {
  const mouse = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const blade = useRef<THREE.Group>(null);
  const word = useRef<THREE.Sprite>(null);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime % 4.2;
    const m = mouse.current;
    const r = rig.current;
    if (!m || !left.current || !right.current) return;
    resetRig(r);

    if (t < 1.3) {
      m.position.x = lerp(-3.4, 0, easeOut(phase(t, 0, 1.3)));
      m.rotation.y = PROFILE_RIGHT;
      walkCycle(r, t, 11);
    } else {
      m.position.x = 0;
      m.rotation.y = lerp(PROFILE_RIGHT, 0, easeInOut(phase(t, 1.3, 1.7)));
    }
    // braccio con le forbici verso la pellicola, poi il taglio
    const reach = easeOut(phase(t, 1.6, 2.0));
    if (r.armR) r.armR.rotation.set(-0.9 * reach, 0, 0.25 * reach);
    if (blade.current) blade.current.rotation.z = t > 2.0 && t < 2.25 ? -0.5 : 0;

    const split = easeOut(phase(t, 2.2, 2.7));
    left.current.position.x = -0.95 - split * 0.35;
    left.current.rotation.y = split * 0.25;
    right.current.position.x = 0.95 + split * 0.35;
    right.current.rotation.y = -split * 0.25;

    const jump = phase(t, 2.5, 3.0);
    if (r.body) r.body.position.y = Math.sin(jump * Math.PI) * 0.6;
    if (t > 2.6 && r.armL) r.armL.rotation.set(-2.6 * easeOut(phase(t, 2.6, 2.9)), 0, -0.3);
    if (word.current) {
      const k = popScale(t, 2.2, 3.9);
      word.current.scale.set(2.7 * k, k, 1);
    }
  });

  return (
    <Diorama>
      <group ref={left} position={[-0.95, 0, 1.3]}>
        <FilmStrip length={1.9} />
      </group>
      <group ref={right} position={[0.95, 0, 1.3]}>
        <FilmStrip length={1.9} />
      </group>
      <group ref={mouse} scale={0.8}>
        <Shadow />
        <SqueakModel
          rig={rig}
          rightHand={
            <group rotation={[Math.PI / 2, 0, 0]}>
              <Scissors ref={blade} />
            </group>
          }
        />
      </group>
      <TextSprite ref={word} text="CUT!" position={[1.9, 2.7, 0]} />
    </Diorama>
  );
}

// 2. Ciak: Squeak alza il ciak, lo batte e guarda verso di noi
function ClapScene() {
  const mouse = useRef<THREE.Group>(null);
  const stick = useRef<THREE.Group>(null);
  const word = useRef<THREE.Sprite>(null);
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
    if (word.current) {
      const k = popScale(t, 1.02, 2.8);
      word.current.scale.set(2.7 * k, k, 1);
    }
  });

  return (
    <Diorama tilt={-0.15}>
      <group ref={mouse} position={[-0.6, 0, 0]} scale={0.85}>
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
      <TextSprite ref={word} text="CIAK!" position={[1.4, 3.1, 0]} />
    </Diorama>
  );
}

// 3. Merenda: tre morsi al formaggio, poi si gira soddisfatto
function CheeseScene() {
  const mouse = useRef<THREE.Group>(null);
  const cheese = useRef<THREE.Group>(null);
  const word = useRef<THREE.Sprite>(null);
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
    if (word.current) {
      const k = popScale(t, 2.6, 4.3);
      word.current.scale.set(2.7 * k, k, 1);
    }
  });

  return (
    <Diorama>
      <group ref={mouse} position={[-1.1, 0, 0]} scale={0.85}>
        <Shadow />
        <SqueakModel rig={rig} />
      </group>
      {/* il formaggio si "accorcia" dal lato del morso (il perno è sul lato destro) */}
      <group ref={cheese} position={[2.25, 0, 0]}>
        <group position={[-0.8, 0, 0]}>
          <Cheese />
        </group>
      </group>
      <TextSprite ref={word} text="Gnam!" position={[-0.3, 3.2, 0]} />
    </Diorama>
  );
}

// 4. Keyframe: salta da un rombo all'altro e li accende
function KeyframeScene() {
  const xs = [-2.1, -0.7, 0.7, 2.1];
  const mouse = useRef<THREE.Group>(null);
  const diamonds = useRef<(THREE.Mesh | null)[]>([]);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime % 4.2;
    const r = rig.current;
    if (!mouse.current) return;
    resetRig(r);
    const hop = Math.min(3, t / 0.8);
    const i = Math.floor(hop);
    const f = hop - i;
    const x = i >= 3 ? xs[3] : lerp(xs[i], xs[i + 1], easeInOut(f));
    mouse.current.position.set(x, 0.56 + (i >= 3 ? 0 : Math.sin(f * Math.PI) * 1.3), 0);
    mouse.current.rotation.y = t < 2.4 ? PROFILE_RIGHT : lerp(PROFILE_RIGHT, 0, easeInOut(phase(t, 2.4, 2.8)));
    if (t > 2.8 && r.armL && r.armR) {
      const up = easeOut(phase(t, 2.8, 3.1));
      r.armL.rotation.set(-2.7 * up, 0, -0.2);
      r.armR.rotation.set(-2.7 * up, 0, 0.2);
    }
    diamonds.current.forEach((d, k) => {
      if (!d) return;
      const lit = t >= k * 0.8 - 0.05;
      const mat = d.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = lit ? 0.9 : 0;
      mat.color.set(lit ? "#ffc93c" : "#555");
      d.rotation.y = state.clock.elapsedTime * 0.8;
    });
  });

  return (
    <Diorama>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.6, 0.12]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {xs.map((x, k) => (
        <KeyframeDiamond key={x} position={[x, 0.3, 0]} ref={(el) => {
            diamonds.current[k] = el;
          }} />
      ))}
      <group ref={mouse} scale={0.6}>
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
    <Diorama tilt={-0.35}>
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

// 6. Pro: passando sopra la timeline, il progetto diventa sempre più complesso
const V_COLORS = ["#2d9be0", "#6cc8ff", "#a347d1", "#d63ab0", "#b5b53a"];
const A_COLOR = "#4f9a2c";

interface TimelineClip {
  x: number;
  w: number;
  z: number;
  color: string;
  base: boolean;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTimeline(): TimelineClip[] {
  const rand = mulberry32(7);
  const out: TimelineClip[] = [];
  const laneZ = (i: number, audio: boolean) => (audio ? 0.42 + i * 0.5 : -0.42 - i * 0.5);
  // montaggio semplice iniziale: una traccia video e una audio
  [[-4.2, 1.6], [-2.5, 2.1], [-0.3, 1.4], [1.2, 2.2], [3.5, 0.8]].forEach(([x, w]) =>
    out.push({ x, w: w - 0.06, z: laneZ(0, false), color: V_COLORS[0], base: true }),
  );
  [[-4.2, 3.8], [-0.3, 3.6], [3.4, 0.9]].forEach(([x, w]) => out.push({ x, w: w - 0.06, z: laneZ(0, true), color: A_COLOR, base: true }));

  // poi decine di clip: tagli fitti in V1/V2, inserti colorati in alto
  for (let lane = 0; lane < 5; lane++) {
    const density = [0.9, 0.75, 0.3, 0.2, 0.12][lane];
    for (let x = -4.2; x < 4.2; ) {
      const w = lane < 2 ? 0.05 + rand() * 0.18 : 0.06 + rand() * 0.35;
      if (rand() < density) out.push({ x, w, z: laneZ(lane, false) + (lane === 0 ? 0 : 0), color: V_COLORS[lane], base: false });
      x += w + (lane < 2 ? 0.03 : 0.2 + rand() * 0.5);
    }
  }
  // audio a "scalini" come in un progetto vero
  let lane = 1;
  for (let x = -4.2; x < 4.2; ) {
    const w = 0.25 + rand() * 0.6;
    out.push({ x, w, z: laneZ(lane, true), color: rand() < 0.2 ? "#7fbf4d" : A_COLOR, base: false });
    x += w + 0.05 + rand() * 0.25;
    lane = Math.min(4, Math.max(1, lane + (rand() < 0.5 ? 1 : -1)));
  }
  return out.filter((c) => c.x + c.w < 4.3);
}

function ProTimelineScene() {
  const clips = useMemo(buildTimeline, []);
  const extra = useMemo(() => clips.filter((c) => !c.base), [clips]);
  const base = useMemo(() => clips.filter((c) => c.base), [clips]);
  const instanced = useRef<THREE.InstancedMesh>(null);
  const mouse = useRef<THREE.Group>(null);
  const rig = useRef(createRig());
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const mesh = instanced.current;
    if (!mesh) return;
    const color = new THREE.Color();
    extra.forEach((c, i) => mesh.setColorAt(i, color.set(c.color)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [extra]);

  useFrame((state) => {
    const t = state.clock.elapsedTime % 8.5;
    const r = rig.current;
    const mesh = instanced.current;
    if (!mesh || !mouse.current) return;
    resetRig(r);

    // cammina da sinistra a destra lungo la linea tra video e audio
    const walk = phase(t, 0, 6);
    const mx = lerp(-4.8, 4.6, walk);
    mouse.current.position.set(mx, 0, 0);
    if (t < 6) {
      mouse.current.rotation.y = PROFILE_RIGHT;
      walkCycle(r, t, 11);
    } else {
      mouse.current.rotation.y = lerp(PROFILE_RIGHT, 0.3, easeInOut(phase(t, 6, 6.4)));
      if (r.armL && r.armR) {
        const up = easeOut(phase(t, 6.4, 6.8));
        r.armL.rotation.set(-2.6 * up, 0, -0.25);
        r.armR.rotation.set(-2.6 * up, 0, 0.25);
      }
    }

    // le clip "nascono" dietro di lui; alla fine spariscono per ricominciare
    const fade = 1 - easeInOut(phase(t, 7.8, 8.4));
    extra.forEach((c, i) => {
      const grow = easeOut(Math.min(1, Math.max(0, (mx - c.x) / 0.5))) * fade;
      dummy.position.set(c.x + c.w / 2, 0.07 * grow, c.z);
      dummy.scale.set(c.w, Math.max(0.001, 0.14 * grow), 0.4 * Math.max(0.001, grow));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group rotation={[0, -0.12, 0]}>
      {/* piano della timeline con le corsie */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 5.4]} />
        <meshStandardMaterial color="#161616" />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const z = i < 5 ? -0.42 - i * 0.5 : 0.42 + (i - 5) * 0.5;
        return (
          <mesh key={i} position={[0, 0, z + 0.25 * Math.sign(z)]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[9, 0.012]} />
            <meshBasicMaterial color="#2c2c2c" />
          </mesh>
        );
      })}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 0.06]} />
        <meshBasicMaterial color="#3a3a3a" />
      </mesh>
      {base.map((c, i) => (
        <mesh key={i} position={[c.x + c.w / 2, 0.07, c.z]}>
          <boxGeometry args={[c.w, 0.14, 0.4]} />
          <meshStandardMaterial color={c.color} roughness={0.5} />
        </mesh>
      ))}
      <instancedMesh ref={instanced} args={[undefined, undefined, extra.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <group ref={mouse} scale={0.55}>
        <Shadow />
        <SqueakModel rig={rig} />
      </group>
    </group>
  );
}

// 7. Community: Squeak mostra fiero il logo di Discord
function DiscordScene() {
  const mouse = useRef<THREE.Group>(null);
  const badge = useRef<THREE.Group>(null);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const u = t % 4;
    const r = rig.current;
    if (!mouse.current || !badge.current) return;
    resetRig(r);
    const lift = u > 2.4 && u < 3.6 ? Math.sin(phase(u, 2.4, 3.6) * Math.PI) : 0;
    if (r.armL && r.armR) {
      r.armL.rotation.set(-1.2 - lift * 1.1, 0, -0.45);
      r.armR.rotation.set(-1.2 - lift * 1.1, 0, 0.45);
    }
    if (r.body) r.body.position.y = lift * 0.35;
    if (r.head) r.head.rotation.z = Math.sin(t * 1.5) * 0.12;
    mouse.current.rotation.y = Math.sin(t * 0.8) * 0.35;
    badge.current.position.set(0, 1.45 + lift * 1.15, 1.25 - lift * 0.3);
    badge.current.rotation.set(-0.1, 0, Math.sin(t * 2) * 0.08);
  });

  return (
    <Diorama tilt={0}>
      <group ref={mouse} scale={0.9}>
        <Shadow />
        <SqueakModel rig={rig} wow />
        <group ref={badge}>
          <group scale={1.35}>
            <DiscordBadge />
          </group>
        </group>
      </group>
    </Diorama>
  );
}

const SCENES = {
  cut: { Component: CutScene, camera: [0, 2.4, 8.2] as [number, number, number], target: [0, 1.25, 0] as [number, number, number] },
  clap: { Component: ClapScene, camera: [0, 2.3, 7.6] as [number, number, number], target: [0, 1.6, 0] as [number, number, number] },
  cheese: { Component: CheeseScene, camera: [0, 2.4, 8.2] as [number, number, number], target: [0, 1.3, 0] as [number, number, number] },
  keyframe: { Component: KeyframeScene, camera: [0, 2.3, 8.4] as [number, number, number], target: [0, 1.2, 0] as [number, number, number] },
  run: { Component: RunScene, camera: [0, 3, 9.5] as [number, number, number], target: [0, 0.9, 0.6] as [number, number, number] },
  pro: { Component: ProTimelineScene, camera: [0, 6.2, 7.6] as [number, number, number], target: [0, 0, 0.2] as [number, number, number] },
  discord: { Component: DiscordScene, camera: [0, 2.2, 8.5] as [number, number, number], target: [0, 1.5, 0] as [number, number, number] },
};

export type SiteSceneName = keyof typeof SCENES;

export default function SiteScene({ name, className }: { name: SiteSceneName; className?: string }) {
  const { Component, camera, target } = SCENES[name];
  return (
    <Stage className={className} camera={camera} target={target}>
      <Component />
    </Stage>
  );
}
