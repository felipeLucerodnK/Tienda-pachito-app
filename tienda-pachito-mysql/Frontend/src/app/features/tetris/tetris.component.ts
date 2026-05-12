import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundService } from '../../core/services/sound.service';

const COLS = 10;
const ROWS = 20;
const BLOCK = 28;

const PIEZAS = [
  { forma: [[1,1,1,1]], color: '#00f0f0' },
  { forma: [[1,1],[1,1]], color: '#f0f000' },
  { forma: [[0,1,0],[1,1,1]], color: '#a000f0' },
  { forma: [[0,1,1],[1,1,0]], color: '#00f000' },
  { forma: [[1,1,0],[0,1,1]], color: '#f00000' },
  { forma: [[1,0,0],[1,1,1]], color: '#0000f0' },
  { forma: [[0,0,1],[1,1,1]], color: '#f0a000' },
];

@Component({
  selector: 'app-tetris',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tetris-wrapper">
      <div class="tetris-header">
        <span>🎮 Tetris</span>
        <div class="tetris-info">
          <span>Puntos: <strong>{{ puntos() }}</strong></span>
          <span>Nivel: <strong>{{ nivel() }}</strong></span>
        </div>
      </div>

      <div class="tetris-body">
        <canvas #gameCanvas
          [width]="COLS * BLOCK"
          [height]="ROWS * BLOCK"
          (click)="canvasFocus()"
          id="tetris-canvas">
        </canvas>

        <div class="tetris-side">
          <div class="side-box">
            <div class="side-label">SIGUIENTE</div>
            <canvas id="next-canvas" [width]="4*BLOCK" [height]="4*BLOCK"></canvas>
          </div>

          <div class="side-box controls">
            <div class="side-label">CONTROLES</div>
            <div class="control-item"><kbd>←→</kbd> Mover</div>
            <div class="control-item"><kbd>↑</kbd> Rotar</div>
            <div class="control-item"><kbd>↓</kbd> Bajar</div>
            <div class="control-item"><kbd>Space</kbd> Caída</div>
            <div class="control-item"><kbd>P</kbd> Pausa</div>
          </div>

          @if (!corriendo() && !gameOver() && !pausado()) {
            <button class="btn-start" (click)="iniciar()">▶ Iniciar</button>
          }
          @if (corriendo()) {
            <button class="btn-start btn-pause" (click)="pausar()">⏸ Pausa</button>
          }
          @if (pausado()) {
            <button class="btn-start" (click)="reanudar()">▶ Reanudar</button>
          }
          @if (gameOver()) {
            <div class="game-over">GAME OVER</div>
            <button class="btn-start" (click)="iniciar()">↺ Reiniciar</button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tetris-wrapper { display: flex; flex-direction: column; gap: 12px; }
    .tetris-header {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 1rem; font-weight: 700;
    }
    .tetris-info { display: flex; gap: 1rem; font-size: 0.9rem; }
    .tetris-body { display: flex; gap: 16px; align-items: flex-start; }
    canvas#tetris-canvas {
      border: 2px solid #333; background: #111;
      cursor: pointer; display: block;
    }
    .tetris-side { display: flex; flex-direction: column; gap: 12px; min-width: 120px; }
    .side-box {
      background: #f9fafb; border: 1px solid #e5e7eb;
      border-radius: 8px; padding: 10px;
    }
    .side-label { font-size: 0.7rem; font-weight: 700; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.05em; }
    canvas#next-canvas { background: #111; border-radius: 4px; display: block; }
    .controls { font-size: 0.78rem; }
    .control-item { margin-bottom: 4px; color: #374151; }
    kbd {
      background: #e5e7eb; border-radius: 4px;
      padding: 1px 5px; font-size: 0.72rem; font-family: monospace;
    }
    .btn-start {
      background: #0f3460; color: white; border: none;
      border-radius: 8px; padding: 0.6rem; font-weight: 700;
      cursor: pointer; width: 100%; font-size: 0.85rem;
    }
    .btn-start:hover { background: #16213e; }
    .btn-pause { background: #d97706; }
    .btn-pause:hover { background: #b45309; }
    .game-over {
      text-align: center; font-weight: 900; color: #dc2626;
      font-size: 1rem; letter-spacing: 0.1em;
    }
  `]
})
export class TetrisComponent implements OnInit, OnDestroy {
  COLS = COLS; ROWS = ROWS; BLOCK = BLOCK;
  puntos  = signal(0);
  nivel   = signal(1);
  corriendo = signal(false);
  pausado   = signal(false);
  gameOver  = signal(false);

  private tablero: (string | null)[][] = [];
  private piezaActual: any = null;
  private piezaSiguiente: any = null;
  private posX = 0; private posY = 0;
  private intervalo: any = null;
  private ctx!: CanvasRenderingContext2D;
  private ctxNext!: CanvasRenderingContext2D;

  constructor(private sound: SoundService) {}

  ngOnInit() {
    setTimeout(() => {
      const canvas = document.getElementById('tetris-canvas') as HTMLCanvasElement;
      const next   = document.getElementById('next-canvas')   as HTMLCanvasElement;
      if (canvas) this.ctx     = canvas.getContext('2d')!;
      if (next)   this.ctxNext = next.getContext('2d')!;
      this.resetTablero();
      this.dibujar();
    }, 50);
  }

  ngOnDestroy() { this.detener(); }

  canvasFocus() {}

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.corriendo() || this.pausado()) return;
    switch(e.key) {
      case 'ArrowLeft':  this.mover(-1); break;
      case 'ArrowRight': this.mover(1);  break;
      case 'ArrowDown':  this.bajar();   break;
      case 'ArrowUp':    this.rotar();   break;
      case ' ':          e.preventDefault(); this.caida(); break;
      case 'p': case 'P': this.pausar(); break;
    }
  }

  iniciar() {
    this.resetTablero();
    this.puntos.set(0);
    this.nivel.set(1);
    this.gameOver.set(false);
    this.pausado.set(false);
    this.piezaSiguiente = this.nuevaPieza();
    this.spawnPieza();
    this.corriendo.set(true);
    this.iniciarIntervalo();
    this.sound.exito();
  }

  pausar() {
    this.pausado.set(true);
    this.corriendo.set(false);
    clearInterval(this.intervalo);
    this.sound.click();
  }

  reanudar() {
    this.pausado.set(false);
    this.corriendo.set(true);
    this.iniciarIntervalo();
    this.sound.click();
  }

  detener() { clearInterval(this.intervalo); }

  private iniciarIntervalo() {
    clearInterval(this.intervalo);
    const velocidad = Math.max(100, 600 - (this.nivel() - 1) * 50);
    this.intervalo = setInterval(() => this.tick(), velocidad);
  }

  private resetTablero() {
    this.tablero = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  private nuevaPieza() {
    const p = PIEZAS[Math.floor(Math.random() * PIEZAS.length)];
    return { forma: p.forma.map(r => [...r]), color: p.color };
  }

  private spawnPieza() {
    this.piezaActual    = this.piezaSiguiente;
    this.piezaSiguiente = this.nuevaPieza();
    this.posX = Math.floor(COLS / 2) - Math.floor(this.piezaActual.forma[0].length / 2);
    this.posY = 0;
    this.dibujarSiguiente();
    if (!this.esValida(this.piezaActual.forma, this.posX, this.posY)) {
      this.gameOver.set(true);
      this.corriendo.set(false);
      clearInterval(this.intervalo);
      this.sound.gameOverSonido();
    }
  }

  private tick() {
    if (!this.bajar()) {
      this.fijar();
      this.sound.fijarPieza();
      this.limpiarLineas();
      this.spawnPieza();
    }
    this.dibujar();
  }

  private mover(dx: number) {
    if (this.esValida(this.piezaActual.forma, this.posX + dx, this.posY)) {
      this.posX += dx;
      this.sound.moverPieza();
      this.dibujar();
    }
  }

  private bajar(): boolean {
    if (this.esValida(this.piezaActual.forma, this.posX, this.posY + 1)) {
      this.posY++; this.dibujar(); return true;
    }
    return false;
  }

  private caida() {
    while (this.esValida(this.piezaActual.forma, this.posX, this.posY + 1)) this.posY++;
    this.sound.fijarPieza();
    this.fijar();
    this.limpiarLineas();
    this.spawnPieza();
    this.dibujar();
  }

  private rotar() {
    const rotada = this.piezaActual.forma[0].map((_: any, i: number) =>
      this.piezaActual.forma.map((r: any[]) => r[i]).reverse()
    );
    if (this.esValida(rotada, this.posX, this.posY)) {
      this.piezaActual.forma = rotada;
      this.sound.rotarPieza();
      this.dibujar();
    }
  }

  private esValida(forma: number[][], x: number, y: number): boolean {
    return forma.every((fila, dy) =>
      fila.every((val, dx) => {
        if (!val) return true;
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && nx < COLS && ny < ROWS && !this.tablero[ny]?.[nx];
      })
    );
  }

  private fijar() {
    this.piezaActual.forma.forEach((fila: number[], dy: number) =>
      fila.forEach((val, dx) => {
        if (val) this.tablero[this.posY + dy][this.posX + dx] = this.piezaActual.color;
      })
    );
  }

  private limpiarLineas() {
    let lineas = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.tablero[y].every(c => c !== null)) {
        this.tablero.splice(y, 1);
        this.tablero.unshift(Array(COLS).fill(null));
        lineas++; y++;
      }
    }
    if (lineas > 0) {
      this.sound.limpiarLinea();
      const pts = [0, 100, 300, 500, 800][lineas] * this.nivel();
      this.puntos.update(p => p + pts);
      if (this.puntos() >= this.nivel() * 500) {
        this.nivel.update(n => n + 1);
        this.sound.exito();
        this.iniciarIntervalo();
      }
    }
  }

  private dibujar() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK);

    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        this.ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      }
    }

    this.tablero.forEach((fila, y) =>
      fila.forEach((color, x) => {
        if (color) this.dibujarBloque(this.ctx, x, y, color);
      })
    );

    let shadowY = this.posY;
    while (this.esValida(this.piezaActual.forma, this.posX, shadowY + 1)) shadowY++;
    this.piezaActual.forma.forEach((fila: number[], dy: number) =>
      fila.forEach((val, dx) => {
        if (val) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
          this.ctx.fillRect((this.posX + dx) * BLOCK, (shadowY + dy) * BLOCK, BLOCK, BLOCK);
        }
      })
    );

    this.piezaActual.forma.forEach((fila: number[], dy: number) =>
      fila.forEach((val, dx) => {
        if (val) this.dibujarBloque(this.ctx, this.posX + dx, this.posY + dy, this.piezaActual.color);
      })
    );
  }

  private dibujarSiguiente() {
    if (!this.ctxNext) return;
    this.ctxNext.fillStyle = '#111';
    this.ctxNext.fillRect(0, 0, 4 * BLOCK, 4 * BLOCK);
    const f = this.piezaSiguiente.forma;
    const ox = Math.floor((4 - f[0].length) / 2);
    const oy = Math.floor((4 - f.length) / 2);
    f.forEach((fila: number[], dy: number) =>
      fila.forEach((val, dx) => {
        if (val) this.dibujarBloque(this.ctxNext, ox + dx, oy + dy, this.piezaSiguiente.color);
      })
    );
  }

  private dibujarBloque(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, 4);
    ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, 4, BLOCK - 2);
  }
}