import type { FlowInput } from '../data/payment';

export type RepStatus = 'pendente' | 'aprovado' | 'recusado';
export type ClientStatus = 'lead' | 'visita' | 'proposta' | 'fechado' | 'perdido';
export type PixType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
export type AccountType = 'corrente' | 'poupanca';
export type ContractStatus = 'rascunho' | 'enviado' | 'assinado' | 'pago';
export type CommissionStatus = 'pendente' | 'a_receber' | 'recebido' | 'bloqueado';
export type MaritalStatus = 'solteiro' | 'casado' | 'uniao_estavel' | 'divorciado' | 'viuvo';

export type CompanyInfo = {
  legalName: string;
  cnpj: string;
  address: string;
  email: string;
};

export type RepAddress = {
  zip: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type RepBank = {
  bankName: string;
  agency: string;
  account: string;
  accountType: AccountType;
  holder: string;
  pixType: PixType;
  pixKey: string;
};

export type RepProfile = {
  id: string;
  email: string;
  commercialEmail: string;
  fullName: string;
  creci: string;
  cpf: string;
  phone: string;
  address: RepAddress;
  regionCity: string;
  regionState: string;
  bank: RepBank;
  status: RepStatus;
  rejectionNote: string;
  createdAt: string;
  approvedAt: string | null;
  bio: string;
};

export type Client = {
  id: string;
  repId: string;
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  nationality: string;
  maritalStatus: MaritalStatus;
  spouseName: string;
  profession: string;
  address: string;
  city: string;
  state: string;
  whatsapp: string;
  email: string;
  interestUnit: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
  lastTouchAt: string;
};

export type ContractRecord = {
  id: string;
  number: string;
  repId: string;
  clientId: string;
  unitId: string;
  unitPrice: number; // preço de tabela congelado no momento da proposta
  flow: FlowInput;
  total: number; // valor final (com box moto e desconto)
  createdAt: string;
  status: ContractStatus;
  commissionStatus: CommissionStatus;
  sentAt: string | null;
  signedAt: string | null;
  paidAt: string | null;
  receivedAt: string | null;
  signatureDataUrl: string;
};

export type Session = {
  repId: string;
  email: string;
  name: string;
  staff: boolean;
};

export type Account = {
  email: string;
  passHash: string;
  repId: string;
};

export type StoreData = {
  session: Session | null;
  company: CompanyInfo;
  accounts: Account[];
  reps: RepProfile[];
  clients: Client[];
  contracts: ContractRecord[];
};
