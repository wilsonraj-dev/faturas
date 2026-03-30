import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SimulacaoApiService } from '../../services/api.service';
import { SimulacaoResumo } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-simulacoes',
  templateUrl: './simulacoes.component.html',
  styleUrls: ['./simulacoes.component.css']
})
export class SimulacoesComponent implements OnInit {
  simulacoes: SimulacaoResumo[] = [];
  carregando = false;

  // Form para nova simulação
  nome = '';
  dataSimulacao = '';
  numeroParcelas = 1;
  valorTotal = 0;
  criando = false;

  opcoesParcelamento = Array.from({ length: 24 }, (_, i) => i + 1);

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private simulacaoService: SimulacaoApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.simulacaoService.listar().subscribe({
      next: (dados) => {
        this.simulacoes = dados;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar simulações', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  get formularioValido(): boolean {
    return !!this.dataSimulacao && this.numeroParcelas >= 1 && this.valorTotal > 0;
  }

  get valorParcela(): number {
    if (this.numeroParcelas < 1 || this.valorTotal <= 0) return 0;
    return Math.round((this.valorTotal / this.numeroParcelas) * 100) / 100;
  }

  criar(): void {
    if (!this.formularioValido) return;

    this.criando = true;
    this.simulacaoService.criar({
      nome: this.nome.trim() || undefined,
      dataSimulacao: this.dataSimulacao,
      numeroParcelas: this.numeroParcelas,
      valorTotal: this.valorTotal
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
    if (!confirm('Tem certeza que deseja excluir esta simulação?')) return;

    this.simulacaoService.deletar(id).subscribe({
      next: () => {
        this.snackBar.open('Simulação excluída!', 'OK', { duration: 2000 });
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao excluir simulação', 'OK', { duration: 3000 })
    });
  }

  converter(id: number): void {
    if (!confirm('Converter esta simulação em compra real? A simulação será removida.')) return;

    this.simulacaoService.converterEmCompra(id).subscribe({
      next: () => {
        this.snackBar.open('Simulação convertida em compra real!', 'OK', { duration: 3000 });
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao converter simulação', 'OK', { duration: 3000 })
    });
  }

  verDetalhe(id: number): void {
    this.router.navigate(['/simulacoes', id]);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  private limparForm(): void {
    this.nome = '';
    this.dataSimulacao = '';
    this.numeroParcelas = 1;
    this.valorTotal = 0;
  }
}
