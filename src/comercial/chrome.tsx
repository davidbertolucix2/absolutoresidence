import { BrandMark } from '../BrandMark';

export const fieldClass =
  'w-full px-4 py-3 rounded-xl border border-[color:var(--ov-line)] bg-[color:var(--ov-bg)] text-sm text-[color:var(--ov-cream)] placeholder:text-[color:var(--ov-muted)]';
export const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-[color:var(--ov-muted)] mb-1.5';
export const primaryBtn = 'ov-btn ov-btn-gold disabled:opacity-50';
export const secondaryBtn = 'ov-btn ov-btn-ghost';

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${dark ? 'text-[#14110c]' : 'text-[color:var(--ov-cream)]'}`}>
      <BrandMark className="h-8 w-8" />
      <span className="leading-none">
        <span className="ov-serif block text-xl tracking-[0.18em]">ABSOLUTO</span>
        <span className="block text-[9px] font-semibold uppercase tracking-[0.42em] opacity-70">Residence</span>
      </span>
    </span>
  );
}
