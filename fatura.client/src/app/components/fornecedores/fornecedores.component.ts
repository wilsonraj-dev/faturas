import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FornecedorService } from '../../services/api.service';
import { Fornecedor } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fornecedores',
  templateUrl: './fornecedores.component.html',
  styleUrls: ['./fornecedores.component.css']
})
export class FornecedoresComponent implements OnInit {
  fornecedores: Fornecedor[] = [];
  carregando = false;
  novoNome = '';
  editandoId: number | null = null;
  editandoNome = '';

  displayedColumns = ['id', 'nome', 'acoes'];
  readonly pageSizeOptions = [10, 15, 20, 25];
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private fornecedorService: FornecedorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregar();
  }

  get fornecedoresPaginados(): Fornecedor[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.fornecedores.slice(inicio, inicio + this.pageSize);
  }

  carregar(): void {
    this.carregando = true;
    this.fornecedorService.listar().subscribe({
      next: (dados) => {
        this.fornecedores = dados;
        this.pageIndex = 0;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar fornecedores', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  criar(): void {
    if (!this.novoNome.trim()) return;

    this.fornecedorService.criar({ nome: this.novoNome.trim() }).subscribe({
      next: () => {
        this.snackBar.open('Fornecedor criado!', 'OK', { duration: 2000 });
        this.novoNome = '';
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao criar fornecedor', 'OK', { duration: 3000 })
    });
  }

  iniciarEdicao(fornecedor: Fornecedor): void {
    this.editandoId = fornecedor.id;
    this.editandoNome = fornecedor.nome;
  }

  salvarEdicao(id: number): void {
    if (!this.editandoNome.trim()) return;

    this.fornecedorService.atualizar(id, { nome: this.editandoNome.trim() }).subscribe({
      next: () => {
        this.snackBar.open('Fornecedor atualizado!', 'OK', { duration: 2000 });
        this.editandoId = null;
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao atualizar fornecedor', 'OK', { duration: 3000 })
    });
  }

  cancelarEdicao(): void {
    this.editandoId = null;
  }

  deletar(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    this.fornecedorService.deletar(id).subscribe({
      next: () => {
        this.snackBar.open('Fornecedor excluído!', 'OK', { duration: 2000 });
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao excluir fornecedor', 'OK', { duration: 3000 })
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
