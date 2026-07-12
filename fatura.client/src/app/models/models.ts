export interface CriarCompraRequest {
  nome: string;
  dataCompra: string;
  numeroParcelas: number;
  valorTotal: number;
  fornecedorId?: number | null;
  contaFinanceiraId: number;
  categoriaId?: number | null;
  subcategoriaId?: number | null;
}

export interface CompraResponse {
  id: number;
  nome: string;
  dataCompra: string;
  numeroParcelas: number;
  valorTotal: number;
  fornecedorId?: number | null;
  fornecedorNome?: string | null;
  contaFinanceiraId?: number | null;
  categoriaId?: number | null;
  categoriaNome?: string | null;
  subcategoriaId?: number | null;
  subcategoriaNome?: string | null;
  parcelas: ParcelaResponse[];
}

export type ParcelaTipo = 'Normal' | 'Recorrente';

export interface ParcelaResponse {
  id: number;
  compraId?: number | null;
  nomeCompra: string;
  tipo: ParcelaTipo;
  compraRecorrenteId?: number | null;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string;
  fornecedorNome?: string | null;
}

export interface CompraRecorrenteRequest {
  nome: string;
  valorMensal: number;
  diaCobranca: number;
  ativo: boolean;
  contaFinanceiraId: number;
  categoriaId?: number | null;
  subcategoriaId?: number | null;
}

export interface CompraRecorrente {
  id: number;
  nome: string;
  valorMensal: number;
  diaCobranca: number;
  ativo: boolean;
  contaFinanceiraId?: number | null;
  categoriaId?: number | null;
  categoriaNome?: string | null;
  subcategoriaId?: number | null;
  subcategoriaNome?: string | null;
}

export enum TipoLembreteEnvio {
  CincoDiasAntes = 1,
  DoisDiasAntes = 2
}

export enum CanalNotificacao {
  Email = 1,
  WhatsApp = 2,
  Push = 3
}

export interface LembretePagamentoRequest {
  nomeConta: string;
  valorConta: number;
  diaVencimento: number;
  ativo: boolean;
}

export interface LembretePagamento {
  id: number;
  nomeConta: string;
  valorConta: number;
  diaVencimento: number;
  ativo: boolean;
  dataCriacao: string;
}

export interface LembretePagamentoHistorico {
  id: number;
  lembretePagamentoId: number;
  tipoEnvio: TipoLembreteEnvio;
  canal: CanalNotificacao;
  dataReferencia: string;
  dataEnvio: string;
}

export interface FaturaResumo {
  id: number;
  mes: number;
  ano: number;
  valorTotal: number;
  quitada: boolean;
  quantidadeParcelas: number;
  orcamento: number;
}

export interface FaturaDetalhe {
  id: number;
  mes: number;
  ano: number;
  valorTotal: number;
  quitada: boolean;
  orcamento: number;
  parcelas: ParcelaResponse[];
}

export interface SimulacaoResponse {
  faturas: SimulacaoFaturaItem[];
}

export interface SimulacaoFaturaItem {
  mes: number;
  ano: number;
  valorParcela: number;
}

// Fornecedor
export interface Fornecedor {
  id: number;
  nome: string;
}

export interface CriarFornecedorRequest {
  nome: string;
}

// Simulação persistida
export interface SimulacaoResumo {
  id: number;
  nome?: string;
  dataSimulacao: string;
  numeroParcelas: number;
  valorTotal: number;
  contaFinanceiraId?: number | null;
  categoriaId?: number | null;
  categoriaNome?: string | null;
  subcategoriaId?: number | null;
  subcategoriaNome?: string | null;
}

export interface SimulacaoDetalhe {
  id: number;
  nome?: string;
  dataSimulacao: string;
  numeroParcelas: number;
  valorTotal: number;
  contaFinanceiraId?: number | null;
  categoriaId?: number | null;
  categoriaNome?: string | null;
  subcategoriaId?: number | null;
  subcategoriaNome?: string | null;
  parcelas: SimulacaoParcelaResponse[];
}

export interface SimulacaoParcelaResponse {
  id: number;
  numeroParcela: number;
  valor: number;
  dataVencimento: string;
  mes: number;
  ano: number;
}

export interface CriarSimulacaoRequest {
  nome?: string;
  dataSimulacao: string;
  numeroParcelas: number;
  valorTotal: number;
  contaFinanceiraId: number;
  categoriaId?: number | null;
  subcategoriaId?: number | null;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  nome: string;
  email: string;
}

export interface UserProfile {
  nome: string;
  email: string;
}

