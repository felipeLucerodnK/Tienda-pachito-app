import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {

  private context: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  // Sonido de caja registradora — para ventas
  cajaRegistradora() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // "Ding" metálico
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(1200, t);
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc1.start(t);
    osc1.stop(t + 0.4);

    // "Ka" grave
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(300, t + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(100, t + 0.2);
    gain2.gain.setValueAtTime(0.3, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc2.start(t + 0.05);
    osc2.stop(t + 0.25);
  }

  // Sonido de compra/entrada de mercancía
  compra() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    [0, 0.12, 0.24].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime([523, 659, 784][i], t + delay);
      gain.gain.setValueAtTime(0.25, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    });
  }

  // Sonido de éxito — para guardar/crear
  exito() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.setValueAtTime(900, t + 0.1);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Sonido de error
  error() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Sonido de click suave — para botones generales
  click() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}