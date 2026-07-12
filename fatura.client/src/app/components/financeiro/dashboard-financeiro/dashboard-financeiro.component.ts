import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Subscription } from 'rxjs';
import type { Chart, ChartType } from 'chart.js';
import {
  CategoriaService,
  ContaFinanceiraService,
  DashboardFinanceiroService,
  SubcategoriaService
} from '../../../services/api.service';
import {
  Categoria,
  ContaFinanceira,
  DashboardFinanceiroAgrupamentoItem,
  DashboardFinanceiroComparativo,
  DashboardFinanceiroComparativoFiltro,
  DashboardFinanceiroFiltro,
  DashboardFinanceiroRankings,
  DashboardFinanceiroResumo,
  DashboardFinanceiroSerieMensalItem,
  Subcategoria
} from '../../../models/models';

type GraficoAlternavel = 'bar' | 'pie';

@Component({
  selector: 'app-dashboard-financeiro',
  templateUrl: './dashboard-financeiro.component.html',
  styleUrls: ['./dashboard-financeiro.component.css']
})
export class DashboardFinanceiroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('receitaDespesaCanvas') receitaDespesaCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriasCanvas') categoriasCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('subcategoriasCanvas') subcategoriasCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('evolucaoCanvas') evolucaoCanvas?: ElementRef<HTMLCanvasElement>;

  filtroForm!: FormGroup;
  comparativoForm!: FormGroup;

  contas: ContaFinanceira[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];

  resumo: DashboardFinanceiroResumo | null = null;
  receitaDespesa: DashboardFinanceiroSerieMensalItem[] = [];
  gastosCategorias: DashboardFinanceiroAgrupamentoItem[] = [];
  gastosSubcategorias: DashboardFinanceiroAgrupamentoItem[] = [];
  evolucao: DashboardFinanceiroSerieMensalItem[] = [];
  comparativo: DashboardFinanceiroComparativo | null = null;
  rankings: DashboardFinanceiroRankings | null = null;

  carregando = false;
  receitaDespesaTipo: GraficoAlternavel = 'bar';
  categoriasTipo: GraficoAlternavel = 'pie';
  subcategoriasTipo: GraficoAlternavel = 'bar';

  private receitaDespesaChart?: Chart;
  private categoriasChart?: Chart;
  private subcategoriasChart?: Chart;
  private evolucaoChart?: Chart;
  private ChartCtor?: typeof import('chart.js').Chart;
  private categoriaSubscription?: Subscription;
  private chartAreaReady = false;

  private readonly cores = [
    '#2563eb',
    '#dc2626',
    '#16a34a',
    '#f59e0b',
    '#7c3aed',
    '#0891b2',
    '#db2777',
    '#4d7c0f'
  ];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardFinanceiroService,
    private contaService: ContaFinanceiraService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

    this.filtroForm = this.fb.group({
      dataInicial: [inicioMes],
      dataFinal: [fimMes],
      contaFinanceiraId: [null],
      categoriaId: [null],
      subcategoriaId: [null]
    });

    this.comparativoForm = this.fb.group({
      periodoAInicial: [inicioMesAnterior],
      periodoAFinal: [fimMesAnterior],
      periodoBInicial: [inicioMes],
      periodoBFinal: [fimMes]
    });

    this.carregarOpcoes();
    this.categoriaSubscription = this.filtroForm.get('categoriaId')?.valueChanges.subscribe(categoriaId => {
      this.filtroForm.patchValue({ subcategoriaId: null }, { emitEvent: false });
      this.carregarSubcategorias(categoriaId);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const chartJs = await import('chart.js');
    chartJs.Chart.register(...chartJs.registerables);
    this.ChartCtor = chartJs.Chart;
    this.chartAreaReady = true;
    this.carregarDashboard();
  }

  ngOnDestroy(): void {
    this.categoriaSubscription?.unsubscribe();
    this.destroyCharts();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.atualizarGraficos();
  }

  get resumoCols(): number {
    if (window.innerWidth < 700) return 1;
    if (window.innerWidth < 1100) return 2;

    return 4;
  }

  get economiaDescricao(): string {
    const pct = this.resumo?.percentualReceitaComprometida ?? 0;
    return `${pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% da receita foi comprometida`;
  }

  get categoriaSelecionadaNome(): string {
    const categoriaId = this.filtroForm?.value?.categoriaId;
    return this.categorias.find(c => c.id === categoriaId)?.nome ?? 'Todas as categorias';
  }

  aplicarFiltros(): void {
    this.carregarDashboard();
  }

  limparFiltros(): void {
    this.filtroForm.reset({
      dataInicial: null,
      dataFinal: null,
      contaFinanceiraId: null,
      categoriaId: null,
      subcategoriaId: null
    });
    this.subcategorias = [];
    this.carregarDashboard();
  }

  alterarReceitaDespesaTipo(tipo: GraficoAlternavel): void {
    this.receitaDespesaTipo = tipo;
    this.renderReceitaDespesaChart();
  }

  alterarCategoriasTipo(tipo: GraficoAlternavel): void {
    this.categoriasTipo = tipo;
    this.renderCategoriasChart();
  }

  alterarSubcategoriasTipo(tipo: GraficoAlternavel): void {
    this.subcategoriasTipo = tipo;
    this.renderSubcategoriasChart();
  }

  selecionarCategoria(item: DashboardFinanceiroAgrupamentoItem): void {
    if (!item.id) return;

    this.filtroForm.patchValue({ categoriaId: item.id, subcategoriaId: null });
    this.carregarDashboard();
  }

  carregarComparativo(): void {
    const filtro = this.buildComparativoFiltro();
    if (!filtro) {
      this.snackBar.open('Informe os dois períodos para comparar', 'OK', { duration: 3000 });
      return;
    }

    this.dashboardService.obterComparativo(filtro).subscribe({
      next: dados => this.comparativo = dados,
      error: () => this.snackBar.open('Erro ao carregar comparativo', 'OK', { duration: 3000 })
    });
  }

  variacaoLabel(valor: number): string {
    if (valor > 0) return `Cresceu ${Math.abs(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
    if (valor < 0) return `Reduziu ${Math.abs(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

    return 'Sem variacao';
  }

  variacaoIcon(valor: number): string {
    if (valor > 0) return 'trending_up';
    if (valor < 0) return 'trending_down';
    return 'trending_flat';
  }

  variacaoClass(valor: number, inverter = false): string {
    if (valor === 0) return 'neutro';
    const positivo = valor > 0;
    return positivo !== inverter ? 'positivo' : 'negativo';
  }

  trackByNome(_: number, item: DashboardFinanceiroAgrupamentoItem): string {
    return `${item.id ?? 'sem-id'}-${item.nome}`;
  }

  private carregarOpcoes(): void {
    forkJoin({
      contas: this.contaService.listar(),
      categorias: this.categoriaService.listar()
    }).subscribe({
      next: ({ contas, categorias }) => {
        this.contas = contas;
        this.categorias = categorias;
      },
      error: () => this.snackBar.open('Erro ao carregar filtros financeiros', 'OK', { duration: 3000 })
    });
  }

  private carregarSubcategorias(categoriaId?: number | null): void {
    if (!categoriaId) {
      this.subcategorias = [];
      return;
    }

    this.subcategoriaService.listar(categoriaId).subscribe({
      next: dados => this.subcategorias = dados,
      error: () => this.subcategorias = []
    });
  }

  carregarDashboard(): void {
    if (!this.chartAreaReady) return;

    const filtro = this.buildFiltro();
    this.carregando = true;

    forkJoin({
      resumo: this.dashboardService.obterResumo(filtro),
      receitaDespesa: this.dashboardService.obterReceitaDespesa(filtro),
      categorias: this.dashboardService.obterCategorias(filtro),
      subcategorias: this.dashboardService.obterSubcategorias(filtro),
      evolucao: this.dashboardService.obterEvolucao(filtro),
      rankings: this.dashboardService.obterRankings(filtro)
    }).subscribe({
      next: dados => {
        this.resumo = dados.resumo;
        this.receitaDespesa = dados.receitaDespesa;
        this.gastosCategorias = dados.categorias;
        this.gastosSubcategorias = dados.subcategorias;
        this.evolucao = dados.evolucao;
        this.rankings = dados.rankings;
        this.carregando = false;
        this.atualizarGraficos();
        this.carregarComparativo();
      },
      error: () => {
        this.carregando = false;
        this.snackBar.open('Erro ao carregar dashboard financeiro', 'OK', { duration: 3000 });
      }
    });
  }

  private atualizarGraficos(): void {
    this.renderReceitaDespesaChart();
    this.renderCategoriasChart();
    this.renderSubcategoriasChart();
    this.renderEvolucaoChart();
  }

  private renderReceitaDespesaChart(): void {
    this.receitaDespesaChart?.destroy();
    const canvas = this.receitaDespesaCanvas?.nativeElement;
    if (!canvas) return;

    if (this.receitaDespesaTipo === 'pie') {
      const totalReceitas = this.receitaDespesa.reduce((sum, item) => sum + item.receitas, 0);
      const totalDespesas = this.receitaDespesa.reduce((sum, item) => sum + item.despesas, 0);
      this.receitaDespesaChart = this.createChart(canvas, 'pie', ['Receitas', 'Despesas'], [totalReceitas, totalDespesas], ['#16a34a', '#dc2626']);

      return;
    }

    const ChartClass = this.ChartCtor;
    if (!ChartClass) return;

    this.receitaDespesaChart = new ChartClass(canvas, {
      type: 'bar',
      data: {
        labels: this.receitaDespesa.map(item => item.label),
        datasets: [
          {
            label: 'Receitas',
            data: this.receitaDespesa.map(item => item.receitas),
            backgroundColor: '#16a34a'
          },
          {
            label: 'Despesas',
            data: this.receitaDespesa.map(item => item.despesas),
            backgroundColor: '#dc2626'
          }
        ]
      },
      options: this.commonChartOptions()
    });
  }

  private renderCategoriasChart(): void {
    this.categoriasChart?.destroy();
    const canvas = this.categoriasCanvas?.nativeElement;
    if (!canvas) return;

    this.categoriasChart = this.createChart(
      canvas,
      this.categoriasTipo,
      this.gastosCategorias.map(item => item.nome),
      this.gastosCategorias.map(item => item.valor),
      this.cores,
      'Gastos por Categoria'
    );
  }

  private renderSubcategoriasChart(): void {
    this.subcategoriasChart?.destroy();
    const canvas = this.subcategoriasCanvas?.nativeElement;
    if (!canvas) return;

    this.subcategoriasChart = this.createChart(
      canvas,
      this.subcategoriasTipo,
      this.gastosSubcategorias.map(item => item.nome),
      this.gastosSubcategorias.map(item => item.valor),
      this.cores.slice().reverse(),
      'Gastos por Subcategoria'
    );
  }

  private renderEvolucaoChart(): void {
    this.evolucaoChart?.destroy();
    const canvas = this.evolucaoCanvas?.nativeElement;
    if (!canvas) return;

    const ChartClass = this.ChartCtor;
    if (!ChartClass) return;

    this.evolucaoChart = new ChartClass(canvas, {
      type: 'line',
      data: {
        labels: this.evolucao.map(item => item.label),
        datasets: [{
          label: 'Saldo',
          data: this.evolucao.map(item => item.saldo),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.14)',
          tension: 0.28,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: this.commonChartOptions()
    });
  }

  private createChart(
    canvas: HTMLCanvasElement,
    type: ChartType,
    labels: string[],
    valores: number[],
    cores: string[],
    datasetLabel?: string
  ): Chart | undefined {
    const ChartClass = this.ChartCtor;
    if (!ChartClass) return undefined;

    console.log(labels)

    return new ChartClass(canvas, {
      type,
      data: {
        labels,
        datasets: [{
          label: datasetLabel,
          data: valores,
          backgroundColor: labels.map((_, index) => cores[index % cores.length])
        }]
      },
      options: this.commonChartOptions(type === 'pie')
    });
  }

  private commonChartOptions(isPie = false): any {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#e0e0e0' : '#263238';
    const gridColor = isDark ? 'rgba(224, 224, 224, 0.16)' : 'rgba(38, 50, 56, 0.12)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isPie ? 'bottom' : 'top',
          labels: { color: textColor, boxWidth: 14 }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label ? `${context.dataset.label}: ` : `${context.label}: `;
              return `${label}${this.formatCurrency(context.parsed.y ?? context.parsed)}`;
            }
          }
        }
      },
      scales: isPie ? {} : {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
      }
    };
  }

  private buildFiltro(): DashboardFinanceiroFiltro {
    const f = this.filtroForm.value;
    return {
      dataInicial: this.toDateParam(f.dataInicial),
      dataFinal: this.toDateParam(f.dataFinal),
      contaFinanceiraId: f.contaFinanceiraId ?? undefined,
      categoriaId: f.categoriaId ?? undefined,
      subcategoriaId: f.subcategoriaId ?? undefined
    };
  }

  private buildComparativoFiltro(): DashboardFinanceiroComparativoFiltro | null {
    const f = this.comparativoForm.value;
    const filtroGlobal = this.buildFiltro();
    const periodoAInicial = this.toDateParam(f.periodoAInicial);
    const periodoAFinal = this.toDateParam(f.periodoAFinal);
    const periodoBInicial = this.toDateParam(f.periodoBInicial);
    const periodoBFinal = this.toDateParam(f.periodoBFinal);

    if (!periodoAInicial || !periodoAFinal || !periodoBInicial || !periodoBFinal) {
      return null;
    }

    return {
      periodoAInicial,
      periodoAFinal,
      periodoBInicial,
      periodoBFinal,
      contaFinanceiraId: filtroGlobal.contaFinanceiraId,
      categoriaId: filtroGlobal.categoriaId,
      subcategoriaId: filtroGlobal.subcategoriaId
    };
  }

  private toDateParam(value: Date | string | null | undefined): string | undefined {
    if (!value) return undefined;

    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private destroyCharts(): void {
    this.receitaDespesaChart?.destroy();
    this.categoriasChart?.destroy();
    this.subcategoriasChart?.destroy();
    this.evolucaoChart?.destroy();
  }
}
