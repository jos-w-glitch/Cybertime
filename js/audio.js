const AudioEngine = {
  ctx: null,
  musicGain: null,
  sfxGain: null,
  musicNodes: [],
  mp3Audio: null,
  beatInterval: null,
  onBeat: null,
  playing: false,
  mode: null,
  bpm: 80,
  baseMusicVolume: 0.55,
  baseSfxVolume: 0.7,

  init(settings) {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.setVolumes(settings);
    } catch {}
  },

  setVolumes(settings) {
    if (!this.musicGain) return;
    this.baseMusicVolume = settings.musicVolume;
    this.baseSfxVolume = settings.sfxVolume;
    this.musicGain.gain.value = settings.musicVolume;
    this.sfxGain.gain.value = settings.sfxVolume;
  },

  setMusicFade(secondsLeft, fadeDuration) {
    const ratio = Math.max(0, Math.min(1, secondsLeft / fadeDuration));
    const vol = this.baseMusicVolume * ratio;
    if (this.musicGain) this.musicGain.gain.value = vol;
    if (this.mp3Audio && !this.musicNodes.length) this.mp3Audio.volume = vol;
  },

  resetMusicVolume() {
    if (!this.musicGain) return;
    this.musicGain.gain.value = this.baseMusicVolume;
    if (this.mp3Audio && !this.musicNodes.length) this.mp3Audio.volume = this.baseMusicVolume;
  },

  async resume() {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
  },

  stopMusic() {
    this.playing = false;
    this.mode = null;
    clearInterval(this.beatInterval);
    this.beatInterval = null;
    this.onBeat = null;
    for (const node of this.musicNodes) {
      try { node.stop?.(); node.disconnect?.(); } catch {}
    }
    this.musicNodes = [];
    if (this.mp3Audio) {
      this.mp3Audio.pause();
      this.mp3Audio = null;
    }
  },

  startMenuMusic() {
    this.stopMusic();
    this.mode = "menu";
    this.playing = true;
    this._playMusicFile(MUSIC_MENU, MENU_MUSIC_FALLBACK);
  },

  startLevelMusic(level, onBeat) {
    this.stopMusic();
    this.onBeat = onBeat;
    this.bpm = level.bpm;
    this.mode = "level";
    this.playing = true;
    this.resetMusicVolume();
    this._playMusicFile(MUSIC_LEVEL(level), null, () => {
      if (level.musicId === "track1") this._playMusicFile(null, MENU_MUSIC_FALLBACK);
      else if (this.ctx) this._playProceduralTrack(level.musicId, level.bpm);
    });
    const beatMs = 60000 / level.bpm;
    let beat = 0;
    this.onBeat?.(beat);
    this.beatInterval = setInterval(() => {
      if (!this.playing || this.mode !== "level") return;
      beat += 1;
      this.onBeat?.(beat);
    }, beatMs);
  },

  _playMusicFile(basePath, fallback, onFail) {
    const paths = [];
    if (basePath) {
      paths.push(`${basePath}.mp3`, `${basePath}.ogg`, `${basePath}.wav`);
    }
    if (fallback) paths.push(fallback);
    this._tryPlayPaths(paths, 0, onFail);
  },

  _tryPlayPaths(paths, index, onFail) {
    if (index >= paths.length) {
      onFail?.();
      return;
    }
    const audio = new Audio(paths[index]);
    audio.loop = true;
    const tryNext = () => this._tryPlayPaths(paths, index + 1, onFail);
    audio.addEventListener("error", tryNext, { once: true });
    audio.play().then(() => {
      this.mp3Audio = audio;
      if (this.ctx && this.musicGain) {
        try {
          const track = this.ctx.createMediaElementSource(audio);
          track.connect(this.musicGain);
          this.musicNodes.push(track);
        } catch {
          audio.volume = 0.55;
        }
      } else {
        audio.volume = 0.55;
      }
    }).catch(tryNext);
  },

  _playProceduralTrack(trackId, bpm) {
    const num = parseInt(String(trackId).replace("track", ""), 10) || 2;
    const p = {
      bass: 50 + num * 4,
      lead: 200 + num * 12,
      pad: 300 + num * 16,
    };
    const beatSec = 60 / bpm;
    const loopBeats = 16;
    const loopDur = beatSec * loopBeats;
    const now = this.ctx.currentTime;
    this._scheduleBassLoop(p.bass, beatSec, loopBeats, now, loopDur);
    this._scheduleLeadLoop(p.lead, beatSec, loopBeats, now, loopDur);
    this._schedulePad(p.pad, now, loopDur);
  },

  _scheduleBassLoop(freq, beatSec, beats, start, loopDur) {
    for (let i = 0; i < beats * 2; i++) {
      const t = start + (i % beats) * beatSec + Math.floor(i / beats) * loopDur;
      if (i % 2 === 0) this._playMusicTone(freq, t, beatSec * 0.4, "sine", 0.18);
    }
  },

  _scheduleLeadLoop(freq, beatSec, beats, start, loopDur) {
    const pattern = [0, 3, 2, 5, 7, 5, 3, 0];
    for (let loop = 0; loop < 2; loop++) {
      pattern.forEach((step, i) => {
        const t = start + loop * loopDur + step * beatSec;
        this._playMusicTone(freq * (1 + i * 0.02), t, beatSec * 0.15, "triangle", 0.06);
      });
    }
  },

  _schedulePad(freq, start, loopDur) {
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start + i * loopDur);
      gain.gain.linearRampToValueAtTime(0.035, start + i * loopDur + 0.3);
      gain.gain.linearRampToValueAtTime(0, start + (i + 1) * loopDur);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(start + i * loopDur);
      osc.stop(start + (i + 1) * loopDur);
      this.musicNodes.push(osc);
    }
  },

  _playMusicTone(freq, time, dur, type, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
    this.musicNodes.push(osc);
  },

  _playSfx(freq, dur, type, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    osc.onended = () => {
      try { osc.disconnect(); gain.disconnect(); } catch {}
    };
  },

  playHit() { this._playSfx(880, 0.08, "square", 0.12); },
  playMiss() { this._playSfx(120, 0.15, "sawtooth", 0.1); },
  playDefuse() { this._playSfx(440, 0.12, "triangle", 0.1); },
};
