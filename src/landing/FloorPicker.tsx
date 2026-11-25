import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Layers } from 'lucide-react';
import {
  availableOnFloor,
  FLOORS,
  floorLabel,
  floorPlan,
  formatArea,
  formatBRL,
  KIND_SHORT,
  LOFT_FLOOR,
  PLAN_SLOTS,
  unitsOnFloor,
  type Unit,
} from '../data/units';
import { UnitDrawer } from './UnitDrawer';

// Faixas de cada pavimento sobre a fachada (coordenadas da imagem 1340×1787). Ilustrativo.
const FACADE_W = 1340;
const FACADE_H = 1787;
const BANDS: Record<number, [number, number]> = {
  15: [84, 156],
  14: [156, 228],
  13: [228, 300],
  12: [300, 372],
  11: [372, 472],
  10: [472, 552],
  9: [552, 632],
  8: [632, 712],
  7: [712, 792],
  6: [792, 872],
};

function bandPolygon(floor: number) {
  const [top, bottom] = BANDS[floor];
  const left = (y: number) => 548 - ((y - 84) / 788) * 40;
  const right = (y: number) => 800 + ((y - 84) / 788) * 32;
  return `${left(top)},${top} ${right(top)},${top} ${right(bottom)},${bottom} ${left(bottom)},${bottom}`;
}

type Props = {
  reserved?: Record<string, unknown>;
  proposeHref: (unit: Unit) => string;
  compact?: boolean;
};

export function FloorPicker({ reserved = {}, proposeHref, compact = false }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [floor, setFloor] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const lit = hover ?? floor;
  const isFree = (u: Unit) => u.status === 'disponivel' && !reserved[u.id];
  const units = useMemo(() => (floor ? unitsOnFloor(floor) : []), [floor]);
  const freeCount = (f: number) => unitsOnFloor(f).filter(isFree).length;

  return (
    <div className={`ab-picker ${compact ? 'is-compact' : ''}`}>
      <div className="ab-tower">
        <img src="/img/fachada-frontal.jpg" alt="Fachada do Absoluto Residence" loading="lazy" />
        <svg viewBox={`0 0 ${FACADE_W} ${FACADE_H}`} preserveAspectRatio="xMidYMid slice" aria-label="Pavimentos do edifício">
          {FLOORS.map((f) => {
            const free = freeCount(f);
            return (
              <g key={f}>
                <polygon
                  points={bandPolygon(f)}
                  className={`ab-band ${lit === f ? 'is-lit' : ''} ${floor === f ? 'is-active' : ''} ${free === 0 ? 'is-soldout' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${floorLabel(f)}: ${free} unidade(s) disponível(is)`}
                  onMouseEnter={() => setHover(f)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(f)}
                  onBlur={() => setHover(null)}
                  onClick={() => setFloor(f)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFloor(f);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
        <AnimatePresence>
          {lit ? (
            <motion.div
              key={lit}
              className="ab-tower-tip"
              style={{ top: `${(((BANDS[lit][0] + BANDS[lit][1]) / 2) / FACADE_H) * 100}%` }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <strong>{lit}º</strong>
              <span>{lit === LOFT_FLOOR ? 'Lofts duplex' : `${freeCount(lit)} disponíve${freeCount(lit) === 1 ? 'l' : 'is'}`}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <p className="ab-tower-hint">
          <Layers size={14} /> Passe o dedo ou o mouse pela torre e toque no andar
        </p>
      </div>

      <div className="ab-floor-panel">
        <AnimatePresence mode="wait">
          {floor == null ? (
            <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <p className="ov-kicker">Escolha seu andar</p>
              <h3 className="ov-serif mt-3 text-3xl sm:text-4xl">Do 6º ao 15º pavimento</h3>
              <p className="mt-3 max-w-md text-[color:var(--ov-muted)]">
                Seis unidades por andar: studios de 31,5 m², apartamentos de 2 dormitórios com 52 m² nas pontas e, no 11º, lofts duplex com mezanino.
              </p>
              <ul className="ab-floor-list mt-6">
                {[...FLOORS].reverse().map((f) => {
                  const free = freeCount(f);
                  return (
                    <li key={f}>
                      <button
                        type="button"
                        onMouseEnter={() => setHover(f)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => setFloor(f)}
                        className={free === 0 ? 'is-soldout' : ''}
                      >
                        <span className="ab-floor-num">{f}º</span>
                        <span className="ab-floor-meta">{f === LOFT_FLOOR ? 'Lofts duplex' : 'Studios + 2 dorm.'}</span>
                        <span className="ab-floor-count">{free === 0 ? 'Vendido' : `${free} livre${free > 1 ? 's' : ''}`}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ) : (
            <motion.div key={floor} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <button type="button" className="ab-back" onClick={() => setFloor(null)}>
                <ArrowLeft size={14} /> Todos os andares
              </button>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="ov-kicker">{floor === LOFT_FLOOR ? 'Lofts duplex com mezanino' : 'Pavimento tipo'}</p>
                  <h3 className="ov-serif mt-2 text-3xl sm:text-4xl">{floorLabel(floor)}</h3>
                </div>
                <div className="flex gap-1">
                  {[...FLOORS].reverse().map((f) => (
                    <button key={f} type="button" className={`ab-mini-floor ${f === floor ? 'is-active' : ''}`} onClick={() => setFloor(f)} aria-label={`${f}º pavimento`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ab-plan-scroll mt-5">
                <div className="ab-plan">
                  <img src={floorPlan(floor)} alt={`Planta do ${floor}º pavimento`} loading="lazy" />
                  {units.map((u) => {
                    const slot = PLAN_SLOTS[u.position];
                    const free = isFree(u);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        className={`ab-slot ${free ? 'is-free' : 'is-sold'}`}
                        style={{ left: `${slot.left}%`, width: `${slot.width}%` }}
                        onClick={() => setUnit(u)}
                        aria-label={`Unidade ${u.id} ${free ? 'disponível' : 'vendida'}`}
                      >
                        <span>
                          {u.id}
                          <small>{free ? formatBRL(u.price ?? 0) : reserved[u.id] ? 'Reservada' : 'Vendida'}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-2 text-xs text-[color:var(--ov-muted)] sm:hidden">Arraste a planta para os lados · toque numa unidade</p>

              <div className="ab-unit-grid mt-5">
                {units
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((u) => {
                    const free = isFree(u);
                    return (
                      <button key={u.id} type="button" className={`ab-unit-card ${free ? '' : 'is-sold'}`} onClick={() => setUnit(u)}>
                        <span className="ab-unit-id">{u.id}</span>
                        <span className="ab-unit-kind">
                          {KIND_SHORT[u.kind]} · {formatArea(u.area)}
                        </span>
                        <span className="ab-unit-price">{free ? formatBRL(u.price ?? 0) : reserved[u.id] ? 'Reservada' : 'Vendida'}</span>
                      </button>
                    );
                  })}
              </div>
              <p className="mt-4 text-xs text-[color:var(--ov-muted)]">
                {availableOnFloor(floor)} unidade(s) disponível(is) na tabela neste andar. Plantas humanizadas, ilustrativas.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UnitDrawer unit={unit} reserved={Boolean(unit && reserved[unit.id])} onClose={() => setUnit(null)} proposeHref={proposeHref} />
    </div>
  );
}
