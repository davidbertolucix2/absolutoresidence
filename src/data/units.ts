// Fonte: "11.2026 TABELA DE VENDAS - ABSOLUTO.pdf" (YES Construtora, atualizada em 04/11/2026).
// Unidades fora da tabela = vendidas.

export type UnitKind = 'studio' | 'apto' | 'loft';
export type UnitStatus = 'disponivel' | 'vendido';

export type Unit = {
  id: string; // "601"
  floor: number; // 6
  position: number; // 1..6
  kind: UnitKind;
  area: number; // m² privativos (tabela)
  bedrooms: number;
  box: string; // vaga de garagem
  price: number | null; // null = vendida
  status: UnitStatus;
};

export const TABLE_DATE = '04/11/2026';
export const TABLE_LABEL = 'Tabela de vendas 11/2026';
export const MOTO_BOX_PRICE = 37000;
export const MAX_INSTALLMENTS = 72;
export const COMMISSION_RATE = 0.08;

export const ADDRESS = 'Av. Francisco Severiano dos Santos, 717 — Porto Belo/SC';
export const MATRICULAS = 'Matrículas 13.904 e 13.892 do Registro de Imóveis de Porto Belo/SC';
export const WORK_START = 'novembro de 2026 (previsto — projetos em aprovação)';
export const DELIVERY = 'dezembro de 2029';
export const BUILDER = 'YES Construtora';

type Row = [id: string, area: number, kind: UnitKind, bedrooms: number, box: string, price: number];

const AVAILABLE: Row[] = [
  ['601', 52, 'apto', 2, '07-G1', 674000],
  ['602', 31.5, 'studio', 1, '06-G1', 474000],
  ['604', 31.5, 'studio', 1, '11-G1', 474000],
  ['606', 52, 'apto', 2, '09-G1', 674000],
  ['702', 31.5, 'studio', 1, '02-G1', 474000],
  ['703', 31.5, 'studio', 1, '13-G1', 474000],
  ['704', 31.5, 'studio', 1, '04-G1', 474000],
  ['705', 31.5, 'studio', 1, '03-G1', 474000],
  ['803', 31.5, 'studio', 1, '17-G1', 474000],
  ['804', 31.5, 'studio', 1, '16-G1', 474000],
  ['805', 31.5, 'studio', 1, '14-G1', 474000],
  ['806', 52, 'apto', 2, '01-G1', 674000],
  ['906', 52, 'apto', 2, '21-G2', 674000],
  ['1002', 31.5, 'studio', 1, '39-G2', 485000],
  ['1003', 31.5, 'studio', 1, '33-G2', 485000],
  ['1004', 31.5, 'studio', 1, '35-G2', 485000],
  ['1005', 31.5, 'studio', 1, '32-G2', 485000],
  ['1101', 70, 'loft', 2, '04 duplo', 1145000],
  ['1103', 50, 'loft', 1, '02 duplo', 905000],
  ['1104', 50, 'loft', 1, '03 duplo', 905000],
  ['1105', 50, 'loft', 1, '62 e 64', 905000],
  ['1106', 70, 'loft', 2, '05 duplo', 1145000],
  ['1205', 31.5, 'studio', 1, '26-G2', 485000],
  ['1206', 52, 'apto', 2, '52-G3', 695000],
  ['1303', 31.5, 'studio', 1, '25-G2', 505000],
  ['1304', 31.5, 'studio', 1, '34-G2', 505000],
  ['1305', 31.5, 'studio', 1, '36-G2', 505000],
  ['1306', 52, 'apto', 2, '37-G2', 705000],
  ['1402', 31.5, 'studio', 1, '38-G2', 505000],
  ['1403', 31.5, 'studio', 1, '45-G3', 505000],
  ['1404', 31.5, 'studio', 1, '47-G3', 505000],
  ['1405', 31.5, 'studio', 1, '44-G3', 505000],
  ['1502', 31.5, 'studio', 1, '46-G3', 505000],
  ['1503', 31.5, 'studio', 1, '51-G3', 505000],
  ['1504', 31.5, 'studio', 1, '48-G3', 505000],
  ['1505', 31.5, 'studio', 1, '49-G3', 505000],
];