export interface UpdateProfileRequest {
  nome: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

// Enums Financeiros
export enum TipoCategoria {
  Receita = 1,
  Despesa = 2
}

export enum TipoContaFinanceira {
  CartaoCredito = 1,
  ContaCorrente = 2,
  Carteira = 3
}

export enum OrigemLancamento {
  Manual = 1,
  Fatura = 2,
  Recorrente = 3
}

// Instituição Financeira
export interface InstituicaoFinanceira {
  id: number;
  nome: string;
  quantidadeContas: number;
}

export interface CriarInstituicaoFinanceiraRequest {
  nome: string;
}

export interface AtualizarInstituicaoFinanceiraRequest {
  nome: string;
}

// Conta Financeira
export interface ContaFinanceira {
  id: number;
  nome: string;
  tipo: TipoContaFinanceira;
  instituicaoId: number;
  instituicaoNome: string;
}

export interface CriarContaFinanceiraRequest {
  nome: string;
  tipo: TipoContaFinanceira;
  instituicaoId: number;
}

export interface AtualizarContaFinanceiraRequest {
  nome: string;
  tipo: TipoContaFinanceira;
  instituicaoId: number;
}

// Categoria
export interface Categoria {
  id: number;
  nome: string;
  tipo: TipoCategoria;
  quantidadeSubcategorias: number;
}

export interface CriarCategoriaRequest {
  nome: string;
  tipo: TipoCategoria;
}

export interface AtualizarCategoriaRequest {
  nome: string;
  tipo: TipoCategoria;
}

// Subcategoria
export interface Subcategoria {
  id: number;
  nome: string;
  categoriaId: number;
  categoriaNome: string;
}

export interface CriarSubcategoriaRequest {
  nome: string;
  categoriaId: number;
}

export interface AtualizarSubcategoriaRequest {
  nome: string;
  categoriaId: number;
}

// Lançamento Financeiro
export interface LancamentoFinanceiro {
  id: number;
  tipo: TipoCategoria;
  valor: number;
  data: string;
  descricao?: string;
  categoriaId?: number;
  categoriaNome?: string;
  subcategoriaId?: number;
  subcategoriaNome?: string;
  contaFinanceiraId: number;
  contaFinanceiraNome: string;
  origem: OrigemLancamento;
  origemId?: number;
}

export interface CriarLancamentoFinanceiroRequest {
  tipo: TipoCategoria;
  valor: number;
  data: string;
  descricao?: string;
  categoriaId?: number;
  subcategoriaId?: number;
  contaFinanceiraId: number;
  origem: OrigemLancamento;
  origemId?: number;
}

export interface AtualizarLancamentoFinanceiroRequest {
  tipo: TipoCategoria;
  valor: number;
  data: string;
  descricao?: string;
  categoriaId?: number;
  subcategoriaId?: number;
  contaFinanceiraId: number;
}

// Dashboard Financeiro
export interface DashboardFinanceiroFiltro {
  dataInicial?: string;
  dataFinal?: string;
  contaFinanceiraId?: number;
  categoriaId?: number;
  subcategoriaId?: number;
}

export interface DashboardFinanceiroResumo {
  totalRecebido: number;
  totalGasto: number;
  saldo: number;
  percentualReceitaComprometida: number;
  ticketMedioDespesas: number;
  ticketMedioReceitas: number;
  quantidadeLancamentos: number;
  maiorDespesaValor: number;
  maiorDespesaDescricao?: string;
}

export interface DashboardFinanceiroSerieMensalItem {
  ano: number;
  mes: number;
  label: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface DashboardFinanceiroAgrupamentoItem {
  id?: number | null;
  nome: string;
  valor: number;
  percentual: number;
}

export interface DashboardFinanceiroPeriodoResumo {
  receita: number;
  despesa: number;
  saldo: number;
}

export interface DashboardFinanceiroComparativo {
  periodoA: DashboardFinanceiroPeriodoResumo;
  periodoB: DashboardFinanceiroPeriodoResumo;
  variacaoReceitaPercentual: number;
  variacaoDespesaPercentual: number;
  variacaoSaldoPercentual: number;
}

export interface DashboardFinanceiroComparativoFiltro {
  periodoAInicial: string;
  periodoAFinal: string;
  periodoBInicial: string;
  periodoBFinal: string;
  contaFinanceiraId?: number;
  categoriaId?: number;
  subcategoriaId?: number;
}

export interface DashboardFinanceiroRankings {
  maioresCategorias: DashboardFinanceiroAgrupamentoItem[];
  maioresSubcategorias: DashboardFinanceiroAgrupamentoItem[];
}
