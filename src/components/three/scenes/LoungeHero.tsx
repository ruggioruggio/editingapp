"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stage } from "../Stage";
import { Deckchair, Newspaper } from "../props";
import { createRig, easeInOut, easeOut, lerp, phase, resetRig, Shadow, SqueakModel, walkCycle } from "../SqueakModel";
import { useDragYaw } from "../useDragYaw";

// seduta un po' più alta e più avanti: il corpo non entra nello schienale
const SEAT_Y = 0.56;
const SEAT_Z = 0.5;
const LEAN = -0.14;
// giornale all'altezza del petto e davanti al muso: il naso resta sempre fuori
const PAPER_Y = 1.12;
const PAPER_Z = 1.5;

function Lounge({ yaw }: { yaw: () => number }) {
  const scene = useRef<THREE.Group>(null);
  const mouse = useRef<THREE.Group>(null);
  const lean = useRef<THREE.Group>(null);
  const paper = useRef<THREE.Group>(null);
  const rig = useRef(createRig());
  const [sitting, setSitting] = useState(false);
  const sat = useRef(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = mouse.current;
    const r = rig.current;
    if (!scene.current || !m || !lean.current || !paper.current) return;

    // tutta la scena si gira trascinando, più un po' di parallasse col puntatore
    scene.current.rotation.y = yaw() + state.pointer.x * 0.25 - 0.2;

    if (t < 1.6) {
      // 1. entra camminando da destra
      const p = phase(t, 0, 1.6);
      m.position.set(lerp(3.6, 0, easeOut(p)), 0, 1.7);
      m.rotation.y = -Math.PI / 2;
      walkCycle(r, t, 10, 1 - p * 0.6);
      paper.current.scale.setScalar(0.001);
    } else if (t < 2.0) {
      // 2. si gira verso di noi
      resetRig(r);
      m.rotation.y = lerp(-Math.PI / 2, 0, easeInOut(phase(t, 1.6, 2.0)));
    } else if (t < 2.6) {
      // 3. saltello all'indietro sulla sdraio
      const p = phase(t, 2.0, 2.6);
      m.rotation.y = 0;
      m.position.z = lerp(1.7, SEAT_Z, easeInOut(p));
      m.position.y = Math.sin(p * Math.PI) * 0.9 + SEAT_Y * p;
      lean.current.rotation.x = LEAN * easeOut(p);
      if (p > 0.55 && !sat.current) {
        sat.current = true;
        setSitting(true);
      }
    } else if (t < 3.2) {
      // 4. apre il giornale
      const p = easeOut(phase(t, 2.6, 3.2));
      m.position.set(0, SEAT_Y, SEAT_Z);
      paper.current.scale.setScalar(Math.max(0.001, p));
      paper.current.position.y = PAPER_Y;
      if (r.armL && r.armR) {
        r.armL.rotation.set(-1.45 * p, 0, -0.3 * p);
        r.armR.rotation.set(-1.45 * p, 0, 0.3 * p);
      }
    } else {
      // 5. legge; ogni tanto abbassa il giornale e ci guarda
      const u = (t - 3.2) % 7;
      const down = u < 4.5 ? 0 : u < 5 ? easeInOut((u - 4.5) / 0.5) : u < 6.3 ? 1 : 1 - easeInOut((u - 6.3) / 0.7);
      paper.current.position.y = lerp(PAPER_Y, 0.85, down);
      paper.current.rotation.x = lerp(-0.1, 0.25, down);
      if (r.armL && r.armR) {
        r.armL.rotation.set(lerp(-1.45, -0.95, down), 0, -0.3);
        r.armR.rotation.set(lerp(-1.45, -0.95, down), 0, 0.3);
      }
      if (r.head) {
        r.head.rotation.y = lerp(Math.sin(t * 1.4) * 0.18, state.pointer.x * 0.5, down);
        r.head.rotation.x = lerp(0.06, -state.pointer.y * 0.3, down);
      }
      lean.current.position.y = Math.sin(t * 1.6) * 0.02; // respiro
    }
  });

  return (
    <group ref={scene}>
      <group scale={1.25}>
        <Deckchair />
      </group>
      <group ref={mouse}>
        <Shadow radius={sitting ? 0.01 : 1.05} />
        <group ref={lean}>
          <SqueakModel rig={rig} sitting={sitting} />
        </group>
        <group ref={paper} position={[0, PAPER_Y, PAPER_Z]}>
          <Newspaper />
        </group>
      </group>
      <Shadow radius={1.5} opacity={0.22} />
    </group>
  );
}

/** Hero del sito: Squeak si rilassa sulla sdraio. Trascinalo per girare la scena. */
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
