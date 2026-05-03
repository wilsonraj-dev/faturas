import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { InstituicaoFinanceiraService } from '../../../services/api.service';
import { InstituicaoFinanceira } from '../../../models/models';
import { InstituicaoFormDialogComponent } from '../dialogs/instituicao-form-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-instituicoes',
  templateUrl: './instituicoes.component.html',
  styleUrls: ['./instituicoes.component.css']
})
export class InstituicoesComponent implements OnInit {
  instituicoes: InstituicaoFinanceira[] = [];
  carregando = false;
  displayedColumns = ['id', 'nome', 'quantidadeContas', 'acoes'];
  readonly pageSizeOptions = [10, 15, 20];
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private instituicaoService: InstituicaoFinanceiraService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.carregar();
  }

  get instituicoesPaginadas(): InstituicaoFinanceira[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.instituicoes.slice(inicio, inicio + this.pageSize);
  }

  carregar(): void {
    this.carregando = true;
    this.instituicaoService.listar().subscribe({
      next: (dados) => {
        this.instituicoes = dados;
        this.pageIndex = 0;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar instituições', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  abrirDialog(instituicao?: InstituicaoFinanceira): void {
    const ref = this.dialog.open(InstituicaoFormDialogComponent, {
      width: '400px',
      data: instituicao || null
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.carregar();
    });
  }

  deletar(inst: InstituicaoFinanceira): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { titulo: 'Excluir Instituição', mensagem: `Deseja excluir "${inst.nome}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.instituicaoService.deletar(inst.id).subscribe({
          next: () => {
            this.snackBar.open('Instituição excluída', 'OK', { duration: 3000 });
            this.carregar();
          },
          error: () => this.snackBar.open('Erro ao excluir instituição', 'OK', { duration: 3000 })
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }
}
