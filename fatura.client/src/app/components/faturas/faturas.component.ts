import { Component, OnInit } from '@angular/core';
import { FaturaService } from '../../services/api.service';
import { FaturaResumo, FaturaDetalhe, ParcelaResponse } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-faturas',
  templateUrl: './faturas.component.html',
  styleUrls: ['./faturas.component.css']
})
export class FaturasComponent implements OnInit {
  faturas: FaturaResumo[] = [];
  anoSelecionado: number = new Date().getFullYear();
  anos: number[] = [];
  carregando = false;
  mesSelecionado: number = new Date().getMonth();

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  editandoOrcamento: { [mes: number]: boolean } = {};
  orcamentoTemp: { [mes: number]: number } = {};

  // Detail (inline)
  detalhesCache: { [faturaId: number]: FaturaDetalhe } = {};
  carregandoDetalhe: { [faturaId: number]: boolean } = {};
  displayedColumns = ['nomeCompra', 'parcela', 'valor', 'dataVencimento'];

  constructor(
    private faturaService: FaturaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const anoAtual = new Date().getFullYear();
    this.anos = Array.from({ length: 5 }, (_, i) => anoAtual - 1 + i);
    this.carregarFaturas();
  }

  carregarFaturas(): void {
    this.carregando = true;
    this.detalhesCache = {};
    this.faturaService.listarFaturas(this.anoSelecionado).subscribe({
      next: (faturas) => {
        this.faturas = faturas;
        this.carregando = false;
        this.carregarDetalheDoMesSelecionado();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar faturas', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  getNomeMes(mes: number): string {
    return this.meses[mes - 1] || '';
  }

  getFaturaPorMes(mes: number): FaturaResumo | undefined {
    return this.faturas.find(f => f.mes === mes);
  }

  getTotalAno(): number {
    return this.faturas.reduce((sum, f) => sum + f.valorTotal, 0);
  }

  getPercentualOrcamento(fatura: FaturaResumo): number {
    if (!fatura.orcamento || fatura.orcamento <= 0) return 0;
    return (fatura.valorTotal / fatura.orcamento) * 100;
  }

  getCorOrcamento(percentual: number): string {
    if (percentual <= 0) return '#9e9e9e';
    if (percentual <= 25) return '#66bb6a';
    if (percentual <= 50) return '#a5d6a7';
    if (percentual <= 75) return '#ffca28';
    if (percentual <= 90) return '#ff9800';
    return '#f44336';
  }

  getMensagemAlerta(percentual: number): string {
    if (percentual <= 0) return '';
    if (percentual <= 25) return 'Orçamento sob controle. Ótimo!';
    if (percentual <= 50) return 'Metade do orçamento utilizado. Atenção!';
    if (percentual <= 75) return 'Orçamento em 75%. Cuidado com os gastos!';
    if (percentual <= 90) return 'Orçamento quase esgotado! Evite novas compras.';
    if (percentual <= 100) return 'Orçamento esgotado! Limite atingido.';
    return 'Orçamento ESTOURADO! Valor acima do limite.';
  }

  getIconeAlerta(percentual: number): string {
    if (percentual <= 25) return 'check_circle';
    if (percentual <= 50) return 'info';
    if (percentual <= 75) return 'warning';
    if (percentual <= 90) return 'error_outline';
    return 'dangerous';
  }

  getProgressValue(percentual: number): number {
    return Math.min(percentual, 100);
  }

  iniciarEdicaoOrcamento(fatura: FaturaResumo): void {
    this.editandoOrcamento[fatura.mes] = true;
    this.orcamentoTemp[fatura.mes] = fatura.orcamento || 0;
  }

  salvarOrcamento(fatura: FaturaResumo): void {
    const novoOrcamento = this.orcamentoTemp[fatura.mes];
    this.faturaService.atualizarOrcamento(fatura.id, novoOrcamento).subscribe({
      next: () => {
        fatura.orcamento = novoOrcamento;
        this.editandoOrcamento[fatura.mes] = false;
        this.snackBar.open('Orçamento atualizado!', 'OK', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Erro ao atualizar orçamento', 'OK', { duration: 3000 });
      }
    });
  }

  cancelarEdicaoOrcamento(mes: number): void {
    this.editandoOrcamento[mes] = false;
  }

  onTabChange(index: number): void {
    this.mesSelecionado = index;
    this.carregarDetalheDoMesSelecionado();
  }

  // --- Detail (inline) ---

  private carregarDetalheDoMesSelecionado(): void {
    const mes = this.mesSelecionado + 1;
    const fatura = this.getFaturaPorMes(mes);
    if (fatura && !this.detalhesCache[fatura.id]) {
      this.carregarDetalhe(fatura.id);
    }
  }

  private carregarDetalhe(faturaId: number): void {
    this.carregandoDetalhe[faturaId] = true;
    this.faturaService.obterFatura(faturaId).subscribe({
      next: (detalhe) => {
        this.detalhesCache[faturaId] = detalhe;
        this.carregandoDetalhe[faturaId] = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar detalhes da fatura', 'OK', { duration: 3000 });
        this.carregandoDetalhe[faturaId] = false;
      }
    });
  }

  getDetalhe(faturaId: number): FaturaDetalhe | undefined {
    return this.detalhesCache[faturaId];
  }

  isCarregandoDetalhe(faturaId: number): boolean {
    return !!this.carregandoDetalhe[faturaId];
  }

  quitarFatura(fatura: FaturaResumo): void {
    this.faturaService.quitarFatura(fatura.id).subscribe({
      next: () => {
        fatura.quitada = true;
        if (this.detalhesCache[fatura.id]) {
          this.detalhesCache[fatura.id].quitada = true;
        }
        this.snackBar.open('Fatura marcada como quitada!', 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erro ao quitar fatura', 'OK', { duration: 3000 })
    });
  }

  reabrirFatura(fatura: FaturaResumo): void {
    if (!confirm('Tem certeza que deseja reabrir esta fatura?')) return;

    this.faturaService.reabrirFatura(fatura.id).subscribe({
      next: () => {
        fatura.quitada = false;
        if (this.detalhesCache[fatura.id]) {
          this.detalhesCache[fatura.id].quitada = false;
        }
        this.snackBar.open('Fatura reaberta!', 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erro ao reabrir fatura', 'OK', { duration: 3000 })
    });
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
