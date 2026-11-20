"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Original, quiet instrumental: a music-box melody over a soft string pad,
 * eight bars of D major (I - vi - IV - V - I - iii - IV - V) through a
 * generated reverb. Synthesized in the browser, so there is no network
 * audio, no autoplay and nothing to license.
 */

const BEAT = 1.2;
const BAR = BEAT * 4;

type Bar = {
  /** Root, an octave below the pad. */
  bass: number;
  /** Sustained triad held across the bar. */
  pad: number[];
  /** [frequency, beat offset, decay seconds] */
  melody: [number, number, number][];
};

const Fs4 = 369.99, G4 = 392.0, A4 = 440.0, B4 = 493.88;
const Cs5 = 554.37, D5 = 587.33, E5 = 659.25;
const D2 = 73.42, Fs2 = 92.5, G2 = 98.0, A2 = 110.0, B2 = 123.47;
const Cs3 = 138.59, D3 = 146.83, E3 = 164.81, Fs3 = 185.0, G3 = 196.0, A3 = 220.0, B3 = 246.94;

/**
 * The pad is voiced in a single close register (138-247 Hz) with smooth voice
 * leading. Spelling the chords from their roots put four of the eight bars
 * under 164 Hz, where a phone speaker reproduces almost nothing.
 */
const CHORDS: Bar[] = [
  { bass: D2, pad: [D3, Fs3, A3], melody: [[A4, 0, 3.4], [Fs4, 2, 2.6], [D5, 3, 2.8]] },
  { bass: B2, pad: [D3, Fs3, B3], melody: [[Fs4, 0, 3.0], [B4, 1.5, 2.6], [A4, 3, 2.6]] },
  { bass: G2, pad: [D3, G3, B3], melody: [[G4, 0, 3.2], [B4, 2, 2.6], [D5, 3, 2.8]] },
  { bass: A2, pad: [Cs3, E3, A3], melody: [[A4, 0, 3.0], [Cs5, 2, 2.6], [E5, 3.5, 2.4]] },
  { bass: D2, pad: [D3, Fs3, A3], melody: [[D5, 0, 3.6], [A4, 2, 2.8]] },
  { bass: Fs2, pad: [Cs3, Fs3, A3], melody: [[Cs5, 0, 3.0], [A4, 1.5, 2.6], [Fs4, 3, 2.8]] },
  { bass: G2, pad: [D3, G3, B3], melody: [[B4, 0, 3.2], [G4, 2, 2.6], [D5, 3, 2.8]] },
  { bass: A2, pad: [Cs3, E3, A3], melody: [[Cs5, 0, 3.0], [E5, 2, 2.6], [A4, 3, 3.0]] },
];

/** Exponentially decaying noise: a small, soft hall. */
function reverbBuffer(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 2.6);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const decay = (1 - i / length) ** 3.2;
      data[i] = (Math.random() * 2 - 1) * decay;
    }
  }
  return buffer;
}

type Engine = {
  context: AudioContext;
  master: GainNode;
  bus: GainNode;
  timer: ReturnType<typeof setInterval>;
  next: number;
  step: number;
};

