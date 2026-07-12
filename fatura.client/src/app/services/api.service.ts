import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CriarCompraRequest,
  CompraResponse,
  CompraRecorrente,
  CompraRecorrenteRequest,
  LembretePagamento,
  LembretePagamentoRequest,
  SimulacaoResponse,
  FaturaResumo,
  FaturaDetalhe,
  Fornecedor,
  CriarFornecedorRequest,
  SimulacaoResumo,
  SimulacaoDetalhe,
  CriarSimulacaoRequest,
  InstituicaoFinanceira,
  CriarInstituicaoFinanceiraRequest,
  AtualizarInstituicaoFinanceiraRequest,
  ContaFinanceira,
  CriarContaFinanceiraRequest,
  AtualizarContaFinanceiraRequest,
  Categoria,
  CriarCategoriaRequest,
  AtualizarCategoriaRequest,
  Subcategoria,
  CriarSubcategoriaRequest,
  AtualizarSubcategoriaRequest,
  LancamentoFinanceiro,
  CriarLancamentoFinanceiroRequest,
  AtualizarLancamentoFinanceiroRequest,
  TipoCategoria,
  DashboardFinanceiroFiltro,
  DashboardFinanceiroResumo,
  DashboardFinanceiroSerieMensalItem,
  DashboardFinanceiroAgrupamentoItem,
  DashboardFinanceiroComparativo,
  DashboardFinanceiroComparativoFiltro,
  DashboardFinanceiroRankings
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
export class LembretePagamentoService {
  private readonly baseUrl = `${environment.apiUrl}/lembretes-pagamento`;

  constructor(private http: HttpClient) { }

  listar(): Observable<LembretePagamento[]> {
    return this.http.get<LembretePagamento[]>(this.baseUrl);
  }

  criar(request: LembretePagamentoRequest): Observable<LembretePagamento> {
    return this.http.post<LembretePagamento>(this.baseUrl, request);
  }

  atualizar(id: number, request: LembretePagamentoRequest): Observable<LembretePagamento> {
    return this.http.put<LembretePagamento>(`${this.baseUrl}/${id}`, request);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  ativar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/ativar`, {});
  }

  desativar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/desativar`, {});
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

@Injectable({ providedIn: 'root' })
export class InstituicaoFinanceiraService {
  private readonly baseUrl = `${environment.apiUrl}/instituicoesFinanceiras`;

  constructor(private http: HttpClient) { }

  listar(): Observable<InstituicaoFinanceira[]> {
    return this.http.get<InstituicaoFinanceira[]>(this.baseUrl);
  }

  obter(id: number): Observable<InstituicaoFinanceira> {
    return this.http.get<InstituicaoFinanceira>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarInstituicaoFinanceiraRequest): Observable<InstituicaoFinanceira> {
    return this.http.post<InstituicaoFinanceira>(this.baseUrl, request);
  }

