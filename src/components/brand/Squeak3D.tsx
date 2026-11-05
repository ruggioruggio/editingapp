"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stage } from "@/components/three/Stage";
import { clamp01, createRig, easeOut, resetRig, Shadow, SqueakModel } from "@/components/three/SqueakModel";

export type Squeak3DMode = "turntable" | "flip" | "spin";

function Solo({ mode }: { mode: Squeak3DMode }) {
  const root = useRef<THREE.Group>(null);
  const rig = useRef(createRig());

  const look = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    const g = root.current;
    const r = rig.current;
    if (!g || !r.body) return;
    const t = state.clock.elapsedTime;
    resetRig(r);

    // Smoothed pointer follow + idle look-around.
    const lx = state.pointer.x * 0.45 + Math.sin(t * 0.7) * 0.18;
    const ly = -state.pointer.y * 0.2 + Math.sin(t * 0.9 + 1) * 0.05;
    look.current.x += (lx - look.current.x) * 0.06;
    look.current.y += (ly - look.current.y) * 0.06;
    const idle = (from: number, turns = 0) => {
      const k = easeOut(clamp01((t - from) / 0.8));
      g.rotation.y = g.rotation.y * (1 - k) + (turns * Math.PI * 2 + Math.sin((t - from) * 0.55) * 0.35 + look.current.x * 0.4) * k;
      if (r.head) {
        r.head.rotation.y = look.current.x * k;
        r.head.rotation.x = look.current.y * k;
        r.head.rotation.z = Math.sin(t * 0.8) * 0.04 * k;
      }
      const hop = (1 - Math.cos(t * 2.4)) / 2;
      r.body?.position.setY(hop * 0.07 * k);
      if (r.armL) r.armL.rotation.z = -0.08 - Math.sin(t * 2.4) * 0.05;
      if (r.armR && mode === "turntable") r.armR.rotation.z = 0.08 + Math.sin(t * 2.4) * 0.05;
    };
    const wave = (from: number) => {
      const k = easeOut(clamp01((t - from) / 0.5));
      if (r.armR) r.armR.rotation.set(-2.5 * k, 0, (0.3 + Math.sin(t * 8) * 0.32) * k);
    };

    if (mode === "turntable") {
      idle(0);
      return;
    }
    if (mode === "flip") {
      const squash = t < 0.4 ? Math.sin((t / 0.4) * Math.PI) * 0.16 : 0;
      const p = clamp01((t - 0.4) / 0.95);
      const land = t > 1.35 && t < 1.65 ? Math.sin(((t - 1.35) / 0.3) * Math.PI) * 0.1 : 0;
      r.body.position.y = Math.sin(p * Math.PI) * 1.5;
      r.body.scale.set(1 + (squash + land) * 0.5, 1 - squash - land, 1 + (squash + land) * 0.5);
      r.body.rotation.x = -easeOut(p) * Math.PI * 2;
      if (t > 1.65) idle(1.65);
      if (t > 1.5) wave(1.5);
    } else {
      const p = clamp01(t / 1.6);
      const back = 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2;
      g.rotation.y = back * Math.PI * 2;
      r.body.position.y = Math.sin(p * Math.PI) * 0.45;
      if (t > 1.6) idle(1.6, 1);
      if (t > 1.5) wave(1.5);
    }
  });

  return (
    <group ref={root}>
      <Shadow radius={1.15} opacity={0.32} />
      <SqueakModel rig={rig} />
    </group>
  );
}

export default function Squeak3D({ mode = "turntable", className }: { mode?: Squeak3DMode; className?: string }) {
  return (
    <Stage eager className={className} camera={[0, 1.9, 8]} target={[0, 1.35, 0]} fov={32}>
      <Solo mode={mode} />
    </Stage>
  );
}
