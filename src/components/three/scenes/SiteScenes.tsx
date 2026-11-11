"use client";

import { useMemo, useRef, type ReactNode, type RefObject } from "react";
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
  Workbench,
} from "../props";
import { createRig, easeInOut, easeOut, lerp, phase, resetRig, Shadow, smoothstep, Spring, SqueakModel, TAIL_STANDING, walkCycle } from "../SqueakModel";

const PROFILE_RIGHT = Math.PI / 2;

function Diorama({ children, tilt = -0.22 }: { children: ReactNode; tilt?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = tilt + Math.sin(state.clock.elapsedTime * 0.35) * 0.08 + state.pointer.x * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

function StrawHat() {
  const straw = "#f0cf6a";
  return (
    <group position={[0, 0.5, -0.05]} rotation={[-0.12, 0, 0.06]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.02, 1.08, 0.06, 40]} />
        <meshStandardMaterial color={straw} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.5, 0.58, 0.4, 32]} />
        <meshStandardMaterial color={straw} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.41, 0]} scale={[1, 0.35, 1]}>
        <sphereGeometry args={[0.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={straw} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.59, 0.6, 0.14, 32]} />
        <meshStandardMaterial color="#c7262f" roughness={0.6} />
      </mesh>
    </group>
  );
}

const CAPE_COLS = 18;
const CAPE_ROWS = 14;
const TAIL_CLEARANCE = 0.14;
const tailSpheres = new THREE.CatmullRomCurve3(TAIL_STANDING.map((p) => new THREE.Vector3(...p))).getSpacedPoints(16);
const tmpV = new THREE.Vector3();

