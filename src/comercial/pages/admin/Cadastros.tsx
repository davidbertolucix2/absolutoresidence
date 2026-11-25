import { useEffect } from 'react';
import { formatDate, whatsappHref } from '../../format';
import { useStore } from '../../store';
import { ADMIN_REP_ID } from '../../auth';
import { formatBRL } from '../../../data/units';
import { closedVolume } from '../../commission';

export function AdminCadastros() {
  const { data, setRepStatus } = useStore();
  const reps = data.reps.filter((rep) => rep.id !== ADMIN_REP_ID).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  useEffect(() => {
    document.title = 'Corretores — gestão Absoluto';
  }, []);

  return (
    <div>
      <p className="ov-kicker">Cadastro aberto</p>
      <h1 className="ov-serif mt-2 text-4xl">Corretores</h1>
      <p className="mt-3 max-w-2xl text-[color:var(--ov-muted)]">
        Qualquer corretor pode criar a conta em /entrar e já começa aprovado. Bloqueie quem não deve vender o empreendimento.
      </p>
      <ul className="mt-8 space-y-2">
        {reps.length === 0 ? <li className="text-sm text-[color:var(--ov-muted)]">Nenhum corretor cadastrado neste navegador.</li> : null}
        {reps.map((rep) => {
          const contracts = data.contracts.filter((c) => c.repId === rep.id);
          return (
            <li key={rep.id} className="ov-card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold">
                  {rep.fullName}
                  {rep.status === 'recusado' ? <span className="ml-2 text-xs text-[color:var(--ov-danger)]">bloqueado</span> : null}
                </p>
                <p className="text-sm text-[color:var(--ov-muted)]">
                  {[rep.email, rep.creci && `CRECI ${rep.creci}`, `desde ${formatDate(rep.createdAt)}`].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-1 text-xs text-[color:var(--ov-gold-2)]">
                  {contracts.length} proposta(s) · {formatBRL(closedVolume(contracts))} assinados
                </p>
              </div>
              <div className="flex items-center gap-3">
                {rep.phone ? (
                  <a className="text-xs font-semibold text-[color:var(--ov-gold-2)]" href={whatsappHref(rep.phone)} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                ) : null}
                {rep.status === 'recusado' ? (
                  <button type="button" className="ov-btn ov-btn-ghost !py-2 text-xs" onClick={() => setRepStatus(rep.id, 'aprovado')}>
                    Reativar
                  </button>
                ) : (
                  <button type="button" className="ov-btn ov-btn-ghost !py-2 text-xs" onClick={() => setRepStatus(rep.id, 'recusado', 'Bloqueado pela gestão')}>
                    Bloquear
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
