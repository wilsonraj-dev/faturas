import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FaturaService } from '../../services/api.service';
import { FaturaDetalhe, ParcelaResponse } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fatura-detalhe',
  templateUrl: './fatura-detalhe.component.html',
  styleUrls: ['./fatura-detalhe.component.css']
})
export class FaturaDetalheComponent implements OnInit {
  fatura: FaturaDetalhe | null = null;
  carregando = false;
  displayedColumns = ['nomeCompra', 'parcela', 'valor', 'dataVencimento'];

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private faturaService: FaturaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.carregarFatura(id);
    }
  }

  carregarFatura(id: number): void {
    this.carregando = true;
    this.faturaService.obterFatura(id).subscribe({
      next: (fatura) => {
        this.fatura = fatura;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar fatura', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  getNomeMes(mes: number): string {
    return this.meses[mes - 1] || '';
  }

  quitarFatura(): void {
    if (!this.fatura) return;

    this.faturaService.quitarFatura(this.fatura.id).subscribe({
      next: () => {
        this.fatura!.quitada = true;
        this.snackBar.open('Fatura marcada como quitada!', 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erro ao quitar fatura', 'OK', { duration: 3000 })
    });
  }

  reabrirFatura(): void {
    if (!this.fatura) return;

    if (!confirm('Tem certeza que deseja reabrir esta fatura?')) return;

    this.faturaService.reabrirFatura(this.fatura.id).subscribe({
      next: () => {
        this.fatura!.quitada = false;
        this.snackBar.open('Fatura reaberta!', 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erro ao reabrir fatura', 'OK', { duration: 3000 })
    });
  }

  voltar(): void {
    this.router.navigate(['/faturas']);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