function Cape({ flap }: { flap: RefObject<number> }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, CAPE_COLS, CAPE_ROWS);
    const red = new THREE.Color("#a81d28");
    const gold = new THREE.Color("#f2c14e");
    const colors: number[] = [];
    for (let r = 0; r <= CAPE_ROWS; r++) {
      const c = r >= CAPE_ROWS - 1 ? gold : red;
      for (let k = 0; k <= CAPE_COLS; k++) colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, []);
  const swing = useMemo(() => new Spring(5, 0.65), []);

  useFrame((state, dt) => {
    const f = swing.step(flap.current, Math.min(dt, 0.1));
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position;
    let i = 0;
    for (let r = 0; r <= CAPE_ROWS; r++) {
      const v = r / CAPE_ROWS;
      for (let k = 0; k <= CAPE_COLS; k++) {
        const u = k / CAPE_COLS - 0.5;
        const y = lerp(1.6, 0.6, v);
        const x = u * 2 * lerp(0.5, 0.85, v);
        // wraps the back of the body with a gap, then hangs free below the widest point
        const ny = Math.max(0, (y - 0.9) / 0.88);
        const back = -1.12 * Math.sqrt(Math.max(0.03, 1 - x * x - ny * ny)) - 0.08;
        const lift = f * v * v;
        const wave = Math.sin(t * 7 - v * 6 + u * 3) * (0.035 + 0.09 * f) * v;
        tmpV.set(x + Math.sin(t * 4 + v * 5) * 0.02 * v, y + lift * 0.35, back - lift * 1.25 - wave);
        // collision with the tail: push the cloth out of each tail sphere instead of letting it pass through
        for (const s of tailSpheres) {
          const d = tmpV.distanceTo(s);
          if (d < TAIL_CLEARANCE && d > 1e-4) tmpV.sub(s).multiplyScalar(TAIL_CLEARANCE / d).add(s);
        }
        pos.setXYZ(i++, tmpV.x, tmpV.y, tmpV.z);
      }
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <group>
      <mesh geometry={geometry} frustumCulled={false}>
        <meshPhysicalMaterial vertexColors side={THREE.DoubleSide} roughness={0.7} sheen={0.5} />
      </mesh>
      <mesh position={[0, 1.58, 0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.12, 1]}>
        <torusGeometry args={[0.63, 0.05, 12, 48]} />
        <meshPhysicalMaterial color="#7a121b" roughness={0.6} sheen={0.5} />
      </mesh>
    </group>
  );
}

function SlideScene() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.2, 1.6, 0),
        new THREE.Vector3(-1.4, 2.3, 0),
        new THREE.Vector3(-0.6, 3.55, 0),
        new THREE.Vector3(0.3, 3.75, 0),
        new THREE.Vector3(1.2, 3.1, 0),
        new THREE.Vector3(2.0, 1.4, 0),
        new THREE.Vector3(2.7, 0.75, 0),
        new THREE.Vector3(3.3, 0.62, 0),
      ]),
    [],
  );
  const SEG = 160;
  const RAD = 10;
  const arm = useMemo(() => new THREE.TubeGeometry(curve, SEG, 0.11, RAD), [curve]);
  const fist = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const turn = useRef<THREE.Group>(null);
  const capeFlap = useRef(0.15);
  const hatBounce = useRef<THREE.Group>(null);
  const lines = useRef<(THREE.Mesh | null)[]>([]);
  const rig = useRef(createRig());
  const START = curve.getPointAt(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime % 9.2;
    const r = rig.current;
    const b = body.current;
    const y = turn.current;
    if (!b || !y) return;
    resetRig(r);
    const show = (from: number, to: number) => {
      const per = RAD * 6;
      const a = Math.floor(from * SEG) * per;
      const z = Math.floor(to * SEG) * per;
      arm.setDrawRange(a, Math.max(0, z - a));
    };
    let fistAt = 0;
    let flap = 0.15;
    const wobble = Math.sin(t * 18) * 0.04;
    const bounce = Math.abs(Math.sin(t * 7)) * 0.06;

    if (t < 1.3) {
      const hop = Math.abs(Math.sin(t * 8));
      b.position.set(START.x - 0.35, 0.2 + hop * 0.3, 0);
      b.rotation.z = wobble;
      const sq = 1 - hop * 0.15;
      if (r.body) r.body.scale.set(1 + (1 - sq) * 0.6, sq, 1 + (1 - sq) * 0.6);
      y.rotation.y = lerp(0.25, PROFILE_RIGHT, easeInOut(phase(t, 0.2, 0.9)));
      if (r.armR) r.armR.rotation.set(0.9 * easeOut(phase(t, 0.5, 1.2)) + Math.sin(t * 12) * 0.15, 0, 0.3);
      if (r.armL) r.armL.rotation.set(-0.4 + Math.sin(t * 10) * 0.3, 0, -0.4 - Math.sin(t * 8) * 0.15);
      if (r.head) r.head.rotation.z = Math.sin(t * 11) * 0.12;
      show(0, 0);
    } else if (t < 2.5) {
      const p = easeOut(phase(t, 1.3, 2.2));
      b.position.set(START.x - 0.35, 0.2 + bounce, 0);
      b.rotation.z = -0.06 * Math.sin(t * 14);
      y.rotation.y = PROFILE_RIGHT;
      if (r.body) r.body.rotation.x = 0.15 * Math.sin(phase(t, 1.3, 2.2) * Math.PI);
      if (r.armR) r.armR.scale.setScalar(0.001);
      if (r.armL) r.armL.rotation.set(-0.6 + Math.sin(t * 16) * 0.4, 0, -0.6);
      if (r.head) r.head.rotation.set(-0.1, 0, Math.sin(t * 9) * 0.15);
      show(0, p);
      fistAt = p;
      flap = 0.6;
    } else if (t < 4.4) {
      const raw = phase(t, 2.5, 4.2);
      const p = raw ** 1.4;
      const pos = curve.getPointAt(Math.min(1, p));
      const tan = curve.getTangentAt(Math.min(1, p));
      const tAngle = Math.atan2(tan.y, tan.x);
      b.position.set(pos.x - 0.1, pos.y - 1.15, 0);
      b.rotation.z = tAngle * 0.8 + Math.sin(t * 20) * 0.08;
      y.rotation.y = PROFILE_RIGHT;
      const speed = Math.abs(tan.y) + 0.3;
      if (r.body) r.body.scale.set(1 / Math.sqrt(1 + speed * 0.2), 1 + speed * 0.2, 1);
      if (r.armR) r.armR.scale.setScalar(0.001);
      if (r.armL) r.armL.rotation.set(-2.7 + Math.sin(t * 22) * 0.5, 0, -0.3 + Math.sin(t * 18) * 0.2);
      if (r.footL) r.footL.position.set(-0.42, 0.1, 0.45 + Math.sin(t * 24) * 0.3);
      if (r.footR) r.footR.position.set(0.42, 0.1, 0.45 - Math.sin(t * 24) * 0.3);
      if (r.head) r.head.rotation.set(0, 0, Math.sin(t * 16) * 0.12);
      show(Math.min(1, p + 0.02), 1);
      fistAt = 1;
      flap = 1.3;
    } else if (t >= 6.2) {
      const end = curve.getPointAt(1);
      const k = smoothstep(phase(t, 6.5, 8.6));
      b.position.set(lerp(end.x + 0.15, START.x - 0.35, k), 0.2, 0);
      b.rotation.z = 0;
      const turnL = easeInOut(phase(t, 6.2, 6.6));
      const turnR = easeInOut(phase(t, 8.6, 9.2));
      y.rotation.y = lerp(lerp(0.2, -PROFILE_RIGHT, turnL), 0.25, turnR);
      walkCycle(r, t, 11, Math.sin(k * Math.PI) ** 0.5);
      show(0, 0);
      flap = 0.35 + Math.sin(k * Math.PI) * 0.4;
    } else {
      const end = curve.getPointAt(1);
      const land = easeOut(phase(t, 4.4, 4.7));
      const landBounce = t < 5.2 ? Math.abs(Math.sin((t - 4.7) * 12)) * 0.2 * (1 - phase(t, 4.7, 5.2)) : 0;
      b.position.set(end.x + 0.15 * land, lerp(end.y - 1.15, 0.2, land) + landBounce, 0);
      b.rotation.z = lerp(b.rotation.z, wobble, 0.15);
      if (r.body && t < 5.0) {
        const sq2 = 1 - landBounce * 0.6;
        r.body.scale.set(1 + (1 - sq2) * 0.8, sq2, 1 + (1 - sq2) * 0.8);
      }
      y.rotation.y = lerp(PROFILE_RIGHT, 0.2, easeInOut(phase(t, 4.8, 5.3)));
      if (t > 5.2) {
        if (r.armR) r.armR.rotation.set(-2.9 + Math.sin(t * 10) * 0.2, 0, 0.15 + Math.sin(t * 7) * 0.15);
        if (r.armL) r.armL.rotation.set(-2.5 + Math.sin(t * 8) * 0.3, 0, -0.3 - Math.sin(t * 6) * 0.15);
        if (r.head) r.head.rotation.set(0, Math.sin(t * 5) * 0.15, Math.sin(t * 8) * 0.1);
      }
      show(0, 0);
      flap = 0.35;
    }

    if (fist.current) {
      const fp = curve.getPointAt(Math.max(0.001, fistAt));
      fist.current.position.copy(fp);
      fist.current.visible = fistAt > 0.01;
    }
    capeFlap.current = flap;
    if (hatBounce.current) hatBounce.current.position.y = (t > 2.5 && t < 4.4 ? Math.abs(Math.sin(t * 14)) * 0.1 : 0) + Math.sin(t * 6) * 0.02;
    lines.current.forEach((l, i) => {
      if (!l) return;
      const env = smoothstep(phase(t, 2.6, 2.9)) * (1 - smoothstep(phase(t, 4.1, 4.45)));
      l.visible = env > 0.01;
      (l.material as THREE.MeshBasicMaterial).opacity = 0.6 * env;
      l.position.set(b.position.x - 0.9 - i * 0.25, b.position.y + 0.6 + (i - 1.5) * 0.35 + Math.sin(t * 20 + i) * 0.1, 0.3);
      l.rotation.z = b.rotation.z + Math.sin(t * 15 + i * 2) * 0.08;
    });
  });

  return (
    <Diorama tilt={-0.16}>
      <group scale={0.7} position={[-0.25, 0.3, 0]}>
        <group position={[0.4, 1.75, -1.8]}>
          <GraphPanel />
        </group>
        {/* il braccio di gomma */}
        <mesh geometry={arm}>
          <meshStandardMaterial color="#c3cad8" roughness={0.6} />
        </mesh>
        <group ref={fist}>
          <mesh>
            <sphereGeometry args={[0.22, 20, 16]} />
            <meshStandardMaterial color="#ff9fbb" roughness={0.55} />
          </mesh>
        </group>
        {/* punto di partenza e d'arrivo come keyframe */}
        {[curve.getPointAt(0), curve.getPointAt(1)].map((v, i) => (
          <mesh key={`k${i}`} position={[v.x, v.y - 0.25 - (i ? 0 : 0.2), -0.3]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#ffc93c" emissive="#ffc93c" emissiveIntensity={0.4} />
          </mesh>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} ref={(m) => void (lines.current[i] = m)} visible={false}>
            <boxGeometry args={[0.7, 0.04, 0.04]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        ))}
        <group ref={body}>
          <group ref={turn}>
            <SqueakModel
              rig={rig}
              outfit={<Cape flap={capeFlap} />}
              hat={
                <group ref={hatBounce}>
                  <StrawHat />
                </group>
              }
            />
          </group>
        </group>
        <group position={[0.4, 0, 0]}>
          <Shadow radius={1.2} opacity={0.25} />
        </group>
      </group>
    </Diorama>
  );
}

