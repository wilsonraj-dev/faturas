import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CategoriaService, SubcategoriaService } from '../../../services/api.service';
import { Categoria, Subcategoria, TipoCategoria } from '../../../models/models';
import { CategoriaFormDialogComponent } from '../dialogs/categoria-form-dialog.component';
import { SubcategoriaFormDialogComponent } from '../dialogs/subcategoria-form-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasFinanceiroComponent implements OnInit {
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  carregandoCategorias = false;
  carregandoSubcategorias = false;
  tabIndex = 0;

  categoriaCols = ['id', 'nome', 'tipo', 'quantidadeSubcategorias', 'acoes'];
  subcategoriaCols = ['id', 'nome', 'categoriaNome', 'acoes'];

  readonly pageSizeOptions = [10, 15, 20];
  catPageSize = 10;
  catPageIndex = 0;
  subPageSize = 10;
  subPageIndex = 0;

  constructor(
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarSubcategorias();
  }

  get categoriasPaginadas(): Categoria[] {
    const inicio = this.catPageIndex * this.catPageSize;
    return this.categorias.slice(inicio, inicio + this.catPageSize);
  }

  get subcategoriasPaginadas(): Subcategoria[] {
    const inicio = this.subPageIndex * this.subPageSize;
    return this.subcategorias.slice(inicio, inicio + this.subPageSize);
  }

  getTipoLabel(tipo: TipoCategoria): string {
    return this.normalizarTipoCategoria(tipo) === TipoCategoria.Receita ? 'Receita' : 'Despesa';
  }

  getTipoClass(tipo: TipoCategoria): string {
    return this.normalizarTipoCategoria(tipo) === TipoCategoria.Receita ? 'badge-receita' : 'badge-despesa';
  }

  private normalizarTipoCategoria(tipo: TipoCategoria | string | null | undefined): TipoCategoria {
    if (typeof tipo === 'number') {
      return tipo;
    }

    switch ((tipo ?? '').toString().toLowerCase()) {
      case '1':
      case 'receita':
        return TipoCategoria.Receita;
      default:
        return TipoCategoria.Despesa;
    }
  }

  carregarCategorias(): void {
    this.carregandoCategorias = true;
    this.categoriaService.listar().subscribe({
      next: (dados) => {
        this.categorias = dados;
        this.catPageIndex = 0;
        this.carregandoCategorias = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar categorias', 'OK', { duration: 3000 });
        this.carregandoCategorias = false;
      }
    });
  }

  carregarSubcategorias(): void {
    this.carregandoSubcategorias = true;
    this.subcategoriaService.listar().subscribe({
      next: (dados) => {
        this.subcategorias = dados;
        this.subPageIndex = 0;
        this.carregandoSubcategorias = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar subcategorias', 'OK', { duration: 3000 });
        this.carregandoSubcategorias = false;
      }
    });
  }

  abrirCategoriaDialog(cat?: Categoria): void {
    const ref = this.dialog.open(CategoriaFormDialogComponent, {
      width: '400px',
      data: cat || null
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.carregarCategorias();
    });
  }

  abrirSubcategoriaDialog(sub?: Subcategoria): void {
    const ref = this.dialog.open(SubcategoriaFormDialogComponent, {
      width: '400px',
      data: sub || null
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.carregarSubcategorias();
    });
  }

  deletarCategoria(cat: Categoria): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { titulo: 'Excluir Categoria', mensagem: `Deseja excluir "${cat.nome}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.categoriaService.deletar(cat.id).subscribe({
          next: () => {
            this.snackBar.open('Categoria excluída', 'OK', { duration: 3000 });
            this.carregarCategorias();
          },
          error: () => this.snackBar.open('Erro ao excluir categoria', 'OK', { duration: 3000 })
        });
      }
    });
  }

  deletarSubcategoria(sub: Subcategoria): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { titulo: 'Excluir Subcategoria', mensagem: `Deseja excluir "${sub.nome}"?` }
    });
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.subcategoriaService.deletar(sub.id).subscribe({
          next: () => {
            this.snackBar.open('Subcategoria excluída', 'OK', { duration: 3000 });
            this.carregarSubcategorias();
          },
          error: () => this.snackBar.open('Erro ao excluir subcategoria', 'OK', { duration: 3000 })
        });
      }
    });
  }

  onCatPageChange(event: PageEvent): void {
    this.catPageSize = event.pageSize;
    this.catPageIndex = event.pageIndex;
  }

  onSubPageChange(event: PageEvent): void {
    this.subPageSize = event.pageSize;
    this.subPageIndex = event.pageIndex;
  }
}
