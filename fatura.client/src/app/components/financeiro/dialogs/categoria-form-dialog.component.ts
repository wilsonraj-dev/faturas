import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriaService } from '../../../services/api.service';
import { Categoria, TipoCategoria } from '../../../models/models';

@Component({
  selector: 'app-categoria-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nova' }} Categoria</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Alimentação, Salário...">
          <mat-error *ngIf="form.get('nome')?.hasError('required')">Nome é obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option [value]="tipoCategoria.Receita">Receita</mat-option>
            <mat-option [value]="tipoCategoria.Despesa">Despesa</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('tipo')?.hasError('required')">Tipo é obrigatório</mat-error>
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
export class CategoriaFormDialogComponent implements OnInit {
  form!: FormGroup;
  editando = false;
  salvando = false;
  tipoCategoria = TipoCategoria;

  constructor(
    public dialogRef: MatDialogRef<CategoriaFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Categoria | null,
    private fb: FormBuilder,
    private service: CategoriaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.editando = !!this.data;
    this.form = this.fb.group({
      nome: [this.data?.nome || '', Validators.required],
      tipo: [this.data?.tipo || '', Validators.required]
    });
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    const req = this.form.value;

    const obs = this.editando
      ? this.service.atualizar(this.data!.id, req)
      : this.service.criar(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Categoria atualizada' : 'Categoria criada', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Erro ao salvar categoria', 'OK', { duration: 3000 });
        this.salvando = false;
      }
    });
  }
}
