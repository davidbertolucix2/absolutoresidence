import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { fieldClass, labelClass, primaryBtn, Wordmark } from '../chrome';
import { formatPhone } from '../format';
import { useStore } from '../store';
import { getUnit, KIND_LABEL } from '../../data/units';

export function LoginPage() {
  const { session, login, signup } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const from = (location.state as { from?: string } | null)?.from || params.get('next') || '/membros';
  const unitId = new URLSearchParams(from.split('?')[1] ?? '').get('unidade');
  const unit = getUnit(unitId);
  const [mode, setMode] = useState<'entrar' | 'cadastro'>(params.get('modo') === 'cadastro' || unit ? 'cadastro' : 'entrar');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [creci, setCreci] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Área do corretor — Absoluto Residence';
  }, []);

  if (session) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const err =
      mode === 'entrar' ? await login(user, pass) : await signup({ fullName, email: user, password: pass, phone, creci });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="ab-auth">
      <div className="ab-auth-photo" aria-hidden="true" />
      <div className="relative z-10 grid min-h-dvh place-items-center px-5 py-10">
        <form className="ov-card ab-glass w-full max-w-md p-7 sm:p-8" onSubmit={submit}>
          <Link to="/" aria-label="Voltar ao site">
            <Wordmark />
          </Link>
          <p className="ov-kicker mt-7">Área do corretor</p>
          <h1 className="ov-serif mt-3 text-3xl">{mode === 'entrar' ? 'Bem-vindo de volta' : 'Crie seu acesso'}</h1>
          <p className="mt-3 text-sm text-[color:var(--ov-muted)]">
            {mode === 'entrar'
              ? 'Carteira de clientes, propostas e contratos do Absoluto Residence.'
              : 'Cadastro aberto a corretores e imobiliárias. Comissão de 8% sobre o valor de venda.'}
          </p>
          {unit ? (
            <p className="mt-4 rounded-xl border border-[color:var(--ov-line)] px-4 py-3 text-sm">
              Proposta para a unidade <strong>{unit.id}</strong> · {KIND_LABEL[unit.kind]}
            </p>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-[color:var(--ov-line)] p-1 text-xs font-semibold uppercase tracking-wide">
            {(['entrar', 'cadastro'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError('');
                }}
                className={`rounded-full py-2 ${mode === item ? 'bg-[color:var(--ov-gold)] text-[#14110c]' : 'text-[color:var(--ov-muted)]'}`}
              >
                {item === 'entrar' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {mode === 'cadastro' ? (
            <>
              <label className="mt-5 block">
                <span className={labelClass}>Nome completo</span>
                <input className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
              </label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>WhatsApp</span>
                  <input className={fieldClass} value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} autoComplete="tel" inputMode="tel" />
                </label>
                <label className="block">
                  <span className={labelClass}>CRECI (opcional)</span>
                  <input className={fieldClass} value={creci} onChange={(e) => setCreci(e.target.value)} placeholder="00000-F/SC" />
                </label>
              </div>
            </>
          ) : null}
          <label className="mt-4 block">
            <span className={labelClass}>{mode === 'entrar' ? 'E-mail ou login' : 'E-mail'}</span>
            <input
              className={fieldClass}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete={mode === 'entrar' ? 'username' : 'email'}
              type={mode === 'entrar' ? 'text' : 'email'}
              required
            />
          </label>
          <label className="mt-4 block">
            <span className={labelClass}>Senha</span>
            <input
              className={fieldClass}
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'}
              minLength={mode === 'cadastro' ? 6 : undefined}
              required
            />
          </label>
          {error ? <p className="mt-3 text-sm text-[color:var(--ov-danger)]">{error}</p> : null}
          <button type="submit" className={`${primaryBtn} mt-6 w-full`} disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'entrar' ? 'Entrar' : 'Criar conta e continuar'}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-[color:var(--ov-muted)]">
            Os dados ficam salvos neste navegador. Use sempre o mesmo aparelho ou exporte o backup em Conta.
          </p>
        </form>
      </div>
    </div>
  );
}
