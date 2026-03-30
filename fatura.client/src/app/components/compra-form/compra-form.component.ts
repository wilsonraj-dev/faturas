import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompraService, FornecedorService } from '../../services/api.service';
import { CriarCompraRequest, SimulacaoFaturaItem, Fornecedor } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-compra-form',
  templateUrl: './compra-form.component.html',
  styleUrls: ['./compra-form.component.css']
})
export class CompraFormComponent implements OnInit {
  nome = '';
  dataCompra = '';
  numeroParcelas = 1;
  valorTotal = 0;
  fornecedorId: number | null = null;
  salvando = false;
  simulacao: SimulacaoFaturaItem[] = [];
  tentouSubmeter = false;

  fornecedores: Fornecedor[] = [];
  novoFornecedorNome = '';
  criandoFornecedor = false;

  opcoesParcelamento = Array.from({ length: 24 }, (_, i) => i + 1);

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private compraService: CompraService,
    private fornecedorService: FornecedorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  carregarFornecedores(): void {
    this.fornecedorService.listar().subscribe({
      next: (dados) => this.fornecedores = dados,
      error: () => { }
    });
  }

  criarFornecedorRapido(): void {
    if (!this.novoFornecedorNome.trim()) return;

    this.criandoFornecedor = true;
    this.fornecedorService.criar({ nome: this.novoFornecedorNome.trim() }).subscribe({
      next: (novo) => {
        this.fornecedores.push(novo);
        this.fornecedorId = novo.id;
        this.novoFornecedorNome = '';
        this.criandoFornecedor = false;
        this.snackBar.open('Fornecedor criado!', 'OK', { duration: 2000 });
      },
      error: () => {
        this.criandoFornecedor = false;
        this.snackBar.open('Erro ao criar fornecedor', 'OK', { duration: 3000 });
      }
    });
  }

  get formularioValido(): boolean {
    return this.nome.trim().length > 0
      && !!this.dataCompra
      && this.numeroParcelas >= 1
      && this.valorTotal > 0;
  }

  get valorParcela(): number {
    if (this.numeroParcelas < 1 || this.valorTotal <= 0) return 0;
    return Math.round((this.valorTotal / this.numeroParcelas) * 100) / 100;
  }

  salvar(): void {
    this.tentouSubmeter = true;
    if (!this.formularioValido) return;

    this.salvando = true;
    const request = this.montarRequest();

    this.compraService.criarCompra(request).subscribe({
      next: () => {
        this.snackBar.open('Compra cadastrada com sucesso!', 'OK', { duration: 3000 });
        this.router.navigate(['/faturas']);
      },
      error: () => {
        this.snackBar.open('Erro ao cadastrar compra', 'OK', { duration: 3000 });
        this.salvando = false;
      }
    });
  }

  simular(): void {
    this.tentouSubmeter = true;
    if (!this.formularioValido) return;

    const request = this.montarRequest();
    this.compraService.simularCompra(request).subscribe({
      next: (res) => this.simulacao = res.faturas,
      error: () => this.snackBar.open('Erro na simulação', 'OK', { duration: 3000 })
    });
  }

  getNomeMes(mes: number): string {
    return this.meses[mes - 1] || '';
  }

  private montarRequest(): CriarCompraRequest {
    return {
      nome: this.nome.trim(),
      dataCompra: this.dataCompra,
      numeroParcelas: this.numeroParcelas,
      valorTotal: this.valorTotal,
      fornecedorId: this.fornecedorId
    };
  }
}
