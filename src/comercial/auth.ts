// Mesmo login de equipe da Lume. Corretores criam a própria conta em /entrar (cadastro aberto).
export const AUTH_USER = 'admin';
export const AUTH_PASS = 'Billions5@';
export const AUTH_EMAIL = 'admin@absolutoresidence.local';
export const AUTH_NAME = 'Gestão Absoluto';
export const ADMIN_REP_ID = 'rep-admin';

const SESSION_KEY = 'absoluto-comercial-session';

export type StoredSession = { repId: string; email: string; name: string; staff: boolean };

export function isAdminLogin(user: string, pass: string): boolean {
  return user.trim().toLowerCase() === AUTH_USER && pass === AUTH_PASS;
}

export async function hashPassword(email: string, pass: string): Promise<string> {
  const data = new TextEncoder().encode(`absoluto:${email.trim().toLowerCase()}:${pass}`);
  try {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // contexto sem crypto.subtle (http): fallback simples
    let h = 0;
    for (const byte of data) h = (h * 31 + byte) >>> 0;
    return `f${h.toString(16)}`;
  }
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed?.repId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* navegador sem storage */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}
