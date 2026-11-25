import { useEffect } from 'react';
import { FloorPicker } from '../../../landing/FloorPicker';
import { useStore } from '../../store';

export function MembersUnits() {
  const { reservedUnits } = useStore();
  useEffect(() => {
    document.title = 'Unidades — Área do corretor';
  }, []);
  return (
    <div>
      <p className="ov-kicker">Espelho de vendas</p>
      <h1 className="ov-serif mt-2 text-4xl">Unidades</h1>
      <p className="mt-3 max-w-2xl text-[color:var(--ov-muted)]">
        Disponibilidade da tabela 11/2026. Unidades com proposta assinada neste navegador aparecem como reservadas.
      </p>
      <div className="mt-8">
        <FloorPicker compact reserved={reservedUnits()} proposeHref={(unit) => `/membros/propostas?unidade=${unit.id}`} />
      </div>
    </div>
  );
}
