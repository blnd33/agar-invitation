"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/** Original, quiet pentatonic instrumental. No network audio or autoplay. */
export default function Music() {
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const engine = useRef<{ context: AudioContext; gain: GainNode; timer: ReturnType<typeof setInterval>; next: number; step: number } | null>(null);
  const wanted = useRef(false);
  useEffect(() => {
    const visibility = async () => { const e = engine.current; if (!e) return; if (document.hidden) await e.context.suspend(); else if (wanted.current) { try { e.next = e.context.currentTime + .1; await e.context.resume(); setPlaying(e.context.state === "running"); } catch { wanted.current = false; setPlaying(false); } } };
    document.addEventListener("visibilitychange", visibility);
    return () => { document.removeEventListener("visibilitychange", visibility); if (engine.current) { clearInterval(engine.current.timer); void engine.current.context.close(); } };
  }, []);
  async function toggle() {
    try {
      if (!engine.current) {
        const context = new AudioContext(); const gain = context.createGain(); gain.gain.value = 0; gain.connect(context.destination);
        const e = { context, gain, timer: 0 as unknown as ReturnType<typeof setInterval>, next: context.currentTime + .1, step: 0 };
        const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66, 220, 329.63, 440, 523.25, 392, 329.63, 293.66, 329.63];
        e.timer = setInterval(() => {
          if (context.state !== "running" || !wanted.current) return;
          while (e.next < context.currentTime + .4) {
            const frequency = notes[e.step % notes.length];
            [1, 2, 3].forEach((harmonic, i) => { const osc = context.createOscillator(); const envelope = context.createGain(); osc.type = "sine"; osc.frequency.value = frequency * harmonic; envelope.gain.setValueAtTime(0, e.next); envelope.gain.linearRampToValueAtTime(.16 / (harmonic * harmonic), e.next + .018); envelope.gain.exponentialRampToValueAtTime(.0001, e.next + 3.5 - i * .4); osc.connect(envelope); envelope.connect(gain); osc.start(e.next); osc.stop(e.next + 3.6); osc.onended = () => { osc.disconnect(); envelope.disconnect(); }; });
            e.step++; e.next += .85;
          }
        }, 180); engine.current = e;
      }
      const e = engine.current; const next = !wanted.current; wanted.current = next;
      if (next) { e.next = e.context.currentTime + .08; await e.context.resume(); if (e.context.state !== "running") { wanted.current = false; setPlaying(false); return; } }
      e.gain.gain.cancelScheduledValues(e.context.currentTime); e.gain.gain.setValueAtTime(e.gain.gain.value, e.context.currentTime); e.gain.gain.linearRampToValueAtTime(next ? .38 : 0, e.context.currentTime + .8);
      setPlaying(next); setUnavailable(false);
    } catch { wanted.current = false; setPlaying(false); setUnavailable(true); }
  }
  return <div className="music-control"><button className="music-button" onClick={toggle} aria-label={playing ? "Mute background music" : "Play background music"} aria-pressed={playing} title={playing ? "Mute music" : "Play soft instrumental music"}>{playing ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>{unavailable && <span role="status" className="audio-notice">Music is unavailable in this browser.</span>}</div>;
}
