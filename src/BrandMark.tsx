type BrandMarkProps = {
  className?: string;
  title?: string;
};

// Monograma "A" sobre frontão neoclássico.
export function BrandMark({ className, title = 'Absoluto Residence' }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title}>
      <rect width="48" height="48" rx="12" fill="#0d1420" />
      <rect x="0.6" y="0.6" width="46.8" height="46.8" rx="11.4" fill="none" stroke="rgba(201,169,110,0.35)" />
      <path d="M10 17.5 24 9.5l14 8" fill="none" stroke="#C9A96E" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 38.5h24" stroke="#C9A96E" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16.2 35.5 24 16.8l7.8 18.7M19.1 28.6h9.8" fill="none" stroke="#EAD7B0" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
