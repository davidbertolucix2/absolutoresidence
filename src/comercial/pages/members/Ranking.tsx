import { useEffect, useMemo } from 'react';
import { formatBRL } from '../../../data/units';
import { closedVolume } from '../../commission';
import { useStore } from '../../store';
import { ADMIN_REP_ID } from '../../auth';

export function MembersRanking() {
  const { data } = useStore();
  const rows = useMemo(
    () =>
      data.reps
        .filter((rep) => rep.status === 'aprovado' && rep.id !== ADMIN_REP_ID)
        .map((rep) => {
          const contracts = data.contracts.filter((item) => item.repId === rep.id);
          const signed = contracts.filter((c) => c.status === 'assinado' || c.status === 'pago');
          return { id: rep.id, name: rep.fullName, creci: rep.creci, proposals: contracts.length, signed: signed.length, volume: closedVolume(contracts) };
        })
        .sort((a, b) => b.volume - a.volume || b.proposals - a.proposals),
    [data.contracts, data.reps],
  );

  useEffect(() => {
    document.title = 'Ranking — Área do corretor';
  }, []);

  return (
    <div>
      <p className="ov-kicker">Ranking</p>
      <h1 className="ov-serif mt-2 text-4xl">Corretores</h1>
      <p className="mt-3 max-w-2xl text-[color:var(--ov-muted)]">Ordenado por VGV assinado. Mostra os cadastros feitos neste navegador.</p>
      <ul className="mt-8 space-y-2">
        {rows.length === 0 ? <li className="text-sm text-[color:var(--ov-muted)]">Nenhum corretor cadastrado ainda.</li> : null}
        {rows.map((row, i) => (
          <li key={row.id} className="ov-card flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-4">
              <span className="ov-serif w-8 text-3xl text-[color:var(--ov-gold-2)]">{i + 1}</span>
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-sm text-[color:var(--ov-muted)]">{row.creci ? `CRECI ${row.creci}` : 'Corretor parceiro'}</p>
              </div>
            </div>
            <p className="text-sm">
              {row.proposals} proposta(s) · {row.signed} assinada(s) · <strong>{formatBRL(row.volume)}</strong>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
