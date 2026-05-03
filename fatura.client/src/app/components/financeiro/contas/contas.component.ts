import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ContaFinanceiraService } from '../../../services/api.service';
import { ContaFinanceira, TipoContaFinanceira } from '../../../models/models';
import { ContaFormDialogComponent } from '../dialogs/conta-form-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-contas',
  templateUrl: './contas.component.html',
  styleUrls: ['./contas.component.css']
})
export class ContasComponent implements OnInit {
  contas: ContaFinanceira[] = [];
  carregando = false;
  displayedColumns = ['id', 'nome', 'tipo', 'instituicaoNome', 'acoes'];
  readonly pageSizeOptions = [10, 15, 20];
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private contaService: ContaFinanceiraService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.carregar();
  }

  get contasPaginadas(): ContaFinanceira[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.contas.slice(inicio, inicio + this.pageSize);
  }

  carregar(): void {
    this.carregando = true;
    this.contaService.listar().subscribe({
      next: (dados) => {
        this.contas = dados;
        this.pageIndex = 0;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar contas', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  getTipoLabel(tipo: TipoContaFinanceira): string {
    const tipoNormalizado = this.normalizarTipoConta(tipo);

    switch (tipoNormalizado) {
      case TipoContaFinanceira.CartaoCredito: return 'Cartão de Crédito';
      case TipoContaFinanceira.ContaCorrente: return 'Conta Corrente';
      case TipoContaFinanceira.Carteira: return 'Carteira';
      default: return '';
    }
  }

  private normalizarTipoConta(tipo: TipoContaFinanceira | string | null | undefined): TipoContaFinanceira | null {
    if (tipo === null || tipo === undefined || tipo === '') {
      return null;
    }

    if (typeof tipo === 'number') {
      return tipo;
    }

    switch (tipo.toString().toLowerCase()) {
      case '1':
      case 'cartaocredito':
        return TipoContaFinanceira.CartaoCredito;
      case '2':
      case 'contacorrente':
        return TipoContaFinanceira.ContaCorrente;
      case '3':
      case 'carteira':
        return TipoContaFinanceira.Carteira;
      default:
        return null;
    }
  }

  abrirDialog(conta?: ContaFinanceira): void {
    const ref = this.dialog.open(ContaFormDialogComponent, {
      width: '450px',
      data: conta || null
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.carregar();
    });
  }

  deletar(conta: ContaFinanceira): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { titulo: 'Excluir Conta', mensagem: `Deseja excluir "${conta.nome}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.contaService.deletar(conta.id).subscribe({
          next: () => {
            this.snackBar.open('Conta excluída', 'OK', { duration: 3000 });
            this.carregar();
          },
          error: () => this.snackBar.open('Erro ao excluir conta', 'OK', { duration: 3000 })
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }
}
