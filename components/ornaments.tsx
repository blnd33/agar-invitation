"use client";
import { motion, useReducedMotion } from "motion/react";

export function Monogram({ wreath = false }: { wreath?: boolean }) {
  const reduced = useReducedMotion();
  return <div className={`monogram ${wreath ? "with-wreath" : ""}`}>
    {wreath && <motion.img className="wreath botanical-wreath" src="/eucalyptus-wreath.webp" alt="" aria-hidden="true" width="700" height="700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : .15 }}/>}
    <img className="couple-logo" src="/couple-logo.png" alt="Agar and Renas — the couple’s calligraphic logo" width="400" height="600" />
  </div>;
}
export function Rings() { return <div className="rings-divider" aria-hidden="true"><span /><svg viewBox="0 0 58 32" fill="none"><circle cx="23" cy="18" r="10" /><circle cx="36" cy="18" r="10" /><path d="m32 6 4-4 4 4-4 4-4-4Z" /></svg><span /></div>; }
