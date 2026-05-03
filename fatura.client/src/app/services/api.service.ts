import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CriarCompraRequest,
  CompraResponse,
  CompraRecorrente,
  CompraRecorrenteRequest,
  SimulacaoResponse,
  FaturaResumo,
  FaturaDetalhe,
  Fornecedor,
  CriarFornecedorRequest,
  SimulacaoResumo,
  SimulacaoDetalhe,
  CriarSimulacaoRequest
} from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly baseUrl = `${environment.apiUrl}/compras`;

  constructor(private http: HttpClient) { }

  criarCompra(request: CriarCompraRequest): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(this.baseUrl, request);
  }

  simularCompra(request: CriarCompraRequest): Observable<SimulacaoResponse> {
    return this.http.post<SimulacaoResponse>(`${this.baseUrl}/simular`, request);
  }
}

@Injectable({ providedIn: 'root' })
export class CompraRecorrenteService {
  private readonly baseUrl = `${environment.apiUrl}/compras-recorrentes`;

  constructor(private http: HttpClient) { }

  listar(): Observable<CompraRecorrente[]> {
    return this.http.get<CompraRecorrente[]>(this.baseUrl);
  }

  criar(request: CompraRecorrenteRequest): Observable<CompraRecorrente> {
    return this.http.post<CompraRecorrente>(this.baseUrl, request);
  }

  atualizar(id: number, request: CompraRecorrenteRequest): Observable<CompraRecorrente> {
    return this.http.put<CompraRecorrente>(`${this.baseUrl}/${id}`, request);
  }

  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class FaturaService {
  private readonly baseUrl = `${environment.apiUrl}/faturas`;

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

@Injectable({ providedIn: 'root' })
export class FornecedorService {
  private readonly baseUrl = `${environment.apiUrl}/fornecedores`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(this.baseUrl);
  }

  obter(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarFornecedorRequest): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.baseUrl, request);
  }

  atualizar(id: number, request: CriarFornecedorRequest): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class SimulacaoApiService {
  private readonly baseUrl = `${environment.apiUrl}/simulacoes`;

  constructor(private http: HttpClient) { }

  listar(): Observable<SimulacaoResumo[]> {
    return this.http.get<SimulacaoResumo[]>(this.baseUrl);
  }

  obter(id: number): Observable<SimulacaoDetalhe> {
    return this.http.get<SimulacaoDetalhe>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarSimulacaoRequest): Observable<SimulacaoDetalhe> {
    return this.http.post<SimulacaoDetalhe>(this.baseUrl, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  converterEmCompra(id: number): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(`${this.baseUrl}/${id}/converter`, {});
  }
}
