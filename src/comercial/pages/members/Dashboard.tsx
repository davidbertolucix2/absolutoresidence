import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AVAILABLE_UNITS, formatBRL } from '../../../data/units';
import { formatDate, nextMonday } from '../../format';
import { closedVolume, COMMISSION_LABEL, ledgerOf, sumByStatus } from '../../commission';
import { useStore } from '../../store';
import { primaryBtn, secondaryBtn } from '../../chrome';

export function MembersDashboard() {
  const { currentRep, followupsOf, contractsOf, clientsOf, reservedUnits } = useStore();
  const rep = currentRep!;
  const followups = followupsOf(rep.id);
  const contracts = contractsOf(rep.id);
  const clients = clientsOf(rep.id);
  const rows = useMemo(() => ledgerOf(contracts, clients), [contracts, clients]);
  const reserved = reservedUnits();
  const free = AVAILABLE_UNITS.filter((unit) => !reserved[unit.id]).length;

  useEffect(() => {
    document.title = 'Início — Área do corretor';
  }, []);

  const total = rows.reduce((acc, row) => acc + row.amount, 0);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="ov-kicker">Painel</p>
          <h1 className="ov-serif mt-2 text-4xl">Olá, {rep.fullName.split(' ')[0]}.</h1>
          <p className="mt-3 max-w-xl text-[color:var(--ov-muted)]">
            Comissão: {COMMISSION_LABEL}, liberada quando a entrada é confirmada pela construtora.
          </p>
        </div>
        <Link to="/membros/propostas" className={primaryBtn}>
          Nova proposta
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clientes" value={String(clients.length)} hint="na sua carteira" />
        <Stat label="Propostas" value={String(contracts.length)} hint={`${contracts.filter((c) => c.status === 'assinado' || c.status === 'pago').length} assinada(s)`} />
        <Stat label="VGV fechado" value={formatBRL(closedVolume(contracts))} hint="propostas assinadas" />
        <Stat label="Unidades livres" value={String(free)} hint={`de ${AVAILABLE_UNITS.length} na tabela`} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <MoneyCard label="Comissão total" value={formatBRL(total, 2)} detail={COMMISSION_LABEL} />
        <MoneyCard label="A receber" value={formatBRL(sumByStatus(rows, 'a_receber'), 2)} detail={`Próximo lote: ${formatDate(nextMonday())}`} />
        <MoneyCard label="Recebido" value={formatBRL(sumByStatus(rows, 'recebido'), 2)} detail="Já creditado" />
        <MoneyCard label="Pendente" value={formatBRL(sumByStatus(rows, 'pendente'), 2)} detail="Aguardando entrada" />
      </div>

      {followups.length > 0 ? (
        <article className="ov-card mt-8 p-6">
          <h2 className="ov-serif text-2xl">Follow-up</h2>
          <ul className="mt-3 space-y-1 text-sm text-[color:var(--ov-muted)]">
            {followups.slice(0, 5).map((client) => (
              <li key={client.id}>
                {client.name} · {client.status}
              </li>
            ))}
          </ul>
          <Link to="/membros/carteira" className={`${secondaryBtn} mt-4`}>
            Abrir clientes
          </Link>
        </article>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link to="/membros/carteira" className="ov-card p-6 transition hover:border-[color:var(--ov-gold)]">
          <h2 className="ov-serif text-2xl">Cadastrar cliente</h2>
          <p className="mt-2 text-sm text-[color:var(--ov-muted)]">Dados do comprador para o contrato: CPF, RG, estado civil e endereço.</p>
        </Link>
        <Link to="/membros/unidades" className="ov-card p-6 transition hover:border-[color:var(--ov-gold)]">
          <h2 className="ov-serif text-2xl">Escolher unidade</h2>
          <p className="mt-2 text-sm text-[color:var(--ov-muted)]">Andar, planta, valor e box. Toque para abrir a proposta.</p>
        </Link>
        <Link to="/membros/propostas" className="ov-card p-6 transition hover:border-[color:var(--ov-gold)]">
          <h2 className="ov-serif text-2xl">Gerar contrato</h2>
          <p className="mt-2 text-sm text-[color:var(--ov-muted)]">Fluxo de pagamento da tabela, contrato pronto e assinatura na tela.</p>
        </Link>
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

function MoneyCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="ov-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--ov-muted)]">{label}</p>
      <p className="ov-serif mt-2 text-2xl">{value}</p>
      <p className="mt-1 text-xs text-[color:var(--ov-muted)]">{detail}</p>
    </article>
  );
}
