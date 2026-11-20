"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig, useReducedMotion } from "motion/react";
import { CalendarDays, ChevronDown, Clock3, Download, Heart, MapPin, RotateCcw, X } from "lucide-react";
import { calendarIcs, countdownAt, event, googleCalendarUrl, mapsUrl } from "@/lib/event";
import { Monogram, Rings } from "./ornaments";
import Petals from "./petals";
import Music from "./music";
import EnvelopeCover from "./envelope-cover";
import InvitationFrame from "./invitation-frame";

type Stage = "cover" | "logo" | "names" | "invitation";
const ease = [0.22, 1, 0.36, 1] as const;

function Countdown() {
  const [remaining, setRemaining] = useState<ReturnType<typeof countdownAt> | null>(null);
  useEffect(() => { const tick = () => setRemaining(countdownAt(Date.now())); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  if (remaining?.total === 0) return <p className="special-day" role="status">Our Special Day Is Here!</p>;
  return <section className="countdown-section" aria-label="Time until our engagement"><p className="eyebrow">Until our engagement</p><div className="countdown" role="timer" aria-label={remaining ? `${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds remaining` : "Loading countdown"}>
    {(["days", "hours", "minutes", "seconds"] as const).map(unit => <div className="countdown-card" key={unit}><AnimatePresence mode="popLayout" initial={false}><motion.span key={remaining?.[unit] ?? "loading"} initial={{ opacity: .3, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: .22 }} className="countdown-number">{remaining ? String(remaining[unit]).padStart(2, "0") : "–"}</motion.span></AnimatePresence><span className="countdown-label">{unit}</span></div>)}
  </div></section>;
}
function Names({ final = false }: { final?: boolean }) {
  const reduced = useReducedMotion();
  return <motion.h1 className={`couple-names ${final ? "final-names" : ""}`} aria-label="Agar and Renas">
    <motion.span layoutId="name-agar" initial={final ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 1.2, delay: final || reduced ? 0 : .2, ease }}>Agar</motion.span><motion.em layoutId="name-ampersand" initial={final ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 1.2, delay: final || reduced ? 0 : .4, ease }}>&</motion.em><motion.span layoutId="name-renas" initial={final ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 1.2, delay: final || reduced ? 0 : .55, ease }}>Renas</motion.span>
  </motion.h1>;
}
function CalendarDialog({ close }: { close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  function download() { const url = URL.createObjectURL(new Blob([calendarIcs()], { type: "text/calendar;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "agar-and-renas-engagement.ics"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return <dialog ref={dialog} className="calendar-dialog" aria-labelledby="calendar-title" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}><div className="calendar-dialog-inner"><button className="dialog-close" onClick={close} aria-label="Close calendar options"><X size={19}/></button><CalendarDays size={28} strokeWidth={1}/><h2 id="calendar-title">Save our date</h2><p>December 2, 2026 · 7:00 PM<br/>Duhok time (UTC+03:00)</p><a className="action primary" href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer"><CalendarDays size={17}/> Add to Google Calendar</a><button className="action secondary" onClick={download}><Download size={17}/> Apple Calendar / Download ICS</button><p className="calendar-note">A little note: the calendar ends at 10:00 PM.<br/>The celebration’s end time is still to be confirmed.</p></div></dialog>;
}

export default function Invitation() {
  const [stage, setStage] = useState<Stage>("cover");
  const [transitioning, setTransitioning] = useState(false);
  const [openingEnvelope, setOpeningEnvelope] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = useReducedMotion();
  const lock = useRef(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const finalHeading = useRef<HTMLDivElement>(null);
  const calendarTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!calendarOpen) calendarTrigger.current?.focus({ preventScroll: true }); }, [calendarOpen]);
  useEffect(() => { const update = () => setHidden(document.hidden); document.addEventListener("visibilitychange", update); return () => { document.removeEventListener("visibilitychange", update); if (transitionTimer.current) clearTimeout(transitionTimer.current); }; }, []);
  function advance(next: Stage) {
    if (lock.current) return;
    lock.current = true; setTransitioning(true); setStage(next);
    if (next === "cover") setOpeningEnvelope(false);
    if (next === "cover" || next === "invitation") window.scrollTo({ top: 0, behavior: "instant" });
    transitionTimer.current = setTimeout(() => { lock.current = false; setTransitioning(false); if (next === "invitation") finalHeading.current?.focus({ preventScroll: true }); else continueButton.current?.focus({ preventScroll: true }); }, reduced ? 60 : next === "logo" ? 450 : 1700);
  }
  function openEnvelope() {
    if (lock.current) return;
    lock.current = true; setOpeningEnvelope(true); setTransitioning(true);
    transitionTimer.current = setTimeout(() => {
      lock.current = false;
      advance("logo");
    }, reduced ? 60 : 2800);
  }
  const reveal = (delay: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: reduced ? 0 : 1, delay: reduced ? 0 : delay, ease } });
  return <MotionConfig reducedMotion="user"><main className={`invitation-shell stage-${stage} ${hidden ? "is-hidden" : ""} ${stage === "invitation" ? "is-final" : ""}`}>
    <div className="watercolor-wash" aria-hidden="true"/>
    <div className="botanical botanical-top" aria-hidden="true"><img src="/eucalyptus-corner.webp" alt="" width="950" height="950" fetchPriority="high"/></div>
    <div className="botanical botanical-bottom" aria-hidden="true"><img src="/eucalyptus-corner.webp" alt="" width="950" height="950"/></div>
    <div className="paper-grain" aria-hidden="true"/>
    <InvitationFrame/>
    <Petals/><Music/>
    <LayoutGroup><AnimatePresence mode="sync">
      {stage === "cover" && <EnvelopeCover key="cover" opening={openingEnvelope} disabled={transitioning} onOpen={openEnvelope} triggerRef={continueButton}/>}
      {(stage === "logo" || (stage === "cover" && openingEnvelope)) && <motion.section key="logo" className="scene logo-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: reduced ? 0 : 1.2, ease }} aria-label="Our monogram" aria-hidden={stage !== "logo"}>
        <motion.div className="logo-reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 1.8 }}><Monogram wreath/></motion.div>
        <button ref={continueButton} className="scene-tap-target" disabled={transitioning} onClick={() => advance("names")} aria-label="Tap anywhere to continue"><span className="continue-prompt">Continue<ChevronDown size={15} strokeWidth={1}/></span></button>
      </motion.section>}
      {stage === "names" && <motion.section key="names" className="scene names-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 1.1, ease }} aria-label="Agar and Renas"><div className="names-content"><div className="name-flourish" aria-hidden="true">✧</div><Names/><motion.div {...reveal(.9)}><Rings/></motion.div></div><button ref={continueButton} className="scene-tap-target" disabled={transitioning} onClick={() => advance("invitation")} aria-label="Tap to View Invitation"><span className="continue-prompt">View invitation<ChevronDown size={15} strokeWidth={1}/></span></button></motion.section>}
      {stage === "invitation" && <motion.section key="invitation" className="final-invitation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .7 }} aria-label="Complete engagement invitation"><motion.div className="final-monogram" {...reveal(.2)}><Monogram/></motion.div><motion.p className="eyebrow families" {...reveal(.45)}>Together with their families,</motion.p><div ref={finalHeading} tabIndex={-1} className="final-heading"><Names final/></div><motion.p className="eyebrow invitation-message" {...reveal(.7)}>Joyfully invite you to celebrate<br/>their engagement.</motion.p><motion.div {...reveal(.9)}><Rings/></motion.div>
        <motion.div className="event-details" {...reveal(1)}><div className="event-row"><CalendarDays/><div><span className="detail-label">Date</span><p>Wednesday, December 2, 2026</p></div></div><div className="event-row"><Clock3/><div><span className="detail-label">Time</span><p>7:00 PM <span className="timezone-label">· Duhok time</span></p></div></div><div className="event-row"><MapPin/><div><span className="detail-label">Location</span><p>{event.venue}</p></div></div></motion.div>
        <motion.div {...reveal(1.2)}><Countdown/></motion.div><motion.div className="invitation-actions" {...reveal(1.4)}><motion.a whileTap={{ scale: .98 }} className="action primary" href={mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={18} strokeWidth={1.5}/>Open in Google Maps</motion.a><motion.button ref={calendarTrigger} whileTap={{ scale: .98 }} className="action secondary" onClick={() => setCalendarOpen(true)} aria-haspopup="dialog"><CalendarDays size={18} strokeWidth={1.5}/>Add to Calendar</motion.button></motion.div>
        <motion.footer className="final-footer" {...reveal(1.6)}><Heart size={17} strokeWidth={1}/><p>With love, Agar & Renas</p><button onClick={() => advance("cover")} className="replay-button"><RotateCcw size={12}/> Replay invitation</button></motion.footer>
      </motion.section>}
    </AnimatePresence></LayoutGroup>
    <span className="sr-only" role="status">{stage === "logo" ? "Our monogram. Continue to reveal our names." : stage === "names" ? "Agar and Renas. Continue to view the invitation." : stage === "invitation" ? "The complete engagement invitation is now open." : "Welcome to our invitation."}</span>
    {calendarOpen && <CalendarDialog close={() => setCalendarOpen(false)}/>}
  </main></MotionConfig>;
}
