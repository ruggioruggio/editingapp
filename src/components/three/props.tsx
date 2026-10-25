"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";

// Oggetti di scena in 3D, tutti generati in codice.

/** Texture disegnata su canvas (testi, strisce, loghi). Viene creata una volta sola. */
function useCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void, deps: unknown[]) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    draw(ctx);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Scritta sempre rivolta verso la camera (es. "CUT!"). */
export const TextSprite = forwardRef<THREE.Sprite, { text: string; color?: string; size?: number; position?: [number, number, number] }>(
  function TextSprite({ text, color = "#ffc93c", size = 1, position }, ref) {
    const map = useCanvasTexture(
      512,
      192,
      (ctx) => {
        ctx.font = "900 120px Nunito, 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 18;
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.strokeText(text, 256, 100);
        ctx.fillStyle = color;
        ctx.fillText(text, 256, 100);
      },
      [text, color],
    );
    return (
      <sprite ref={ref} position={position} scale={[size * 2.7, size, 1]}>
        <spriteMaterial map={map} transparent depthWrite={false} />
      </sprite>
    );
  },
);

/** Sdraio a righe gialle e bianche. Seduta a y≈0.45. */
export function Deckchair() {
  const stripes = useCanvasTexture(
    256,
    256,
    (ctx) => {
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#fff7dd" : "#ffc93c";
        ctx.fillRect(i * 32, 0, 32, 256);
      }
    },
    [],
  );
  const wood = <meshStandardMaterial color="#9a6a3c" roughness={0.8} />;
  return (
    <group>
      {/* telaio */}
      {[-0.95, 0.95].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.3, 0.55]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.08, 0.75, 0.08]} />
            {wood}
          </mesh>
          <mesh position={[x, 0.85, -0.45]} rotation={[-0.45, 0, 0]}>
            <boxGeometry args={[0.08, 1.9, 0.08]} />
            {wood}
          </mesh>
          <mesh position={[x, 0.55, 0.15]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
            <boxGeometry args={[0.07, 1.2, 0.07]} />
            {wood}
          </mesh>
        </group>
      ))}
      {/* tessuto: seduta e schienale */}
      <mesh position={[0, 0.42, 0.2]} rotation={[-Math.PI / 2 + 0.2, 0, 0]}>
        <planeGeometry args={[1.85, 1.15]} />
        <meshStandardMaterial map={stripes} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.15, -0.62]} rotation={[-0.45, 0, 0]}>
        <planeGeometry args={[1.85, 1.6]} />
        <meshStandardMaterial map={stripes} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Giornale aperto: due pagine a V con titolo e righe di testo. */
export function Newspaper() {
  const page = useCanvasTexture(
    256,
    320,
    (ctx) => {
      ctx.fillStyle = "#f4f1e8";
      ctx.fillRect(0, 0, 256, 320);
      ctx.fillStyle = "#1d1d1d";
      ctx.font = "900 34px Georgia, serif";
      ctx.fillText("SQUEAK", 20, 46);
      ctx.fillText("TIMES", 20, 84);
      ctx.fillRect(20, 96, 216, 4);
      ctx.fillStyle = "#9999ff";
      ctx.fillRect(20, 112, 100, 70);
      ctx.fillStyle = "#8a8a8a";
      for (let y = 196; y < 300; y += 14) ctx.fillRect(20, y, 216 - ((y * 7) % 40), 6);
      for (let y = 112; y < 182; y += 14) ctx.fillRect(132, y, 104, 6);
    },
    [],
  );
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.42 * s, 0, 0.06]} rotation={[0, -0.28 * s, 0]}>
          <planeGeometry args={[0.85, 1.05]} />
          <meshStandardMaterial map={page} side={THREE.DoubleSide} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/** Pellicola con fotogrammi colorati, appoggiata a terra. */
