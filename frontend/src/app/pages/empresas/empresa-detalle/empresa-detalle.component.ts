import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ResenaService } from '../../../core/services/resena.service';
import { AuthService } from '../../../core/services/auth.service';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { Empresa, Resena, ResenaForm } from '../../../core/models/models';

@Component({
  selector: 'app-empresa-detalle',
  standalone: true,
  imports: [RouterLink, FormsModule, StarRatingComponent, DecimalPipe],
  templateUrl: './empresa-detalle.component.html',
  styleUrls: ['./empresa-detalle.component.scss'],
})
export class EmpresaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private empresaService = inject(EmpresaService);
  private resenaService = inject(ResenaService);
  auth = inject(AuthService);

  empresa = signal<Empresa | null>(null);
  resenas = signal<Resena[]>([]);
  loading = signal(true);
  showForm = signal(false);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  editTarget = signal<Resena | null>(null);
  showDeleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);

  empresaId = 0;
  form: ResenaForm = this.emptyForm();

  ngOnInit() {
    this.empresaId = Number(this.route.snapshot.paramMap.get('id'));
    this.empresaService.getById(this.empresaId).subscribe(e => this.empresa.set(e));
    this.loadResenas();
  }

  loadResenas() {
    this.resenaService.getByEmpresa(this.empresaId).subscribe(data => {
      this.resenas.set(data);
      this.loading.set(false);
    });
  }

  openForm() {
    if (!this.auth.isAdmin()) {
      const userId = this.auth.currentUser()?.id;
      const yaReseno = this.resenas().some(r => r.usuario_id === userId);
      if (yaReseno) {
        this.showToast('Ya has escrito una reseña para esta empresa', 'error');
        return;
      }
    }
    this.form = this.emptyForm();
    this.editTarget.set(null);
    this.showForm.set(true);
  }

  openEdit(r: Resena) {
    this.editTarget.set(r);
    this.form = { usuario_id: r.usuario_id, empresa_id: r.empresa_id, titulo: r.titulo, cuerpo: r.cuerpo, puntuacion: r.puntuacion };
    this.showForm.set(true);
  }

  save() {
    const target = this.editTarget();
    const obs = target
      ? this.resenaService.update(target.id, { titulo: this.form.titulo, cuerpo: this.form.cuerpo, puntuacion: this.form.puntuacion })
      : this.resenaService.create(this.form);
    obs.subscribe({
      next: () => { this.showToast(target ? 'Reseña actualizada' : 'Reseña publicada', 'success'); this.showForm.set(false); this.loadResenas(); },
      error: (err) => this.showToast(err.error?.error ?? 'Error al guardar', 'error'),
    });
  }

  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
    this.showDeleteModal.set(true);
  }

  executeDelete() {
    const id = this.deleteTargetId();
    if (!id) return;
    this.showDeleteModal.set(false);
    this.resenaService.delete(id).subscribe({
      next: () => { this.showToast('Reseña eliminada', 'success'); this.loadResenas(); },
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
    return { usuario_id: this.auth.currentUser()?.id ?? 0, empresa_id: this.empresaId, titulo: '', cuerpo: '', puntuacion: 0 };
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

  get distribucion(): { stars: number; pct: number }[] {
    const total = this.resenas().length;
    return [5, 4, 3, 2, 1].map(s => ({
      stars: s,
      pct: total ? Math.round((this.resenas().filter(r => r.puntuacion === s).length / total) * 100) : 0,
    }));
  }
}
