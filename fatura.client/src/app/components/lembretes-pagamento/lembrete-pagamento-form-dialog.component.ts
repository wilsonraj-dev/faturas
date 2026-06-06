import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LembretePagamento, LembretePagamentoRequest } from '../../models/models';
import { LembretePagamentoService } from '../../services/api.service';

@Component({
  selector: 'app-lembrete-pagamento-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar' : 'Novo' }} lembrete de pagamento</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Nome da Conta</mat-label>
          <input matInput formControlName="nomeConta" placeholder="Ex: Seguro do Carro">
          <mat-error *ngIf="form.controls['nomeConta'].hasError('required')">Informe o nome da conta.</mat-error>
          <mat-error *ngIf="form.controls['nomeConta'].hasError('maxlength')">Máximo de 200 caracteres.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valor</mat-label>
          <input matInput type="number" formControlName="valorConta" min="0.01" step="0.01">
          <span matTextPrefix>R$&nbsp;</span>
          <mat-error *ngIf="form.controls['valorConta'].hasError('required')">Informe o valor.</mat-error>
          <mat-error *ngIf="form.controls['valorConta'].hasError('min')">O valor deve ser maior que zero.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Dia do Vencimento</mat-label>
          <input matInput type="number" formControlName="diaVencimento" min="1" max="31" step="1">
          <mat-error *ngIf="form.controls['diaVencimento'].hasError('required')">Informe o dia do vencimento.</mat-error>
          <mat-error *ngIf="form.controls['diaVencimento'].hasError('min') || form.controls['diaVencimento'].hasError('max')">
            Informe um dia entre 1 e 31.
          </mat-error>
        </mat-form-field>

        <mat-slide-toggle formControlName="ativo">Ativo</mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" type="button" (click)="salvar()" [disabled]="salvando || form.invalid">
        {{ salvando ? 'Salvando...' : (editando ? 'Salvar' : 'Criar') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: ['.form-column { display: flex; flex-direction: column; gap: 8px; min-width: 0; padding-top: 4px; }']
})

export class LembretePagamentoFormDialogComponent implements OnInit {
  private readonly data = inject<LembretePagamento | null>(MAT_DIALOG_DATA);
  editando = false;
  salvando = false;
  readonly form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<LembretePagamentoFormDialogComponent>,
    private lembretePagamentoService: LembretePagamentoService,
    private snackBar: MatSnackBar
  ) {
    const fb = new FormBuilder();
    this.form = fb.nonNullable.group({
      nomeConta: ['', [Validators.required, Validators.maxLength(200)]],
      valorConta: [0, [Validators.required, Validators.min(0.01)]],
      diaVencimento: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      ativo: [true]
    });
  }

  ngOnInit(): void {
    this.editando = !!this.data;

    if (!this.data) {
      return;
    }

    this.form.patchValue({
      nomeConta: this.data.nomeConta,
      valorConta: this.data.valorConta,
      diaVencimento: this.data.diaVencimento,
      ativo: this.data.ativo
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const valores = this.form.getRawValue();
    const request: LembretePagamentoRequest = {
      nomeConta: valores.nomeConta.trim(),
      valorConta: valores.valorConta,
      diaVencimento: valores.diaVencimento,
      ativo: valores.ativo
    };

    const operacao = this.editando
      ? this.lembretePagamentoService.atualizar(this.data!.id, request)
      : this.lembretePagamentoService.criar(request);

    operacao.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Lembrete atualizado com sucesso' : 'Lembrete criado com sucesso', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Erro ao salvar lembrete', 'OK', { duration: 3000 });
        this.salvando = false;
      }
    });
  }
}
