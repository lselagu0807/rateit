import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ResenaService } from '../../core/services/resena.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { Resena } from '../../core/models/models';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [FormsModule, StarRatingComponent],
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.scss'],
})
export class CuentaComponent implements OnInit {
  auth          = inject(AuthService);
  resenaService = inject(ResenaService);

  resenas = signal<Resena[]>([]);
  toast   = signal<{msg: string; type: 'success'|'error'} | null>(null);

  form = {
    nombre:   this.auth.currentUser()?.nombre ?? '',
    ciudad:   this.auth.currentUser()?.ciudad ?? '',
    password: '',
  };

  ngOnInit() {
    const id = this.auth.currentUser()?.id;
    if (id) this.resenaService.getByUsuario(id).subscribe(data => this.resenas.set(data));
  }

  save() {
    const id = this.auth.currentUser()?.id;
    if (!id) return;
    const payload: any = {};
    if (this.form.nombre)   payload.nombre   = this.form.nombre;
    if (this.form.ciudad)   payload.ciudad   = this.form.ciudad;
    if (this.form.password) payload.password = this.form.password;

    this.auth.updatePerfil(id, payload).subscribe({
      next: () => { this.form.password = ''; this.showToast('Cambios guardados', 'success'); },
      error: (err) => this.showToast(err.error?.error ?? 'Error al guardar', 'error'),
    });
  }

  showToast(msg: string, type: 'success'|'error') {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3000);
  }

  initials(): string {
    return (this.auth.currentUser()?.nombre ?? '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  timeAgo(dateStr: string): string {
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (d === 0) return 'Hoy'; if (d === 1) return 'Ayer'; return `Hace ${d} días`;
  }
}
