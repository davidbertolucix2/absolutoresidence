import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ADMIN_REP_ID, AUTH_EMAIL, AUTH_NAME, clearSession, hashPassword, isAdminLogin, loadSession, saveSession } from './auth';
import { blankRep, DEFAULT_COMPANY, makeAdminRep } from './seed';
import { computeFlow, normalizeFlow, type FlowInput } from '../data/payment';
import { getUnit } from '../data/units';
import type {
  Client,
  ClientStatus,
  CommissionStatus,
  CompanyInfo,
  ContractRecord,
  ContractStatus,
  RepProfile,
  Session,
  StoreData,
} from './types';
import { daysBetween, uid } from './format';

const STORAGE_KEY = 'absoluto-comercial-v1';
export const FOLLOWUP_DAYS = 7;

function emptyStore(): StoreData {
  return {
    session: null,
    company: DEFAULT_COMPANY,
    accounts: [],
    reps: [makeAdminRep()],
    clients: [],
    contracts: [],
  };
}

function migrateRep(rep: RepProfile): RepProfile {
  return { ...blankRep(rep.createdAt), ...rep, commercialEmail: rep.commercialEmail || rep.email };
}

function migrateClient(client: Client): Client {
  const defaults: Partial<Client> = {
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
    whatsapp: '',
    email: '',
    interestUnit: '',
    notes: '',
  };
  return { ...defaults, ...client, status: client.status ?? 'lead' };
}

function migrateContract(contract: ContractRecord): ContractRecord {
  return {
    ...contract,
    status: contract.status ?? 'rascunho',
    commissionStatus: contract.commissionStatus ?? 'pendente',
    sentAt: contract.sentAt ?? null,
    signedAt: contract.signedAt ?? null,
    paidAt: contract.paidAt ?? null,
    receivedAt: contract.receivedAt ?? null,
    signatureDataUrl: contract.signatureDataUrl ?? '',
  };
}

function loadStore(): StoreData {
  const fallback = emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = loadSession();
    if (!raw) return { ...fallback, session: stored };
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    const reps = (parsed.reps ?? []).map(migrateRep);
    return {
      ...fallback,
      ...parsed,
      session: stored,
      company: parsed.company ?? fallback.company,
      accounts: parsed.accounts ?? [],
      reps: reps.some((rep) => rep.id === ADMIN_REP_ID) ? reps : [makeAdminRep(), ...reps],
      clients: (parsed.clients ?? []).map(migrateClient),
      contracts: (parsed.contracts ?? []).map(migrateContract),
    };
  } catch {
    return fallback;
  }
}

function persist(data: StoreData) {
  try {
    const { session: _session, ...rest } = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    window.alert('Não foi possível salvar no navegador (limite de armazenamento).');
  }
}

export type ClientInput = Omit<Client, 'id' | 'createdAt' | 'lastTouchAt' | 'repId'> & { id?: string };
export type SignupInput = { fullName: string; email: string; password: string; phone: string; creci: string };

