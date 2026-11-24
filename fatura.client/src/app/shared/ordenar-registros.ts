import type { Sort } from '@angular/material/sort';

const comparadorTexto = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export function ordenarRegistros<T extends { id: number; nome: string; categoriaNome?: string }>(
  registros: readonly T[],
  { active, direction }: Sort
): T[] {
  const sentido = direction === 'desc' ? -1 : 1;

  return [...registros].sort((a, b) => {
    const porId = a.id - b.id;
    if (!direction || active === 'id') return porId * sentido;

    const textoA = active === 'categoriaNome' ? a.categoriaNome ?? '' : a.nome;
    const textoB = active === 'categoriaNome' ? b.categoriaNome ?? '' : b.nome;
    return comparadorTexto.compare(textoA, textoB) * sentido || porId;
  });
}
