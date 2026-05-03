import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import {
  LancamentoFinanceiroService,
  ContaFinanceiraService,
  CategoriaService
} from '../../../services/api.service';
import {
  LancamentoFinanceiro,
  ContaFinanceira,
  Categoria,
  TipoCategoria,
  OrigemLancamento
} from '../../../models/models';
import { LancamentoFormDialogComponent } from '../dialogs/lancamento-form-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';

@Component({
  selector: 'app-lancamentos',
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.css']
})
export class LancamentosComponent implements OnInit {
  lancamentos: LancamentoFinanceiro[] = [];
  contas: ContaFinanceira[] = [];
  categorias: Categoria[] = [];
  carregando = false;
  filtroForm!: FormGroup;

  displayedColumns = ['data', 'descricao', 'categoriaNome', 'subcategoriaNome', 'contaFinanceiraNome', 'tipo', 'valor', 'acoes'];
  readonly pageSizeOptions = [10, 15, 20, 50];
  pageSize = 15;
  pageIndex = 0;

  private readonly FILTROS_KEY = 'lancamentos_filtros';

  constructor(
    private lancamentoService: LancamentoFinanceiroService,
    private contaService: ContaFinanceiraService,
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const saved = this.loadFiltros();
    this.filtroForm = this.fb.group({
      dataInicial: [saved?.dataInicial ? new Date(saved.dataInicial) : null],
      dataFinal: [saved?.dataFinal ? new Date(saved.dataFinal) : null],
      tipo: [saved?.tipo || null],
      contaFinanceiraId: [saved?.contaFinanceiraId || null],
      categoriaId: [saved?.categoriaId || null]
    });

    this.contaService.listar().subscribe(data => this.contas = data);
    this.categoriaService.listar().subscribe(data => this.categorias = data);
    this.carregar();
  }

  get lancamentosPaginados(): LancamentoFinanceiro[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.lancamentosFiltrados.slice(inicio, inicio + this.pageSize);
  }

  get lancamentosFiltrados(): LancamentoFinanceiro[] {
    let result = this.lancamentos;
    const f = this.filtroForm.value;
    if (f.contaFinanceiraId) {
      result = result.filter(l => l.contaFinanceiraId === f.contaFinanceiraId);
    }
    if (f.categoriaId) {
      result = result.filter(l => l.categoriaId === f.categoriaId);
    }
    return result;
  }

  get totalReceitas(): number {
    return this.lancamentosFiltrados
      .filter(l => this.normalizarTipoCategoria(l.tipo) === TipoCategoria.Receita)
      .reduce((sum, l) => sum + l.valor, 0);
  }

  get totalDespesas(): number {
    return this.lancamentosFiltrados
      .filter(l => this.normalizarTipoCategoria(l.tipo) === TipoCategoria.Despesa)
      .reduce((sum, l) => sum + l.valor, 0);
  }

  get saldo(): number {
    return this.totalReceitas - this.totalDespesas;
  }

  getTipoLabel(tipo: TipoCategoria): string {
    return this.normalizarTipoCategoria(tipo) === TipoCategoria.Receita ? 'Receita' : 'Despesa';
  }

  getTipoClass(tipo: TipoCategoria): string {
    return this.normalizarTipoCategoria(tipo) === TipoCategoria.Receita ? 'badge-receita' : 'badge-despesa';
  }

  getOrigemLabel(origem: OrigemLancamento): string {
    const origemNormalizada = this.normalizarOrigem(origem);

    switch (origemNormalizada) {
      case OrigemLancamento.Manual: return 'Manual';
      case OrigemLancamento.Fatura: return 'Fatura';
      case OrigemLancamento.Recorrente: return 'Recorrente';
      default: return '';
    }
  }

  isReadonly(lancamento: LancamentoFinanceiro): boolean {
    return this.normalizarOrigem(lancamento.origem) !== OrigemLancamento.Manual;
  }

  private normalizarTipoCategoria(tipo: TipoCategoria | string | null | undefined): TipoCategoria {
    if (typeof tipo === 'number') {
      return tipo;
    }

    switch ((tipo ?? '').toString().toLowerCase()) {
      case '1':
      case 'receita':
        return TipoCategoria.Receita;
      default:
        return TipoCategoria.Despesa;
    }
  }

  private normalizarOrigem(origem: OrigemLancamento | string | null | undefined): OrigemLancamento | null {
    if (origem === null || origem === undefined || origem === '') {
      return null;
    }

    if (typeof origem === 'number') {
      return origem;
    }

    switch (origem.toString().toLowerCase()) {
      case '1':
      case 'manual':
        return OrigemLancamento.Manual;
      case '2':
      case 'fatura':
        return OrigemLancamento.Fatura;
      case '3':
      case 'recorrente':
        return OrigemLancamento.Recorrente;
      default:
        return null;
    }
  }

  carregar(): void {
    this.carregando = true;
    const f = this.filtroForm.value;
    const dataInicial = f.dataInicial ? (f.dataInicial as Date).toISOString() : undefined;
    const dataFinal = f.dataFinal ? (f.dataFinal as Date).toISOString() : undefined;
    const tipo = f.tipo || undefined;

    this.lancamentoService.listar(dataInicial, dataFinal, tipo).subscribe({
      next: (dados) => {
        this.lancamentos = dados;
        this.pageIndex = 0;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar lançamentos', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  filtrar(): void {
    this.saveFiltros();
    this.carregar();
  }

  limparFiltros(): void {
    this.filtroForm.reset();
    localStorage.removeItem(this.FILTROS_KEY);
    this.carregar();
  }

  abrirDialog(lancamento?: LancamentoFinanceiro): void {
    const ref = this.dialog.open(LancamentoFormDialogComponent, {
      width: '500px',
      data: lancamento || null
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.carregar();
    });
  }

  deletar(lancamento: LancamentoFinanceiro): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { titulo: 'Excluir Lançamento', mensagem: `Deseja excluir este lançamento?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.lancamentoService.deletar(lancamento.id).subscribe({
          next: () => {
            this.snackBar.open('Lançamento excluído', 'OK', { duration: 3000 });
            this.carregar();
          },
          error: () => this.snackBar.open('Erro ao excluir lançamento', 'OK', { duration: 3000 })
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  private saveFiltros(): void {
    const f = this.filtroForm.value;
    localStorage.setItem(this.FILTROS_KEY, JSON.stringify({
      dataInicial: f.dataInicial ? (f.dataInicial as Date).toISOString() : null,
      dataFinal: f.dataFinal ? (f.dataFinal as Date).toISOString() : null,
      tipo: f.tipo,
      contaFinanceiraId: f.contaFinanceiraId,
      categoriaId: f.categoriaId
    }));
  }

  private loadFiltros(): any {
    try {
      const saved = localStorage.getItem(this.FILTROS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}
