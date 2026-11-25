import { useEffect } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Building2, CircleUser, FileText, LayoutDashboard, LogOut, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Wordmark } from '../../chrome';
import { useStore } from '../../store';

const NAV = [
  { to: '/membros', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/membros/carteira', label: 'Clientes', icon: Users },
  { to: '/membros/propostas', label: 'Propostas', icon: FileText },
  { to: '/membros/unidades', label: 'Unidades', icon: Building2 },
  { to: '/membros/ranking', label: 'Ranking', icon: Trophy },
  { to: '/membros/conta', label: 'Conta', icon: CircleUser },
];

export function MembersGate() {
  const { session, currentRep } = useStore();
  const location = useLocation();
  if (!session || !currentRep) {
    return <Navigate to="/entrar" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <MembersLayout />;
}

function MembersLayout() {
  const { currentRep, logout, followupsOf, isStaff } = useStore();
  const followups = currentRep ? followupsOf(currentRep.id) : [];

  useEffect(() => {
    document.title = 'Área do corretor — Absoluto Residence';
  }, []);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="print:hidden hidden flex-col border-r border-[color:var(--ov-line)] bg-[color:var(--ov-bg-2)] px-4 pb-6 pt-6 lg:flex lg:sticky lg:top-0 lg:h-dvh">
        <Link to="/" className="px-2">
          <Wordmark />
        </Link>
        <p className="mt-6 truncate px-2 text-xs text-[color:var(--ov-muted)]">{currentRep?.fullName}</p>
        {currentRep?.creci ? <p className="px-2 text-[10px] uppercase tracking-widest text-[color:var(--ov-gold)]">CRECI {currentRep.creci}</p> : null}
        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive
                    ? 'bg-[color:var(--ov-gold)] text-[#14110c]'
                    : 'text-[color:var(--ov-muted)] hover:bg-white/5 hover:text-[color:var(--ov-cream)]'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {isStaff ? (
          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--ov-muted)] hover:text-[color:var(--ov-cream)]">
            <ShieldCheck size={16} /> Painel da gestão
          </Link>
        ) : null}
        <button type="button" onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--ov-muted)] hover:text-[color:var(--ov-cream)]">
          <LogOut size={16} /> Sair
        </button>
      </aside>
      <div className="min-w-0">
        <div className="print:hidden sticky top-0 z-30 border-b border-[color:var(--ov-line)] bg-[color:var(--ov-bg-2)]/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 pt-3">
            <Link to="/">
              <Wordmark />
            </Link>
            <button type="button" onClick={logout} className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ov-muted)]">
              Sair
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                    isActive ? 'bg-[color:var(--ov-gold)] text-[#14110c]' : 'bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isStaff ? (
              <NavLink to="/admin" className="shrink-0 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
                Gestão
              </NavLink>
            ) : null}
          </div>
        </div>
        <div className="max-w-6xl px-5 py-8 sm:px-8 print:m-0 print:max-w-none print:p-0">
          {followups.length > 0 ? (
            <div className="print:hidden mb-6 rounded-2xl bg-[color:var(--ov-gold)] px-4 py-3 text-sm font-semibold text-[#14110c]">
              {followups.length} cliente(s) sem contato há 7 dias.{' '}
              <Link to="/membros/carteira" className="underline">
                Abrir clientes
              </Link>
            </div>
          ) : null}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
