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
import { ThemeService } from '../../../services/theme.service';

type GraficoAlternavel = 'line' | 'bar' | 'pie';

@Component({
  selector: 'app-dashboard-financeiro',
  templateUrl: './dashboard-financeiro.component.html',
  styleUrls: ['./dashboard-financeiro.component.css']
})
export class DashboardFinanceiroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('receitaDespesaCanvas') receitaDespesaCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('subcategoriasCanvas') subcategoriasCanvas?: ElementRef<HTMLCanvasElement>;

  filtroForm!: FormGroup;
  comparativoForm!: FormGroup;

  contas: ContaFinanceira[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];

  resumo: DashboardFinanceiroResumo | null = null;
  receitaDespesa: DashboardFinanceiroSerieMensalItem[] = [];
  gastosCategorias: DashboardFinanceiroAgrupamentoItem[] = [];
  gastosSubcategorias: DashboardFinanceiroAgrupamentoItem[] = [];
  comparativo: DashboardFinanceiroComparativo | null = null;
  rankings: DashboardFinanceiroRankings | null = null;

  carregando = false;
  receitaDespesaTipo: GraficoAlternavel = 'line';
  subcategoriasTipo: GraficoAlternavel = 'bar';
  private readonly cardsContraidos = new Set<string>();

  private receitaDespesaChart?: Chart;
  private subcategoriasChart?: Chart;
  private ChartCtor?: typeof import('chart.js').Chart;
  private categoriaSubscription?: Subscription;
  private themeSubscription?: Subscription;
  private chartAreaReady = false;

  private readonly colorTokens = [
    '--chart-1',
    '--chart-2',
    '--chart-3',
    '--chart-4',
    '--chart-5',
    '--chart-6',
    '--chart-7',
    '--chart-8'
  ];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardFinanceiroService,
    private contaService: ContaFinanceiraService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
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
    this.themeSubscription = this.themeService.theme$.subscribe(() => {
      if (this.chartAreaReady) {
        this.atualizarGraficos();
      }
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
    this.themeSubscription?.unsubscribe();
    this.destroyCharts();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.atualizarGraficos();
  }

  get economiaDescricao(): string {
    const pct = this.resumo?.percentualReceitaComprometida ?? 0;
    return `${pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% da receita foi comprometida`;
  }

  cardEstaContraido(card: string): boolean {
    return this.cardsContraidos.has(card);
  }

  alternarCard(card: string): void {
    if (this.cardsContraidos.has(card)) {
      this.cardsContraidos.delete(card);
      // Charts need a resize after their container becomes visible again.
      setTimeout(() => this.atualizarGraficos());
      return;
    }

    this.cardsContraidos.add(card);
  }

  get categoriaSelecionadaNome(): string {
    const categoriaId = this.filtroForm?.value?.categoriaId;
    return this.categorias.find(c => c.id === categoriaId)?.nome ?? 'Todas as categorias';
  }

  get totalGastoCategorias(): number {
    return this.gastosCategorias.reduce((total, item) => total + item.valor, 0);
  }

  get periodoSelecionadoLabel(): string {
    const inicio = this.filtroForm?.value?.dataInicial;
    const fim = this.filtroForm?.value?.dataFinal;
    if (!inicio && !fim) return 'Todo o período disponível';

    const formatar = (value: Date | string): string => new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: 'numeric'
    }).format(value instanceof Date ? value : new Date(value));

    if (inicio && fim) return `${formatar(inicio)} a ${formatar(fim)}`;
    return formatar(inicio ?? fim);
  }

  get visaoAnualLabel(): string {
    return `Janeiro a dezembro de ${this.getAnoVisaoAnual()}`;
  }

  getCategoriaCor(index: number): string {
    return `var(${this.colorTokens[index % this.colorTokens.length]})`;
  }

  getCategoriaPercentual(item: DashboardFinanceiroAgrupamentoItem): number {
    if (item.percentual) return item.percentual;
    return this.totalGastoCategorias > 0 ? (item.valor / this.totalGastoCategorias) * 100 : 0;
  }

  getCategoriaIcone(nome: string): string {
    const valor = nome.toLocaleLowerCase('pt-BR');
    if (/moradia|casa|aluguel/.test(valor)) return 'home';
    if (/mercado|aliment|restaurante|comida/.test(valor)) return 'shopping_cart';
    if (/saúde|saude|farmácia|farmacia/.test(valor)) return 'favorite';
    if (/transporte|carro|combustível|combustivel/.test(valor)) return 'directions_car';
    if (/assinatura|serviço|servico/.test(valor)) return 'subscriptions';
    if (/tecnologia|eletrônico|eletronico/.test(valor)) return 'devices';
    if (/lazer|jogo|entretenimento/.test(valor)) return 'sports_esports';
    if (/educação|educacao|curso/.test(valor)) return 'school';
    if (/presente/.test(valor)) return 'redeem';
    return 'category';
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

  alterarSubcategoriasTipo(tipo: GraficoAlternavel): void {
    this.subcategoriasTipo = tipo;
    this.renderSubcategoriasChart();
  }

  selecionarCategoria(item: DashboardFinanceiroAgrupamentoItem): void {
    if (!item.id) return;

    const categoriaJaSelecionada = this.filtroForm.value.categoriaId === item.id;
    this.filtroForm.patchValue({
      categoriaId: categoriaJaSelecionada ? null : item.id,
      subcategoriaId: null
    });
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

    return 'Sem variação';
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
    const filtroAnual = this.buildFiltroAnual();
    this.carregando = true;

    forkJoin({
      resumo: this.dashboardService.obterResumo(filtro),
      receitaDespesa: this.dashboardService.obterReceitaDespesa(filtroAnual),
      categorias: this.dashboardService.obterCategorias(filtro),
      subcategorias: this.dashboardService.obterSubcategorias(filtro),
      rankings: this.dashboardService.obterRankings(filtro)
    }).subscribe({
      next: dados => {
        this.resumo = dados.resumo;
        this.receitaDespesa = this.normalizarSerieAnual(dados.receitaDespesa, this.getAnoVisaoAnual());
        this.gastosCategorias = dados.categorias;
        this.gastosSubcategorias = dados.subcategorias;
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
    this.renderSubcategoriasChart();
  }

  private renderReceitaDespesaChart(): void {
    this.receitaDespesaChart?.destroy();
    const canvas = this.receitaDespesaCanvas?.nativeElement;
    if (!canvas) return;

    if (this.receitaDespesaTipo === 'pie') {
      const totalReceitas = this.receitaDespesa.reduce((sum, item) => sum + item.receitas, 0);
      const totalDespesas = this.receitaDespesa.reduce((sum, item) => sum + item.despesas, 0);
      this.receitaDespesaChart = this.createChart(canvas, 'pie', ['Receitas', 'Despesas'], [totalReceitas, totalDespesas], [
        this.getCssColor('--color-success'),
        this.getCssColor('--color-danger')
      ]);

      return;
    }

    const ChartClass = this.ChartCtor;
    if (!ChartClass) return;

    const isLine = this.receitaDespesaTipo === 'line';
    this.receitaDespesaChart = new ChartClass(canvas, {
      type: isLine ? 'line' : 'bar',
      data: {
        labels: this.receitaDespesa.map(item => item.label),
        datasets: [
          {
            label: 'Receitas',
            data: this.receitaDespesa.map(item => item.receitas),
            borderColor: this.getCssColor('--color-success'),
            backgroundColor: isLine ? `${this.getCssColor('--color-success')}1f` : this.getCssColor('--color-success'),
            pointBackgroundColor: this.getCssColor('--color-success'),
            pointBorderColor: this.getCssColor('--color-surface'),
            pointBorderWidth: 2,
            tension: 0.34,
            fill: false,
            pointRadius: isLine ? 4 : 0,
            pointHoverRadius: 6,
            borderWidth: 3,
            borderRadius: isLine ? 0 : 8,
            borderSkipped: false,
            maxBarThickness: 30
          },
          {
            label: 'Despesas',
            data: this.receitaDespesa.map(item => item.despesas),
            borderColor: this.getCssColor('--color-danger'),
            backgroundColor: isLine ? `${this.getCssColor('--color-danger')}1f` : this.getCssColor('--color-danger'),
            pointBackgroundColor: this.getCssColor('--color-danger'),
            pointBorderColor: this.getCssColor('--color-surface'),
            pointBorderWidth: 2,
            tension: 0.34,
            fill: false,
            pointRadius: isLine ? 4 : 0,
            pointHoverRadius: 6,
            borderWidth: 3,
            borderRadius: isLine ? 0 : 8,
            borderSkipped: false,
            maxBarThickness: 30
          }
        ]
      },
      options: this.commonChartOptions()
    });
  }

  private renderSubcategoriasChart(): void {
    this.subcategoriasChart?.destroy();
    const canvas = this.subcategoriasCanvas?.nativeElement;
    if (!canvas) return;

    const labels = this.gastosSubcategorias.map(item => item.nome);
    const valores = this.gastosSubcategorias.map(item => item.valor);
    const cores = this.getChartColors().reverse();

    if (this.subcategoriasTipo === 'pie') {
      this.subcategoriasChart = this.createChart(canvas, 'pie', labels, valores, cores);
      return;
    }

    const ChartClass = this.ChartCtor;
    if (!ChartClass) return;

    const options = this.commonChartOptions();
    options.plugins.legend.labels.generateLabels = (chart: any) => labels.map((label, index) => ({
      text: label,
      fillStyle: cores[index % cores.length],
      strokeStyle: cores[index % cores.length],
      lineWidth: 0,
      hidden: !chart.getDataVisibility(index),
      index
    }));
    options.plugins.legend.onClick = (_event: unknown, legendItem: { index?: number }, legend: any) => {
      if (legendItem.index === undefined) return;

      legend.chart.toggleDataVisibility(legendItem.index);
      legend.chart.update();
    };

    this.subcategoriasChart = new ChartClass(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Gastos por Subcategoria',
          data: valores,
          backgroundColor: labels.map((_, index) => cores[index % cores.length]),
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.9,
          categoryPercentage: 0.8
        }]
      },
      options
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
    const textColor = this.getCssColor('--color-text-primary');
    const gridColor = this.getCssColor('--chart-grid');

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 9,
            boxHeight: 9,
            padding: 20
          }
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
        x: {
          ticks: { color: textColor },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: (value: number | string) => Number(value).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              maximumFractionDigits: 1
            })
          },
          grid: { color: gridColor, borderDash: [4, 4] },
          border: { display: false }
        }
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

  private buildFiltroAnual(): DashboardFinanceiroFiltro {
    const ano = this.getAnoVisaoAnual();
    return {
      dataInicial: `${ano}-01-01`,
      dataFinal: `${ano}-12-31`,
      contaFinanceiraId: this.filtroForm.value.contaFinanceiraId ?? undefined
    };
  }

  private getAnoVisaoAnual(): number {
    const referencia = this.filtroForm?.value?.dataFinal ?? this.filtroForm?.value?.dataInicial;
    if (!referencia) return new Date().getFullYear();
    return (referencia instanceof Date ? referencia : new Date(referencia)).getFullYear();
  }

  private normalizarSerieAnual(
    dados: DashboardFinanceiroSerieMensalItem[],
    ano: number
  ): DashboardFinanceiroSerieMensalItem[] {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses.map((label, index) => {
      const mes = index + 1;
      const item = dados.find(valor => valor.ano === ano && valor.mes === mes);
      return item
        ? { ...item, label }
        : { ano, mes, label, receitas: 0, despesas: 0, saldo: 0 };
    });
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

  private getChartColors(): string[] {
    return this.colorTokens.map(token => this.getCssColor(token));
  }

  private getCssColor(token: string): string {
    return getComputedStyle(document.body).getPropertyValue(token).trim();
  }

  private destroyCharts(): void {
    this.receitaDespesaChart?.destroy();
    this.subcategoriasChart?.destroy();
  }
}
