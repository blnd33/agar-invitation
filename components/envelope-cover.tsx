"use client";
import type { Ref } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function EnvelopeCover({ opening, disabled, onOpen, triggerRef }: {
  opening: boolean; disabled: boolean; onOpen: () => void; triggerRef: Ref<HTMLButtonElement>;
}) {
  const reduced = useReducedMotion();
  return <motion.section className={`scene gatefold-scene ${opening ? "gatefold-is-opening" : ""}`} aria-label="A special invitation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .45 }}>
    <div className="gatefold-doors" aria-hidden="true">
      <div className="gatefold-door gatefold-left">
        <div className="gatefold-art"><img className="gatefold-botanical" src="/embossed-botanical.webp" alt="" fetchPriority="high"/><img className="gatefold-botanical secondary-botanical" src="/embossed-botanical.webp" alt=""/></div>
        <span className="gatefold-seal"><img className="wax-seal-texture" src="/wax-seal.webp" alt=""/><span className="stamp-inner"><img src="/couple-logo.png" alt=""/></span></span>
      </div>
      <div className="gatefold-door gatefold-right"><div className="gatefold-art"><img className="gatefold-botanical" src="/embossed-botanical.webp" alt=""/><img className="gatefold-botanical secondary-botanical" src="/embossed-botanical.webp" alt=""/></div></div>
    </div>
    <header className="gatefold-heading"><h1>A Special Invitation</h1></header>
    <button ref={triggerRef} className="gatefold-open" onClick={onOpen} disabled={disabled} aria-label="Tap to Open" aria-busy={opening}><span className="gatefold-instruction">{opening ? "Opening your invitation…" : "Touch the seal to open"}</span></button>
    <div className="gatefold-footer" aria-hidden="true">Made with love, for you</div>
  </motion.section>;
}
