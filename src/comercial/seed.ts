import { ADMIN_REP_ID, AUTH_EMAIL, AUTH_NAME } from './auth';
import type { CompanyInfo, RepProfile } from './types';

// Razão social e CNPJ ficam em branco até a construtora informar (Painel da equipe → Empresa).
export const DEFAULT_COMPANY: CompanyInfo = {
  legalName: 'YES Construtora',
  cnpj: '',
  address: 'Porto Belo/SC',
  email: '',
};

export const emptyAddress = {
  zip: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: 'SC',
};

export const emptyBank = {
  bankName: '',
  agency: '',
  account: '',
  accountType: 'corrente' as const,
  holder: '',
  pixType: 'cpf' as const,
  pixKey: '',
};

export function blankRep(now = new Date().toISOString()): RepProfile {
  return {
    id: '',
    email: '',
    commercialEmail: '',
    fullName: '',
    creci: '',
    cpf: '',
    phone: '',
    address: { ...emptyAddress },
    regionCity: 'Porto Belo',
    regionState: 'SC',
    bank: { ...emptyBank },
    status: 'aprovado',
    rejectionNote: '',
    createdAt: now,
    approvedAt: now,
    bio: '',
  };
}

export function makeAdminRep(now = new Date().toISOString()): RepProfile {
  return {
    ...blankRep(now),
    id: ADMIN_REP_ID,
    email: AUTH_EMAIL,
    commercialEmail: AUTH_EMAIL,
    fullName: AUTH_NAME,
    bio: 'Conta da gestão comercial do Absoluto Residence.',
  };
}
