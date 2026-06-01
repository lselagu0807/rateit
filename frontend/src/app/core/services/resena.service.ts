import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resena, ResenaForm, ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private readonly http = inject(HttpClient);
  private readonly API  = '/api/resenas/';

  getAll(puntuacion?: number): Observable<Resena[]> {
    let params = new HttpParams();
    if (puntuacion) params = params.set('puntuacion', puntuacion);
    return this.http.get<Resena[]>(this.API, { params });
  }

  getById(id: number): Observable<Resena> {
    const params = new HttpParams().set('id', id);
    return this.http.get<Resena>(this.API, { params });
  }

  getByEmpresa(empresaId: number, sort: string = 'created_at', order: string = 'desc'): Observable<Resena[]> {
    const params = new HttpParams()
      .set('empresa_id', empresaId)
      .set('sort', sort)
      .set('order', order);
    return this.http.get<Resena[]>(this.API, { params });
  }

  getByUsuario(usuarioId: number): Observable<Resena[]> {
    const params = new HttpParams().set('usuario_id', usuarioId);
    return this.http.get<Resena[]>(this.API, { params });
  }

  create(data: ResenaForm): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.API, data);
  }

  update(id: number, data: Partial<ResenaForm>): Observable<ApiResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.put<ApiResponse>(this.API, data, { params });
  }

  marcarUtil(id: number): Observable<ApiResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.put<ApiResponse>(this.API, { incrementar_util: true }, { params });
  }

  delete(id: number): Observable<ApiResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<ApiResponse>(this.API, { params });
  }
}
