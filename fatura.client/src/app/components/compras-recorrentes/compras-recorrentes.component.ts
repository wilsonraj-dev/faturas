import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompraRecorrente, CompraRecorrenteRequest, ContaFinanceira, Categoria, Subcategoria, TipoCategoria } from '../../models/models';
import { CategoriaService, CompraRecorrenteService, ContaFinanceiraService, SubcategoriaService } from '../../services/api.service';

@Component({
  selector: 'app-compras-recorrentes',
  templateUrl: './compras-recorrentes.component.html',
  styleUrls: ['./compras-recorrentes.component.css']
})
export class ComprasRecorrentesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  comprasRecorrentes: CompraRecorrente[] = [];
  contas: ContaFinanceira[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  carregando = false;
  salvando = false;
  editandoId: number | null = null;
  displayedColumns = ['nome', 'valorMensal', 'diaCobranca', 'status', 'acoes'];
  readonly pageSizeOptions = [10, 15, 20, 25];
  pageSize = 10;
  pageIndex = 0;

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(200)]],
    valorMensal: [0, [Validators.required, Validators.min(0.01)]],
    diaCobranca: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    ativo: [true],
    contaFinanceiraId: [0, [Validators.required, Validators.min(1)]],
    categoriaId: [null as number | null],
    subcategoriaId: [null as number | null]
  });

  constructor(
    private compraRecorrenteService: CompraRecorrenteService,
    private contaFinanceiraService: ContaFinanceiraService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private snackBar: MatSnackBar
  ) { }

  get nomeControl() {
    return this.form.controls.nome;
  }

  get valorMensalControl() {
    return this.form.controls.valorMensal;
  }

  get diaCobrancaControl() {
    return this.form.controls.diaCobranca;
  }

  get contaFinanceiraControl() {
    return this.form.controls.contaFinanceiraId;
  }

  get emEdicao(): boolean {
    return this.editandoId !== null;
  }

  get comprasRecorrentesPaginadas(): CompraRecorrente[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.comprasRecorrentes.slice(inicio, inicio + this.pageSize);
  }

  ngOnInit(): void {
    this.carregarContas();
    this.carregarCategorias();
    this.carregar();

    this.form.controls.categoriaId.valueChanges.subscribe(categoriaId => {
      this.form.patchValue({ subcategoriaId: null }, { emitEvent: false });
      this.subcategorias = [];

      if (!categoriaId) {
        return;
      }

      this.subcategoriaService.listar(categoriaId).subscribe({
        next: (dados) => this.subcategorias = dados,
        error: () => { }
      });
    });
  }

  carregarContas(): void {
    this.contaFinanceiraService.listar().subscribe({
      next: (dados) => this.contas = dados,
      error: () => { }
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listar(TipoCategoria.Despesa).subscribe({
      next: (dados) => this.categorias = dados,
      error: () => { }
    });
  }

  carregar(): void {
    this.carregando = true;
    this.compraRecorrenteService.listar().subscribe({
      next: (dados) => {
        this.comprasRecorrentes = dados;
        this.pageIndex = 0;
        this.carregando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar compras recorrentes', 'OK', { duration: 3000 });
        this.carregando = false;
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const valores = this.form.getRawValue();
    const request: CompraRecorrenteRequest = {
      nome: valores.nome.trim(),
      valorMensal: valores.valorMensal,
      diaCobranca: valores.diaCobranca,
      ativo: valores.ativo,
      contaFinanceiraId: valores.contaFinanceiraId,
      categoriaId: valores.categoriaId,
      subcategoriaId: valores.subcategoriaId
    };

    const operacao = this.emEdicao
      ? this.compraRecorrenteService.atualizar(this.editandoId!, request)
      : this.compraRecorrenteService.criar(request);

    operacao.subscribe({
      next: () => {
        this.snackBar.open(this.emEdicao ? 'Compra recorrente atualizada!' : 'Compra recorrente criada!', 'OK', { duration: 2500 });
        this.cancelarEdicao();
        this.carregar();
        this.salvando = false;
      },
      error: () => {
        this.snackBar.open('Erro ao salvar compra recorrente', 'OK', { duration: 3000 });
        this.salvando = false;
      }
    });
  }

  editar(compraRecorrente: CompraRecorrente): void {
    this.editandoId = compraRecorrente.id;
    this.form.patchValue({
      nome: compraRecorrente.nome,
      valorMensal: compraRecorrente.valorMensal,
      diaCobranca: compraRecorrente.diaCobranca,
        ativo: compraRecorrente.ativo,
        contaFinanceiraId: compraRecorrente.contaFinanceiraId ?? 0,
        categoriaId: compraRecorrente.categoriaId ?? null,
        subcategoriaId: compraRecorrente.subcategoriaId ?? null
    });

    if (compraRecorrente.categoriaId) {
      this.subcategoriaService.listar(compraRecorrente.categoriaId).subscribe({
        next: (dados) => this.subcategorias = dados,
        error: () => { }
      });
    }
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.form.reset({
      nome: '',
      valorMensal: 0,
      diaCobranca: 1,
        ativo: true,
        contaFinanceiraId: 0,
        categoriaId: null,
        subcategoriaId: null
    });
    this.subcategorias = [];
  }

  desativar(compraRecorrente: CompraRecorrente): void {
    if (!confirm(`Deseja desativar a compra recorrente "${compraRecorrente.nome}"?`)) {
      return;
    }

    this.compraRecorrenteService.desativar(compraRecorrente.id).subscribe({
      next: () => {
        this.snackBar.open('Compra recorrente desativada!', 'OK', { duration: 2500 });
        this.carregar();
        if (this.editandoId === compraRecorrente.id) {
          this.cancelarEdicao();
        }
      },
      error: () => this.snackBar.open('Erro ao desativar compra recorrente', 'OK', { duration: 3000 })
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
