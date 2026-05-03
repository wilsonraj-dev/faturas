import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstituicaoFinanceiraService } from '../../../services/api.service';
import { InstituicaoFinanceira } from '../../../models/models';

@Component({
  selector: 'app-instituicao-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nova' }} Instituição</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Nubank, Itaú...">
          <mat-error *ngIf="form.get('nome')?.hasError('required')">Nome é obrigatório</mat-error>
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
  styles: ['.full-width { width: 100%; } .btn-spinner { display: inline-block; margin-right: 8px; }']
})
export class InstituicaoFormDialogComponent implements OnInit {
  form!: FormGroup;
  editando = false;
  salvando = false;

  constructor(
    public dialogRef: MatDialogRef<InstituicaoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InstituicaoFinanceira | null,
    private fb: FormBuilder,
    private service: InstituicaoFinanceiraService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.editando = !!this.data;
    this.form = this.fb.group({
      nome: [this.data?.nome || '', Validators.required]
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
        this.snackBar.open(this.editando ? 'Instituição atualizada' : 'Instituição criada', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Erro ao salvar instituição', 'OK', { duration: 3000 });
        this.salvando = false;
      }
    });
  }
}
