"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Original solo-piano instrumental: a rolling left-hand arpeggio under a
 * lyrical right-hand line, eight bars of D major with jazz sevenths
 * (Dmaj7 - Bm7 - Em7 - A7 - Dmaj7 - F#m7 - Gmaj7 - A7) through a generated
 * reverb. Synthesized in the browser, so there is no network audio, no
 * autoplay and nothing to license.
 */

const BEAT = 1.2;
const BAR = BEAT * 4;
const SLOT = BAR / 8;

/** Rolling arpeggio shape over the bar, as indices into the chord voicing. */
const ROLL = [0, 1, 2, 3, 2, 1, 2, 1];
/** Slight accent on the downbeat so the bar breathes instead of ticking. */
const ACCENT = [1, 0.72, 0.8, 0.72, 0.78, 0.7, 0.78, 0.68];

type Bar = {
  /** Four chord tones, low to high; the left hand rolls through these. */
  arp: [number, number, number, number];
  /** [frequency, beat offset, decay seconds] */
  melody: [number, number, number][];
};

const A2 = 110.0, B2 = 123.47;
const D3 = 146.83, E3 = 164.81, Fs3 = 185.0, G3 = 196.0, A3 = 220.0, B3 = 246.94;
const Cs4 = 277.18, D4 = 293.66, E4 = 329.63, Fs4 = 369.99, G4 = 392.0, A4 = 440.0, B4 = 493.88;
const Cs5 = 554.37, D5 = 587.33, E5 = 659.25;

const CHORDS: Bar[] = [
  { arp: [D3, A3, Cs4, Fs4], melody: [[A4, 0, 3.2]] },
  { arp: [B2, Fs3, A3, D4], melody: [[Fs4, 0, 2.4], [A4, 2, 2.4]] },
  { arp: [E3, B3, D4, G4], melody: [[G4, 0, 3.0], [B4, 2.5, 2.4]] },
  { arp: [A2, E3, G3, Cs4], melody: [[A4, 0, 2.6], [Cs5, 2, 2.8]] },
  { arp: [D3, A3, Cs4, Fs4], melody: [[D5, 0, 3.4], [A4, 2.5, 2.4]] },
  { arp: [Fs3, A3, Cs4, E4], melody: [[Cs5, 0, 3.0], [A4, 2.5, 2.4]] },
  { arp: [G3, B3, D4, Fs4], melody: [[B4, 0, 3.0], [D5, 2, 2.6]] },
  { arp: [A2, E3, G3, Cs4], melody: [[Cs5, 0, 2.6], [E5, 2, 2.4], [A4, 3.2, 3.0]] },
];

/** Exponentially decaying noise: a small, soft hall. */
function reverbBuffer(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 3);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3.2;
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
    tone.frequency.value = 3000;
    tone.Q.value = 0.7;

    const dry = context.createGain();
    dry.gain.value = 0.76;
    tone.connect(dry);
    dry.connect(master);

    const reverb = context.createConvolver();
    reverb.buffer = reverbBuffer(context);
    const wet = context.createGain();
    wet.gain.value = 0.55;
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

  /** One oscillator with its own envelope, cleaned up when it ends. */
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

  /**
   * A struck note. The fast attack and the quiet octave above read as a
   * hammer; the old version's 3x partial sat an octave and a fifth up and
   * made every note sound hollow instead.
   */
  function struck(e: Engine, frequency: number, start: number, peak: number, decay: number) {
    voice(e, "triangle", frequency, 0, start, 0.006, peak, 0, decay);
    voice(e, "sine", frequency * 2, 0, start, 0.01, peak * 0.26, 0, decay * 0.6);
  }

  function bar(e: Engine, chord: Bar, at: number) {
    // Left hand: a rolling arpeggio. Its constant motion is what keeps the
    // piece continuous, so no sustained pad is needed to cover the gaps.
    ROLL.forEach((index, slot) => {
      struck(e, chord.arp[index], at + slot * SLOT, 0.066 * ACCENT[slot], 2.4);
    });

    // A little air underneath, well below the arpeggio.
    voice(e, "sine", chord.arp[1], -4, at, 0.9, 0.021, BAR, 1.8);
    voice(e, "sine", chord.arp[2], 4, at, 1.1, 0.021, BAR - 0.2, 1.8);

    // Right hand: the melody, louder and longer than the accompaniment.
    chord.melody.forEach(([frequency, beat, decay]) => {
      struck(e, frequency, at + beat * BEAT, 0.15, decay);
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
      e.master.gain.linearRampToValueAtTime(next ? 0.8 : 0, e.context.currentTime + (next ? 1.6 : 0.9));
      setPlaying(next);
      setUnavailable(false);
    } catch { wanted.current = false; setPlaying(false); setUnavailable(true); }
  }

  return <div className="music-control"><button className="music-button" onClick={toggle} aria-label={playing ? "Mute background music" : "Play background music"} aria-pressed={playing} title={playing ? "Mute music" : "Play soft instrumental music"}>{playing ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>{unavailable && <span role="status" className="audio-notice">Music is unavailable in this browser.</span>}</div>;
}
