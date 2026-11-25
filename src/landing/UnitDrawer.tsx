import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BedDouble, Car, Maximize2, X } from 'lucide-react';
import { formatArea, formatBRL, KIND_LABEL, LOFT_FLOOR, unitPlan, type Unit } from '../data/units';
import { computeFlow, FLOW_PRESETS, presetFlow, type FlowKind } from '../data/payment';

type Props = {
  unit: Unit | null;
  reserved?: boolean;
  onClose: () => void;
  proposeHref: (unit: Unit) => string;
};

const SIM_KINDS: FlowKind[] = ['mensal', 'reforcos', 'avista'];

export function UnitDrawer({ unit, reserved = false, onClose, proposeHref }: Props) {
  const [kind, setKind] = useState<FlowKind>('mensal');
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!unit) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (zoom ? setZoom(false) : onClose());
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [unit, onClose, zoom]);

  const free = unit?.status === 'disponivel' && !reserved;
  const sim = unit?.price != null && free ? computeFlow(unit.price, presetFlow(kind)) : null;

  return (
    <AnimatePresence>
      {unit ? (
        <motion.div className="ab-drawer-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="ab-drawer-backdrop" aria-label="Fechar" onClick={onClose} />
          <motion.aside
            className="ab-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Unidade ${unit.id}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="ov-kicker">{unit.floor}º pavimento</p>
                <h3 className="ov-serif mt-2 text-4xl">Unidade {unit.id}</h3>
                <p className="mt-1 text-[color:var(--ov-muted)]">
                  {KIND_LABEL[unit.kind]}
                  {unit.floor === LOFT_FLOOR ? ' com mezanino' : ''}
                </p>
              </div>
              <button type="button" className="ab-icon-btn" onClick={onClose} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <button type="button" className="ab-drawer-plan" onClick={() => setZoom(true)} aria-label="Ampliar planta">
              <img src={unitPlan(unit)} alt={`Planta humanizada da unidade ${unit.id}`} />
              <span>
                <Maximize2 size={14} /> Ampliar
              </span>
            </button>

            <div className="ab-specs">
              <div>
                <Maximize2 size={16} />
                <span>{formatArea(unit.area)}</span>
                <small>área privativa</small>
              </div>
              <div>
                <BedDouble size={16} />
                <span>{unit.bedrooms}</span>
                <small>{unit.bedrooms > 1 ? 'dormitórios' : 'dormitório'}</small>
              </div>
              <div>
                <Car size={16} />
                <span>{free ? unit.box : '—'}</span>
                <small>box</small>
              </div>
            </div>

            {free && sim ? (
              <>
                <div className="ab-price">
                  <small>Valor de tabela</small>
                  <strong>{formatBRL(unit.price ?? 0)}</strong>
                </div>
                <div className="ab-sim">
                  <div className="ab-sim-tabs">
                    {SIM_KINDS.map((k) => (
                      <button key={k} type="button" className={k === kind ? 'is-active' : ''} onClick={() => setKind(k)}>
                        {FLOW_PRESETS[k].label}
                      </button>
                    ))}
                  </div>
                  <ul>
                    {sim.lines.map((line) => (
                      <li key={line.label}>
                        <span>{line.label}</span>
                        <strong>
                          {line.count > 1 ? `${line.count}× ` : ''}
                          {formatBRL(line.each, 2)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                  <p>Simulação com base na tabela 11/2026. Parcelas corrigidas pelo CUB/SC. Condições finais na proposta.</p>
                </div>
                <Link to={proposeHref(unit)} className="ov-btn ov-btn-gold mt-5 w-full" onClick={onClose}>
                  Fazer proposta desta unidade
                </Link>
              </>
            ) : (
              <div className="ab-price is-sold">
                <small>Status</small>
                <strong>{reserved ? 'Reservada' : 'Vendida'}</strong>
                <p className="mt-2 text-sm text-[color:var(--ov-muted)]">Escolha outra unidade do mesmo tipo em outro andar.</p>
              </div>
            )}
          </motion.aside>

          <AnimatePresence>
            {zoom ? (
              <motion.button
                type="button"
                className="ab-zoom"
                onClick={() => setZoom(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-label="Fechar planta ampliada"
              >
                <img src={unitPlan(unit)} alt={`Planta ampliada da unidade ${unit.id}`} />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
