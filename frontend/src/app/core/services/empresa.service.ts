import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa, EmpresaForm, ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly API  = 'http://localhost/rateit/backend/api/empresas/';

  getAll(sort: string = 'valoracion_media', order: string = 'desc'): Observable<Empresa[]> {
    const params = new HttpParams().set('sort', sort).set('order', order);
    return this.http.get<Empresa[]>(this.API, { params });
  }

  getById(id: number): Observable<Empresa> {
    const params = new HttpParams().set('id', id);
    return this.http.get<Empresa>(this.API, { params });
  }

  search(query: string): Observable<Empresa[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<Empresa[]>(this.API, { params });
  }

  create(data: EmpresaForm): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.API, data);
  }

  update(id: number, data: Partial<EmpresaForm>): Observable<ApiResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.put<ApiResponse>(this.API, data, { params });
  }

  delete(id: number): Observable<ApiResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<ApiResponse>(this.API, { params });
  }
}
