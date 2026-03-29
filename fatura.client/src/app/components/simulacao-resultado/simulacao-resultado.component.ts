import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FaturaService } from '../../services/api.service';
import { SimulacaoFaturaItem, FaturaResumo } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-simulacao-resultado',
  templateUrl: './simulacao-resultado.component.html',
  styleUrls: ['./simulacao-resultado.component.css']
})
export class SimulacaoResultadoComponent implements OnChanges {
  @Input() simulacao: SimulacaoFaturaItem[] = [];

  expandido: { [index: number]: boolean } = {};
  faturasMap: { [chave: string]: FaturaResumo } = {};
  carregandoFaturas = false;

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private faturaService: FaturaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['simulacao'] && this.simulacao.length > 0) {
      this.expandido = {};
      this.carregarFaturasExistentes();
    }
  }

  toggleExpandir(index: number): void {
    this.expandido[index] = !this.expandido[index];
  }

  getNomeMes(mes: number): string {
    return this.meses[mes - 1] || '';
  }

  getFaturaExistente(item: SimulacaoFaturaItem): FaturaResumo | undefined {
    return this.faturasMap[`${item.mes}-${item.ano}`];
  }

  getValorAtual(item: SimulacaoFaturaItem): number {
    const fatura = this.getFaturaExistente(item);
    return fatura ? fatura.valorTotal : 0;
  }

  getValorCombinado(item: SimulacaoFaturaItem): number {
    return this.getValorAtual(item) + item.valorParcela;
  }

  getOrcamento(item: SimulacaoFaturaItem): number {
    const fatura = this.getFaturaExistente(item);
    return fatura ? fatura.orcamento : 0;
  }

  getPercentualOrcamento(item: SimulacaoFaturaItem): number {
    const orcamento = this.getOrcamento(item);
    if (!orcamento || orcamento <= 0) return 0;
    return (this.getValorCombinado(item) / orcamento) * 100;
  }

  getCorPercentual(percentual: number): string {
    if (percentual <= 0) return '#9e9e9e';
    if (percentual <= 50) return '#4caf50';
    if (percentual <= 75) return '#ff9800';
    if (percentual <= 100) return '#f44336';
    return '#b71c1c';
  }

  private carregarFaturasExistentes(): void {
    const anosUnicos = [...new Set(this.simulacao.map(s => s.ano))];
    if (anosUnicos.length === 0) return;

    this.carregandoFaturas = true;
    const requests = anosUnicos.map(ano => this.faturaService.listarFaturas(ano));

    forkJoin(requests).subscribe({
      next: (resultados) => {
        this.faturasMap = {};
        resultados.flat().forEach(f => {
          this.faturasMap[`${f.mes}-${f.ano}`] = f;
        });
        this.carregandoFaturas = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar faturas existentes', 'OK', { duration: 3000 });
        this.carregandoFaturas = false;
      }
    });
  }
}
