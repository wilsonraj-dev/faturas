import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompraRecorrente, CompraRecorrenteRequest } from '../../models/models';
import { CompraRecorrenteService } from '../../services/api.service';

@Component({
  selector: 'app-compras-recorrentes',
  templateUrl: './compras-recorrentes.component.html',
  styleUrls: ['./compras-recorrentes.component.css']
})
export class ComprasRecorrentesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  comprasRecorrentes: CompraRecorrente[] = [];
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
    ativo: [true]
  });

  constructor(
    private compraRecorrenteService: CompraRecorrenteService,
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

  get emEdicao(): boolean {
    return this.editandoId !== null;
  }

  get comprasRecorrentesPaginadas(): CompraRecorrente[] {
    const inicio = this.pageIndex * this.pageSize;
    return this.comprasRecorrentes.slice(inicio, inicio + this.pageSize);
  }

  ngOnInit(): void {
    this.carregar();
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
      ativo: valores.ativo
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
      ativo: compraRecorrente.ativo
    });
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.form.reset({
      nome: '',
      valorMensal: 0,
      diaCobranca: 1,
      ativo: true
    });
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
