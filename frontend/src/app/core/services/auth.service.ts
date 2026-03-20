import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface Usuario {
  id:         number;
  nombre:     string;
  email:      string;
  ciudad:     string;
  rol:        'admin' | 'usuario';
  verificado: boolean;
  created_at?: string;
}

interface AuthResponse {
  user:    Usuario;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API    = 'http://localhost/rateit/backend/api/auth/';
  private readonly STORAGE_KEY = 'rateit_user';

  // Signal con el usuario actual
  currentUser = signal<Usuario | null>(this.loadFromStorage());

  // Computed helpers
  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin    = computed(() => this.currentUser()?.rol === 'admin');

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.API + '?action=login', { email, password }).pipe(
      tap(res => this.setUser(res.user))
    );
  }

  register(data: { nombre: string; email: string; password: string; ciudad: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.API + '?action=register', data).pipe(
      tap(res => this.setUser(res.user))
    );
  }

  updatePerfil(id: number, data: Partial<{ nombre: string; ciudad: string; password: string }>): Observable<AuthResponse> {
    const params = new HttpParams().set('id', id).set('action', 'update');
    return this.http.put<AuthResponse>(this.API, data, { params }).pipe(
      tap(res => this.setUser(res.user))
    );
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setUser(user: Usuario) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadFromStorage(): Usuario | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
