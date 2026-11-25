import { MAX_INSTALLMENTS, MOTO_BOX_PRICE, formatBRL } from './units';

// Tabela 11/2026: "Entrada + saldo em até 72x direto com a construtora", valores corrigidos pelo CUB/SC.
// Os percentuais abaixo são pontos de partida editáveis; a construtora valida cada proposta.

export type FlowKind = 'avista' | 'mensal' | 'reforcos' | 'personalizado';

export type FlowInput = {
  kind: FlowKind;
  discountPct: number; // desconto negociado sobre o preço de tabela
  entryPct: number; // % do valor na entrada
  entrySplits: number; // entrada dividida em N vezes (1 = ato)
  months: number; // parcelas mensais do saldo (≤ 72)
  balloons: number; // reforços anuais (balões)
  balloonsPct: number; // % do valor somando todos os reforços
  keysPct: number; // % pago na entrega das chaves
  motoBox: boolean;
};

export const FLOW_PRESETS: Record<FlowKind, { label: string; hint: string; input: Omit<FlowInput, 'motoBox'> }> = {
  avista: {
    label: 'À vista',
    hint: 'Pagamento integral na assinatura. Desconto sob aprovação da construtora.',
    input: { kind: 'avista', discountPct: 0, entryPct: 100, entrySplits: 1, months: 0, balloons: 0, balloonsPct: 0, keysPct: 0 },
  },
  mensal: {
    label: 'Entrada + 72x',
    hint: 'Entrada e saldo em até 72 parcelas mensais direto com a construtora, corrigidas pelo CUB/SC.',
    input: { kind: 'mensal', discountPct: 0, entryPct: 20, entrySplits: 1, months: 72, balloons: 0, balloonsPct: 0, keysPct: 0 },
  },
  reforcos: {
    label: 'Entrada + mensais + reforços',
    hint: 'Parte do saldo em reforços anuais para baixar a parcela mensal.',
    input: { kind: 'reforcos', discountPct: 0, entryPct: 20, entrySplits: 1, months: 60, balloons: 5, balloonsPct: 20, keysPct: 0 },
  },
  personalizado: {
    label: 'Personalizado',
    hint: 'Monte o fluxo com o cliente. Entrada, parcelas, reforços e chaves livres (até 72 meses).',
    input: { kind: 'personalizado', discountPct: 0, entryPct: 10, entrySplits: 3, months: 48, balloons: 4, balloonsPct: 20, keysPct: 10 },
  },
};

export function presetFlow(kind: FlowKind, motoBox = false): FlowInput {
  return { ...FLOW_PRESETS[kind].input, motoBox };
}

export type FlowLine = { label: string; count: number; each: number; total: number; when: string };

export type FlowResult = {
  tablePrice: number;
  motoBox: number;
  gross: number;
  discount: number;
  total: number;
  lines: FlowLine[];
  sumCheck: number;
  warnings: string[];
};

const round = (value: number) => Math.round(value * 100) / 100;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

export function normalizeFlow(input: FlowInput): FlowInput {
  if (input.kind === 'avista') {
    return { ...input, entryPct: 100, entrySplits: 1, months: 0, balloons: 0, balloonsPct: 0, keysPct: 0 };
  }
  return {
    ...input,
    discountPct: clamp(input.discountPct, 0, 30),
    entryPct: clamp(input.entryPct, 0, 100),
    entrySplits: Math.round(clamp(input.entrySplits, 1, 12)),
    months: Math.round(clamp(input.months, 0, MAX_INSTALLMENTS)),
    balloons: Math.round(clamp(input.balloons, 0, 6)),
    balloonsPct: clamp(input.balloonsPct, 0, 100),
    keysPct: clamp(input.keysPct, 0, 100),
  };
}

export function computeFlow(unitPrice: number, raw: FlowInput): FlowResult {
  const input = normalizeFlow(raw);
  const motoBox = input.motoBox ? MOTO_BOX_PRICE : 0;
  const gross = unitPrice + motoBox;
  const discount = round(gross * (clamp(input.discountPct, 0, 30) / 100));
  const total = round(gross - discount);
  const warnings: string[] = [];
  const lines: FlowLine[] = [];

  if (input.kind === 'avista') {
    lines.push({ label: 'Pagamento à vista', count: 1, each: total, total, when: 'na assinatura' });
    return { tablePrice: unitPrice, motoBox, gross, discount, total, lines, sumCheck: total, warnings };
  }

  const entry = round(total * (input.entryPct / 100));
  const balloonsTotal = input.balloons > 0 ? round(total * (input.balloonsPct / 100)) : 0;
  const keys = round(total * (input.keysPct / 100));
  const monthlyTotal = round(total - entry - balloonsTotal - keys);

  if (entry > 0) {
    const each = round(entry / input.entrySplits);
    lines.push({
      label: input.entrySplits > 1 ? 'Entrada parcelada' : 'Entrada',
      count: input.entrySplits,
      each,
      total: entry,
      when: input.entrySplits > 1 ? `ato + ${input.entrySplits - 1} mensal(is) consecutiva(s)` : 'na assinatura',
    });
  }
  if (monthlyTotal > 0.009) {
    if (input.months <= 0) {
      warnings.push('Há saldo sem parcelas mensais: informe o número de meses.');
    } else {
      lines.push({
        label: 'Parcelas mensais',
        count: input.months,
        each: round(monthlyTotal / input.months),
        total: monthlyTotal,
        when: input.entrySplits > 1 ? `a partir do ${input.entrySplits + 1}º mês` : '30 dias após a assinatura',
      });
    }
  }
  if (monthlyTotal < -0.009) warnings.push('Entrada + reforços + chaves passam de 100% do valor.');
  if (balloonsTotal > 0) {
    lines.push({
      label: 'Reforços anuais',
      count: input.balloons,
      each: round(balloonsTotal / input.balloons),
      total: balloonsTotal,
      when: 'a cada 12 meses',
    });
  }
  if (keys > 0) {
    lines.push({ label: 'Parcela das chaves', count: 1, each: keys, total: keys, when: 'na entrega das chaves' });
  }
  const lastMonth = Math.max(input.months + input.entrySplits - 1, input.balloons * 12);
  if (lastMonth > MAX_INSTALLMENTS) warnings.push(`O fluxo passa de ${MAX_INSTALLMENTS} meses.`);

  const sumCheck = round(lines.reduce((acc, line) => acc + line.total, 0));
  return { tablePrice: unitPrice, motoBox, gross, discount, total, lines, sumCheck, warnings };
}

export function flowSummary(result: FlowResult): string {
  return result.lines.map((line) => `${line.count}× ${formatBRL(line.each, 2)} (${line.label.toLowerCase()})`).join(' + ');
}

export function flowTitle(input: FlowInput): string {
  return FLOW_PRESETS[input.kind].label;
}
