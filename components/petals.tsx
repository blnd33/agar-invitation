"use client";
import { useEffect, useState, type CSSProperties } from "react";
type Petal = { x: number; y: number; duration: number; delay: number; drift: number; rotation: number; size: number; opacity: number; type: number };
export default function Petals() {
  const [petals, setPetals] = useState<Petal[]>([]);
  useEffect(() => { setPetals(Array.from({ length: 9 }, (_, i) => ({ x: Math.random() * 100, y: -12 - Math.random() * 18, duration: 19 + Math.random() * 19, delay: -Math.random() * 38, drift: (Math.random() - 0.5) * 180, rotation: (Math.random() > .5 ? 1 : -1) * (100 + Math.random() * 280), size: 23 + Math.random() * 15, opacity: .44 + Math.random() * .26, type: i % 4 }))); }, []);
  return <div className="petals" aria-hidden="true">{petals.map((p, i) => <div key={i} className={`petal petal-${p.type}`} style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size * 1.4, opacity: p.opacity, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`, "--drift": `${p.drift}px`, "--rotation": `${p.rotation}deg`, "--flutter-duration": `${3 + i * .37}s` } as CSSProperties}><img src={`/botanical-leaf-${p.type}.webp`} alt="" width="100" height="140" decoding="async"/></div>)}</div>;
}
