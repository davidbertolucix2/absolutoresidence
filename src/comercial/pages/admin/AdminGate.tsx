import { useEffect } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { Building2, ClipboardCheck, LayoutDashboard, LogOut, Wallet } from 'lucide-react';
import { primaryBtn, secondaryBtn, Wordmark } from '../../chrome';
import { useStore } from '../../store';

const NAV = [
  { to: '/admin', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/admin/cadastros', label: 'Corretores', icon: ClipboardCheck },
  { to: '/admin/comissoes', label: 'Comissões', icon: Wallet },
  { to: '/admin/empresa', label: 'Empresa', icon: Building2 },
];

export function AdminGate() {
  const { session, isStaff, logout, data } = useStore();
  const reps = data.reps.filter((rep) => rep.id !== 'rep-admin');

  useEffect(() => {
    document.title = 'Gestão comercial — Absoluto Residence';
  }, []);

  if (!session) return <Navigate to="/entrar" replace state={{ from: '/admin' }} />;
  if (!isStaff) {
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <div className="ov-card max-w-lg p-8">
          <Wordmark />
          <h1 className="ov-serif mt-6 text-3xl">Sem acesso</h1>
          <p className="mt-3 text-sm text-[color:var(--ov-muted)]">O painel da gestão é só para a conta administradora.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/" className={primaryBtn}>
              Voltar
            </Link>
            <button type="button" className={secondaryBtn} onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pending = reps.filter((rep) => rep.status === 'pendente').length;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="print:hidden flex flex-col border-r border-[color:var(--ov-line)] bg-[color:var(--ov-bg-2)] px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Link to="/" className="px-2">
          <Wordmark />
        </Link>
        <p className="mt-6 truncate px-2 text-xs text-[color:var(--ov-muted)]">{session.name}</p>
        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--ov-gold)]">Gestão</p>
        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive
                    ? 'bg-[color:var(--ov-gold)] text-[#16120c]'
                    : 'text-[color:var(--ov-muted)] hover:bg-white/5 hover:text-[color:var(--ov-cream)]'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
              {item.to === '/admin/cadastros' && pending > 0 ? (
                <span className="ml-auto min-w-5 rounded-full bg-[color:var(--ov-cream)] px-1.5 py-0.5 text-center text-[10px] text-[#16120c]">
                  {pending}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <Link to="/membros" className="px-3 py-2 text-sm text-[color:var(--ov-muted)] hover:text-[color:var(--ov-cream)]">
          Área do corretor
        </Link>
        <button type="button" onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--ov-muted)] hover:text-[color:var(--ov-cream)]">
          <LogOut size={16} /> Sair
        </button>
      </aside>
      <div className="min-w-0">
        <div className="print:hidden sticky top-0 z-30 flex gap-2 overflow-x-auto border-b border-[color:var(--ov-line)] bg-[color:var(--ov-bg-2)] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                  isActive ? 'bg-[color:var(--ov-gold)] text-[#16120c]' : 'bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="max-w-6xl px-5 py-8 sm:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