export const FLOORS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;
export const LOFT_FLOOR = 11;

function baseOf(floor: number, position: number): Pick<Unit, 'kind' | 'area' | 'bedrooms'> {
  if (floor === LOFT_FLOOR) {
    const big = position === 1 || position === 6;
    return { kind: 'loft', area: big ? 70 : 50, bedrooms: big ? 2 : 1 };
  }
  const big = position === 1 || position === 6;
  return big ? { kind: 'apto', area: 52, bedrooms: 2 } : { kind: 'studio', area: 31.5, bedrooms: 1 };
}

export const UNITS: Unit[] = FLOORS.flatMap((floor) =>
  [1, 2, 3, 4, 5, 6].map((position) => {
    const id = `${floor}${String(position).padStart(2, '0')}`;
    const row = AVAILABLE.find((item) => item[0] === id);
    if (row) {
      const [, area, kind, bedrooms, box, price] = row;
      return { id, floor, position, kind, area, bedrooms, box, price, status: 'disponivel' as const };
    }
    return { id, floor, position, ...baseOf(floor, position), box: '—', price: null, status: 'vendido' as const };
  }),
);

export const AVAILABLE_UNITS = UNITS.filter((unit) => unit.status === 'disponivel');

export function getUnit(id: string | null | undefined): Unit | undefined {
  if (!id) return undefined;
  return UNITS.find((unit) => unit.id === id);
}

export function unitsOnFloor(floor: number): Unit[] {
  return UNITS.filter((unit) => unit.floor === floor);
}

export function availableOnFloor(floor: number): number {
  return unitsOnFloor(floor).filter((unit) => unit.status === 'disponivel').length;
}

export const KIND_LABEL: Record<UnitKind, string> = {
  studio: 'Studio',
  apto: 'Apartamento 2 dormitórios',
  loft: 'Loft duplex',
};

export const KIND_SHORT: Record<UnitKind, string> = {
  studio: 'Studio',
  apto: 'Apto 2D',
  loft: 'Loft',
};

export function unitPlan(unit: Pick<Unit, 'floor' | 'position'>): string {
  const pos = String(unit.position).padStart(2, '0');
  return unit.floor === LOFT_FLOOR ? `/plantas/unit-loft-${pos}.jpg` : `/plantas/unit-tipo-${pos}.jpg`;
}

export function floorPlan(floor: number): string {
  return floor === LOFT_FLOOR ? '/plantas/planta-lofts.jpg' : '/plantas/planta-pavimento-tipo.jpg';
}

// Posição de cada unidade na planta do pavimento (planta deitada, esquerda → direita: 06, 05, 04, circulação, 03, 02, 01).
// Valores em % da largura da imagem.
export const PLAN_SLOTS: Record<number, { left: number; width: number }> = {
  6: { left: 0, width: 16.1 },
  5: { left: 15.8, width: 13.2 },
  4: { left: 28.6, width: 13.2 },
  3: { left: 54.9, width: 14.6 },
  2: { left: 69.2, width: 14.7 },
  1: { left: 83.6, width: 16.4 },
};

export function floorLabel(floor: number): string {
  return floor === LOFT_FLOOR ? `${floor}º pavimento · Lofts` : `${floor}º pavimento`;
}

export function minPrice(kind: UnitKind): number {
  return Math.min(...AVAILABLE_UNITS.filter((u) => u.kind === kind).map((u) => u.price ?? Infinity));
}

export function formatBRL(value: number, fractions = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: fractions,
    maximumFractionDigits: fractions,
  }).format(value);
}

export function formatArea(value: number): string {
  return `${value.toLocaleString('pt-BR')} m²`;
}
