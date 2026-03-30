import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SimulacaoApiService, FaturaService } from '../../services/api.service';
import { SimulacaoDetalhe, FaturaResumo } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-simulacao-detalhe',
  templateUrl: './simulacao-detalhe.component.html',
  styleUrls: ['./simulacao-detalhe.component.css']
})
export class SimulacaoDetalheComponent implements OnInit {
  simulacao: SimulacaoDetalhe | null = null;
  carregando = false;
  faturasMap: { [chave: string]: FaturaResumo } = {};

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  displayedColumns = ['numeroParcela', 'mesAno', 'valor', 'valorAtual', 'valorCombinado'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simulacaoService: SimulacaoApiService,
    private faturaService: FaturaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.carregar(id);
    }
  }

  carregar(id: number): void {
    this.carregando = true;
    this.simulacaoService.obter(id).subscribe({
      next: (dados) => {
        this.simulacao = dados;
        this.carregarFaturasExistentes();
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar simulação', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  converter(): void {
    if (!this.simulacao) return;
    if (!confirm('Converter esta simulação em compra real? A simulação será removida.')) return;

    this.simulacaoService.converterEmCompra(this.simulacao.id).subscribe({
      next: () => {
        this.snackBar.open('Simulação convertida em compra real!', 'OK', { duration: 3000 });
        this.router.navigate(['/faturas']);
      },
      error: () => this.snackBar.open('Erro ao converter simulação', 'OK', { duration: 3000 })
    });
  }

  deletar(): void {
    if (!this.simulacao) return;
    if (!confirm('Excluir esta simulação?')) return;

    this.simulacaoService.deletar(this.simulacao.id).subscribe({
      next: () => {
        this.snackBar.open('Simulação excluída!', 'OK', { duration: 2000 });
        this.router.navigate(['/simulacoes']);
      },
      error: () => this.snackBar.open('Erro ao excluir simulação', 'OK', { duration: 3000 })
    });
  }

  getNomeMes(mes: number): string {
    return this.meses[mes - 1] || '';
  }

  getValorAtual(mes: number, ano: number): number {
    const fatura = this.faturasMap[`${mes}-${ano}`];
    return fatura ? fatura.valorTotal : 0;
  }

  getValorCombinado(mes: number, ano: number, valorParcela: number): number {
    return this.getValorAtual(mes, ano) + valorParcela;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  private carregarFaturasExistentes(): void {
    if (!this.simulacao) return;

    const anosUnicos = [...new Set(this.simulacao.parcelas.map(p => p.ano))];
    if (anosUnicos.length === 0) return;

    const requests = anosUnicos.map(ano => this.faturaService.listarFaturas(ano));
    forkJoin(requests).subscribe({
      next: (resultados) => {
        this.faturasMap = {};
        resultados.flat().forEach(f => {
          this.faturasMap[`${f.mes}-${f.ano}`] = f;
        });
      },
      error: () => { }
    });
  }
}
