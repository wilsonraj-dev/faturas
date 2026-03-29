import { Component, OnInit } from '@angular/core';
import { FaturaService, CompraService } from '../../services/api.service';
import { FaturaResumo, CriarCompraRequest, SimulacaoFaturaItem } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

export type StatusFatura = 'saudavel' | 'atencao' | 'estourado';
export type SaudeFinanceira = 'saudavel' | 'atencao' | 'critico';
export type OrdenacaoMeses = 'cronologica' | 'valor';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  faturas: FaturaResumo[] = [];
  anoSelecionado: number = new Date().getFullYear();
  anos: number[] = [];

  // Indicadores
  totalComprometido = 0;
  mediaMensal = 0;
  maiorFatura: FaturaResumo | null = null;
  menorFatura: FaturaResumo | null = null;

  // Limite mensal
  limiteMensal = 1000;
  private readonly LIMITE_STORAGE_KEY = 'dashboard_limite_mensal';

  // Ordenação
  ordenacao: OrdenacaoMeses = 'cronologica';

  // Simulação
  simulacao: SimulacaoFaturaItem[] = [];
  simNome = '';
  simData = '';
  simParcelas = 1;
  simValor = 0;
  simTentouSubmeter = false;

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private faturaService: FaturaService,
    private compraService: CompraService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const limSalvo = localStorage.getItem(this.LIMITE_STORAGE_KEY);
    if (limSalvo) {
      this.limiteMensal = +limSalvo;
    }
    const anoAtual = new Date().getFullYear();
    this.anos = Array.from({ length: 5 }, (_, i) => anoAtual - 1 + i);
    this.carregarDados();
  }

  carregarDados(): void {
    this.faturaService.obterDashboard(this.anoSelecionado).subscribe({
      next: (dados) => {
        this.faturas = dados;
        this.calcularIndicadores();
      },
      error: () => this.snackBar.open('Erro ao carregar dashboard', 'OK', { duration: 3000 })
    });
  }

  salvarLimite(): void {
    localStorage.setItem(this.LIMITE_STORAGE_KEY, this.limiteMensal.toString());
    this.snackBar.open('Limite salvo com sucesso!', 'OK', { duration: 2000 });
  }

  private calcularIndicadores(): void {
    this.totalComprometido = this.faturas.reduce((sum, f) => sum + f.valorTotal, 0);
    const mesesComFatura = this.faturas.filter(f => f.valorTotal > 0).length;
    this.mediaMensal = mesesComFatura > 0 ? this.totalComprometido / mesesComFatura : 0;

    if (this.faturas.length > 0) {
      this.maiorFatura = this.faturas.reduce((prev, curr) => curr.valorTotal > prev.valorTotal ? curr : prev);
      this.menorFatura = this.faturas.reduce((prev, curr) => curr.valorTotal < prev.valorTotal ? curr : prev);
    } else {
      this.maiorFatura = null;
      this.menorFatura = null;
    }
  }

  // --- Status por mês ---
  getStatus(fatura: FaturaResumo): StatusFatura {
    const pct = this.limiteMensal > 0 ? fatura.valorTotal / this.limiteMensal : 0;
    if (pct > 1) return 'estourado';
    if (pct >= 0.5) return 'atencao';
    return 'saudavel';
  }

  getStatusLabel(status: StatusFatura): string {
    switch (status) {
      case 'saudavel': return 'Saudável';
      case 'atencao': return 'Atenção';
      case 'estourado': return 'Estourado';
    }
  }

  getStatusIcon(status: StatusFatura): string {
    switch (status) {
      case 'saudavel': return 'check_circle';
      case 'atencao': return 'warning';
      case 'estourado': return 'error';
    }
  }

  // --- Cor dinâmica da barra ---
  getBarColor(fatura: FaturaResumo): string {
    const status = this.getStatus(fatura);
    switch (status) {
      case 'saudavel': return '#4caf50';
      case 'atencao': return '#ff9800';
      case 'estourado': return '#f44336';
    }
  }

  // --- Gráfico de barras ---
  getNomeMes(mes: number): string {
    return this.meses[mes - 1] || '';
  }

  getMaxValor(): number {
    if (this.faturas.length === 0) return 1;
    return Math.max(...this.faturas.map(f => f.valorTotal), this.limiteMensal);
  }

  getBarWidth(valor: number): number {
    const max = this.getMaxValor();
    return max > 0 ? (valor / max) * 100 : 0;
  }

  get faturasOrdenadas(): FaturaResumo[] {
    const copia = [...this.faturas];
    if (this.ordenacao === 'valor') {
      return copia.sort((a, b) => b.valorTotal - a.valorTotal);
    }
    return copia.sort((a, b) => a.mes - b.mes);
  }

  // --- Top 3 meses ---
  get top3Meses(): FaturaResumo[] {
    return [...this.faturas]
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 3);
  }

  // --- Meses com alerta ---
  get mesesEstourados(): FaturaResumo[] {
    return this.faturas.filter(f => f.valorTotal > this.limiteMensal);
  }

  get mesesProximosLimite(): FaturaResumo[] {
    return this.faturas.filter(f => {
      const pct = this.limiteMensal > 0 ? f.valorTotal / this.limiteMensal : 0;
      return pct >= 0.8 && pct <= 1;
    });
  }

  get temAlertas(): boolean {
    return this.mesesEstourados.length > 0 || this.mesesProximosLimite.length > 0;
  }

  // --- Saúde financeira geral ---
  get saudeFinanceira(): SaudeFinanceira {
    if (this.faturas.some(f => f.valorTotal > this.limiteMensal)) return 'critico';
    if (this.faturas.some(f => this.limiteMensal > 0 && f.valorTotal / this.limiteMensal >= 0.8)) return 'atencao';
    return 'saudavel';
  }

  get saudeLabel(): string {
    switch (this.saudeFinanceira) {
      case 'saudavel': return 'Saudável';
      case 'atencao': return 'Atenção';
      case 'critico': return 'Crítico';
    }
  }

  get saudeIcon(): string {
    switch (this.saudeFinanceira) {
      case 'saudavel': return 'sentiment_very_satisfied';
      case 'atencao': return 'sentiment_neutral';
      case 'critico': return 'sentiment_very_dissatisfied';
    }
  }

  get saudeDescricao(): string {
    switch (this.saudeFinanceira) {
      case 'saudavel': return 'Nenhum mês acima de 80% do limite. Finanças sob controle!';
      case 'atencao': return 'Algum mês ultrapassou 80% do limite. Fique atento!';
      case 'critico': return 'Algum mês ultrapassou o limite estabelecido. Revise seus gastos!';
    }
  }

  getPctLimite(fatura: FaturaResumo): number {
    return this.limiteMensal > 0 ? (fatura.valorTotal / this.limiteMensal) * 100 : 0;
  }

  getLimiteBarWidth(): number {
    const max = this.getMaxValor();
    return max > 0 ? (this.limiteMensal / max) * 100 : 0;
  }

  isAlerta = (fatura: FaturaResumo): boolean => {
    return fatura.valorTotal >= this.limiteMensal && !fatura.quitada;
  }

  // --- Simulação ---
  get simFormularioValido(): boolean {
    return !!this.simNome?.trim() && !!this.simData && this.simParcelas >= 1 && this.simValor > 0;
  }

  simular(): void {
    this.simTentouSubmeter = true;
    if (!this.simFormularioValido) return;

    const request: CriarCompraRequest = {
      nome: this.simNome,
      dataCompra: this.simData,
      numeroParcelas: this.simParcelas,
      valorTotal: this.simValor
    };

    this.compraService.simularCompra(request).subscribe({
      next: (res) => this.simulacao = res.faturas,
      error: () => this.snackBar.open('Erro na simulação', 'OK', { duration: 3000 })
    });
  }

  limparSimulacao(): void {
    this.simulacao = [];
    this.simNome = '';
    this.simData = '';
    this.simParcelas = 1;
    this.simValor = 0;
    this.simTentouSubmeter = false;
  }
}
