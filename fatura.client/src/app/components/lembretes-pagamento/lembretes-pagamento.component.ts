import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LembretePagamento } from '../../models/models';
import { LembretePagamentoService } from '../../services/api.service';
import { ConfirmDialogComponent } from '../financeiro/dialogs/confirm-dialog.component';
import { LembretePagamentoFormDialogComponent } from './lembrete-pagamento-form-dialog.component';

@Component({
  selector: 'app-lembretes-pagamento',
  templateUrl: './lembretes-pagamento.component.html',
  styleUrls: ['./lembretes-pagamento.component.css']
})
export class LembretesPagamentoComponent implements OnInit {
  lembretes: LembretePagamento[] = [];
  carregando = false;
  displayedColumns = ['conta', 'valor', 'diaVencimento', 'status', 'acoes'];
  readonly pageSizeOptions = [10, 15, 20];
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private lembretePagamentoService: LembretePagamentoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregar();
  }

  get lembretesPaginados(): LembretePagamento[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.lembretes.slice(inicio, inicio + this.pageSize);
  }

  carregar(): void {
    this.carregando = true;
    this.lembretePagamentoService.listar().subscribe({
      next: (dados) => {
        this.lembretes = dados;
        this.pageIndex = 0;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar lembretes de pagamento', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  abrirDialog(lembrete?: LembretePagamento): void {
    const ref = this.dialog.open(LembretePagamentoFormDialogComponent, {
      width: '480px',
      data: lembrete ?? null
    });

    ref.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.carregar();
      }
    });
  }

  excluir(lembrete: LembretePagamento): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        titulo: 'Excluir lembrete',
        mensagem: `Deseja excluir o lembrete da conta "${lembrete.nomeConta}"?`
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) {
        return;
      }

      this.lembretePagamentoService.excluir(lembrete.id).subscribe({
        next: () => {
          this.snackBar.open('Lembrete excluído com sucesso', 'OK', { duration: 3000 });
          this.carregar();
        },
        error: () => this.snackBar.open('Erro ao excluir lembrete', 'OK', { duration: 3000 })
      });
    });
  }

  alternarStatus(lembrete: LembretePagamento): void {
    const operacao = lembrete.ativo
      ? this.lembretePagamentoService.desativar(lembrete.id)
      : this.lembretePagamentoService.ativar(lembrete.id);

    operacao.subscribe({
      next: () => {
        this.snackBar.open(
          lembrete.ativo ? 'Lembrete desativado com sucesso' : 'Lembrete ativado com sucesso',
          'OK',
          { duration: 3000 }
        );
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao atualizar status do lembrete', 'OK', { duration: 3000 })
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }
}
