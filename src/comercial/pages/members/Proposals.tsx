import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fieldClass, labelClass, primaryBtn, secondaryBtn, Wordmark } from '../../chrome';
import { SignaturePad } from '../../SignaturePad';
import { buildContract } from '../../contracts';
import { formatDate, formatPhone, whatsappHref } from '../../format';
import { COMMISSION_LABEL, contractCommission } from '../../commission';
import { useStore } from '../../store';
import type { CommissionStatus, ContractStatus } from '../../types';
import {
  AVAILABLE_UNITS,
  COMMISSION_RATE,
  FLOORS,
  formatArea,
  formatBRL,
  getUnit,
  KIND_LABEL,
  KIND_SHORT,
  MAX_INSTALLMENTS,
  MOTO_BOX_PRICE,
  TABLE_LABEL,
  unitPlan,
} from '../../../data/units';
import { computeFlow, FLOW_PRESETS, presetFlow, type FlowInput, type FlowKind } from '../../../data/payment';

export const CONTRACT_LABEL: Record<ContractStatus, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviada ao cliente',
  assinado: 'Assinada',
  pago: 'Entrada confirmada',
};

const COMMISSION_STATUS: Record<CommissionStatus, string> = {
  pendente: 'Comissão pendente',
  a_receber: 'Comissão a receber',
  recebido: 'Comissão recebida',
  bloqueado: 'Comissão bloqueada',
};

