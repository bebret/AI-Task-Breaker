import { useEffect } from 'react';

/**
 * Daftar suara latar mode fokus. Suaranya disintesis pakai Web Audio API
 * (bukan file audio) supaya tetap ringan dan bisa jalan offline.
 */
export const AMBIENT_SOUNDS = [
  {
    id: 'none',
    emoji: '🤫',
    label: 'Tanpa Suara',
    desc: 'Fokus dalam sunyi.',
  },
  {
    id: 'rain',
    emoji: '🌧️',
    label: 'Rintik Hujan',
    desc: 'Derai hujan yang bikin rileks.',
  },
  {
    id: 'wind',
    emoji: '🌬️',
    label: 'Suara Angin',
    desc: 'Angin sepoi-sepoi di pepohonan.',
  },
  {
    id: 'calm',
    emoji: '🎧',
    label: 'Tenang',
    desc: 'Nada rendah, tanpa distraksi.',
  },
];

const VOLUME = { rain: 0.16, wind: 0.3, calm: 0.24 };

/** Buffer noise 2 detik: white untuk hujan, brown untuk angin, pink untuk tenang. */
function makeNoiseBuffer(ctx, kind) {
  const length = Math.floor(ctx.sampleRate * 2);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === 'white') {
      data[i] = white * 0.5;
    } else if (kind === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    } else {
      last = 0.98 * last + 0.02 * white;
      data[i] = white * 0.4 + last * 1.6;
    }
  }

  return buffer;
}

/** Rakit sumber noise -> filter -> gain, plus LFO halus biar terasa hidup. */
function buildChain(ctx, soundId) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const source = ctx.createBufferSource();
  source.buffer = makeNoiseBuffer(
    ctx,
    soundId === 'rain' ? 'white' : soundId === 'wind' ? 'brown' : 'pink'
  );
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  const lfos = [];

  if (soundId === 'rain') {
    filter.type = 'highpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.5;

    // Getaran halus supaya terasa seperti tetesan, bukan desis datar.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.7;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    lfos.push(lfo);
  } else if (soundId === 'wind') {
    filter.type = 'lowpass';
    filter.frequency.value = 620;

    // Angin naik-turun: LFO menggerakkan cut-off filter.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 340;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    lfos.push(lfo);
  } else {
    filter.type = 'lowpass';
    filter.frequency.value = 520;
  }

  source.connect(filter);
  filter.connect(master);
  source.start();

  return { master, source, lfos };
}

/**
 * Putar suara latar sesuai `soundId` selama `enabled` bernilai true.
 * Volume di-fade in/out supaya tidak "njeglek" saat mulai atau dijeda.
 */
export function useAmbientSound(soundId, enabled) {
  useEffect(() => {
    const Ctor =
      typeof window !== 'undefined' &&
      (window.AudioContext || window.webkitAudioContext);
    if (!Ctor || !enabled || !soundId || soundId === 'none') return undefined;

    const ctx = new Ctor();
    const chain = buildChain(ctx, soundId);
    const target = VOLUME[soundId] ?? 0.2;

    if (ctx.state === 'suspended') ctx.resume?.();
    chain.master.gain.setTargetAtTime(target, ctx.currentTime, 0.5);

    return () => {
      const now = ctx.currentTime;
      chain.master.gain.cancelScheduledValues(now);
      chain.master.gain.setTargetAtTime(0, now, 0.15);
      window.setTimeout(() => {
        try {
          chain.source.stop();
        } catch {
          /* sudah berhenti */
        }
        chain.lfos.forEach((lfo) => {
          try {
            lfo.stop();
          } catch {
            /* sudah berhenti */
          }
        });
        ctx.close();
      }, 400);
    };
  }, [soundId, enabled]);
}
