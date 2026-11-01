/**
 * ManaMart Acoustic Dispatch & Audio Synthesizer Engine
 * Synthesizes pure Web Audio tones (no external audio files required)
 * Engineered for high penetration through ambient neighborhood noise.
 */

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;
    this.volume = 0.85; // Default 85%
    this.isMuted = false;
    this.subscribers = new Set();
    this.lastPlayedSound = null;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported in this browser environment.');
        return null;
      }
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  getAnalyser() {
    this.initAudio();
    return this.analyser;
  }

  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    this.notifySubscribers({ type: 'volume_change', volume: this.volume });
  }

  getVolume() {
    return this.volume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
    this.notifySubscribers({ type: 'mute_toggle', isMuted: this.isMuted });
    return this.isMuted;
  }

  getIsMuted() {
    return this.isMuted;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(event) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error('Error in sound service subscriber:', e);
      }
    });
  }

  /**
   * 1. Hyperlocal Order Chime (Merchant Core: 1.2s Dual Tone)
   * Resonant C5 + E5 marimba tone with G6 overtone sparkle
   */
  playOrderChime() {
    const ctx = this.initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.lastPlayedSound = 'Order Chime (523Hz + 659Hz Dual Marimba)';
    this.notifySubscribers({ type: 'sound_played', name: this.lastPlayedSound });

    try {
      // Note 1: C5 (523.25 Hz) Triangle
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.7, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.85);

      // Note 2: E5 (659.25 Hz) Sine after 90ms offset
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.09);

      gain2.gain.setValueAtTime(0, now + 0.09);
      gain2.gain.linearRampToValueAtTime(0.8, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.09);
      osc2.stop(now + 1.25);

      // Note 3: Overtone sparkle: G6 (1567.98 Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1567.98, now + 0.1);

      gain3.gain.setValueAtTime(0.15, now + 0.1);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc3.connect(gain3);
      gain3.connect(this.masterGain);
      osc3.start(now + 0.1);
      osc3.stop(now + 0.95);
    } catch (err) {
      console.warn('Audio play error:', err);
    }
  }

  /**
   * 2. Rider Proximity Alert (Delivery Radar: 420ms Staccato)
   * Rapid dual chirp: 880Hz -> 1100Hz, then 1320Hz -> 1760Hz
   */
  playRiderChirp() {
    const ctx = this.initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.lastPlayedSound = 'Rider Proximity Chirp (880Hz -> 1320Hz)';
    this.notifySubscribers({ type: 'sound_played', name: this.lastPlayedSound });

    try {
      // Chirp 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.08);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.7, now + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Chirp 2 (Higher pitch, doppler pulse)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.26);

      gain2.gain.setValueAtTime(0, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.75, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.36);
    } catch (err) {
      console.warn('Audio play error:', err);
    }
  }

  /**
   * 3. Neighborhood Deal Ding (Broadcast: 1.8s Harmonious)
   * Tibetan bell / singing bowl: 432Hz fundamental + 864Hz harmonic blend
   */
  playDealDing() {
    const ctx = this.initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.lastPlayedSound = 'Neighborhood Deal Ding (432Hz Singing Bell)';
    this.notifySubscribers({ type: 'sound_played', name: this.lastPlayedSound });

    try {
      // Fundamental 432 Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.7, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0005, now + 1.8);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 1.85);

      // 1st Harmonic 864 Hz
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(864, now);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0005, now + 1.4);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now);
      osc2.stop(now + 1.45);
    } catch (err) {
      console.warn('Audio play error:', err);
    }
  }

  /**
   * 4. Urgent 15-Min Timer Alert (Urgency Pulse: 750ms)
   * Triple pulse countdown alert with B5 sawtooth accent
   */
  playUrgentAlert() {
    const ctx = this.initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.lastPlayedSound = '15-Min Timer Countdown Pulse (740Hz -> 987Hz)';
    this.notifySubscribers({ type: 'sound_played', name: this.lastPlayedSound });

    try {
      [0, 0.15, 0.30].forEach((delay, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index === 2 ? 'sawtooth' : 'sine';
        const freq = index === 2 ? 987.77 : 739.99; // B5 for last pulse
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(index === 2 ? 0.6 : 0.4, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.13);
      });
    } catch (err) {
      console.warn('Audio play error:', err);
    }
  }

  /**
   * Play all 4 chimes in sequence for acoustic sound check
   */
  playSequenceTest() {
    this.playOrderChime();
    setTimeout(() => this.playRiderChirp(), 1400);
    setTimeout(() => this.playDealDing(), 2300);
    setTimeout(() => this.playUrgentAlert(), 4200);
  }
}

export const soundService = new SoundService();
export default soundService;

