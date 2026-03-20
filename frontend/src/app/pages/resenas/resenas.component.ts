import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ResenaService } from '../../core/services/resena.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { AuthService } from '../../core/services/auth.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { Resena, ResenaForm, Empresa } from '../../core/models/models';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [FormsModule, RouterLink, StarRatingComponent],
  templateUrl: './resenas.component.html',
  styleUrls: ['./resenas.component.scss'],
})
export class ResenasComponent implements OnInit {
  private resenaService = inject(ResenaService);
  private empresaService = inject(EmpresaService);
  auth = inject(AuthService);

  resenas = signal<Resena[]>([]);
  empresas = signal<Empresa[]>([]);
  loading = signal(true);
  filterPuntuacion = signal(0);
  showModal = signal(false);
  editTarget = signal<Resena | null>(null);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  form: ResenaForm = this.emptyForm();

  ngOnInit() {
    this.empresaService.getAll().subscribe(data => this.empresas.set(data));
    this.load();
  }

  load() {
    this.loading.set(true);
    const p = this.filterPuntuacion();
    this.resenaService.getAll(p || undefined).subscribe(data => { this.resenas.set(data); this.loading.set(false); });
  }

  setFilter(p: number) { this.filterPuntuacion.set(p); this.load(); }

  openCreate() { this.form = this.emptyForm(); this.editTarget.set(null); this.showModal.set(true); }

  openEdit(r: Resena) {
    this.editTarget.set(r);
    this.form = { usuario_id: r.usuario_id, empresa_id: r.empresa_id, titulo: r.titulo, cuerpo: r.cuerpo, puntuacion: r.puntuacion };
    this.showModal.set(true);
  }

  save() {
    const target = this.editTarget();
    const obs = target
      ? this.resenaService.update(target.id, { titulo: this.form.titulo, cuerpo: this.form.cuerpo, puntuacion: this.form.puntuacion })
      : this.resenaService.create(this.form);
    obs.subscribe({
      next: () => { this.showToast(target ? 'Reseña actualizada' : 'Reseña publicada', 'success'); this.showModal.set(false); this.load(); },
      error: (err) => this.showToast(err.error?.error ?? 'Error al guardar', 'error'),
    });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    this.resenaService.delete(id).subscribe({
      next: () => { this.showToast('Reseña eliminada', 'success'); this.load(); },
      error: () => this.showToast('Error al eliminar', 'error'),
    });
  }

  marcarUtil(r: Resena) {
    this.resenaService.marcarUtil(r.id).subscribe(() => {
      this.resenas.update(list => list.map(x => x.id === r.id ? { ...x, util_count: x.util_count + 1 } : x));
    });
  }

  canEditResena(r: Resena): boolean {
    const user = this.auth.currentUser();
    return !!user && (user.id === r.usuario_id || user.rol === 'admin');
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  emptyForm(): ResenaForm {
    return { usuario_id: this.auth.currentUser()?.id ?? 0, empresa_id: 0, titulo: '', cuerpo: '', puntuacion: 0 };
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Hace menos de 1 hora';
    if (h < 24) return `Hace ${h}h`;
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

}
