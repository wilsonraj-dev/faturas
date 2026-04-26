import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { FaturaResumo, SimulacaoResumo } from '../../models/models';
import { FaturaService, SimulacaoApiService } from '../../services/api.service';

type ModoVisualizacao = 'individual' | 'selecionar' | 'todas';

interface ParcelaResultado {
  nomeSimulacao: string;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  valorFaturaAtual: number;
  valorTotalMes: number;
  data: Date;
}

interface ParcelaAgrupadaResultado {
  nomeSimulacao: string;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  valorFaturaAtual: number;
  valorTotalMes: number;
  data: Date;
  labelParcela: string;
  labelData: string;
}

@Component({
  selector: 'app-simulacoes',
  templateUrl: './simulacoes.component.html',
  styleUrls: ['./simulacoes.component.css']
})
export class SimulacoesComponent implements OnInit {
  simulacoes: SimulacaoResumo[] = [];
  carregando = false;
  criando = false;
  calculandoImpacto = false;
  modoVisualizacao: ModoVisualizacao = 'individual';
  agruparPorMes = false;
  simulacaoAbertaId: number | null = null;
  idsSelecionados = new Set<number>();
  resultadoParcelas: ParcelaAgrupadaResultado[] = [];
  faturasMap: Record<string, FaturaResumo> = {};
  readonly pageSizeOptions = [6, 12, 18, 24];
  pageSize = 6;
  pageIndex = 0;

