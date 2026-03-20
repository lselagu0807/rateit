import { Component, OnInit, OnDestroy, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { EmpresaService } from '../../core/services/empresa.service';
import { ResenaService } from '../../core/services/resena.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { Empresa, Resena } from '../../core/models/models';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, StarRatingComponent, DecimalPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private empresaService = inject(EmpresaService);
  private resenaService = inject(ResenaService);
  private router = inject(Router);

  empresas = signal<Empresa[]>([]);
  resenas = signal<Resena[]>([]);
  searchQuery = '';
  loading = signal(true);

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse = { x: -1000, y: -1000 };
  private animId = 0;
  private readonly NUM_PARTICLES = 80;
  private readonly MAX_DIST = 140;
  private readonly MOUSE_RADIUS = 160;

  ngOnInit() {
    this.empresaService.getAll('valoracion_media', 'desc').subscribe(data => this.empresas.set(data.slice(0, 3)));
    this.resenaService.getAll().subscribe(data => { this.resenas.set(data.slice(0, 4)); this.loading.set(false); });
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize(canvas);
    this.initParticles(canvas);
    window.addEventListener('resize', () => this.resize(canvas));
    window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { this.mouse.x = -1000; this.mouse.y = -1000; });
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', () => { });
    window.removeEventListener('mousemove', () => { });
  }

  private resize(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initParticles(canvas: HTMLCanvasElement) {
    this.particles = Array.from({ length: this.NUM_PARTICLES }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
    }));
  }

  private animate() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of this.particles) {
      // Atracción suave al ratón
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.MOUSE_RADIUS) {
        p.vx += dx / dist * 0.3;
        p.vy += dy / dist * 0.3;
      }

      // Límite de velocidad
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 2.5) { p.vx = (p.vx / speed) * 2.5; p.vy = (p.vy / speed) * 2.5; }

      p.x += p.vx;
      p.y += p.vy;

      // Rebote en bordes
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // Dibujar punto
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(0, 192, 127, 0.6)';
      this.ctx.fill();
    }

    // Dibujar líneas entre partículas cercanas
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.MAX_DIST) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(0, 192, 127, ${1 - dist / this.MAX_DIST})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/empresas'], { queryParams: { q: this.searchQuery } });
    }
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Hace menos de 1 hora';
    if (h < 24) return `Hace ${h} hora${h > 1 ? 's' : ''}`;
    const d = Math.floor(h / 24);
    return `Hace ${d} día${d > 1 ? 's' : ''}`;
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#1E6B4A', '#6B3A1E', '#1E3F6B', '#5B1E6B', '#6B6B1E', '#1E5B6B'];
    let hash = 0;
    for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  ratingLabel(r: number): string {
    if (r >= 4.5) return 'Excelente'; if (r >= 4) return 'Muy bien';
    if (r >= 3) return 'Regular'; return 'Mal';
  }
}