  atualizar(id: number, request: AtualizarInstituicaoFinanceiraRequest): Observable<InstituicaoFinanceira> {
    return this.http.put<InstituicaoFinanceira>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ContaFinanceiraService {
  private readonly baseUrl = `${environment.apiUrl}/contasFinanceiras`;

  constructor(private http: HttpClient) { }

  listar(instituicaoId?: number): Observable<ContaFinanceira[]> {
    const params = instituicaoId ? `?instituicaoId=${instituicaoId}` : '';
    return this.http.get<ContaFinanceira[]>(`${this.baseUrl}${params}`);
  }

  obter(id: number): Observable<ContaFinanceira> {
    return this.http.get<ContaFinanceira>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarContaFinanceiraRequest): Observable<ContaFinanceira> {
    return this.http.post<ContaFinanceira>(this.baseUrl, request);
  }

  atualizar(id: number, request: AtualizarContaFinanceiraRequest): Observable<ContaFinanceira> {
    return this.http.put<ContaFinanceira>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly baseUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  listar(tipo?: TipoCategoria): Observable<Categoria[]> {
    const params = tipo ? `?tipo=${tipo}` : '';
    return this.http.get<Categoria[]>(`${this.baseUrl}${params}`);
  }

  obter(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarCategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, request);
  }

  atualizar(id: number, request: AtualizarCategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class SubcategoriaService {
  private readonly baseUrl = `${environment.apiUrl}/subcategorias`;

  constructor(private http: HttpClient) { }

  listar(categoriaId?: number): Observable<Subcategoria[]> {
    const params = categoriaId ? `?categoriaId=${categoriaId}` : '';
    return this.http.get<Subcategoria[]>(`${this.baseUrl}${params}`);
  }

  obter(id: number): Observable<Subcategoria> {
    return this.http.get<Subcategoria>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarSubcategoriaRequest): Observable<Subcategoria> {
    return this.http.post<Subcategoria>(this.baseUrl, request);
  }

  atualizar(id: number, request: AtualizarSubcategoriaRequest): Observable<Subcategoria> {
    return this.http.put<Subcategoria>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class LancamentoFinanceiroService {
  private readonly baseUrl = `${environment.apiUrl}/lancamentosFinanceiros`;

  constructor(private http: HttpClient) { }

  listar(dataInicial?: string, dataFinal?: string, tipo?: TipoCategoria): Observable<LancamentoFinanceiro[]> {
    const params = new URLSearchParams();
    if (dataInicial) params.set('dataInicial', dataInicial);
    if (dataFinal) params.set('dataFinal', dataFinal);
    if (tipo) params.set('tipo', tipo.toString());
    const query = params.toString();
    return this.http.get<LancamentoFinanceiro[]>(`${this.baseUrl}${query ? '?' + query : ''}`);
  }

  obter(id: number): Observable<LancamentoFinanceiro> {
    return this.http.get<LancamentoFinanceiro>(`${this.baseUrl}/${id}`);
  }

  criar(request: CriarLancamentoFinanceiroRequest): Observable<LancamentoFinanceiro> {
    return this.http.post<LancamentoFinanceiro>(this.baseUrl, request);
  }

  atualizar(id: number, request: AtualizarLancamentoFinanceiroRequest): Observable<LancamentoFinanceiro> {
    return this.http.put<LancamentoFinanceiro>(`${this.baseUrl}/${id}`, request);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardFinanceiroService {
  private readonly baseUrl = `${environment.apiUrl}/dashboard-financeiro`;

  constructor(private http: HttpClient) { }

  obterResumo(filtro: DashboardFinanceiroFiltro): Observable<DashboardFinanceiroResumo> {
    return this.http.get<DashboardFinanceiroResumo>(`${this.baseUrl}/resumo${this.toQuery(filtro)}`);
  }

  obterReceitaDespesa(filtro: DashboardFinanceiroFiltro): Observable<DashboardFinanceiroSerieMensalItem[]> {
    return this.http.get<DashboardFinanceiroSerieMensalItem[]>(`${this.baseUrl}/receita-despesa${this.toQuery(filtro)}`);
  }

  obterCategorias(filtro: DashboardFinanceiroFiltro): Observable<DashboardFinanceiroAgrupamentoItem[]> {
    return this.http.get<DashboardFinanceiroAgrupamentoItem[]>(`${this.baseUrl}/categorias${this.toQuery(filtro)}`);
  }

  obterSubcategorias(filtro: DashboardFinanceiroFiltro): Observable<DashboardFinanceiroAgrupamentoItem[]> {
    return this.http.get<DashboardFinanceiroAgrupamentoItem[]>(`${this.baseUrl}/subcategorias${this.toQuery(filtro)}`);
  }

  obterEvolucao(filtro: DashboardFinanceiroFiltro): Observable<DashboardFinanceiroSerieMensalItem[]> {
    return this.http.get<DashboardFinanceiroSerieMensalItem[]>(`${this.baseUrl}/evolucao${this.toQuery(filtro)}`);
  }

  obterComparativo(filtro: DashboardFinanceiroComparativoFiltro): Observable<DashboardFinanceiroComparativo> {
    return this.http.get<DashboardFinanceiroComparativo>(`${this.baseUrl}/comparativo${this.toQuery(filtro)}`);
  }

  obterRankings(filtro: DashboardFinanceiroFiltro): Observable<DashboardFinanceiroRankings> {
    return this.http.get<DashboardFinanceiroRankings>(`${this.baseUrl}/rankings${this.toQuery(filtro)}`);
  }

  private toQuery(filtro: object): string {
    const params = new URLSearchParams();

    Object.entries(filtro).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });

    const query = params.toString();
    return query ? `?${query}` : '';
  }
}