function ClapScene() {
  const mouse = useRef<THREE.Group>(null);
  const stick = useRef<THREE.Group>(null);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime % 3.6;
    const r = rig.current;
    if (!mouse.current) return;
    resetRig(r);
    const back = easeInOut(phase(t, 2.9, 3.6));
    mouse.current.rotation.y = lerp(lerp(0.9, 0.25, easeInOut(phase(t, 0, 0.6))), 0.9, back);
    if (r.armR) r.armR.rotation.set(-1.5, 0, 0.15);
    if (r.head) r.head.rotation.y = lerp(lerp(0.5, -0.3, easeInOut(phase(t, 1.2, 1.6))), 0.5, back);
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

function CheeseScene() {
  const mouse = useRef<THREE.Group>(null);
  const cheese = useRef<THREE.Group>(null);
  const rig = useRef(createRig());
  const bites = [0.5, 1.2, 1.9];

  useFrame((state) => {
    const t = state.clock.elapsedTime % 7.2;
    const r = rig.current;
    const m = mouse.current;
    if (!m || !cheese.current) return;
    resetRig(r);

    // each bite takes a chunk gradually; leftovers slide away and a fresh wedge slides in off-screen
    const eaten = bites.reduce((acc, b) => acc + smoothstep(phase(t, b + 0.12, b + 0.32)), 0);
    const away = smoothstep(phase(t, 3.6, 4.4));
    const back = 1 - easeOut(phase(t, 5.0, 6.4));
    cheese.current.scale.x = t < 4.45 ? Math.max(0.001, 1 - eaten * 0.2) : 1;
    cheese.current.position.x = 2.0 + (t < 4.45 ? away : back) * 3.4;

    // the bitten edge recedes by 0.32 per bite: Squeak shuffles forward to keep his snout on it,
    // then walks back to his spot (facing where he goes) while the new wedge arrives
    const shuffle = bites.reduce((acc, b) => acc + Math.sin(phase(t, b + 0.32, b + 0.62) * Math.PI), 0);
    const homeward = smoothstep(phase(t, 4.75, 6.05));
    const fed = Math.min(eaten, 3) * 0.32;
    m.position.x = -1.0 + fed * (1 - homeward);
    if (shuffle > 0.01) walkCycle(r, t, 14, shuffle * 0.5);
    if (t > 4.65 && t < 6.15) walkCycle(r, t, 10, Math.sin(phase(t, 4.65, 6.15) * Math.PI) ** 0.5);

    const lunge = bites.reduce((acc, b) => acc + Math.max(0, Math.sin(phase(t, b, b + 0.4) * Math.PI)), 0);
    // contact, not penetration: the snout tip (1.53 ahead of the body origin, x0.8 scale) stops at the bitten face
    const SNOUT = 1.53;
    const edge = cheese.current.position.x - 1.6 * cheese.current.scale.x;
    const maxReach = (edge + 0.03 - m.position.x) / 0.8 - SNOUT;
    if (r.body) r.body.position.z = Math.min(lunge * 0.3, Math.max(0, maxReach));
    if (r.head) r.head.rotation.x = lunge * 0.25;
    const toCamera = easeInOut(phase(t, 2.4, 2.9));
    const toLeft = easeInOut(phase(t, 4.3, 4.75));
    const toRight = easeInOut(phase(t, 6.1, 6.7));
    m.rotation.y = lerp(lerp(lerp(PROFILE_RIGHT, 0.2, toCamera), -PROFILE_RIGHT, toLeft), PROFILE_RIGHT, toRight);
    const patting = smoothstep(phase(t, 2.6, 2.9)) * (1 - smoothstep(phase(t, 4.1, 4.4)));
    // short arms reach the upper belly only with the forearms raised: pat there, paws resting on the surface
    const pat = Math.sin(t * 9) * 0.07;
    if (r.armL && patting > 0) r.armL.rotation.set((-1.25 + pat) * patting, 0, 0.15 * patting);
    if (r.armR && patting > 0) r.armR.rotation.set((-1.25 - pat) * patting, 0, -0.15 * patting);
    if (r.head) r.head.rotation.y = -0.4 * smoothstep(phase(t, 3.6, 4.0)) * (1 - smoothstep(phase(t, 4.2, 4.6)));
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

function KeyframeScene() {
  const xs = [-1.8, -0.6, 0.6, 1.8];
  const mouse = useRef<THREE.Group>(null);
  const diamonds = useRef<(THREE.Mesh | null)[]>([]);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime % 7;
    const r = rig.current;
    const m = mouse.current;
    if (!m || !r.body) return;
    resetRig(r);
    if (t >= 3.9) {
      // turns around and walks back to the first keyframe
      const turnL = easeInOut(phase(t, 3.9, 4.3));
      const turnR = easeInOut(phase(t, 6.4, 6.9));
      m.rotation.y = lerp(lerp(0, -PROFILE_RIGHT, turnL), PROFILE_RIGHT, turnR);
      const k = smoothstep(phase(t, 4.2, 6.5));
      m.position.set(lerp(xs[3], xs[0], k), 0.56, 0);
      walkCycle(r, t, 11, Math.sin(k * Math.PI) ** 0.5);
      diamonds.current.forEach((d, i) => {
        if (!d) return;
        const mat = d.material as THREE.MeshStandardMaterial;
        const fade = i === 0 ? 0 : smoothstep(phase(t, 4.3 + (3 - i) * 0.5, 4.9 + (3 - i) * 0.5));
        mat.emissiveIntensity = 0.9 * (1 - fade);
        mat.color.set("#555").lerp(new THREE.Color("#ffc93c"), 1 - fade);
        d.rotation.y = state.clock.elapsedTime * 0.8;
      });
      return;
    }

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
        r.body.rotation.x = (0.5 - g) * 0.5;
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
      const lit = k === 0 ? 1 : smoothstep(phase(t, k * HOP - 0.2, k * HOP + 0.05));
      const mat = d.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.9 * lit;
      mat.color.set("#555").lerp(new THREE.Color("#ffc93c"), lit);
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

  const clipRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!runner.current) return;
    // runner stays in frame, the timeline scrolls under him like a treadmill
    runner.current.position.x = Math.sin(t * 0.45) * 0.9;
    runner.current.position.y = Math.abs(Math.sin(t * 9)) * 0.06;
    walkCycle(rig.current, t, 18, 1.2);
    if (rig.current.body) rig.current.body.rotation.x = 0.12;
    clipRefs.current.forEach((m, i) => {
      if (!m) return;
      const span = 12;
      const x = ((((clips[i].x - t * 2.4 + 6) % span) + span) % span) - 6;
      m.position.x = x;
      m.scale.y = Math.min(1, Math.max(0.001, (6 - Math.abs(x)) / 1.2));
    });
  });

  return (
    <Diorama tilt={-0.3}>
      {clips.map((c, i) => (
        <mesh key={i} ref={(m) => void (clipRefs.current[i] = m)} position={[c.x, 0.06, 0.5 + c.lane * 0.55]}>
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

function ConstructionScene({ lines = ["SQUEAKEDIT PRO", "IN ARRIVO"] }: { lines?: [string, string] }) {
  const mouse = useRef<THREE.Group>(null);
  const bench = useRef<THREE.Group>(null);
  const dust = useRef<(THREE.Mesh | null)[]>([]);
  const rig = useRef(createRig());
  const hits = [0.65, 1.35, 2.05];

  useFrame((state) => {
    const t = state.clock.elapsedTime % 4.8;
    const r = rig.current;
    if (!mouse.current) return;
    resetRig(r);

    // arm angle -PI/2 = arm level, hammer head pointing straight down onto the bench top
    const CONTACT = -Math.PI / 2;
    const REST = -0.5;
    if (t < 2.4) {
      mouse.current.rotation.y = PROFILE_RIGHT * 0.85;
      let arm = lerp(REST, -1.8, smoothstep(phase(t, 0.1, 0.25)));
      for (const h of hits) {
        if (t > h - 0.45 && t <= h - 0.15) arm = lerp(-1.8, -2.7, easeOut(phase(t, h - 0.45, h - 0.15)));
        if (t > h - 0.15 && t <= h) arm = lerp(-2.7, CONTACT, phase(t, h - 0.15, h) ** 2);
        if (t > h && t <= h + 0.25) arm = lerp(CONTACT, -1.8, smoothstep(phase(t, h + 0.05, h + 0.25)));
      }
      if (t > hits[2] + 0.25) arm = lerp(-1.8, REST, smoothstep(phase(t, hits[2] + 0.25, 2.5)));
      // left-handed: facing right, the left arm is the one on the camera side
      if (r.armL) r.armL.rotation.set(arm, 0, 0);
      if (r.head) r.head.rotation.x = 0.18;
    } else {
      mouse.current.rotation.y = lerp(PROFILE_RIGHT * 0.85, 0.1, easeInOut(phase(t, 2.4, 2.8)));
      if (r.armL) r.armL.rotation.set(REST, 0, 0);
      const wave = smoothstep(phase(t, 2.8, 3.1)) * (1 - smoothstep(phase(t, 4.1, 4.4)));
      if (r.armR) r.armR.rotation.set(-2.6 * wave, 0, (0.3 + Math.sin(t * 12) * 0.35) * wave);
      if (r.head) r.head.rotation.z = Math.sin(t * 3) * 0.1 * wave;
      if (t >= 4.4) mouse.current.rotation.y = lerp(0.1, PROFILE_RIGHT * 0.85, easeInOut(phase(t, 4.4, 4.8)));
    }

    // the bench takes the blow: a short dip, plus a puff of sawdust from the strike point
    const last = hits.filter((h) => t >= h).pop();
    const since = last === undefined ? 9 : t - last;
    if (bench.current) bench.current.position.y = -0.018 * Math.max(0, 1 - since / 0.12);
    dust.current.forEach((d, i) => {
      if (!d) return;
      const k = since / 0.7;
      d.visible = k < 1;
      if (!d.visible) return;
      const a = (i / dust.current.length) * Math.PI * 2;
      d.position.set(Math.cos(a) * 0.25 * k, 0.86 + 0.18 * k * (1.4 - k), Math.sin(a) * 0.18 * k);
      d.scale.setScalar(0.03 + 0.03 * k);
      (d.material as THREE.MeshStandardMaterial).opacity = 0.7 * (1 - k);
    });
  });

  return (
    <Diorama tilt={-0.15}>
      <group position={[0, 0, -1.3]}>
        <Barrier width={3.4} />
      </group>
      {/* where the hammer head lands, worked out from Squeak's pose at the moment of contact */}
      <group position={[1.095, 0, 1.096]} rotation={[0, 1.335, 0]}>
        <group ref={bench}>
          <Workbench />
        </group>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} ref={(m) => void (dust.current[i] = m)} visible={false}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#e6c79a" transparent opacity={0.7} roughness={1} />
          </mesh>
        ))}
      </group>
      <group position={[2.45, 0, -0.75]} rotation={[0, -0.45, 0]}>
        <WorkSign lines={lines} />
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
          leftHand={<Hammer />}
        />
      </group>
    </Diorama>
  );
}

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

function AngryScene() {
  const mouse = useRef<THREE.Group>(null);
  const phoneRef = useRef<THREE.Group>(null);
  const puffs = useRef<(THREE.Mesh | null)[]>([]);
  const rig = useRef(createRig());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const r = rig.current;
    if (!mouse.current) return;
    resetRig(r);
    const c = t % 2.4;
    const stomp = Math.abs(Math.sin(c * Math.PI * 2.5));
    if (r.footL) r.footL.position.y = 0.1 + (Math.sin(c * Math.PI * 5) > 0 ? stomp * 0.25 : 0);
    if (r.footR) r.footR.position.y = 0.1 + (Math.sin(c * Math.PI * 5) < 0 ? stomp * 0.25 : 0);
    if (r.body) r.body.position.y = Math.abs(Math.sin(c * Math.PI * 5)) * 0.08;
    mouse.current.rotation.y = 0.15 + Math.sin(t * 9) * 0.04;
    if (r.armR) r.armR.rotation.set(-1.9 + Math.sin(t * 22) * 0.25, 0, 0.3);
    if (r.armL) r.armL.rotation.set(-0.5 + Math.sin(t * 11) * 0.3, 0, -0.6);
    if (r.head) {
      r.head.rotation.z = Math.sin(t * 14) * 0.08;
      r.head.rotation.x = -0.12;
    }
    if (phoneRef.current) phoneRef.current.rotation.z = Math.sin(t * 22) * 0.35;
    puffs.current.forEach((p, i) => {
      if (!p) return;
      const k = (t * 0.9 + i / 6) % 1;
      const side = i % 2 ? 1 : -1;
      p.position.set(side * (0.75 + k * 0.5), 2.85 + k * 1.3, 0.3);
      p.scale.setScalar(0.12 + k * 0.28);
      (p.material as THREE.MeshStandardMaterial).opacity = 0.75 * Math.sin(Math.min(1, k * 1.6) * Math.PI * 0.5) * (1 - k);
    });
  });

  return (
    <Diorama tilt={-0.1}>
      <group ref={mouse} scale={0.85}>
        <Shadow />
        <SqueakModel
          rig={rig}
          angry
          rightHand={
            <group ref={phoneRef} position={[0.3, 0.05, 0.3]} rotation={[0.2, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.36, 0.66, 0.06]} />
                <meshStandardMaterial color="#22232b" roughness={0.3} metalness={0.4} />
              </mesh>
              <mesh position={[0, 0, 0.032]}>
                <planeGeometry args={[0.3, 0.56]} />
                <meshBasicMaterial color="#ff5f5f" />
              </mesh>
            </group>
          }
        />
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} ref={(m) => void (puffs.current[i] = m)}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#f2f2f2" transparent opacity={0.6} roughness={1} />
          </mesh>
        ))}
      </group>
    </Diorama>
  );
}

