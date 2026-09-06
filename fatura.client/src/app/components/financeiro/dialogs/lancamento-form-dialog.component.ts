import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  LancamentoFinanceiroService,
  ContaFinanceiraService,
  CategoriaService,
  SubcategoriaService
} from '../../../services/api.service';
import {
  LancamentoFinanceiro,
  ContaFinanceira,
  Categoria,
  Subcategoria,
  TipoCategoria,
  OrigemLancamento
} from '../../../models/models';

@Component({
  selector: 'app-lancamento-form-dialog',
  template: `
    <header class="dialog-header">
      <div>
        <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Novo' }} Lançamento</h2>
        <p>Preencha os dados da sua receita ou despesa.</p>
      </div>
      <button mat-icon-button type="button" aria-label="Fechar modal" (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>
    </header>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" id="lancamento-form" (ngSubmit)="salvar()">
        <section class="form-section" aria-labelledby="dados-lancamento">
          <h3 id="dados-lancamento">Dados do lançamento</h3>
          <div class="form-grid main-fields">
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="tipo">
                <mat-option [value]="tipoCategoria.Receita">Receita</mat-option>
                <mat-option [value]="tipoCategoria.Despesa">Despesa</mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('tipo')?.hasError('required')">Tipo é obrigatório</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valor</mat-label>
              <input matInput type="number" formControlName="valor" placeholder="0.00" min="0.01" step="0.01">
              <span matTextPrefix>R$&nbsp;</span>
              <mat-error *ngIf="form.get('valor')?.hasError('required')">Valor é obrigatório</mat-error>
              <mat-error *ngIf="form.get('valor')?.hasError('min')">Valor deve ser maior que zero</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="data">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('data')?.hasError('required')">Data é obrigatória</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descrição</mat-label>
              <input matInput formControlName="descricao" placeholder="Ex: Pagamento de conta...">
            </mat-form-field>

          </div>
        </section>
        <section class="form-section" aria-labelledby="classificacao-lancamento">
          <h3 id="classificacao-lancamento">Conta e classificação</h3>
          <div class="form-grid classification-fields">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Conta Financeira</mat-label>
              <mat-select formControlName="contaFinanceiraId">
                <mat-option *ngFor="let conta of contas" [value]="conta.id">{{ conta.nome }}</mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('contaFinanceiraId')?.hasError('required')">Conta é obrigatória</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoria</mat-label>
              <mat-select formControlName="categoriaId" (selectionChange)="onCategoriaChange()">
                <mat-option [value]="null">Nenhuma</mat-option>
                <mat-option *ngFor="let cat of categorias" [value]="cat.id">{{ cat.nome }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Subcategoria</mat-label>
              <mat-select formControlName="subcategoriaId" [disabled]="subcategorias.length === 0">
                <mat-option [value]="null">Nenhuma</mat-option>
                <mat-option *ngFor="let sub of subcategorias" [value]="sub.id">{{ sub.nome }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </section>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-actions" align="end">
      <span class="required-note">* Campos obrigatórios</span>
      <button mat-button class="cancel-button" type="button" (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" type="submit" form="lancamento-form" [disabled]="form.invalid || salvando">
        <mat-spinner *ngIf="salvando" diameter="20" class="btn-spinner"></mat-spinner>
        {{ salvando ? 'Salvando...' : (editando ? 'Salvar alterações' : 'Criar lançamento') }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./lancamento-form-dialog.component.css']
})
export class LancamentoFormDialogComponent implements OnInit {
  form!: FormGroup;
  editando = false;
  salvando = false;
  contas: ContaFinanceira[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  tipoCategoria = TipoCategoria;

  constructor(
    public dialogRef: MatDialogRef<LancamentoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LancamentoFinanceiro | null,
    private fb: FormBuilder,
    private lancamentoService: LancamentoFinanceiroService,
    private contaService: ContaFinanceiraService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.editando = !!this.data;
    this.form = this.fb.group({
      tipo: [this.data?.tipo || '', Validators.required],
      valor: [this.data?.valor || '', [Validators.required, Validators.min(0.01)]],
      data: [this.data ? new Date(this.data.data) : new Date(), Validators.required],
      descricao: [this.data?.descricao || ''],
      contaFinanceiraId: [this.data?.contaFinanceiraId || '', Validators.required],
      categoriaId: [this.data?.categoriaId || null],
      subcategoriaId: [this.data?.subcategoriaId || null]
    });

    this.contaService.listar().subscribe(data => this.contas = data);
    this.categoriaService.listar().subscribe(data => this.categorias = data);

    if (this.data?.categoriaId) {
      this.carregarSubcategorias(this.data.categoriaId);
    }
  }

  onCategoriaChange(): void {
    const catId = this.form.get('categoriaId')?.value;
    this.form.patchValue({ subcategoriaId: null });
    this.subcategorias = [];
    if (catId) {
      this.carregarSubcategorias(catId);
    }
  }

  private carregarSubcategorias(categoriaId: number): void {
    this.subcategoriaService.listar(categoriaId).subscribe(data => this.subcategorias = data);
  }

  salvar(): void {
    if (this.form.invalid || this.salvando) return;
    this.salvando = true;

    const formValue = this.form.value;
    const dataFormatada = formValue.data instanceof Date
      ? formValue.data.toISOString()
      : formValue.data;

    if (this.editando) {
      const req = { ...formValue, data: dataFormatada };
      this.lancamentoService.atualizar(this.data!.id, req).subscribe({
        next: () => {
          this.snackBar.open('Lançamento atualizado', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Erro ao atualizar lançamento', 'OK', { duration: 3000 });
          this.salvando = false;
        }
      });
    } else {
      const req = {
        ...formValue,
        data: dataFormatada,
        origem: OrigemLancamento.Manual
      };
      this.lancamentoService.criar(req).subscribe({
        next: () => {
          this.snackBar.open('Lançamento criado', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Erro ao criar lançamento', 'OK', { duration: 3000 });
          this.salvando = false;
        }
      });
    }
  }
}
