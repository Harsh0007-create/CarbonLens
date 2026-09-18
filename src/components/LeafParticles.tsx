import { useEffect, useRef } from "react";

interface Leaf {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  driftPhase: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  glyph: string;
}

const GLYPHS = ["🍃", "🌿", "🍀"];

/**
 * Lightweight canvas particle layer: leaves drift down and sway with a
 * sine-wave motion. Capped particle count and a single rAF loop keep it
 * cheap; the canvas is pointer-transparent so it never blocks the UI.
 */
export default function LeafParticles({ count = 14 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced-motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (initial: boolean): Leaf => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : -30,
      size: 14 + Math.random() * 12,
      speedY: 0.35 + Math.random() * 0.55,
      driftX: 0.6 + Math.random() * 0.9,
      driftPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.35 + Math.random() * 0.35,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    });

    const leaves: Leaf[] = Array.from({ length: count }, () => spawn(true));
    let t = 0;

    const tick = () => {
      t += 0.01;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];
        leaf.y += leaf.speedY;
        leaf.x += Math.sin(t * 2 + leaf.driftPhase) * leaf.driftX * 0.4;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > height + 40) leaves[i] = spawn(false);

        ctx.save();
        ctx.globalAlpha = leaf.opacity;
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.font = `${leaf.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(leaf.glyph, 0, 0);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-[5]"
      aria-hidden="true"
    />
  );
}