export default function Music() {
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const engine = useRef<Engine | null>(null);
  const wanted = useRef(false);

  useEffect(() => {
    const visibility = async () => {
      const e = engine.current;
      if (!e) return;
      if (document.hidden) await e.context.suspend();
      else if (wanted.current) {
        try {
          e.next = e.context.currentTime + 0.1;
          await e.context.resume();
          setPlaying(e.context.state === "running");
        } catch { wanted.current = false; setPlaying(false); }
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      if (engine.current) { clearInterval(engine.current.timer); void engine.current.context.close(); }
    };
  }, []);

  function build(): Engine {
    const context = new AudioContext();

    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    // Rolls the edge off every voice, which is most of the "soft".
    const tone = context.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 3200;
    tone.Q.value = 0.7;

    const dry = context.createGain();
    dry.gain.value = 0.78;
    tone.connect(dry);
    dry.connect(master);

    const reverb = context.createConvolver();
    reverb.buffer = reverbBuffer(context);
    const wet = context.createGain();
    wet.gain.value = 0.5;
    tone.connect(reverb);
    reverb.connect(wet);
    wet.connect(master);

    const bus = context.createGain();
    bus.gain.value = 1;
    bus.connect(tone);

    const e: Engine = { context, master, bus, timer: 0 as unknown as ReturnType<typeof setInterval>, next: context.currentTime + 0.15, step: 0 };

    e.timer = setInterval(() => {
      if (context.state !== "running" || !wanted.current) return;
      while (e.next < context.currentTime + 1.2) {
        bar(e, CHORDS[e.step % CHORDS.length], e.next);
        e.step++;
        e.next += BAR;
      }
    }, 250);

    return e;
  }

  /**
   * One oscillator with its own envelope, cleaned up when it ends.
   * `hold` keeps the pad at level across the bar; without it the
   * exponential release dips into an audible gap before the next chord.
   */
  function voice(e: Engine, type: OscillatorType, frequency: number, detune: number, start: number, attack: number, peak: number, hold: number, decay: number) {
    const osc = e.context.createOscillator();
    const envelope = e.context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.linearRampToValueAtTime(peak, start + attack);
    if (hold > 0) envelope.gain.setValueAtTime(peak, start + attack + hold);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + decay);
    osc.connect(envelope);
    envelope.connect(e.bus);
    osc.start(start);
    osc.stop(start + attack + hold + decay + 0.1);
    osc.onended = () => { osc.disconnect(); envelope.disconnect(); };
  }

  function bar(e: Engine, chord: Bar, at: number) {
    // Pad: two lightly detuned sines per chord tone, held across the bar and
    // released just into the next one so the chords join rather than pulse.
    // Holding for a whole BAR means this chord is still at level when the next
    // one finishes its attack, so the two crossfade instead of leaving a gap.
    chord.pad.forEach((frequency) => {
      voice(e, "sine", frequency, -4, at, 0.9, 0.03, BAR, 1.8);
      voice(e, "sine", frequency, 4, at, 1.1, 0.03, BAR - 0.2, 1.8);
    });

    // Kept deliberately quiet: phone speakers cannot reproduce this octave, so
    // any more of it would just eat headroom the melody needs.
    voice(e, "sine", chord.bass, 0, at, 0.4, 0.022, BAR * 0.9, 1.6);

    // Melody: a soft struck tone plus a quiet octave for sparkle. This is what
    // actually has to carry on a phone, so it sits well above the pad.
    chord.melody.forEach(([frequency, beat, decay]) => {
      const start = at + beat * BEAT;
      voice(e, "triangle", frequency, 0, start, 0.035, 0.17, 0, decay);
      voice(e, "sine", frequency * 2, 0, start, 0.04, 0.045, 0, decay * 0.7);
    });
  }

  async function toggle() {
    try {
      if (!engine.current) engine.current = build();
      const e = engine.current;
      const next = !wanted.current;
      wanted.current = next;
      if (next) {
        e.next = e.context.currentTime + 0.15;
        await e.context.resume();
        if (e.context.state !== "running") { wanted.current = false; setPlaying(false); return; }
      }
      e.master.gain.cancelScheduledValues(e.context.currentTime);
      e.master.gain.setValueAtTime(e.master.gain.value, e.context.currentTime);
      e.master.gain.linearRampToValueAtTime(next ? 0.55 : 0, e.context.currentTime + (next ? 1.6 : 0.9));
      setPlaying(next);
      setUnavailable(false);
    } catch { wanted.current = false; setPlaying(false); setUnavailable(true); }
  }

  return <div className="music-control"><button className="music-button" onClick={toggle} aria-label={playing ? "Mute background music" : "Play background music"} aria-pressed={playing} title={playing ? "Mute music" : "Play soft instrumental music"}>{playing ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>{unavailable && <span role="status" className="audio-notice">Music is unavailable in this browser.</span>}</div>;
}
