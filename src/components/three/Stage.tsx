"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import clsx from "clsx";

/**
 * Contenitore delle scene 3D. Il canvas WebGL esiste solo quando la scena è
 * vicina allo schermo: con tante scene nella stessa pagina il browser non
 * terrebbe aperti tutti i contesti grafici (e consumerebbe batteria).
 */
export function Stage({
  children,
  className,
  camera = [0, 2.4, 10],
  target = [0, 1.2, 0],
  fov = 30,
  eager = false,
}: {
  children: ReactNode;
  className?: string;
  camera?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  /** monta subito, senza aspettare che sia visibile (hero, splash) */
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <div ref={ref} className={clsx("relative", className)}>
      {visible && (
        <Canvas
          dpr={[1, 2]}
          camera={{ position: camera, fov }}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ camera: cam }) => cam.lookAt(...target)}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 6, 5]} intensity={1.7} />
          <directionalLight position={[-4, 3, -4]} intensity={0.9} color="#9999ff" />
          <pointLight position={[0, 1, 5]} intensity={6} color="#ffd9e6" distance={10} />
          {children}
        </Canvas>
      )}
    </div>
  );
}
