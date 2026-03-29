export interface CriarCompraRequest {
  nome: string;
  dataCompra: string;
  numeroParcelas: number;
  valorTotal: number;
}

export interface CompraResponse {
  id: number;
  nome: string;
  dataCompra: string;
  numeroParcelas: number;
  valorTotal: number;
  parcelas: ParcelaResponse[];
}

export interface ParcelaResponse {
  id: number;
  nomeCompra: string;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string;
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