export function FilmStrip({ length = 3 }: { length?: number }) {
  const map = useCanvasTexture(
    512,
    96,
    (ctx) => {
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, 512, 96);
      for (let x = 6; x < 512; x += 24) {
        ctx.fillStyle = "#0b0b0b";
        ctx.fillRect(x, 6, 12, 10);
        ctx.fillRect(x, 80, 12, 10);
      }
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#6f66e0" : "#2d8ceb";
        ctx.fillRect(6 + i * 64, 22, 56, 52);
      }
    },
    [],
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <planeGeometry args={[length, 0.6]} />
      <meshStandardMaterial map={map} side={THREE.DoubleSide} roughness={0.6} />
    </mesh>
  );
}

/** Forbici: due lame, quella superiore ruota per "tagliare". */
export const Scissors = forwardRef<THREE.Group>(function Scissors(_, bladeRef) {
  return (
    <group rotation={[0, 0, -Math.PI / 2]} scale={0.9}>
      {[0, 1].map((i) => (
        <group key={i} ref={i === 1 ? bladeRef : undefined}>
          <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.04, 10, 24]} />
            <meshStandardMaterial color="#ff5f5f" roughness={0.4} />
          </mesh>
          <mesh position={[0.08 * (i ? 1 : -1), 0.38, 0]} rotation={[0, 0, (i ? -1 : 1) * 0.12]}>
            <boxGeometry args={[0.07, 0.75, 0.03]} />
            <meshStandardMaterial color="#d9dde6" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

/** Ciak: base con scritte e asta superiore incernierata a sinistra. */
export const Clapperboard = forwardRef<THREE.Group>(function Clapperboard(_, stickRef) {
  const face = useCanvasTexture(
    256,
    160,
    (ctx) => {
      ctx.fillStyle = "#1f1f1f";
      ctx.fillRect(0, 0, 256, 160);
      ctx.fillStyle = "#e8e8e8";
      ctx.font = "800 26px Nunito, sans-serif";
      ctx.fillText("SCENA 1", 18, 52);
      ctx.fillText("CIAK 1", 18, 96);
      ctx.fillStyle = "#9999ff";
      ctx.fillText("EDIT", 160, 52);
    },
    [],
  );
  const stripes = useCanvasTexture(
    256,
    32,
    (ctx) => {
      ctx.fillStyle = "#1f1f1f";
      ctx.fillRect(0, 0, 256, 32);
      ctx.fillStyle = "#f2f2f2";
      for (let x = -32; x < 256; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 32);
        ctx.lineTo(x + 24, 0);
        ctx.lineTo(x + 48, 0);
        ctx.lineTo(x + 24, 32);
        ctx.fill();
      }
    },
    [],
  );
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.2, 0.75, 0.06]} />
        <meshStandardMaterial attach="material-4" map={face} />
        <meshStandardMaterial attach="material-0" color="#1f1f1f" />
        <meshStandardMaterial attach="material-1" color="#1f1f1f" />
        <meshStandardMaterial attach="material-2" color="#1f1f1f" />
        <meshStandardMaterial attach="material-3" color="#1f1f1f" />
        <meshStandardMaterial attach="material-5" color="#1f1f1f" />
      </mesh>
      {/* cerniera a sinistra */}
      <group ref={stickRef} position={[-0.6, 0.38, 0]}>
        <mesh position={[0.6, 0.09, 0]}>
          <boxGeometry args={[1.2, 0.18, 0.07]} />
          <meshStandardMaterial attach="material-4" map={stripes} />
          <meshStandardMaterial attach="material-0" color="#1f1f1f" />
          <meshStandardMaterial attach="material-1" color="#1f1f1f" />
          <meshStandardMaterial attach="material-2" color="#1f1f1f" />
          <meshStandardMaterial attach="material-3" color="#1f1f1f" />
          <meshStandardMaterial attach="material-5" color="#1f1f1f" />
        </mesh>
      </group>
    </group>
  );
});