const SCENES: Record<string, { Component: () => ReactNode; camera: V3; target: V3 }> = {
  slide: { Component: SlideScene, camera: [0, 2.1, 9.6], target: [0, 1.65, 0] },
  clap: { Component: ClapScene, camera: [0, 2.3, 8.2], target: [0, 1.55, 0] },
  cheese: { Component: CheeseScene, camera: [0, 2.4, 8.6], target: [0, 1.3, 0] },
  keyframe: { Component: KeyframeScene, camera: [0, 2.3, 8.4], target: [0, 1.2, 0] },
  run: { Component: RunScene, camera: [0, 3, 9.5], target: [0, 0.9, 0.6] },
  construction: { Component: () => <ConstructionScene />, camera: [0, 2.4, 9], target: [0, 1.25, 0] },
  maintenance: { Component: () => <ConstructionScene lines={["SQUEAKEDIT", "IN MANUTENZIONE"]} />, camera: [0, 2.4, 9], target: [0, 1.25, 0] },
  discord: { Component: DiscordScene, camera: [0, 2.0, 7.4], target: [0, 1.5, 0] },
  angry: { Component: AngryScene, camera: [0, 2.2, 7.6], target: [0, 1.7, 0] },
};

export type SiteSceneName = "slide" | "clap" | "cheese" | "keyframe" | "run" | "construction" | "maintenance" | "discord" | "angry";

export default function SiteScene({ name, className }: { name: SiteSceneName; className?: string }) {
  const { Component, camera, target } = SCENES[name];
  return (
    <Stage className={className} camera={camera} target={target} fade>
      <Component />
    </Stage>
  );
}
