import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CompraService, FornecedorService, ContaFinanceiraService, CategoriaService, SubcategoriaService } from '../../services/api.service';
import { CriarCompraRequest, SimulacaoFaturaItem, Fornecedor, ContaFinanceira, Categoria, Subcategoria, TipoCategoria, CompraResponse } from '../../models/models';
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
  contaFinanceiraId: number | null = null;
  categoriaId: number | null = null;
  subcategoriaId: number | null = null;
  salvando = false;
  carregandoCompra = false;
  compraId: number | null = null;
  simulacao: SimulacaoFaturaItem[] = [];
  tentouSubmeter = false;

  fornecedores: Fornecedor[] = [];
  contas: ContaFinanceira[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  novoFornecedorNome = '';
  criandoFornecedor = false;
  readonly ultimaContaKey = 'compra_ultima_conta_financeira';

  opcoesParcelamento = Array.from({ length: 24 }, (_, i) => i + 1);

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private compraService: CompraService,
    private fornecedorService: FornecedorService,
    private contaFinanceiraService: ContaFinanceiraService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregarFornecedores();
    this.carregarContas();
    this.carregarCategorias();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.compraId = id;
      this.carregandoCompra = true;
      this.compraService.obterCompra(id).subscribe({
        next: compra => {
          this.preencherFormulario(compra);
          this.carregandoCompra = false;
        },
        error: () => {
          this.snackBar.open('Não foi possível carregar a compra.', 'OK', { duration: 3000 });
          this.voltarParaFaturas();
        }
      });
    }
  }

  carregarFornecedores(): void {
    this.fornecedorService.listar().subscribe({
      next: (dados) => this.fornecedores = dados,
      error: () => { }
    });
  }

  carregarContas(): void {
    this.contaFinanceiraService.listar().subscribe({
      next: (dados) => {
        this.contas = dados;
        const ultimaConta = Number(localStorage.getItem(this.ultimaContaKey));
        if (!this.compraId && !this.contaFinanceiraId && ultimaConta && this.contas.some(conta => conta.id === ultimaConta)) {
          this.contaFinanceiraId = ultimaConta;
        }
      },
      error: () => { }
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listar(TipoCategoria.Despesa).subscribe({
      next: (dados) => this.categorias = dados,
      error: () => { }
    });
  }

  onCategoriaChange(): void {
    this.subcategoriaId = null;
    this.subcategorias = [];

    if (!this.categoriaId) {
      return;
    }

    this.subcategoriaService.listar(this.categoriaId).subscribe({
      next: (dados) => this.subcategorias = dados,
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
      && this.valorTotal > 0
      && !!this.contaFinanceiraId;
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

    const operacao = this.compraId
      ? this.compraService.atualizarCompra(this.compraId, request)
      : this.compraService.criarCompra(request);
    operacao.subscribe({
      next: () => {
        localStorage.setItem(this.ultimaContaKey, String(this.contaFinanceiraId));
        this.snackBar.open(this.compraId ? 'Compra atualizada com sucesso!' : 'Compra cadastrada com sucesso!', 'OK', { duration: 3000 });
        this.voltarParaFaturas();
      },
      error: (erro: HttpErrorResponse) => {
        this.snackBar.open(typeof erro.error === 'string' ? erro.error : 'Erro ao salvar compra', 'OK', { duration: 5000 });
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
      fornecedorId: this.fornecedorId,
      contaFinanceiraId: this.contaFinanceiraId!,
      categoriaId: this.categoriaId,
      subcategoriaId: this.subcategoriaId
    };
  }

  private preencherFormulario(compra: CompraResponse): void {
    this.nome = compra.nome;
    this.dataCompra = compra.dataCompra.slice(0, 10);
    this.numeroParcelas = compra.numeroParcelas;
    this.valorTotal = compra.valorTotal;
    this.fornecedorId = compra.fornecedorId ?? null;
    this.contaFinanceiraId = compra.contaFinanceiraId ?? null;
    this.categoriaId = compra.categoriaId ?? null;
    this.subcategoriaId = compra.subcategoriaId ?? null;
    if (this.categoriaId) {
      this.subcategoriaService.listar(this.categoriaId).subscribe({
        next: dados => this.subcategorias = dados,
        error: () => this.snackBar.open('Erro ao carregar subcategorias', 'OK', { duration: 3000 })
      });
    }
  }

  voltarParaFaturas(): void {
    const ano = this.route.snapshot.queryParamMap.get('ano');
    const mes = this.route.snapshot.queryParamMap.get('mes');
    this.router.navigate(['/faturas'], { queryParams: ano && mes ? { ano, mes } : {} });
  }
}