/** Spicchio di formaggio estruso, con i buchi. */
export function Cheese() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1.6, 0);
    shape.lineTo(1.6, 0.9);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  }, []);
  return (
    <group>
      <mesh geometry={geometry} position={[-0.8, 0, -0.5]}>
        <meshStandardMaterial color="#ffc93c" roughness={0.6} />
      </mesh>
      {[
        [0.35, 0.35, 0.52],
        [0.0, 0.18, 0.52],
        [0.5, 0.6, 0.1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 1, 0.3]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#d99a00" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Keyframe a forma di rombo, come in timeline. */
export const KeyframeDiamond = forwardRef<THREE.Mesh, { position: [number, number, number] }>(function KeyframeDiamond(
  { position },
  ref,
) {
  return (
    <mesh ref={ref} position={position} rotation={[0, 0, 0]}>
      <octahedronGeometry args={[0.28]} />
      <meshStandardMaterial color="#555" emissive="#ffc93c" emissiveIntensity={0} roughness={0.4} />
    </mesh>
  );
});

/** Logo di Discord ("Clyde") estruso in 3D: solido, con gli occhi traforati. Largo ~2 unità. */
export function DiscordLogo3D() {
  const geometry = useMemo(() => {
    // tracciato disegnato su una griglia 256x256 e portato in coordinate 3D (y verso l'alto)
    const p = (x: number, y: number) => new THREE.Vector2((x - 128) / 128, -(y - 140) / 128);
    const shape = new THREE.Shape();
    const start = p(60, 88);
    shape.moveTo(start.x, start.y);
    const quad = (cx: number, cy: number, x: number, y: number) => {
      const c = p(cx, cy);
      const e = p(x, y);
      shape.quadraticCurveTo(c.x, c.y, e.x, e.y);
    };
    quad(128, 60, 196, 88);
    quad(222, 140, 214, 186);
    quad(196, 200, 172, 204);
    const a = p(160, 184);
    shape.lineTo(a.x, a.y);
    quad(128, 194, 96, 184);
    const b = p(84, 204);
    shape.lineTo(b.x, b.y);
    quad(60, 200, 42, 186);
    quad(34, 140, 60, 88);
    for (const ex of [100, 156]) {
      const c = p(ex, 146);
      const eye = new THREE.Path();
      eye.absellipse(c.x, c.y, 17 / 128, 20 / 128, 0, Math.PI * 2, false, 0);
      shape.holes.push(eye);
    }
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 24,
    });
    g.center();
    return g;
  }, []);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#5865f2" roughness={0.3} metalness={0.1} emissive="#2a33a8" emissiveIntensity={0.25} />
    </mesh>
  );
}

/** Pannello del Graph Editor di After Effects: sfondo scuro con griglia ed etichette. */
export function GraphPanel({ width = 7.4, height = 4.4 }: { width?: number; height?: number }) {
  const map = useCanvasTexture(
    740,
    440,
    (ctx) => {
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, 740, 440);
      ctx.strokeStyle = "#2c2c2c";
      ctx.lineWidth = 2;
      for (let x = 0; x <= 740; x += 46) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 440);
        ctx.stroke();
      }
      for (let y = 0; y <= 440; y += 44) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(740, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#6f6f6f";
      ctx.font = "600 20px 'Segoe UI', sans-serif";
      ["1200 px/sec", "800", "400", "0"].forEach((label, i) => ctx.fillText(label, 10, 30 + i * 132));
      ctx.fillStyle = "#2d8ceb";
      ctx.fillRect(500, 0, 3, 440); // indicatore di tempo
    },
    [],
  );
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  );
}

