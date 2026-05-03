import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubcategoriaService, CategoriaService } from '../../../services/api.service';
import { Subcategoria, Categoria } from '../../../models/models';

@Component({
  selector: 'app-subcategoria-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nova' }} Subcategoria</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Almoço, Supermercado...">
          <mat-error *ngIf="form.get('nome')?.hasError('required')">Nome é obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Categoria</mat-label>
          <mat-select formControlName="categoriaId">
            <mat-option *ngFor="let cat of categorias" [value]="cat.id">{{ cat.nome }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('categoriaId')?.hasError('required')">Categoria é obrigatória</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="salvar()" [disabled]="form.invalid || salvando">
        <mat-spinner *ngIf="salvando" diameter="20" class="btn-spinner"></mat-spinner>
        {{ editando ? 'Salvar' : 'Criar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: ['.form-column { display: flex; flex-direction: column; gap: 4px; } .btn-spinner { display: inline-block; margin-right: 8px; }']
})
export class SubcategoriaFormDialogComponent implements OnInit {
  form!: FormGroup;
  editando = false;
  salvando = false;
  categorias: Categoria[] = [];

  constructor(
    public dialogRef: MatDialogRef<SubcategoriaFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Subcategoria | null,
    private fb: FormBuilder,
    private subcategoriaService: SubcategoriaService,
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.editando = !!this.data;
    this.form = this.fb.group({
      nome: [this.data?.nome || '', Validators.required],
      categoriaId: [this.data?.categoriaId || '', Validators.required]
    });
    this.categoriaService.listar().subscribe(data => this.categorias = data);
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    const req = this.form.value;

    const obs = this.editando
      ? this.subcategoriaService.atualizar(this.data!.id, req)
      : this.subcategoriaService.criar(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Subcategoria atualizada' : 'Subcategoria criada', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Erro ao salvar subcategoria', 'OK', { duration: 3000 });
        this.salvando = false;
      }
    });
  }
}