type StoreApi = {
  data: StoreData;
  session: Session | null;
  currentRep: RepProfile | null;
  isStaff: boolean;
  signup: (input: SignupInput) => Promise<string | null>;
  login: (user: string, pass: string) => Promise<string | null>;
  logout: () => void;
  updateRep: (id: string, patch: Partial<RepProfile>) => void;
  setRepStatus: (id: string, status: RepProfile['status'], note?: string) => void;
  saveCompany: (company: CompanyInfo) => void;
  upsertClient: (client: ClientInput) => Client | null;
  touchClient: (id: string) => void;
  setClientStatus: (id: string, status: ClientStatus) => void;
  clientsOf: (repId: string) => Client[];
  followupsOf: (repId: string) => Client[];
  createContract: (input: { clientId: string; unitId: string; flow: FlowInput }) => ContractRecord | null;
  deleteContract: (id: string) => void;
  sendContract: (id: string) => void;
  signContract: (id: string, signatureDataUrl: string) => void;
  markContractPaid: (id: string) => void;
  setCommissionStatus: (id: string, status: CommissionStatus) => void;
  markBatchPaid: () => void;
  contractsOf: (repId: string) => ContractRecord[];
  reservedUnits: () => Record<string, ContractRecord>;
  saveAccount: (patch: Partial<RepProfile>) => void;
  exportWorkspace: () => string;
  importWorkspace: (json: string) => void;
};

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(() => loadStore());

  const commit = useCallback((updater: (prev: StoreData) => StoreData) => {
    setData((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

  const currentRep = useMemo(() => {
    if (!data.session) return null;
    return data.reps.find((rep) => rep.id === data.session?.repId) ?? null;
  }, [data.reps, data.session]);

  const isStaff = Boolean(data.session?.staff);

  const api = useMemo<StoreApi>(() => {
    const seeAll = (repId: string) => repId === ADMIN_REP_ID || isStaff;
    const startSession = (session: Session) => {
      saveSession(session);
      setData((prev) => ({ ...prev, session }));
    };

    return {
      data,
      session: data.session,
      currentRep,
      isStaff,
      signup: async ({ fullName, email, password, phone, creci }) => {
        const mail = email.trim().toLowerCase();
        if (!fullName.trim()) return 'Informe seu nome.';
        if (!/^\S+@\S+\.\S+$/.test(mail)) return 'E-mail inválido.';
        if (password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
        if (mail === AUTH_EMAIL || data.accounts.some((acc) => acc.email === mail)) {
          return 'Já existe uma conta com este e-mail neste navegador. Use “Entrar”.';
        }
        const now = new Date().toISOString();
        const rep: RepProfile = {
          ...blankRep(now),
          id: uid('rep'),
          email: mail,
          commercialEmail: mail,
          fullName: fullName.trim(),
          phone,
          creci: creci.trim(),
          bank: { ...blankRep(now).bank, holder: fullName.trim() },
          status: 'aprovado',
        };
        const passHash = await hashPassword(mail, password);
        commit((prev) => ({
          ...prev,
          reps: [...prev.reps, rep],
          accounts: [...prev.accounts, { email: mail, passHash, repId: rep.id }],
        }));
        startSession({ repId: rep.id, email: mail, name: rep.fullName, staff: false });
        return null;
      },
      login: async (user, pass) => {
        if (isAdminLogin(user, pass)) {
          startSession({ repId: ADMIN_REP_ID, email: AUTH_EMAIL, name: AUTH_NAME, staff: true });
          return null;
        }
        const mail = user.trim().toLowerCase();
        const account = data.accounts.find((acc) => acc.email === mail);
        if (!account) return 'Conta não encontrada neste navegador. Crie seu cadastro.';
        const hash = await hashPassword(mail, pass);
        if (hash !== account.passHash) return 'Senha incorreta.';
        const rep = data.reps.find((item) => item.id === account.repId);
        if (!rep) return 'Cadastro não encontrado.';
        if (rep.status === 'recusado') return 'Acesso bloqueado pela gestão comercial.';
        startSession({ repId: rep.id, email: mail, name: rep.fullName, staff: false });
        return null;
      },
      logout: () => {
        clearSession();
        setData((prev) => ({ ...prev, session: null }));
      },
      updateRep: (id, patch) =>
        commit((prev) => ({ ...prev, reps: prev.reps.map((rep) => (rep.id === id ? { ...rep, ...patch } : rep)) })),
      setRepStatus: (id, status, note = '') =>
        commit((prev) => ({
          ...prev,
          reps: prev.reps.map((rep) =>
            rep.id === id
              ? { ...rep, status, rejectionNote: note, approvedAt: status === 'aprovado' ? new Date().toISOString() : rep.approvedAt }
              : rep,
          ),
        })),
      saveCompany: (company) => commit((prev) => ({ ...prev, company })),
      upsertClient: (input) => {
        if (!currentRep) return null;
        const now = new Date().toISOString();
        const existing = input.id ? data.clients.find((c) => c.id === input.id) : null;
        const { id: _ignored, ...fields } = input;
        const client: Client = {
          ...fields,
          id: existing?.id ?? uid('cli'),
          repId: existing?.repId ?? currentRep.id,
          createdAt: existing?.createdAt ?? now,
          lastTouchAt: existing?.lastTouchAt ?? now,
        };
        commit((prev) => ({
          ...prev,
          clients: existing ? prev.clients.map((item) => (item.id === existing.id ? client : item)) : [...prev.clients, client],
        }));
        return client;
      },
      touchClient: (id) => {
        const now = new Date().toISOString();
        commit((prev) => ({ ...prev, clients: prev.clients.map((c) => (c.id === id ? { ...c, lastTouchAt: now } : c)) }));
      },
      setClientStatus: (id, status) =>
        commit((prev) => ({ ...prev, clients: prev.clients.map((c) => (c.id === id ? { ...c, status } : c)) })),
      clientsOf: (repId) => data.clients.filter((client) => seeAll(repId) || client.repId === repId),
      followupsOf: (repId) =>
        data.clients.filter(
          (client) =>
            (seeAll(repId) || client.repId === repId) &&
            (client.status === 'lead' || client.status === 'visita' || client.status === 'proposta') &&
            daysBetween(client.lastTouchAt) >= FOLLOWUP_DAYS,
        ),
      createContract: ({ clientId, unitId, flow }) => {
        if (!currentRep) return null;
        const client = data.clients.find((item) => item.id === clientId);
        const unit = getUnit(unitId);
        if (!client || !unit || unit.price == null) return null;
        const normalized = normalizeFlow(flow);
        const result = computeFlow(unit.price, normalized);
        const createdAt = new Date().toISOString();
        const seq = data.contracts.length + 1;
        const record: ContractRecord = {
          id: uid('ctr'),
          number: `ABS-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`,
          repId: currentRep.id,
          clientId,
          unitId,
          unitPrice: unit.price,
          flow: normalized,
          total: result.total,
          createdAt,
          status: 'rascunho',
          commissionStatus: 'pendente',
          sentAt: null,
          signedAt: null,
          paidAt: null,
          receivedAt: null,
          signatureDataUrl: '',
        };
        commit((prev) => ({
          ...prev,
          contracts: [...prev.contracts, record],
          clients: prev.clients.map((item) =>
            item.id === clientId
              ? { ...item, status: item.status === 'fechado' ? item.status : 'proposta', interestUnit: unitId, lastTouchAt: createdAt }
              : item,
          ),
        }));
        return record;
      },
      deleteContract: (id) =>
        commit((prev) => ({ ...prev, contracts: prev.contracts.filter((item) => item.id !== id || item.status !== 'rascunho') })),
      sendContract: (id) => {
        const now = new Date().toISOString();
        commit((prev) => ({
          ...prev,
          contracts: prev.contracts.map((item) =>
            item.id === id && item.status === 'rascunho' ? { ...item, status: 'enviado' as ContractStatus, sentAt: now } : item,
          ),
        }));
      },
      signContract: (id, signatureDataUrl) => {
        const now = new Date().toISOString();
        commit((prev) => {
          const contract = prev.contracts.find((item) => item.id === id);
          return {
            ...prev,
            contracts: prev.contracts.map((item) =>
              item.id === id ? { ...item, status: 'assinado' as ContractStatus, signedAt: now, signatureDataUrl } : item,
            ),
            clients: prev.clients.map((client) =>
              contract && client.id === contract.clientId ? { ...client, status: 'fechado', lastTouchAt: now } : client,
            ),
          };
        });
      },
      markContractPaid: (id) => {
        const now = new Date().toISOString();
        commit((prev) => ({
          ...prev,
          contracts: prev.contracts.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'pago' as ContractStatus,
                  paidAt: now,
                  commissionStatus: item.commissionStatus === 'bloqueado' ? item.commissionStatus : ('a_receber' as CommissionStatus),
                }
              : item,
          ),
        }));
      },
      setCommissionStatus: (id, status) => {
        const now = new Date().toISOString();
        commit((prev) => ({
          ...prev,
          contracts: prev.contracts.map((item) =>
            item.id === id ? { ...item, commissionStatus: status, receivedAt: status === 'recebido' ? now : item.receivedAt } : item,
          ),
        }));
      },
      markBatchPaid: () => {
        const now = new Date().toISOString();
        commit((prev) => ({
          ...prev,
          contracts: prev.contracts.map((item) =>
            item.commissionStatus === 'a_receber' ? { ...item, commissionStatus: 'recebido', receivedAt: now } : item,
          ),
        }));
      },
      contractsOf: (repId) => data.contracts.filter((item) => seeAll(repId) || item.repId === repId),
      reservedUnits: () => {
        const map: Record<string, ContractRecord> = {};
        for (const item of data.contracts) {
          if (item.status === 'assinado' || item.status === 'pago') map[item.unitId] = item;
        }
        return map;
      },
      saveAccount: (patch) => {
        if (!currentRep) return;
        commit((prev) => {
          const reps = prev.reps.map((rep) => (rep.id === currentRep.id ? { ...rep, ...patch } : rep));
          const updated = reps.find((rep) => rep.id === currentRep.id);
          const session = prev.session && updated ? { ...prev.session, name: updated.fullName } : prev.session;
          if (session) saveSession(session);
          return { ...prev, reps, session };
        });
      },
      exportWorkspace: () =>
        JSON.stringify(
          { company: data.company, accounts: data.accounts, reps: data.reps, clients: data.clients, contracts: data.contracts },
          null,
          2,
        ),
      importWorkspace: (json) => {
        const parsed = JSON.parse(json) as Partial<StoreData>;
        commit((prev) => ({
          ...prev,
          company: parsed.company ?? prev.company,
          accounts: parsed.accounts ?? prev.accounts,
          reps: (parsed.reps ?? prev.reps).map(migrateRep),
          clients: (parsed.clients ?? prev.clients).map(migrateClient),
          contracts: (parsed.contracts ?? prev.contracts).map(migrateContract),
        }));
      },
    };
  }, [commit, currentRep, data, isStaff]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore precisa do StoreProvider');
  return ctx;
}