/** Caschetto giallo da cantiere (si mette in testa a Squeak). */
export function HardHat() {
  return (
    <group position={[0, 0.42, 0.02]} rotation={[-0.12, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.66, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffc93c" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.02, 0.12]} scale={[1, 1, 1.15]}>
        <cylinderGeometry args={[0.78, 0.8, 0.06, 32]} />
        <meshStandardMaterial color="#f2b21f" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.5]}>
        <torusGeometry args={[0.32, 0.05, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#f2b21f" roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Gilet arancione ad alta visibilità con bande riflettenti. */
export function SafetyVest() {
  return (
    <group position={[0, 0.95, 0.02]}>
      <mesh scale={[1.03, 0.62, 1.15]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, Math.PI * 0.18, Math.PI * 0.62]} />
        <meshStandardMaterial color="#ff7a1a" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[-0.12, 0.12].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.12, 1]}>
          <torusGeometry args={[1.01, 0.035, 8, 48]} />
          <meshStandardMaterial color="#e6ff6b" emissive="#c8e04a" emissiveIntensity={0.35} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Martello: manico di legno e testa di metallo. */
export function Hammer() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.75, 10]} />
        <meshStandardMaterial color="#9a6a3c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.34, 0.14, 0.14]} />
        <meshStandardMaterial color="#8d93a3" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Cono stradale arancione con banda bianca. */
export function TrafficCone() {
  return (
    <group>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial color="#e2600f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.28, 0.9, 24]} />
        <meshStandardMaterial color="#ff7a1a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.15, 0.19, 0.16, 24]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Transenna a strisce bianche e rosse. */
export function Barrier({ width = 2.6 }: { width?: number }) {
  const stripes = useCanvasTexture(
    512,
    64,
    (ctx) => {
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, 512, 64);
      ctx.fillStyle = "#e5322d";
      for (let x = -64; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 64);
        ctx.lineTo(x + 32, 0);
        ctx.lineTo(x + 64, 0);
        ctx.lineTo(x + 32, 64);
        ctx.fill();
      }
    },
    [],
  );
  return (
    <group>
      {[-width / 2 + 0.15, width / 2 - 0.15].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#c9c9c9" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.75, 0.05]}>
        <boxGeometry args={[width, 0.26, 0.05]} />
        <meshStandardMaterial attach="material-4" map={stripes} />
        <meshStandardMaterial attach="material-0" color="#e5322d" />
        <meshStandardMaterial attach="material-1" color="#e5322d" />
        <meshStandardMaterial attach="material-2" color="#e5322d" />
        <meshStandardMaterial attach="material-3" color="#e5322d" />
        <meshStandardMaterial attach="material-5" color="#e5322d" />
      </mesh>
    </group>
  );
}

/** Cartello giallo del cantiere su due pali. */
export function WorkSign({ lines }: { lines: [string, string] }) {
  const map = useCanvasTexture(
    512,
    320,
    (ctx) => {
      ctx.fillStyle = "#ffc93c";
      ctx.fillRect(0, 0, 512, 320);
      ctx.strokeStyle = "#1d1d1d";
      ctx.lineWidth = 14;
      ctx.strokeRect(14, 14, 484, 292);
      ctx.fillStyle = "#1d1d1d";
      ctx.textAlign = "center";
      ctx.font = "900 52px Nunito, 'Segoe UI', sans-serif";
      ctx.fillText(lines[0], 256, 135, 440);
      ctx.font = "800 48px Nunito, 'Segoe UI', sans-serif";
      ctx.fillText(lines[1], 256, 222, 440);
    },
    lines,
  );
  return (
    <group>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.85, -0.02]}>
          <boxGeometry args={[0.08, 1.7, 0.08]} />
          <meshStandardMaterial color="#9a6a3c" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0.03]}>
        <boxGeometry args={[1.8, 1.12, 0.06]} />
        <meshStandardMaterial attach="material-4" map={map} />
        <meshStandardMaterial attach="material-0" color="#d9a524" />
        <meshStandardMaterial attach="material-1" color="#d9a524" />
        <meshStandardMaterial attach="material-2" color="#d9a524" />
        <meshStandardMaterial attach="material-3" color="#d9a524" />
        <meshStandardMaterial attach="material-5" color="#d9a524" />
      </mesh>
    </group>
  );
}

/** Pila di mattoni. */
export function Bricks() {
  const rows = [
    [-0.3, 0.3],
    [0, 0.6],
  ];
  return (
    <group>
      {[0, 1, 2].map((r) =>
        (r === 2 ? [0] : r === 1 ? rows[0] : rows[1].concat(-0.6)).map((x) => (
          <mesh key={`${r}${x}`} position={[x, 0.11 + r * 0.22, 0]}>
            <boxGeometry args={[0.56, 0.2, 0.3]} />
            <meshStandardMaterial color="#b5532f" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  );
}
