export interface CriarCompraRequest {
  nome: string;
  dataCompra: string;
  numeroParcelas: number;
  valorTotal: number;
  fornecedorId?: number | null;
}

export interface CompraResponse {
  id: number;
  nome: string;
  dataCompra: string;
  numeroParcelas: number;
  valorTotal: number;
  fornecedorId?: number | null;
  fornecedorNome?: string | null;
  parcelas: ParcelaResponse[];
}

export interface ParcelaResponse {
  id: number;
  nomeCompra: string;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string;
  fornecedorNome?: string | null;
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
}

export interface SimulacaoDetalhe {
  id: number;
  nome?: string;
  dataSimulacao: string;
  numeroParcelas: number;
  valorTotal: number;
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
