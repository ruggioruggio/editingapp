"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stage } from "../Stage";
import { Deckchair, Newspaper } from "../props";
import { createRig, easeInOut, lerp, phase, resetRig, Shadow, smoothstep, SqueakModel, walkCycle } from "../SqueakModel";
import { useDragYaw } from "../useDragYaw";

const SEAT_Y = 0.56;
const SEAT_Z = 0.5;
const LEAN = -0.14;
const GRIP_Z = 0.26;
// short arms can't hold the paper past the snout: it is read at chest height, head bent over it
const READ_ARM = -1.0;
const LOWER_ARM = -0.55;
const PAPER_GRIP = new THREE.Vector3(0, -0.04, 0.22);
const POCKET_ROT = new THREE.Euler(-0.25, 0.6, 0.12);
const READ_ROT = new THREE.Euler(-0.1, 0, 0);

function Pocket({ anchor }: { anchor: RefObject<THREE.Group | null> }) {
  return (
    <group position={[0.56, 0.62, 0.84]} rotation={[POCKET_ROT.x, POCKET_ROT.y, POCKET_ROT.z]}>
      <mesh position={[0, -0.06, 0.02]}>
        <boxGeometry args={[0.46, 0.4, 0.07]} />
        <meshPhysicalMaterial color="#4f63a3" roughness={0.85} sheen={0.5} />
      </mesh>
      <mesh position={[0, 0.12, 0.065]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.47, 0.1, 0.03]} />
        <meshPhysicalMaterial color="#3d4f88" roughness={0.85} />
      </mesh>
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.09, 0.085]}>
          <sphereGeometry args={[0.022, 12, 8]} />
          <meshStandardMaterial color="#e8c26a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <group ref={anchor} position={[0, 0.06, -0.01]} />
    </group>
  );
}

