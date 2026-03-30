import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CriarCompraRequest,
  CompraResponse,
  SimulacaoResponse,
  FaturaResumo,
  FaturaDetalhe
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly baseUrl = '/api/compras';

  constructor(private http: HttpClient) { }

  criarCompra(request: CriarCompraRequest): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(this.baseUrl, request);
  }

  simularCompra(request: CriarCompraRequest): Observable<SimulacaoResponse> {
    return this.http.post<SimulacaoResponse>(`${this.baseUrl}/simular`, request);
  }
}

@Injectable({ providedIn: 'root' })
export class FaturaService {
  private readonly baseUrl = '/api/faturas';

  constructor(private http: HttpClient) { }

  listarFaturas(ano: number): Observable<FaturaResumo[]> {
    return this.http.get<FaturaResumo[]>(`${this.baseUrl}?ano=${ano}`);
  }

  obterFatura(id: number): Observable<FaturaDetalhe> {
    return this.http.get<FaturaDetalhe>(`${this.baseUrl}/${id}`);
  }

  quitarFatura(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/quitar`, {});
  }

  reabrirFatura(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/reabrir`, {});
  }

  atualizarOrcamento(id: number, orcamento: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/orcamento`, { orcamento });
  }

  obterDashboard(ano: number): Observable<FaturaResumo[]> {
    return this.http.get<FaturaResumo[]>(`${this.baseUrl}/dashboard?ano=${ano}`);
  }

  exportarExcel(ano?: number): Observable<Blob> {
    const url = ano ? `${this.baseUrl}/exportar?ano=${ano}` : `${this.baseUrl}/exportar`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
}
}
}
