import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContaFinanceiraService, InstituicaoFinanceiraService } from '../../../services/api.service';
import { ContaFinanceira, InstituicaoFinanceira, TipoContaFinanceira } from '../../../models/models';

@Component({
  selector: 'app-conta-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Nova' }} Conta Financeira</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Nubank Crédito">
          <mat-error *ngIf="form.get('nome')?.hasError('required')">Nome é obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option [value]="tipoContaFinanceira.CartaoCredito">Cartão de Crédito</mat-option>
            <mat-option [value]="tipoContaFinanceira.ContaCorrente">Conta Corrente</mat-option>
            <mat-option [value]="tipoContaFinanceira.Carteira">Carteira</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('tipo')?.hasError('required')">Tipo é obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Instituição</mat-label>
          <mat-select formControlName="instituicaoId">
            <mat-option *ngFor="let inst of instituicoes" [value]="inst.id">{{ inst.nome }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('instituicaoId')?.hasError('required')">Instituição é obrigatória</mat-error>
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
export class ContaFormDialogComponent implements OnInit {
  form!: FormGroup;
  editando = false;
  salvando = false;
  instituicoes: InstituicaoFinanceira[] = [];
  tipoContaFinanceira = TipoContaFinanceira;

  constructor(
    public dialogRef: MatDialogRef<ContaFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ContaFinanceira | null,
    private fb: FormBuilder,
    private contaService: ContaFinanceiraService,
    private instituicaoService: InstituicaoFinanceiraService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.editando = !!this.data;
    this.form = this.fb.group({
      nome: [this.data?.nome || '', Validators.required],
      tipo: [this.data?.tipo || '', Validators.required],
      instituicaoId: [this.data?.instituicaoId || '', Validators.required]
    });
    this.instituicaoService.listar().subscribe(data => this.instituicoes = data);
  }

  salvar(): void {
    if (this.form.invalid) return;
    this.salvando = true;
    const req = this.form.value;

    const obs = this.editando
      ? this.contaService.atualizar(this.data!.id, req)
      : this.contaService.criar(req);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Conta atualizada' : 'Conta criada', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Erro ao salvar conta', 'OK', { duration: 3000 });
        this.salvando = false;
      }
    });
  }
}
