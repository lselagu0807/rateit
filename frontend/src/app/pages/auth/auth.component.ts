import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  mode    = signal<'login' | 'register'>('login');
  loading = signal(false);
  error   = signal('');

  loginForm = { email: '', password: '' };
  registerForm = { nombre: '', email: '', password: '', ciudad: '' };

  submit() {
    this.error.set('');
    this.loading.set(true);

    if (this.mode() === 'login') {
      this.auth.login(this.loginForm.email, this.loginForm.password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => { this.error.set(err.error?.error ?? 'Error al iniciar sesión'); this.loading.set(false); },
      });
    } else {
      const { nombre, email, password, ciudad } = this.registerForm;
      this.auth.register({ nombre, email, password, ciudad }).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => { this.error.set(err.error?.error ?? 'Error al registrarse'); this.loading.set(false); },
      });
    }
  }

  toggle() {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set('');
  }
}