  readonly displayedColumns = ['simulacao', 'parcela', 'valor', 'faturaAtual', 'totalMes', 'data'];
  readonly opcoesParcelamento = Array.from({ length: 24 }, (_, i) => i + 1);
  readonly modosVisualizacao: Array<{ value: ModoVisualizacao; label: string; tooltip: string }> = [
    {
      value: 'individual',
      label: 'Individual',
      tooltip: 'Visualize os cards e abra o impacto de uma simulação por vez.'
    },
    {
      value: 'selecionar',
      label: 'Selecionar',
      tooltip: 'Escolha uma ou mais simulações e calcule o impacto consolidado.'
    },
    {
      value: 'todas',
      label: 'Todas',
      tooltip: 'Mostra automaticamente o impacto consolidado de todas as simulações.'
    }
  ];

  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly faturaService: FaturaService,
    private readonly simulacaoService: SimulacaoApiService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.form = this.fb.nonNullable.group({
      nome: ['', [Validators.maxLength(200)]],
      dataSimulacao: ['', [Validators.required]],
      numeroParcelas: [1, [Validators.required, Validators.min(1)]],
      valorTotal: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  get nomeControl() {
    return this.form.controls.nome;
  }

  get dataSimulacaoControl() {
    return this.form.controls.dataSimulacao;
  }

  get numeroParcelasControl() {
    return this.form.controls.numeroParcelas;
  }

  get valorTotalControl() {
    return this.form.controls.valorTotal;
  }

  get formularioValido(): boolean {
    return this.form.valid;
  }

  get valorParcela(): number {
    const { numeroParcelas, valorTotal } = this.form.getRawValue();
    if (numeroParcelas < 1 || valorTotal <= 0) {
      return 0;
    }

    return this.arredondarValor(valorTotal / numeroParcelas);
  }

  get quantidadeSelecionada(): number {
    return this.idsSelecionados.size;
  }

  get resultadoParcelasPaginadas(): ParcelaAgrupadaResultado[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.resultadoParcelas.slice(inicio, inicio + this.pageSize);
  }

  get possuiResultado(): boolean {
    return this.resultadoParcelas.length > 0;
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.simulacaoService.listar().subscribe({
      next: (dados) => {
        this.simulacoes = dados;
        this.sincronizarSelecao();
        this.carregarFaturasExistentes();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar simulações', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  criar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.criando = true;
    this.simulacaoService.criar({
      nome: valores.nome.trim() || undefined,
      dataSimulacao: valores.dataSimulacao,
      numeroParcelas: valores.numeroParcelas,
      valorTotal: valores.valorTotal
    }).subscribe({
      next: () => {
        this.snackBar.open('Simulação criada!', 'OK', { duration: 2000 });
        this.limparForm();
        this.carregar();
        this.criando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao criar simulação', 'OK', { duration: 3000 });
        this.criando = false;
      }
    });
  }

  deletar(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta simulação?')) {
      return;
    }

    this.simulacaoService.deletar(id).subscribe({
      next: () => {
        this.snackBar.open('Simulação excluída!', 'OK', { duration: 2000 });
        this.idsSelecionados.delete(id);
        if (this.simulacaoAbertaId === id) {
          this.simulacaoAbertaId = null;
        }
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao excluir simulação', 'OK', { duration: 3000 })
    });
  }

  converter(id: number): void {
    if (!confirm('Converter esta simulação em compra real? A simulação será removida.')) {
      return;
    }

    this.simulacaoService.converterEmCompra(id).subscribe({
      next: () => {
        this.snackBar.open('Simulação convertida em compra real!', 'OK', { duration: 3000 });
        this.idsSelecionados.delete(id);
        if (this.simulacaoAbertaId === id) {
          this.simulacaoAbertaId = null;
        }
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao converter simulação', 'OK', { duration: 3000 })
    });
  }

  verDetalhe(id: number): void {
    if (this.simulacaoAbertaId === id) {
      this.simulacaoAbertaId = null;
      this.resultadoParcelas = [];
      return;
    }

    this.simulacaoAbertaId = id;
    const simulacao = this.simulacoes.find(item => item.id === id);
    if (!simulacao) {
      this.resultadoParcelas = [];
      return;
    }

    this.calcularResultado([simulacao]);
  }

  alterarModo(modo: ModoVisualizacao): void {
    if (this.modoVisualizacao === modo) {
      return;
    }

    this.modoVisualizacao = modo;
    this.simulacaoAbertaId = null;
    this.atualizarResultadoPorModo();
  }

  alterarAgrupamento(agrupar: boolean): void {
    this.agruparPorMes = agrupar;
    this.atualizarResultadoPorModo();
  }

  selecionarSimulacoes(event: MatSelectionListChange): void {
    const ids = event.source.selectedOptions.selected
      .map(option => Number(option.value))
      .filter(id => !Number.isNaN(id));

    this.idsSelecionados = new Set(ids);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  calcularImpactoSelecionado(): void {
    const selecionadas = this.simulacoes.filter(sim => this.idsSelecionados.has(sim.id));
    if (selecionadas.length === 0) {
      this.snackBar.open('Selecione pelo menos uma simulação para calcular o impacto.', 'OK', { duration: 3000 });
      this.resultadoParcelas = [];
      return;
    }

    this.calcularResultado(selecionadas);
  }

  obterTituloResultado(): string {
    switch (this.modoVisualizacao) {
      case 'individual': {
        const simulacao = this.simulacoes.find(item => item.id === this.simulacaoAbertaId);
        return simulacao ? `Impacto de ${this.getNomeSimulacao(simulacao)}` : 'Impacto da Simulação';
      }
      case 'selecionar':
        return `Impacto consolidado (${this.quantidadeSelecionada} selecionada${this.quantidadeSelecionada === 1 ? '' : 's'})`;
      case 'todas':
        return 'Impacto consolidado de todas as simulações';
      default:
        return 'Impacto das Simulações';
    }
  }

  getNomeSimulacao(simulacao: SimulacaoResumo): string {
    return simulacao.nome?.trim() || `Simulação #${simulacao.id}`;
  }

  getQuantidadeParcelasLabel(simulacao: SimulacaoResumo): string {
    return `${simulacao.numeroParcelas}x`;
  }

  getValorParcela(simulacao: SimulacaoResumo): number {
    return this.arredondarValor(simulacao.valorTotal / simulacao.numeroParcelas);
  }

  formatarData(data: string | Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarMesAno(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(data);
  }

  calcularParcelas(simulacoes: SimulacaoResumo[]): ParcelaResultado[] {
    const parcelas = simulacoes.flatMap(simulacao => {
      const valorBase = simulacao.valorTotal / simulacao.numeroParcelas;
      const valorParcela = this.arredondarValor(valorBase);
      const diferenca = this.arredondarValor(simulacao.valorTotal - (valorParcela * simulacao.numeroParcelas));
      const dataBase = this.normalizarData(simulacao.dataSimulacao);

      return Array.from({ length: simulacao.numeroParcelas }, (_, index) => {
        const numeroParcela = index + 1;
        const data = new Date(dataBase.getFullYear(), dataBase.getMonth() + index, dataBase.getDate());
        const valor = numeroParcela === simulacao.numeroParcelas
          ? this.arredondarValor(valorParcela + diferenca)
          : valorParcela;
        const valorFaturaAtual = this.getValorFaturaAtual(data);

        return {
          nomeSimulacao: this.getNomeSimulacao(simulacao),
          numeroParcela,
          totalParcelas: simulacao.numeroParcelas,
          valor,
          valorFaturaAtual,
          valorTotalMes: this.arredondarValor(valorFaturaAtual + valor),
          data
        };
      });
    });

    return parcelas.sort((a, b) => {
      const diffAno = a.data.getFullYear() - b.data.getFullYear();
      if (diffAno !== 0) {
        return diffAno;
      }

      const diffMes = a.data.getMonth() - b.data.getMonth();
      if (diffMes !== 0) {
        return diffMes;
      }

      return a.numeroParcela - b.numeroParcela;
    });
  }

  private calcularResultado(simulacoes: SimulacaoResumo[]): void {
    this.calculandoImpacto = true;
    const parcelas = this.calcularParcelas(simulacoes);
    this.resultadoParcelas = this.agruparPorMes
      ? this.agruparParcelasPorMes(parcelas)
      : parcelas.map(parcela => this.mapearLinhaResultado(parcela));
    this.pageIndex = 0;
    this.calculandoImpacto = false;
  }

  private atualizarResultadoPorModo(): void {
    if (this.modoVisualizacao === 'todas') {
      this.calcularResultado(this.simulacoes);
      return;
    }

    if (this.modoVisualizacao === 'individual' && this.simulacaoAbertaId !== null) {
      const simulacao = this.simulacoes.find(item => item.id === this.simulacaoAbertaId);
      if (simulacao) {
        this.calcularResultado([simulacao]);
        return;
      }
    }

    this.resultadoParcelas = [];
    this.pageIndex = 0;
  }

  private agruparParcelasPorMes(parcelas: ParcelaResultado[]): ParcelaAgrupadaResultado[] {
    const agrupado = new Map<string, ParcelaAgrupadaResultado>();

    parcelas.forEach(parcela => {
      const chave = `${parcela.data.getFullYear()}-${parcela.data.getMonth()}`;
      const existente = agrupado.get(chave);
      if (existente) {
        existente.valor = this.arredondarValor(existente.valor + parcela.valor);
        existente.valorTotalMes = this.arredondarValor(existente.valorFaturaAtual + existente.valor);
        return;
      }

      agrupado.set(chave, {
        nomeSimulacao: 'Consolidado',
        numeroParcela: 0,
        totalParcelas: 0,
        valor: parcela.valor,
        valorFaturaAtual: parcela.valorFaturaAtual,
        valorTotalMes: this.arredondarValor(parcela.valorFaturaAtual + parcela.valor),
        data: new Date(parcela.data.getFullYear(), parcela.data.getMonth(), 1),
        labelParcela: '-',
        labelData: this.formatarMesAno(parcela.data)
      });
    });

    return [...agrupado.values()].sort((a, b) => a.data.getTime() - b.data.getTime());
  }

  private mapearLinhaResultado(parcela: ParcelaResultado): ParcelaAgrupadaResultado {
    return {
      ...parcela,
      labelParcela: `${parcela.numeroParcela}/${parcela.totalParcelas}`,
      labelData: this.formatarMesAno(parcela.data)
    };
  }

  private carregarFaturasExistentes(): void {
    const anosUnicos = [...new Set(this.obterAnosImpactados(this.simulacoes))];
    if (anosUnicos.length === 0) {
      this.faturasMap = {};
      this.atualizarResultadoPorModo();
      this.carregando = false;
      return;
    }

    forkJoin(anosUnicos.map(ano => this.faturaService.listarFaturas(ano))).subscribe({
      next: (resultados) => {
        this.faturasMap = {};
        resultados.flat().forEach(fatura => {
          this.faturasMap[this.getChaveFatura(fatura.ano, fatura.mes - 1)] = fatura;
        });
        this.atualizarResultadoPorModo();
        this.carregando = false;
      },
      error: () => {
        this.faturasMap = {};
        this.atualizarResultadoPorModo();
        this.carregando = false;
        this.snackBar.open('Não foi possível carregar as faturas existentes para compor a simulação.', 'OK', { duration: 3000 });
      }
    });
  }

  private obterAnosImpactados(simulacoes: SimulacaoResumo[]): number[] {
    return simulacoes.flatMap(simulacao => {
      const dataBase = this.normalizarData(simulacao.dataSimulacao);
      return Array.from({ length: simulacao.numeroParcelas }, (_, index) => dataBase.getFullYear() + Math.floor((dataBase.getMonth() + index) / 12));
    });
  }

  private getValorFaturaAtual(data: Date): number {
    return this.faturasMap[this.getChaveFatura(data.getFullYear(), data.getMonth())]?.valorTotal ?? 0;
  }

  private getChaveFatura(ano: number, mesIndexadoEmZero: number): string {
    return `${ano}-${mesIndexadoEmZero}`;
  }

  private sincronizarSelecao(): void {
    const idsExistentes = new Set(this.simulacoes.map(sim => sim.id));
    this.idsSelecionados = new Set([...this.idsSelecionados].filter(id => idsExistentes.has(id)));
    if (this.simulacaoAbertaId !== null && !idsExistentes.has(this.simulacaoAbertaId)) {
      this.simulacaoAbertaId = null;
    }
  }

  private limparForm(): void {
    this.form.reset({
      nome: '',
      dataSimulacao: '',
      numeroParcelas: 1,
      valorTotal: 0
    });
  }

  private normalizarData(data: string): Date {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, (mes || 1) - 1, dia || 1);
  }

  private arredondarValor(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