export function MembersProposals() {
  const store = useStore();
  const { currentRep, clientsOf, contractsOf, createContract, sendContract, signContract, markContractPaid, deleteContract, upsertClient, reservedUnits, isStaff, data } = store;
  const rep = currentRep!;
  const [params, setParams] = useSearchParams();
  const clients = clientsOf(rep.id);
  const records = contractsOf(rep.id).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reserved = reservedUnits();

  const [clientId, setClientId] = useState(params.get('cliente') || clients[0]?.id || '');
  const [unitId, setUnitId] = useState(params.get('unidade') || '');
  const [flow, setFlow] = useState<FlowInput>(() => presetFlow('mensal'));
  const [previewId, setPreviewId] = useState<string | null>(records[0]?.id ?? null);
  const [signature, setSignature] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  useEffect(() => {
    document.title = 'Propostas — Área do corretor';
  }, []);

  useEffect(() => {
    if (!clientId && clients[0]) setClientId(clients[0].id);
  }, [clients, clientId]);

  const unit = getUnit(unitId);
  const result = unit?.price != null ? computeFlow(unit.price, flow) : null;
  const commission = result ? result.total * COMMISSION_RATE : 0;

  const preview = useMemo(() => {
    const record = records.find((item) => item.id === previewId);
    if (!record) return null;
    const client = data.clients.find((item) => item.id === record.clientId);
    const owner = data.reps.find((item) => item.id === record.repId) ?? rep;
    if (!client) return null;
    return buildContract(record, client, owner, data.company);
  }, [records, previewId, data.clients, data.company, data.reps, rep]);

  const pickPreset = (kind: FlowKind) => setFlow((current) => presetFlow(kind, current.motoBox));
  const setField = (key: keyof FlowInput, value: number | boolean) =>
    setFlow((current) => ({
      ...current,
      // mexer na estrutura do fluxo transforma o preset em "Personalizado", para o contrato descrever o que foi combinado
      kind: key === 'motoBox' || key === 'discountPct' ? current.kind : 'personalizado',
      [key]: value,
    }));

  const addQuickClient = () => {
    if (!quickName.trim()) return;
    const created = upsertClient({
      name: quickName.trim(),
      cpf: '',
      rg: '',
      birthDate: '',
      nationality: 'brasileira',
      maritalStatus: 'solteiro',
      spouseName: '',
      profession: '',
      address: '',
      city: '',
      state: 'SC',
      whatsapp: quickPhone,
      email: '',
      interestUnit: unitId,
      notes: '',
      status: 'proposta',
    });
    if (created) {
      setClientId(created.id);
      setQuickName('');
      setQuickPhone('');
    }
  };

  const generate = (event: FormEvent) => {
    event.preventDefault();
    if (!clientId || !unit) return;
    const created = createContract({ clientId, unitId: unit.id, flow });
    if (created) {
      setPreviewId(created.id);
      setSignature('');
      setParams({}, { replace: true });
      setTimeout(() => document.getElementById('contrato')?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  };

  const shareText = preview
    ? `Proposta ${preview.record.number} — Absoluto Residence\nUnidade ${preview.unit.id} (${KIND_LABEL[preview.unit.kind]}, ${formatArea(preview.unit.area)}, box ${preview.unit.box})\nValor: ${formatBRL(preview.flow.total, 2)}\n` +
      preview.flow.lines.map((l) => `• ${l.label}: ${l.count}× ${formatBRL(l.each, 2)}`).join('\n') +
      `\nParcelas corrigidas pelo CUB/SC. ${TABLE_LABEL}.`
    : '';

  return (
    <div>
      <div className="print:hidden">
        <p className="ov-kicker">Propostas e contratos</p>
        <h1 className="ov-serif mt-2 text-4xl">Monte a proposta</h1>
        <p className="mt-3 max-w-2xl text-[color:var(--ov-muted)]">
          Escolha o cliente, a unidade e o fluxo de pagamento da tabela. O contrato se ajusta sozinho à unidade e ao fluxo.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] print:hidden">
        <form className="space-y-5" onSubmit={generate}>
          {/* 1. Cliente */}
          <section className="ov-card space-y-3 p-5">
            <h2 className="ov-serif text-xl">1 · Cliente</h2>
            <select className={fieldClass} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.length === 0 ? <option value="">Nenhum cliente — adicione abaixo</option> : null}
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                  {client.cpf ? ` · ${client.cpf}` : ''}
                </option>
              ))}
            </select>
            <div className="grid gap-2 sm:grid-cols-[1fr_170px_auto]">
              <input className={fieldClass} placeholder="Novo cliente: nome" value={quickName} onChange={(e) => setQuickName(e.target.value)} />
              <input className={fieldClass} placeholder="WhatsApp" value={quickPhone} onChange={(e) => setQuickPhone(formatPhone(e.target.value))} />
              <button type="button" className={secondaryBtn} onClick={addQuickClient} disabled={!quickName.trim()}>
                Adicionar
              </button>
            </div>
            <p className="text-xs text-[color:var(--ov-muted)]">
              CPF, RG, estado civil e endereço completam o contrato em{' '}
              <Link to="/membros/carteira" className="underline">
                Clientes
              </Link>
              .
            </p>
          </section>

          {/* 2. Unidade */}
          <section className="ov-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="ov-serif text-xl">2 · Unidade</h2>
              <Link to="/membros/unidades" className="text-xs font-semibold text-[color:var(--ov-gold-2)]">
                Ver no prédio →
              </Link>
            </div>
            <select className={fieldClass} value={unitId} onChange={(e) => setUnitId(e.target.value)} required>
              <option value="">Selecione a unidade</option>
              {FLOORS.map((floor) => {
                const list = AVAILABLE_UNITS.filter((u) => u.floor === floor);
                if (!list.length) return null;
                return (
                  <optgroup key={floor} label={`${floor}º pavimento`}>
                    {list.map((u) => (
                      <option key={u.id} value={u.id} disabled={Boolean(reserved[u.id])}>
                        {u.id} · {KIND_SHORT[u.kind]} · {formatArea(u.area)} · {formatBRL(u.price ?? 0)}
                        {reserved[u.id] ? ' · reservada' : ''}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            {unit ? (
              <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                <img src={unitPlan(unit)} alt={`Planta da unidade ${unit.id}`} className="w-full rounded-xl bg-white object-contain" />
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-[color:var(--ov-muted)]">Tipologia</dt>
                  <dd>{KIND_LABEL[unit.kind]}</dd>
                  <dt className="text-[color:var(--ov-muted)]">Pavimento</dt>
                  <dd>{unit.floor}º</dd>
                  <dt className="text-[color:var(--ov-muted)]">Área privativa</dt>
                  <dd>{formatArea(unit.area)}</dd>
                  <dt className="text-[color:var(--ov-muted)]">Dormitórios</dt>
                  <dd>{unit.bedrooms}</dd>
                  <dt className="text-[color:var(--ov-muted)]">Box</dt>
                  <dd>{unit.box}</dd>
                  <dt className="text-[color:var(--ov-muted)]">Tabela</dt>
                  <dd className="font-semibold text-[color:var(--ov-gold-2)]">{formatBRL(unit.price ?? 0)}</dd>
                </dl>
              </div>
            ) : null}
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={flow.motoBox} onChange={(e) => setField('motoBox', e.target.checked)} className="h-4 w-4 accent-[#c9a96e]" />
              Incluir box para moto (2 m² · {formatBRL(MOTO_BOX_PRICE)})
            </label>
          </section>

          {/* 3. Fluxo */}
          <section className="ov-card space-y-4 p-5">
            <h2 className="ov-serif text-xl">3 · Fluxo de pagamento</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(FLOW_PRESETS) as FlowKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => pickPreset(kind)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    flow.kind === kind ? 'border-[color:var(--ov-gold)] bg-[color:var(--ov-gold)]/10' : 'border-[color:var(--ov-line)] hover:border-[color:var(--ov-gold)]/60'
                  }`}
                >
                  <p className="font-semibold">{FLOW_PRESETS[kind].label}</p>
                  <p className="mt-1 text-xs text-[color:var(--ov-muted)]">{FLOW_PRESETS[kind].hint}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumField label="Desconto %" value={flow.discountPct} step={0.5} onChange={(v) => setField('discountPct', v)} />
              {flow.kind !== 'avista' ? (
                <>
                  <NumField label="Entrada %" value={flow.entryPct} onChange={(v) => setField('entryPct', v)} />
                  <NumField label="Entrada em (x)" value={flow.entrySplits} min={1} onChange={(v) => setField('entrySplits', v)} />
                  <NumField label={`Mensais (até ${MAX_INSTALLMENTS})`} value={flow.months} max={MAX_INSTALLMENTS} onChange={(v) => setField('months', v)} />
                  <NumField label="Reforços anuais" value={flow.balloons} max={6} onChange={(v) => setField('balloons', v)} />
                  <NumField label="Reforços % total" value={flow.balloonsPct} onChange={(v) => setField('balloonsPct', v)} />
                  <NumField label="Chaves %" value={flow.keysPct} onChange={(v) => setField('keysPct', v)} />
                </>
              ) : null}
            </div>
            {result ? (
              <div className="rounded-2xl border border-[color:var(--ov-line)] p-4 text-sm">
                <table className="w-full">
                  <tbody>
                    {result.lines.map((line) => (
                      <tr key={line.label} className="border-b border-white/5 last:border-0">
                        <td className="py-2">{line.label}</td>
                        <td className="py-2 text-right tabular-nums">
                          {line.count}× {formatBRL(line.each, 2)}
                        </td>
                        <td className="hidden py-2 pl-4 text-right tabular-nums text-[color:var(--ov-muted)] sm:table-cell">{formatBRL(line.total, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-[color:var(--ov-line)] pt-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[color:var(--ov-muted)]">Valor da proposta</p>
                    <p className="ov-serif text-2xl text-[color:var(--ov-gold-2)]">{formatBRL(result.total, 2)}</p>
                    {result.discount > 0 ? <p className="text-xs text-[color:var(--ov-muted)]">Desconto {formatBRL(result.discount, 2)}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-[color:var(--ov-muted)]">Sua comissão (8%)</p>
                    <p className="ov-serif text-xl">{formatBRL(commission, 2)}</p>
                  </div>
                </div>
                {result.warnings.map((w) => (
                  <p key={w} className="mt-2 text-sm text-[color:var(--ov-danger)]">
                    {w}
                  </p>
                ))}
                <p className="mt-2 text-xs text-[color:var(--ov-muted)]">Parcelas corrigidas mensalmente pelo CUB/SC. Descontos e reforços sujeitos à aprovação da construtora.</p>
              </div>
            ) : (
              <p className="text-sm text-[color:var(--ov-muted)]">Selecione a unidade para ver o fluxo.</p>
            )}
            <button type="submit" className={`${primaryBtn} w-full`} disabled={!clientId || !unit || Boolean(result?.warnings.length)}>
              Gerar proposta e contrato
            </button>
          </section>
        </form>

        <aside>
          <h2 className="ov-serif text-xl">Suas propostas</h2>
          <ul className="mt-4 space-y-2">
            {records.length === 0 ? <li className="text-sm text-[color:var(--ov-muted)]">Nenhuma proposta ainda.</li> : null}
            {records.map((item) => {
              const client = data.clients.find((c) => c.id === item.clientId);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewId(item.id);
                      setSignature('');
                      setTimeout(() => document.getElementById('contrato')?.scrollIntoView({ behavior: 'smooth' }), 60);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left ${previewId === item.id ? 'border-[color:var(--ov-gold)]' : 'border-[color:var(--ov-line)]'}`}
                  >
                    <p className="font-semibold">
                      {item.number} · Unid. {item.unitId}
                    </p>
                    <p className="text-sm text-[color:var(--ov-muted)]">
                      {client?.name ?? 'Cliente'} · {FLOW_PRESETS[item.flow.kind].label} · {formatBRL(item.total)}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--ov-gold-2)]">
                      {CONTRACT_LABEL[item.status]} · {COMMISSION_STATUS[item.commissionStatus]} · {formatBRL(contractCommission(item), 2)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-[color:var(--ov-muted)]">Comissão: {COMMISSION_LABEL}.</p>
        </aside>
      </div>

      {preview ? (
        <article id="contrato" className="lm-onepager mt-12 scroll-mt-24 rounded-3xl bg-[#f7f3ec] p-6 text-[#14110c] shadow-2xl print:mt-0 print:rounded-none print:p-0 print:shadow-none sm:p-12">
          <div className="flex items-start justify-between gap-4">
            <Wordmark dark />
            <div className="text-right text-xs font-semibold uppercase tracking-widest">
              <p>{preview.record.number}</p>
              <p className="mt-1 opacity-60">{CONTRACT_LABEL[preview.record.status]}</p>
            </div>
          </div>
          <h2 className="ov-serif mt-8 text-2xl sm:text-3xl">{preview.title}</h2>
          <p className="mt-2 text-sm opacity-70">
            {preview.client.name} · gerado em {formatDate(preview.record.createdAt)} · {TABLE_LABEL}
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
            <img src={unitPlan(preview.unit)} alt={`Planta ${preview.unit.id}`} className="w-full rounded-xl border border-black/10 bg-white object-contain" />
            <div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Info label="Unidade" value={preview.unit.id} />
                <Info label="Tipologia" value={KIND_SHORT[preview.unit.kind]} />
                <Info label="Área" value={formatArea(preview.unit.area)} />
                <Info label="Box" value={preview.unit.box} />
              </div>
              <table className="mt-5 w-full text-sm">
                <thead>
                  <tr className="border-b border-black/15 text-left text-[11px] uppercase tracking-widest opacity-60">
                    <th className="py-2">Fluxo · {FLOW_PRESETS[preview.record.flow.kind].label}</th>
                    <th className="py-2 text-right">Parcelas</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.flow.lines.map((line) => (
                    <tr key={line.label} className="border-b border-black/5">
                      <td className="py-2">
                        {line.label}
                        <span className="block text-xs opacity-60">{line.when}</span>
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {line.count}× {formatBRL(line.each, 2)}
                      </td>
                      <td className="py-2 text-right tabular-nums">{formatBRL(line.total, 2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="pt-3 font-semibold">Valor total</td>
                    <td />
                    <td className="pt-3 text-right text-base font-semibold tabular-nums">{formatBRL(preview.flow.total, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 space-y-5 text-sm leading-relaxed">
            {preview.clauses.map((clause) => (
              <section key={clause.heading}>
                <h3 className="font-semibold">{clause.heading}</h3>
                <p className="mt-1 whitespace-pre-wrap opacity-80">{clause.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 grid gap-8 text-sm sm:grid-cols-2">
            <div>
              {preview.record.signatureDataUrl ? (
                <img src={preview.record.signatureDataUrl} alt="Assinatura do comprador" className="h-20 w-60 object-contain" />
              ) : (
                <div className="h-20" />
              )}
              <p className="border-t border-black/30 pt-2">{preview.client.name}</p>
              <p className="text-xs opacity-60">Promissário(a) comprador(a){preview.record.signedAt ? ` · assinado em ${formatDate(preview.record.signedAt)}` : ''}</p>
            </div>
            <div>
              <div className="h-20" />
              <p className="border-t border-black/30 pt-2">{preview.company.legalName}</p>
              <p className="text-xs opacity-60">Promitente vendedora</p>
            </div>
          </div>
          <p className="mt-8 text-[11px] leading-relaxed opacity-55">
            Modelo gerado automaticamente a partir da {TABLE_LABEL}. Valores, prazos e condições estão sujeitos à aprovação da construtora e à análise jurídica antes da assinatura definitiva.
          </p>

          <div className="print:hidden mt-8 space-y-4 border-t border-black/10 pt-6">
            {preview.record.status === 'rascunho' || preview.record.status === 'enviado' ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Assinatura do comprador</p>
                <SignaturePad value={signature} onChange={setSignature} />
              </>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {preview.record.status === 'rascunho' ? (
                <button type="button" className="ov-btn border border-black/15 text-[#14110c]" onClick={() => sendContract(preview.record.id)}>
                  Marcar como enviada
                </button>
              ) : null}
              {preview.record.status === 'rascunho' || preview.record.status === 'enviado' ? (
                <button type="button" className={primaryBtn} disabled={!signature} onClick={() => signContract(preview.record.id, signature)}>
                  Registrar assinatura
                </button>
              ) : null}
              {isStaff && preview.record.status === 'assinado' ? (
                <button type="button" className={primaryBtn} onClick={() => markContractPaid(preview.record.id)}>
                  Confirmar entrada (libera comissão)
                </button>
              ) : null}
              <a className="ov-btn border border-black/15 text-[#14110c]" href={whatsappHref(preview.client.whatsapp || '', shareText)} target="_blank" rel="noreferrer">
                Enviar resumo no WhatsApp
              </a>
              <button type="button" className="ov-btn border border-black/15 text-[#14110c]" onClick={() => window.print()}>
                Imprimir / PDF
              </button>
              {preview.record.status === 'rascunho' ? (
                <button
                  type="button"
                  className="ov-btn text-[color:var(--ov-danger)]"
                  onClick={() => {
                    deleteContract(preview.record.id);
                    setPreviewId(null);
                  }}
                >
                  Excluir rascunho
                </button>
              ) : null}
            </div>
            {!isStaff && preview.record.status === 'assinado' ? (
              <p className="text-xs opacity-60">A gestão comercial confirma a entrada e libera sua comissão de {formatBRL(preview.commission, 2)}.</p>
            ) : null}
          </div>
        </article>
      ) : null}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        className={fieldClass}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-55">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
