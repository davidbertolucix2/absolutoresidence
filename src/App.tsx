import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { StoreProvider } from './comercial/store';
import { LoginPage } from './comercial/pages/Login';
import { AdminGate } from './comercial/pages/admin/AdminGate';
import { AdminOverview } from './comercial/pages/admin/Overview';
import { AdminCadastros } from './comercial/pages/admin/Cadastros';
import { AdminComissoes } from './comercial/pages/admin/Comissoes';
import { AdminEmpresa } from './comercial/pages/admin/Empresa';
import { MembersGate } from './comercial/pages/members/MembersGate';
import { MembersDashboard } from './comercial/pages/members/Dashboard';
import { MembersClients } from './comercial/pages/members/Clients';
import { MembersProposals } from './comercial/pages/members/Proposals';
import { MembersUnits } from './comercial/pages/members/Units';
import { MembersRanking } from './comercial/pages/members/Ranking';
import { MembersAccount } from './comercial/pages/members/Account';
import { Landing } from './Landing';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    if (raw && /^[A-Za-z][\w:-]*$/.test(raw)) {
      document.getElementById(raw)?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <StoreProvider>
          <ScrollManager />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/entrar" element={<LoginPage />} />
            <Route path="/proposta" element={<Navigate to="/membros/propostas" replace />} />
            <Route path="/admin" element={<AdminGate />}>
              <Route index element={<AdminOverview />} />
              <Route path="cadastros" element={<AdminCadastros />} />
              <Route path="comissoes" element={<AdminComissoes />} />
              <Route path="empresa" element={<AdminEmpresa />} />
            </Route>
            <Route path="/membros" element={<MembersGate />}>
              <Route index element={<MembersDashboard />} />
              <Route path="carteira" element={<MembersClients />} />
              <Route path="propostas" element={<MembersProposals />} />
              <Route path="contratos" element={<Navigate to="/membros/propostas" replace />} />
              <Route path="unidades" element={<MembersUnits />} />
              <Route path="ranking" element={<MembersRanking />} />
              <Route path="conta" element={<MembersAccount />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
