export type Sfx = {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  resume: () => void;
  jump: () => void;
  slide: () => void;
  coin: () => void;
  mult: () => void;
  crash: () => void;
  lane: () => void;
};

export function createSfx(startMuted: boolean): Sfx {
  let muted = startMuted;
  let ctx: AudioContext | null = null;

  function context() {
    if (muted) return null;
    try {
      if (!ctx) ctx = new AudioContext();
      if (ctx.state === "suspended") void ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }

  function tone(
    freq: number,
    dur: number,
    when: number,
    type: OscillatorType,
    gain: number,
    slideTo?: number,
  ) {
    const audio = context();
    if (!audio) return;
    const start = audio.currentTime + when;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo && slideTo > 0) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    }
    amp.gain.setValueAtTime(gain, start);
    amp.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function noise(dur: number, gain: number, freq: number) {
    const audio = context();
    if (!audio) return;
    const length = Math.max(1, Math.floor(audio.sampleRate * dur));
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq;
    const amp = audio.createGain();
    const start = audio.currentTime;
    amp.gain.setValueAtTime(gain, start);
    amp.gain.exponentialRampToValueAtTime(0.001, start + dur);
    source.connect(filter);
    filter.connect(amp);
    amp.connect(audio.destination);
    source.start(start);
    source.stop(start + dur);
  }

  return {
    get muted() {
      return muted;
    },
    setMuted(next) {
      muted = next;
      if (!next) context();
    },
    resume() {
      context();
    },
    jump() {
      tone(240, 0.12, 0, "square", 0.05, 640);
    },
    slide() {
      noise(0.16, 0.04, 700);
      tone(200, 0.14, 0, "sawtooth", 0.03, 90);
    },
    coin() {
      tone(740, 0.06, 0, "square", 0.045);
      tone(1180, 0.08, 0.05, "square", 0.04);
    },
    mult() {
      tone(523, 0.08, 0, "square", 0.05);
      tone(659, 0.08, 0.07, "square", 0.05);
      tone(784, 0.12, 0.14, "square", 0.05);
    },
    crash() {
      noise(0.32, 0.1, 400);
      tone(160, 0.28, 0, "sawtooth", 0.06, 40);
    },
    lane() {
      tone(360, 0.04, 0, "square", 0.03);
    },
  };
}
