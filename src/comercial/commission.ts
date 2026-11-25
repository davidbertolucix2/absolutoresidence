import { COMMISSION_RATE, formatBRL, getUnit, KIND_SHORT } from '../data/units';
import type { Client, CommissionStatus, ContractRecord } from './types';

export function contractCommission(contract: ContractRecord): number {
  return Math.round(contract.total * COMMISSION_RATE * 100) / 100;
}

export const COMMISSION_LABEL = `${Math.round(COMMISSION_RATE * 100)}% do valor de venda`;

export type LedgerRow = {
  contract: ContractRecord;
  clientName: string;
  unitLabel: string;
  amount: number;
  status: CommissionStatus;
};

export function ledgerOf(contracts: ContractRecord[], clients: Client[]): LedgerRow[] {
  return contracts
    .map((contract) => {
      const client = clients.find((item) => item.id === contract.clientId);
      const unit = getUnit(contract.unitId);
      return {
        contract,
        clientName: client?.name ?? 'Cliente',
        unitLabel: unit ? `${unit.id} · ${KIND_SHORT[unit.kind]}` : contract.unitId,
        amount: contractCommission(contract),
        status: contract.commissionStatus,
      };
    })
    .sort((a, b) => b.contract.createdAt.localeCompare(a.contract.createdAt));
}

export function sumByStatus(rows: LedgerRow[], status: CommissionStatus): number {
  return rows.filter((row) => row.status === status).reduce((acc, row) => acc + row.amount, 0);
}

export function closedVolume(contracts: ContractRecord[]): number {
  return contracts.filter((c) => c.status === 'assinado' || c.status === 'pago').reduce((acc, c) => acc + c.total, 0);
}

export function receiptLine(row: LedgerRow): string {
  return `${row.contract.number} · ${row.clientName} · ${row.unitLabel} · ${formatBRL(row.amount, 2)}`;
}
