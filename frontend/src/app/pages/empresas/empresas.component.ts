import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { EmpresaService } from '../../core/services/empresa.service';
import { AuthService } from '../../core/services/auth.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { Empresa, EmpresaForm, CATEGORIAS } from '../../core/models/models';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [RouterLink, FormsModule, StarRatingComponent, DecimalPipe],
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.scss'],
})
export class EmpresasComponent implements OnInit {
  private service = inject(EmpresaService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  empresas = signal<Empresa[]>([]);
  loading = signal(true);
  sort = signal('valoracion_media');
  showModal = signal(false);
  editTarget = signal<Empresa | null>(null);
  toast = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  searchQuery = '';
  categorias = CATEGORIAS;
  form: EmpresaForm = this.emptyForm();
  showDeleteModal = signal(false);
  deleteTargetId = signal<number | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['q']) { this.searchQuery = p['q']; this.doSearch(); }
      else { this.load(); }
    });
  }

  load() {
    this.loading.set(true);
    this.service.getAll(this.sort()).subscribe(data => { this.empresas.set(data); this.loading.set(false); });
  }

  doSearch() {
    if (!this.searchQuery.trim()) { this.load(); return; }
    this.loading.set(true);
    this.service.search(this.searchQuery).subscribe(data => { this.empresas.set(data); this.loading.set(false); });
  }

  setSort(s: string) { this.sort.set(s); this.load(); }

  openCreate() { this.form = this.emptyForm(); this.editTarget.set(null); this.showModal.set(true); }

  openEdit(e: Empresa) {
    this.editTarget.set(e);
    this.form = {
      nombre: e.nombre, descripcion: e.descripcion, categoria: e.categoria,
      website: e.website, logo_emoji: e.logo_emoji, logo_color: e.logo_color, verificada: !!e.verificada
    };
    this.showModal.set(true);
  }

  save() {
    const target = this.editTarget();
    const obs = target ? this.service.update(target.id, this.form) : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.showToast(target ? 'Empresa actualizada' : 'Empresa creada', 'success'); this.showModal.set(false); this.load(); },
      error: () => this.showToast('Error al guardar', 'error'),
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
    this.service.delete(id).subscribe({
      next: () => { this.showToast('Empresa eliminada', 'success'); this.load(); },
      error: () => this.showToast('Error al eliminar', 'error'),
    });
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  emptyForm(): EmpresaForm {
    return { nombre: '', descripcion: '', categoria: '', website: '', logo_emoji: '🏢', logo_color: '#1E2421', verificada: false };
  }

  ratingLabel(r: number): string {
    if (r >= 4.5) return 'Excelente'; if (r >= 4) return 'Muy bien';
    if (r >= 3) return 'Regular'; if (r >= 2) return 'Mal'; return 'Pésimo';
  }

  barWidth(r: number): string { return Math.round((r / 5) * 100) + '%'; }
}
