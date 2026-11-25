import { useEffect, useMemo } from 'react';
import { formatBRL } from '../../../data/units';
import { COMMISSION_LABEL, contractCommission } from '../../commission';
import { useStore } from '../../store';
import { primaryBtn } from '../../chrome';
import { nextMonday, formatDate } from '../../format';
import type { CommissionStatus } from '../../types';

export function AdminComissoes() {
  const { data, markBatchPaid, setCommissionStatus } = useStore();
  const due = useMemo(() => data.contracts.filter((item) => item.commissionStatus === 'a_receber'), [data.contracts]);
  const totalDue = due.reduce((acc, item) => acc + contractCommission(item), 0);

  useEffect(() => {
    document.title = 'Comissões — gestão Absoluto';
  }, []);

  return (
    <div>
      <p className="ov-kicker">Pagamento</p>
      <h1 className="ov-serif mt-2 text-4xl">Comissões</h1>
      <p className="mt-3 text-[color:var(--ov-muted)]">
        {COMMISSION_LABEL}. Lote semanal — próximo em {formatDate(nextMonday())}.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--ov-muted)]">
          {due.length} comissão(ões) a pagar · {formatBRL(totalDue, 2)}
        </p>
        <button type="button" className={primaryBtn} disabled={due.length === 0} onClick={markBatchPaid}>
          Marcar lote como pago
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {data.contracts.length === 0 ? (
          <li className="text-sm text-[color:var(--ov-muted)]">Nenhuma proposta ainda.</li>
        ) : (
          data.contracts.map((item) => {
            const client = data.clients.find((c) => c.id === item.clientId);
            const rep = data.reps.find((r) => r.id === item.repId);
            return (
              <li key={item.id} className="ov-card flex flex-wrap justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">
                    {item.number} · unid. {item.unitId} · {client?.name}
                  </p>
                  <p className="text-sm text-[color:var(--ov-muted)]">
                    {rep?.fullName}
                    {rep?.bank.pixKey ? ` · Pix ${rep.bank.pixKey}` : ''} · venda {formatBRL(item.total)} · comissão{' '}
                    <strong className="text-[color:var(--ov-cream)]">{formatBRL(contractCommission(item), 2)}</strong>
                  </p>
                </div>
                <select
                  className="rounded-full border border-[color:var(--ov-line)] bg-[color:var(--ov-bg)] px-3 py-2 text-xs font-semibold"
                  value={item.commissionStatus}
                  onChange={(e) => setCommissionStatus(item.id, e.target.value as CommissionStatus)}
                >
                  <option value="pendente">Pendente</option>
                  <option value="a_receber">A receber</option>
                  <option value="recebido">Recebido</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
