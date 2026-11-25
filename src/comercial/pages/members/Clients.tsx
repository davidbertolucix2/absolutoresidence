import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldClass, labelClass, primaryBtn, secondaryBtn } from '../../chrome';
import { BR_STATES, daysBetween, formatCpf, formatPhone, whatsappHref } from '../../format';
import { FOLLOWUP_DAYS, useStore } from '../../store';
import { AVAILABLE_UNITS, KIND_SHORT } from '../../../data/units';
import type { Client, ClientStatus, MaritalStatus } from '../../types';

const emptyForm = {
  name: '',
  cpf: '',
  rg: '',
  birthDate: '',
  nationality: 'brasileira',
  maritalStatus: 'solteiro' as MaritalStatus,
  spouseName: '',
  profession: '',
  address: '',
  city: '',
  state: 'SC',
  whatsapp: '',
  email: '',
  interestUnit: '',
  notes: '',
  status: 'lead' as ClientStatus,
};

export const CLIENT_STATUS: Record<ClientStatus, string> = {
  lead: 'Lead',
  visita: 'Visita',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export function MembersClients() {
  const { currentRep, clientsOf, upsertClient, touchClient, setClientStatus, data, isStaff } = useStore();
  const clients = clientsOf(currentRep!.id);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todos' | ClientStatus>('todos');
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Clientes — Área do corretor';
  }, []);

  const visible = clients
    .filter((client) => (filter === 'todos' ? true : client.status === filter))
    .filter((client) => (query ? `${client.name} ${client.cpf} ${client.email}`.toLowerCase().includes(query.toLowerCase()) : true))
    .sort((a, b) => b.lastTouchAt.localeCompare(a.lastTouchAt));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    upsertClient({ ...form, id: editing ?? undefined });
    setForm(emptyForm);
    setEditing(null);
  };

  const load = (client: Client) => {
    setEditing(client.id);
    const { id: _id, repId: _rep, createdAt: _c, lastTouchAt: _l, ...rest } = client;
    setForm({ ...emptyForm, ...rest });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => setForm((c) => ({ ...c, [key]: value }));
  const married = form.maritalStatus === 'casado' || form.maritalStatus === 'uniao_estavel';

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
      <div className="order-2 lg:order-1">
        <p className="ov-kicker">Carteira</p>
        <h1 className="ov-serif mt-2 text-4xl">Clientes</h1>
        <input className={`${fieldClass} mt-5`} placeholder="Buscar por nome, CPF ou e-mail" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="mt-4 flex flex-wrap gap-2">
          {(['todos', 'lead', 'visita', 'proposta', 'fechado', 'perdido'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                filter === item ? 'bg-[color:var(--ov-gold)] text-[#14110c]' : 'border border-[color:var(--ov-line)]'
              }`}
            >
              {item === 'todos' ? 'Todos' : CLIENT_STATUS[item]}
            </button>
          ))}
        </div>
        <ul className="mt-6 space-y-2">
          {visible.length === 0 ? (
            <li className="text-sm text-[color:var(--ov-muted)]">Nenhum cliente neste filtro. Cadastre ao lado.</li>
          ) : (
            visible.map((client) => {
              const stale = client.status !== 'fechado' && client.status !== 'perdido' && daysBetween(client.lastTouchAt) >= FOLLOWUP_DAYS;
              const owner = isStaff ? data.reps.find((rep) => rep.id === client.repId)?.fullName : null;
              return (
                <li key={client.id} className="ov-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-sm text-[color:var(--ov-muted)]">
                        {[client.city && `${client.city}/${client.state}`, client.interestUnit && `unid. ${client.interestUnit}`, owner, stale ? 'follow-up' : '']
                          .filter(Boolean)
                          .join(' · ') || 'Sem detalhes'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {client.whatsapp ? (
                        <a className="text-xs font-semibold text-[color:var(--ov-gold-2)]" href={whatsappHref(client.whatsapp)} target="_blank" rel="noreferrer">
                          WhatsApp
                        </a>
                      ) : null}
                      <button type="button" className="text-xs font-semibold" onClick={() => load(client)}>
                        Editar
                      </button>
                      <button type="button" className="text-xs font-semibold" onClick={() => touchClient(client.id)} title="Registrar contato de hoje">
                        Contato hoje
                      </button>
                      <Link className="text-xs font-semibold text-[color:var(--ov-gold-2)]" to={`/membros/propostas?cliente=${client.id}${client.interestUnit ? `&unidade=${client.interestUnit}` : ''}`}>
                        Proposta
                      </Link>
                      <select
                        className="rounded-full border border-[color:var(--ov-line)] bg-[color:var(--ov-bg)] px-2 py-1 text-xs"
                        value={client.status}
                        onChange={(e) => setClientStatus(client.id, e.target.value as ClientStatus)}
                      >
                        {Object.entries(CLIENT_STATUS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <form className="ov-card order-1 h-fit space-y-3 p-5 lg:order-2" onSubmit={submit}>
        <h2 className="ov-serif text-2xl">{editing ? 'Editar cliente' : 'Novo cliente'}</h2>
        <p className="text-xs text-[color:var(--ov-muted)]">Esses dados preenchem o contrato. Só o nome é obrigatório para começar.</p>
        <label className="block">
          <span className={labelClass}>Nome completo</span>
          <input className={fieldClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>CPF</span>
            <input className={fieldClass} value={form.cpf} inputMode="numeric" onChange={(e) => set('cpf', formatCpf(e.target.value))} />
          </label>
          <label className="block">
            <span className={labelClass}>RG</span>
            <input className={fieldClass} value={form.rg} onChange={(e) => set('rg', e.target.value)} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Nascimento</span>
            <input className={fieldClass} type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>Profissão</span>
            <input className={fieldClass} value={form.profession} onChange={(e) => set('profession', e.target.value)} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Estado civil</span>
            <select className={fieldClass} value={form.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value as MaritalStatus)}>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="uniao_estavel">União estável</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Nacionalidade</span>
            <input className={fieldClass} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
          </label>
        </div>
        {married ? (
          <label className="block">
            <span className={labelClass}>Cônjuge / companheiro(a)</span>
            <input className={fieldClass} value={form.spouseName} onChange={(e) => set('spouseName', e.target.value)} />
          </label>
        ) : null}
        <label className="block">
          <span className={labelClass}>Endereço</span>
          <input className={fieldClass} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua, número, bairro, CEP" />
        </label>
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <label className="block">
            <span className={labelClass}>Cidade</span>
            <input className={fieldClass} value={form.city} onChange={(e) => set('city', e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>UF</span>
            <select className={fieldClass} value={form.state} onChange={(e) => set('state', e.target.value)}>
              {BR_STATES.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>WhatsApp</span>
            <input className={fieldClass} value={form.whatsapp} inputMode="tel" onChange={(e) => set('whatsapp', formatPhone(e.target.value))} />
          </label>
          <label className="block">
            <span className={labelClass}>E-mail</span>
            <input className={fieldClass} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Unidade de interesse</span>
            <select className={fieldClass} value={form.interestUnit} onChange={(e) => set('interestUnit', e.target.value)}>
              <option value="">—</option>
              {AVAILABLE_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.id} · {KIND_SHORT[unit.kind]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Etapa</span>
            <select className={fieldClass} value={form.status} onChange={(e) => set('status', e.target.value as ClientStatus)}>
              {Object.entries(CLIENT_STATUS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className={labelClass}>Notas</span>
          <textarea className={fieldClass} rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={primaryBtn}>
            {editing ? 'Salvar' : 'Cadastrar cliente'}
          </button>
          {editing ? (
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
