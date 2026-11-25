import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AVAILABLE_UNITS, formatBRL } from '../../../data/units';
import { closedVolume, COMMISSION_LABEL, contractCommission } from '../../commission';
import { useStore } from '../../store';
import { primaryBtn, secondaryBtn } from '../../chrome';
import { ADMIN_REP_ID } from '../../auth';

export function AdminOverview() {
  const { data, reservedUnits } = useStore();
  const reps = data.reps.filter((rep) => rep.id !== ADMIN_REP_ID);
  const signed = data.contracts.filter((item) => item.status === 'assinado');
  const due = data.contracts.filter((item) => item.commissionStatus === 'a_receber');
  const totalDue = due.reduce((acc, item) => acc + contractCommission(item), 0);
  const reserved = Object.keys(reservedUnits()).length;

  useEffect(() => {
    document.title = 'Gestão comercial — Absoluto Residence';
  }, []);

  return (
    <div>
      <p className="ov-kicker">Gestão</p>
      <h1 className="ov-serif mt-2 text-4xl">Painel comercial</h1>
      <p className="mt-3 max-w-2xl text-[color:var(--ov-muted)]">
        Corretores, propostas e comissões ({COMMISSION_LABEL}). Os dados vêm deste navegador; corretores enviam o backup de Conta para consolidar aqui.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Corretores" value={String(reps.length)} hint={`${reps.filter((r) => r.status === 'recusado').length} bloqueado(s)`} />
        <Stat label="Propostas" value={String(data.contracts.length)} hint={`${signed.length} aguardando entrada`} />
        <Stat label="VGV assinado" value={formatBRL(closedVolume(data.contracts))} hint={`${reserved} de ${AVAILABLE_UNITS.length} unidades`} />
        <Stat label="Comissões a pagar" value={formatBRL(totalDue, 2)} hint={`${due.length} item(ns)`} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="ov-card p-6">
          <h2 className="ov-serif text-2xl">Propostas assinadas</h2>
          {signed.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--ov-muted)]">Nada aguardando confirmação de entrada.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {signed.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <span className="font-semibold">{item.number}</span> · unid. {item.unitId} · {formatBRL(item.total)}
                </li>
              ))}
            </ul>
          )}
          <Link to="/membros/propostas" className={`${primaryBtn} mt-5`}>
            Abrir propostas
          </Link>
        </article>
        <article className="ov-card p-6">
          <h2 className="ov-serif text-2xl">Comissões</h2>
          <p className="mt-3 text-sm text-[color:var(--ov-muted)]">
            {due.length === 0 ? 'Nada a pagar neste lote.' : `${due.length} item(ns) · ${formatBRL(totalDue, 2)}`}
          </p>
          <p className="mt-2 text-sm text-[color:var(--ov-gold-2)]">Liberadas quando a entrada é confirmada.</p>
          <Link to="/admin/comissoes" className={`${secondaryBtn} mt-5`}>
            Abrir comissões
          </Link>
        </article>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="ov-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--ov-muted)]">{label}</p>
      <p className="ov-serif mt-2 text-3xl text-[color:var(--ov-gold-2)]">{value}</p>
      <p className="mt-1 text-xs text-[color:var(--ov-muted)]">{hint}</p>
    </article>
  );
}
