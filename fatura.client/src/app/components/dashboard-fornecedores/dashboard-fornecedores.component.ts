import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, of, Subscription } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { FaturaDetalhe } from '../../models/models';
import { FaturaService } from '../../services/api.service';

type PeriodoFornecedor = 'ano' | 'mes';

interface FornecedorEstatistica {
  nome: string;
  totalCompras: number;
  valorTotal: number;
}

interface FornecedorAcumulado {
  nome: string;
  compraIds: Set<number>;
  valorTotal: number;
}

@Component({
  selector: 'app-dashboard-fornecedores',
  templateUrl: './dashboard-fornecedores.component.html',
  styleUrls: ['./dashboard-fornecedores.component.css']
})
export class DashboardFornecedoresComponent implements OnInit, OnDestroy {
  readonly meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  readonly displayedColumns = ['nome', 'totalCompras', 'valorTotal'];
  readonly pageSizeOptions = [5, 10, 15, 20, 25];
  readonly defaultPageSize = 5;
  readonly filtroForm;

  anos: number[] = [];
  carregando = false;
  estatisticasFornecedores: FornecedorEstatistica[] = [];
  dataSource = new MatTableDataSource<FornecedorEstatistica>([]);

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    this.paginator = paginator;
    this.configurarPaginacao();
  }

  private faturasDetalhadas: FaturaDetalhe[] = [];
  private paginator?: MatPaginator;
  private readonly subscriptions = new Subscription();
  private carregamentoSubscription?: Subscription;

  constructor(
    formBuilder: FormBuilder,
    private readonly faturaService: FaturaService,
    private readonly snackBar: MatSnackBar
  ) {
    this.filtroForm = formBuilder.group({
      periodo: formBuilder.nonNullable.control<PeriodoFornecedor>('ano', Validators.required),
      ano: formBuilder.nonNullable.control(new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]),
      mes: formBuilder.nonNullable.control(new Date().getMonth() + 1, [Validators.min(1), Validators.max(12)])
    });
  }

  ngOnInit(): void {
    const anoAtual = new Date().getFullYear();
    this.anos = Array.from({ length: 7 }, (_, index) => anoAtual - 3 + index);

    this.atualizarControleMes();

    this.subscriptions.add(
      this.filtroForm.controls.periodo.valueChanges.subscribe(() => {
        this.atualizarControleMes();
        this.recalcularEstatisticas();
      })
    );

    this.subscriptions.add(
      this.filtroForm.controls.mes.valueChanges.subscribe(() => {
        if (this.periodoSelecionado === 'mes') {
          this.recalcularEstatisticas();
        }
      })
    );

    this.subscriptions.add(
      this.filtroForm.controls.ano.valueChanges.subscribe((ano) => {
        if (this.filtroForm.controls.ano.valid) {
          this.carregarDados(ano);
        }
      })
    );

    this.carregarDados(this.anoSelecionado);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.carregamentoSubscription?.unsubscribe();
  }

  get periodoSelecionado(): PeriodoFornecedor {
    return this.filtroForm.controls.periodo.value;
  }

  get anoSelecionado(): number {
    return this.filtroForm.controls.ano.value;
  }

  get mesSelecionado(): number {
    return this.filtroForm.controls.mes.value;
  }

  get periodoDescricao(): string {
    if (this.periodoSelecionado === 'mes') {
      return `${this.meses[this.mesSelecionado - 1]} de ${this.anoSelecionado}`;
    }

    return this.anoSelecionado.toString();
  }

  get totalFornecedores(): number {
    return this.estatisticasFornecedores.length;
  }

  get totalComprasPeriodo(): number {
    return this.estatisticasFornecedores.reduce((total, item) => total + item.totalCompras, 0);
  }

  get valorTotalPeriodo(): number {
    return this.estatisticasFornecedores.reduce((total, item) => total + item.valorTotal, 0);
  }

  get topFornecedoresPorCompras(): FornecedorEstatistica[] {
    return [...this.estatisticasFornecedores]
      .sort((a, b) => b.totalCompras - a.totalCompras || b.valorTotal - a.valorTotal || a.nome.localeCompare(b.nome))
      .slice(0, 5);
  }

  get topFornecedoresPorValor(): FornecedorEstatistica[] {
    return [...this.estatisticasFornecedores]
      .sort((a, b) => b.valorTotal - a.valorTotal || b.totalCompras - a.totalCompras || a.nome.localeCompare(b.nome))
      .slice(0, 5);
  }

  get fornecedorDestaquePorCompras(): FornecedorEstatistica | null {
    return this.topFornecedoresPorCompras[0] ?? null;
  }

  get fornecedorDestaquePorValor(): FornecedorEstatistica | null {
    return this.topFornecedoresPorValor[0] ?? null;
  }

  private atualizarControleMes(): void {
    const mesControl = this.filtroForm.controls.mes;

    if (this.periodoSelecionado === 'mes') {
      mesControl.enable({ emitEvent: false });
      mesControl.setValidators([Validators.required, Validators.min(1), Validators.max(12)]);
    } else {
      mesControl.disable({ emitEvent: false });
      mesControl.setValidators([Validators.min(1), Validators.max(12)]);
    }

    mesControl.updateValueAndValidity({ emitEvent: false });
  }

  private carregarDados(ano: number): void {
    this.carregamentoSubscription?.unsubscribe();
    this.carregando = true;

    this.carregamentoSubscription = this.faturaService.obterDashboard(ano).pipe(
      switchMap((faturas) => {
        if (faturas.length === 0) {
          return of([] as FaturaDetalhe[]);
        }

        return forkJoin(faturas.map((fatura) => this.faturaService.obterFatura(fatura.id)));
      }),
      finalize(() => this.carregando = false)
    ).subscribe({
      next: (detalhes) => {
        this.faturasDetalhadas = detalhes;
        this.recalcularEstatisticas();
      },
      error: () => {
        this.faturasDetalhadas = [];
        this.estatisticasFornecedores = [];
        this.snackBar.open('Erro ao carregar o dashboard de fornecedores', 'OK', { duration: 3000 });
      }
    });
  }

  private recalcularEstatisticas(): void {
    const fornecedores = new Map<string, FornecedorAcumulado>();

    for (const fatura of this.faturasFiltradas) {
      for (const parcela of fatura.parcelas) {
        const fornecedorNome = parcela.fornecedorNome?.trim();
        if (!fornecedorNome) {
          continue;
        }

        const chaveFornecedor = fornecedorNome.toLocaleLowerCase('pt-BR');
        const acumulado = fornecedores.get(chaveFornecedor) ?? {
          nome: fornecedorNome,
          compraIds: new Set<number>(),
          valorTotal: 0
        };

        acumulado.valorTotal += Number(parcela.valor);

        if (parcela.compraId) {
          acumulado.compraIds.add(parcela.compraId);
        }

        fornecedores.set(chaveFornecedor, acumulado);
      }
    }

    this.estatisticasFornecedores = Array.from(fornecedores.values())
      .map((fornecedor) => ({
        nome: fornecedor.nome,
        totalCompras: fornecedor.compraIds.size,
        valorTotal: fornecedor.valorTotal
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal || b.totalCompras - a.totalCompras || a.nome.localeCompare(b.nome));

    this.dataSource.data = this.estatisticasFornecedores;
    this.configurarPaginacao();
  }

  private configurarPaginacao(): void {
    if (!this.paginator) {
      return;
    }

    this.paginator._intl.itemsPerPageLabel = 'Itens por página';
    this.dataSource.paginator = this.paginator;

    if (!this.paginator.pageSize) {
      this.paginator.pageSize = this.defaultPageSize;
    }
  }

  private get faturasFiltradas(): FaturaDetalhe[] {
    if (this.periodoSelecionado === 'ano') {
      return this.faturasDetalhadas;
    }

    return this.faturasDetalhadas.filter((fatura) => fatura.mes === this.mesSelecionado);
  }
}
