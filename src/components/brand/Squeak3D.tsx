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

  useFrame((state, dt) => {
    const g = root.current;
    const r = rig.current;
    if (!g || !r.body) return;
    const t = state.clock.elapsedTime;
    resetRig(r);

    if (mode === "turntable") {
      g.rotation.y += dt * 1.1;
      r.body.position.y = Math.abs(Math.sin(t * 3)) * 0.12;
      return;
    }
    const wave = () => {
      if (r.armR) r.armR.rotation.set(-2.6, 0, 0.3 + Math.sin(t * 14) * 0.35);
    };
    if (mode === "flip") {
      const squash = t < 0.4 ? Math.sin((t / 0.4) * Math.PI) * 0.18 : 0;
      const p = clamp01((t - 0.4) / 0.9);
      r.body.position.y = Math.sin(p * Math.PI) * 1.6;
      r.body.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
      r.body.rotation.x = -easeOut(p) * Math.PI * 2;
      g.rotation.y = 0.5 - easeOut(clamp01((t - 1.3) / 0.8)) * 0.5;
      if (t > 1.5) wave();
    } else {
      const p = clamp01(t / 1.4);
      g.rotation.y = easeOut(p) * Math.PI * 2;
      r.body.position.y = Math.sin(p * Math.PI) * 0.5;
      if (t > 1.4) wave();
    }
  });

  return (
    <group ref={root}>
      <Shadow />
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