function Lounge({ yaw }: { yaw: () => number }) {
  const scene = useRef<THREE.Group>(null);
  const mouse = useRef<THREE.Group>(null);
  const lean = useRef<THREE.Group>(null);
  const paper = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Group>(null);
  const hand = useRef<THREE.Group>(null);
  const pocket = useRef<THREE.Group>(null);
  const rig = useRef(createRig());
  const [sitting, setSitting] = useState(false);
  const sat = useRef(false);
  const handL = useRef<THREE.Group>(null);
  const tmp = useMemo(() => ({ rest: new THREE.Vector3(), held: new THREE.Vector3(), heldL: new THREE.Vector3(), read: new THREE.Vector3(), out: new THREE.Vector3() }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = mouse.current;
    const r = rig.current;
    const p = paper.current;
    if (!scene.current || !m || !lean.current || !p) return;

    scene.current.rotation.y = yaw() + state.pointer.x * 0.25 - 0.2;
    if (t < 2.85) resetRig(r);

    // 1. walks in and slows down to a stop
    if (t < 1.7) {
      const k = phase(t, 0, 1.7);
      m.position.set(lerp(2.3, 0, 1 - (1 - k) ** 2), 0, 1.7);
      m.rotation.y = -Math.PI / 2;
      walkCycle(r, t, 8, (1 - k) ** 0.6);
    } else if (t < 2.2) {
      // 2. turns to face us, weight shifting
      m.rotation.y = lerp(-Math.PI / 2, 0, easeInOut(phase(t, 1.7, 2.15)));
      if (r.head) r.head.rotation.y = lerp(0.4, 0, smoothstep(phase(t, 1.75, 2.2)));
    } else if (t < 3.0) {
      // 3. crouch (anticipation), hop back onto the chair, absorb the landing
      const crouch = Math.sin(phase(t, 2.2, 2.45) * Math.PI);
      const k = smoothstep(phase(t, 2.38, 2.85));
      m.position.z = lerp(1.7, SEAT_Z, k);
      m.position.y = Math.sin(k * Math.PI) * 0.75 + SEAT_Y * k;
      if (r.body) r.body.scale.set(1 + crouch * 0.08, 1 - crouch * 0.12, 1 + crouch * 0.08);
      if (r.armL && r.armR) {
        r.armL.rotation.set(0.5 * crouch - 0.6 * Math.sin(k * Math.PI), 0, -0.25);
        r.armR.rotation.set(0.5 * crouch - 0.6 * Math.sin(k * Math.PI), 0, 0.25);
      }
      lean.current.rotation.x = LEAN * smoothstep(phase(t, 2.7, 3.0));
      if (k > 0.5 && !sat.current) {
        sat.current = true;
        setSitting(true);
      }
    }

    if (t >= 2.85) {
      m.position.set(0, SEAT_Y, SEAT_Z);
      lean.current.rotation.x = LEAN;
    }

    if (shadow.current) shadow.current.scale.setScalar(Math.max(0.001, 1 - smoothstep(phase(t, 2.35, 2.75))));

    // 4. paper: in the pocket -> grabbed -> raised with both hands -> unfolded
    if (pocket.current) pocket.current.getWorldPosition(tmp.rest);
    if (hand.current) hand.current.getWorldPosition(tmp.held);
    if (handL.current) handL.current.getWorldPosition(tmp.heldL);
    m.worldToLocal(tmp.rest);
    m.worldToLocal(tmp.held);
    m.worldToLocal(tmp.heldL);
    // both paws grip the outer edges, which curve back toward Squeak, so the fold sits a little further out
    tmp.read.copy(tmp.held).add(tmp.heldL).multiplyScalar(0.5).add(PAPER_GRIP);

    const reach = smoothstep(phase(t, 3.1, 3.55));
    const lift = smoothstep(phase(t, 3.55, 4.0));
    const raise = smoothstep(phase(t, 3.95, 4.6));
    const grab = smoothstep(phase(t, 3.48, 3.62));

    if (t >= 3.0 && t < 4.6 && r.armL && r.armR && r.head) {
      // right paw goes down to the pocket, then up to the chest
      const ax = lerp(lerp(0, -0.55, reach), -1.05, lift);
      const az = lerp(lerp(0, -0.25, reach), -0.1, lift);
      r.armR.rotation.set(lerp(ax, READ_ARM, raise), 0, lerp(az, GRIP_Z, raise));
      r.armL.rotation.set(lerp(0, READ_ARM, raise), 0, lerp(0, -GRIP_Z, raise));
      r.head.rotation.x = lerp(0.3 * reach * (1 - lift), 0.12, raise);
      r.head.rotation.y = -0.35 * reach * (1 - lift * 0.7) * (1 - raise);
    }

    tmp.out.copy(tmp.rest).lerp(tmp.held, grab).lerp(tmp.read, raise);
    p.position.copy(tmp.out);
    p.rotation.set(lerp(POCKET_ROT.x, READ_ROT.x, raise), lerp(POCKET_ROT.y, READ_ROT.y, Math.max(grab * 0.4, raise)), lerp(POCKET_ROT.z, READ_ROT.z, raise));
    const openX = smoothstep(phase(t, 4.1, 4.55));
    const openY = smoothstep(phase(t, 4.25, 4.75));
    const sx = lerp(0.22, 1, openX);
    p.scale.set(sx, lerp(0.26, 1, openY), sx);

    // 5. reads, now and then lowers the paper to look at us (the paper simply follows the paws)
    if (t >= 4.6) {
      const u = (t - 4.6) % 7;
      const down = u < 4.5 ? 0 : u < 5 ? easeInOut((u - 4.5) / 0.5) : u < 6.3 ? 1 : 1 - easeInOut((u - 6.3) / 0.7);
      p.rotation.x = lerp(-0.1, 0.25, down);
      if (r.armL && r.armR) {
        r.armL.rotation.set(lerp(READ_ARM, LOWER_ARM, down), 0, -GRIP_Z);
        r.armR.rotation.set(lerp(READ_ARM, LOWER_ARM, down), 0, GRIP_Z);
      }
      if (r.head) {
        const settle = smoothstep(phase(t, 4.6, 5.2));
        r.head.rotation.y = lerp(Math.sin(t * 1.4) * 0.18 * settle, state.pointer.x * 0.5, down);
        // eyes follow the lines while reading, then look up at us
        r.head.rotation.x = lerp(0.12 + Math.sin(t * 0.9) * 0.03, -state.pointer.y * 0.3, down);
      }
      lean.current.position.y = Math.sin(t * 1.6) * 0.02;
    }
  });

  return (
    <group ref={scene}>
      <group scale={1.25}>
        <Deckchair />
      </group>
      <group ref={mouse}>
        <group ref={shadow}>
          <Shadow radius={1.05} />
        </group>
        <group ref={lean}>
          <SqueakModel
            rig={rig}
            sitting={sitting}
            outfit={<Pocket anchor={pocket} />}
            rightHand={<group ref={hand} position={[0, -0.05, 0.12]} />}
            leftHand={<group ref={handL} position={[0, -0.05, 0.12]} />}
          />
        </group>
        <group ref={paper}>
          <Newspaper />
        </group>
      </group>
      <Shadow radius={1.5} opacity={0.22} />
    </group>
  );
}

export default function LoungeHero({ className }: { className?: string }) {
  const { handlers, step } = useDragYaw();
  return (
    <div className={className} {...handlers} style={{ touchAction: "pan-y", cursor: "grab" }}>
      <Stage eager fade className="h-full w-full" camera={[0, 2.3, 10.5]} target={[0, 1.35, 0]} fov={30}>
        <Lounge yaw={step} />
      </Stage>
    </div>
  );
}
