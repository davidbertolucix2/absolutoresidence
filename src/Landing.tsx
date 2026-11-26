import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Calendar, MapPin, Menu, X } from 'lucide-react';
import { Wordmark } from './comercial/chrome';
import { FloorPicker } from './landing/FloorPicker';
import { UnitDrawer } from './landing/UnitDrawer';
import {
  ADDRESS,
  AVAILABLE_UNITS,
  BUILDER,
  formatArea,
  formatBRL,
  KIND_LABEL,
  KIND_SHORT,
  minPrice,
  TABLE_DATE,
  type Unit,
  type UnitKind,
} from './data/units';

const proposeHref = (unit: Unit) => `/membros/propostas?unidade=${unit.id}`;

const NAV = [
  { to: '/projeto', label: 'O projeto' },
  { to: '/lazer', label: 'Lazer' },
  { to: '/unidades', label: 'Unidades e tabela' },
  { to: '/localizacao', label: 'Localização' },
];

/** Vídeos gerados (Kling). Deixe vazio para usar só a imagem. */
const HERO_VIDEO = '';

const AMENITIES = [
  'Piscina adulto com raia integrada',
  'Piscina infantil',
  'Prainha',
  'Bar molhado',
  'Bangalôs',
  'Deck solarium',
  'Estar float',
  'Academia',
  'Salão de festas',
  'Gourmet externo',
  'Pizza wine bar',
  'Fireplace',
  'Estar com pergolado',
  'Coworking',
  'Smart market',
  'Brinquedoteca',
  'Lavanderia',
  'Pet place',
];

const GALLERY = [
  { src: '/img/piscina.jpg', title: 'Piscina com raia', text: 'Lâmina d’água entre colunas clássicas, com prainha e estar float.' },
  { src: '/img/bangalos.jpg', title: 'Bangalôs', text: 'Daybeds com cortinas de linho no deck solarium.' },
  { src: '/img/pizza-wine-bar.jpg', title: 'Pizza wine bar', text: 'Forno a lenha, adega climatizada e balcão para receber.' },
  { src: '/img/academia.jpg', title: 'Academia', text: 'Equipada, com luz natural e acesso direto ao jardim.' },
  { src: '/img/salao-festas.jpg', title: 'Salão de festas', text: 'Cozinha integrada e brinquedoteca ao lado.' },
  { src: '/img/hall.jpg', title: 'Hall social', text: 'Boiserie, sanca iluminada e mármore: o neoclássico na chegada.' },
];

const TYPOLOGIES: { kind: UnitKind; img: string; area: string; text: string }[] = [
  { kind: 'studio', img: '/img/cozinha-studio.jpg', area: '31,5 m²', text: 'Living integrado, cozinha completa, dormitório com closet e BWC. Ideal para morar ou locação por temporada.' },
  { kind: 'apto', img: '/img/apto-2d.jpg', area: '52 m²', text: 'Dois dormitórios, living de 19,8 m² e sacada, nas pontas do edifício.' },
  { kind: 'loft', img: '/img/loft-interior.jpg', area: '50 a 70 m²', text: 'Pé-direito duplo com mezanino, no 11º pavimento. Só cinco disponíveis.' },
];

export function SiteLayout({ children, title }: { children: ReactNode; title: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title;
    setMenu(false);
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [title, pathname]);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div className="ab-site">
      <motion.div className="ab-progress" style={{ scaleX: progress }} />
      <header className={`ov-nav ${scrolled || pathname !== '/' ? 'is-scrolled' : ''}`}>
        <div className="ov-wrap flex h-[72px] items-center justify-between gap-4">
          <Link to="/" aria-label="Absoluto Residence — início">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] font-medium tracking-wide text-[color:var(--ov-cream)]/80 lg:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `ab-navlink ${isActive ? 'is-active' : ''}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/entrar" className="hidden text-[13px] font-medium text-[color:var(--ov-cream)]/70 hover:text-[color:var(--ov-cream)] sm:inline">
              Área do corretor
            </Link>
            <Link to="/membros/propostas" className="ov-btn ov-btn-gold whitespace-nowrap !px-4 !py-2 text-xs sm:!px-5 sm:!py-2.5 sm:text-sm">
              Fazer proposta
            </Link>
            <button type="button" className="ab-icon-btn lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menu">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {menu ? (
        <div className="ab-menu">
          <div className="ov-wrap flex h-[72px] items-center justify-between">
            <Link to="/">
              <Wordmark />
            </Link>
            <button type="button" className="ab-icon-btn" onClick={() => setMenu(false)} aria-label="Fechar menu">
              <X size={18} />
            </button>
          </div>
          <nav className="ov-wrap mt-6 flex flex-col">
            {[{ to: '/', label: 'Início' }, ...NAV].map((item, i) => (
              <motion.div key={item.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={item.to} className="ov-serif block border-b border-[color:var(--ov-line)] py-4 text-3xl">
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <Link to="/membros/propostas" className="ov-btn ov-btn-gold mt-8">
              Fazer proposta
            </Link>
            <Link to="/entrar" className="ov-btn ov-btn-ghost mt-3">
              Área do corretor
            </Link>
          </nav>
        </div>
      ) : null}

      <motion.main key={pathname} id="topo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}

/* --------------------------------- PÁGINAS -------------------------------- */

export function HomePage() {
  return (
    <SiteLayout title="Absoluto Residence — Porto Belo/SC · Estilo neoclássico">
      <Hero />
      <HomeIntro />
      <ZoomReveal src="/img/hero-noturna.jpg" kicker="A fachada" title="Neoclássico ao anoitecer." text="Colunas, cornijas e iluminação cênica: um edifício pensado para ser lembrado." />
      <Explore />
      <Closing />
    </SiteLayout>
  );
}

export function ProjetoPage() {
  return (
    <SiteLayout title="O projeto — Absoluto Residence">
      <PageHero img="/img/fachada-frontal.jpg" kicker="O projeto" title="O clássico que permanece." text="Arquitetura neoclássica, três tipologias e lazer de resort a poucos minutos do mar." />
      <Concept />
      <Typologies />
      <NextPage to="/lazer" label="Lazer de resort" img="/img/piscina.jpg" />
    </SiteLayout>
  );
}

export function LazerPage() {
  return (
    <SiteLayout title="Lazer — Absoluto Residence">
      <PageHero img="/img/piscina.jpg" kicker="Lazer de resort" title="Viver bem, sem sair de casa." text="Mais de 20 itens de lazer, da piscina com raia ao pizza wine bar." />
      <ZoomReveal src="/img/bangalos.jpg" kicker="Deck solarium" title="Bangalôs para desacelerar." text="Daybeds com cortinas de linho, prainha e bar molhado." />
      <Amenities />
      <NextPage to="/unidades" label="Escolha sua unidade" img="/img/loft-interior.jpg" />
    </SiteLayout>
  );
}

export function UnidadesPage() {
  return (
    <SiteLayout title="Unidades e tabela — Absoluto Residence">
      <PageHero img="/img/loft-interior.jpg" kicker={`Tabela de ${TABLE_DATE}`} title="Escolha o andar. Toque na unidade." text="Planta, área, box, valor de tabela e simulação de pagamento de cada unidade disponível." compact />
      <Picker />
      <PriceTable />
      <NextPage to="/localizacao" label="Localização" img="/img/localizacao-aerea.jpg" />
    </SiteLayout>
  );
}

export function LocalizacaoPage() {
  return (
    <SiteLayout title="Localização — Absoluto Residence">
      <PageHero img="/img/localizacao-aerea.jpg" kicker="Localização" title="Porto Belo, entre o mar e a serra." text="Acesso rápido à BR-101, às praias de Porto Belo e Bombinhas, a Itapema e a Balneário Camboriú." />
      <Location />
      <Closing />
    </SiteLayout>
  );
}

/* ------------------------------ BLOCOS NOVOS ------------------------------ */

function PageHero({ img, kicker, title, text, compact = false }: { img: string; kicker: string; title: string; text: string; compact?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return (
    <section ref={ref} className={`ab-page-hero ${compact ? 'is-compact' : ''}`}>
      <motion.div className="ab-page-hero-media" style={{ y }}>
        <motion.img src={img} alt="" initial={{ scale: 1.18 }} animate={{ scale: 1.04 }} transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }} />
      </motion.div>
      <div className="ab-hero-shade" />
      <motion.div className="ov-wrap relative z-10" style={{ opacity: fade }}>
        <motion.p className="ov-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
          {kicker}
        </motion.p>
        <h1 className="ov-serif mt-4 max-w-4xl text-5xl leading-[1.02] sm:text-7xl">
          <span className="ab-line">
            <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
              {title}
            </motion.span>
          </span>
        </h1>
        <motion.p className="mt-5 max-w-xl text-[color:var(--ov-cream)]/80" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}>
          {text}
        </motion.p>
      </motion.div>
    </section>
  );
}

/** Efeito de aproximação: a imagem começa como um quadro pequeno e cresce até ocupar a tela. */
function ZoomReveal({ src, kicker, title, text }: { src: string; kicker: string; title: string; text: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const clip = useTransform(scrollYProgress, [0, 0.6], ['inset(22% 30% 22% 30% round 28px)', 'inset(0% 0% 0% 0% round 0px)']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.45, 0.7], [40, 0]);
  return (
    <section ref={ref} className="ab-zoomreveal">
      <div className="ab-zoomreveal-sticky">
        <motion.div className="ab-zoomreveal-frame" style={{ clipPath: clip }}>
          <motion.img src={src} alt={title} style={{ scale }} loading="lazy" />
          <div className="ab-zoomreveal-shade" />
        </motion.div>
        <motion.div className="ov-wrap ab-zoomreveal-text" style={{ opacity: textOpacity, y: textY }}>
          <p className="ov-kicker">{kicker}</p>
          <h2 className="ov-serif mt-3 max-w-3xl text-4xl sm:text-6xl">{title}</h2>
          <p className="mt-4 max-w-lg text-[color:var(--ov-cream)]/80">{text}</p>
        </motion.div>
      </div>
    </section>
  );
}

function HomeIntro() {
  return (
    <section id="conceito" className="ab-section">
      <div className="ov-wrap">
        <Reveal>
          <p className="ov-kicker">O conceito</p>
        </Reveal>
        <WordsReveal text="Colunas, frontões e cornijas que atravessam o tempo. Um edifício que não segue tendência: ele fica." />
        <Reveal>
          <Link to="/projeto" className="ov-btn ov-btn-ghost mt-10">
            Conhecer o projeto <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

const EXPLORE = [
  { to: '/projeto', label: 'O projeto', text: 'Conceito, números e tipologias', img: '/img/fachada-frontal.jpg' },
  { to: '/lazer', label: 'Lazer', text: 'Piscina, bangalôs, academia e mais', img: '/img/piscina.jpg' },
  { to: '/unidades', label: 'Unidades e tabela', text: 'Escolha o andar e a unidade', img: '/img/loft-interior.jpg' },
  { to: '/localizacao', label: 'Localização', text: 'Porto Belo, perto do mar', img: '/img/localizacao-aerea.jpg' },
];

function Explore() {
  return (
    <section className="ab-section">
      <div className="ov-wrap">
        <Reveal>
          <p className="ov-kicker">Explore</p>
          <h2 className="ov-serif mt-3 text-4xl sm:text-6xl">Conheça o Absoluto por partes.</h2>
        </Reveal>
        <div className="ab-explore mt-12">
          {EXPLORE.map((item, i) => (
            <Reveal key={item.to} delay={i * 0.08}>
              <Link to={item.to} className="ab-explore-card">
                <img src={item.img} alt="" loading="lazy" />
                <span className="ab-explore-shade" />
                <span className="ab-explore-text">
                  <small>0{i + 1}</small>
                  <strong className="ov-serif">{item.label}</strong>
                  <em>{item.text}</em>
                </span>
                <ArrowUpRight className="ab-explore-arrow" size={20} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function NextPage({ to, label, img }: { to: string; label: string; img: string }) {
  return (
    <section className="ab-section !pt-0">
      <div className="ov-wrap">
        <Link to={to} className="ab-next">
          <img src={img} alt="" loading="lazy" />
          <span className="ab-explore-shade" />
          <span className="ab-next-text">
            <small>Próxima página</small>
            <strong className="ov-serif">{label}</strong>
          </span>
          <ArrowRight className="ab-explore-arrow" size={22} />
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------- HERO --------------------------------- */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  return (
    <section ref={ref} className="ab-hero" aria-label="Absoluto Residence">
      <motion.div className="ab-hero-media" style={{ y, scale }}>
        {HERO_VIDEO ? (
          <video src={HERO_VIDEO} poster="/img/hero-noturna.jpg" autoPlay muted loop playsInline />
        ) : (
          <img src="/img/hero-noturna.jpg" alt="Fachada noturna do Absoluto Residence" fetchPriority="high" />
        )}
      </motion.div>
      <div className="ab-hero-shade" />
      <motion.div className="ov-wrap ab-hero-content" style={{ opacity: fade, y: lift }}>
        <motion.p className="ov-kicker" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
          Porto Belo · Santa Catarina
        </motion.p>
        <h1 className="ab-hero-title ov-serif">
          {['O clássico', 'que permanece.'].map((line, i) => (
            <span key={line} className="ab-line">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35 + i * 0.15, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="ab-hero-sub"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.9 }}
        >
          Absoluto Residence. Arquitetura neoclássica, lazer de resort e studios, apartamentos e lofts a poucos minutos do mar. Em até 72× direto com a construtora.
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.9 }}>
          <Link to="/unidades" className="ov-btn ov-btn-gold">
            Escolher minha unidade
          </Link>
          <Link to="/membros/propostas" className="ov-btn ov-btn-ghost">
            Fazer proposta <ArrowUpRight size={16} />
          </Link>
        </motion.div>
        <motion.dl className="ab-hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}>
          <div>
            <dt>Studios</dt>
            <dd>31,5 m²</dd>
          </div>
          <div>
            <dt>Aptos 2 dorm.</dt>
            <dd>52 m²</dd>
          </div>
          <div>
            <dt>Lofts duplex</dt>
            <dd>até 70 m²</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>dez/2029</dd>
          </div>
        </motion.dl>
      </motion.div>
      <a href="#conceito" className="ab-scroll-cue" aria-label="Rolar para o conceito">
        <span />
        <ArrowDown size={14} />
      </a>
    </section>
  );
}

/* --------------------------------- CONCEITO -------------------------------- */

function Parallax({ src, alt, strength = 14, className = '' }: { src: string; alt: string; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <div ref={ref} className={`ab-parallax ${className}`}>
      <motion.img src={src} alt={alt} style={{ y }} loading="lazy" />
    </div>
  );
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function WordsReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className="ab-manifesto ov-serif">
      {words.map((word, i) => (
        <Word key={`${word}-${i}`} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

function Concept() {
  return (
    <section className="ab-section">
      <div className="ov-wrap">
        <Reveal>
          <p className="ov-kicker">O conceito</p>
        </Reveal>
        <WordsReveal text="Colunas, frontões e cornijas que atravessam o tempo. Um edifício que não segue tendência: ele fica. Absoluto é a elegância do estilo neoclássico com a vida prática de quem quer morar, investir e descansar perto do mar." />
        <div className="ab-concept-grid mt-16">
          <Parallax src="/img/fachada-frontal.jpg" alt="Fachada frontal ao entardecer" className="ab-concept-tall" strength={10} />
          <div className="flex flex-col justify-between gap-10">
            <Reveal>
              <div className="ab-figures">
                <div>
                  <strong>{AVAILABLE_UNITS.length}</strong>
                  <span>unidades disponíveis na tabela de {TABLE_DATE}</span>
                </div>
                <div>
                  <strong>20+</strong>
                  <span>itens de lazer, do bar molhado ao fireplace</span>
                </div>
                <div>
                  <strong>72×</strong>
                  <span>parcelamento direto com a {BUILDER}, corrigido pelo CUB/SC</span>
                </div>
              </div>
            </Reveal>
            <Parallax src="/img/piscina.jpg" alt="Piscina sob o edifício" className="ab-concept-wide" strength={12} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- LAZER --------------------------------- */

function Amenities() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-68%']);

  return (
    <section id="lazer" ref={ref} className="ab-hscroll">
      <div className="ab-hscroll-sticky">
        <div className="ov-wrap flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ov-kicker">Lazer de resort</p>
            <h2 className="ov-serif mt-3 text-4xl sm:text-6xl">Viver bem, sem sair de casa.</h2>
          </div>
          <p className="max-w-sm text-[color:var(--ov-muted)]">Role para percorrer as áreas comuns. Perspectivas artísticas do projeto.</p>
        </div>
        <motion.div className="ab-hscroll-track" style={{ x }}>
          {GALLERY.map((item, i) => (
            <figure key={item.src} className="ab-hcard">
              <div className="ab-hcard-img">
                <img src={item.src} alt={item.title} loading="lazy" />
              </div>
              <figcaption>
                <span>0{i + 1}</span>
                <strong className="ov-serif">{item.title}</strong>
                <small>{item.text}</small>
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
      <div className="ab-amenities-mobile ov-wrap">
        {GALLERY.map((item) => (
          <figure key={item.src} className="ab-hcard">
            <div className="ab-hcard-img">
              <img src={item.src} alt={item.title} loading="lazy" />
            </div>
            <figcaption>
              <strong className="ov-serif">{item.title}</strong>
              <small>{item.text}</small>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="ov-wrap ab-amenity-list">
        {AMENITIES.map((item, i) => (
          <Reveal key={item} delay={(i % 6) * 0.04}>
            <span>{item}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- PICKER --------------------------------- */

function Picker() {
  return (
    <section id="unidades" className="ab-section ab-picker-section">
      <div className="ov-wrap">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ov-kicker">Escolha sua unidade</p>
              <h2 className="ov-serif mt-3 text-4xl sm:text-6xl">Escolha o andar.<br />Toque na unidade.</h2>
            </div>
            <p className="max-w-sm text-[color:var(--ov-muted)]">
              Planta, área, box e valor de tabela de cada unidade disponível. Monte a simulação e siga para a proposta.
            </p>
          </div>
        </Reveal>
        <FloorPicker proposeHref={proposeHref} />
      </div>
    </section>
  );
}

/* ------------------------------- TIPOLOGIAS ------------------------------- */

function Typologies() {
  return (
    <section className="ab-section">
      <div className="ov-wrap">
        <Reveal>
          <p className="ov-kicker">Tipologias</p>
          <h2 className="ov-serif mt-3 max-w-3xl text-4xl sm:text-6xl">Três formas de morar o Absoluto.</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TYPOLOGIES.map((item, i) => {
            const count = AVAILABLE_UNITS.filter((u) => u.kind === item.kind).length;
            return (
              <Reveal key={item.kind} delay={i * 0.1}>
                <article className="ab-typo">
                  <Parallax src={item.img} alt={KIND_LABEL[item.kind]} strength={8} className="ab-typo-img" />
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ov-gold-2)]">{item.area}</p>
                    <h3 className="ov-serif mt-2 text-3xl">{KIND_LABEL[item.kind]}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[color:var(--ov-muted)]">{item.text}</p>
                    <div className="mt-5 flex items-end justify-between border-t border-[color:var(--ov-line)] pt-4">
                      <div>
                        <small className="text-[11px] uppercase tracking-widest text-[color:var(--ov-muted)]">a partir de</small>
                        <p className="ov-serif text-2xl">{formatBRL(minPrice(item.kind))}</p>
                      </div>
                      <span className="text-xs text-[color:var(--ov-muted)]">{count} disponíve{count === 1 ? 'l' : 'is'}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- TABELA --------------------------------- */

function PriceTable() {
  const [filter, setFilter] = useState<'todos' | UnitKind>('todos');
  const [sort, setSort] = useState<'unidade' | 'preco'>('unidade');
  const [unit, setUnit] = useState<Unit | null>(null);
  const rows = useMemo(() => {
    const list = AVAILABLE_UNITS.filter((u) => filter === 'todos' || u.kind === filter);
    return list.slice().sort((a, b) => (sort === 'preco' ? (a.price ?? 0) - (b.price ?? 0) : Number(a.id) - Number(b.id)));
  }, [filter, sort]);

  return (
    <section id="tabela" className="ab-section">
      <div className="ov-wrap">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="ov-kicker">Tabela de vendas · {TABLE_DATE}</p>
              <h2 className="ov-serif mt-3 text-4xl sm:text-6xl">Unidades disponíveis</h2>
              <p className="mt-3 max-w-xl text-[color:var(--ov-muted)]">
                Entrada + saldo em até 72× direto com a construtora. Valores corrigidos pelo CUB/SC. Box para moto (2 m²): {formatBRL(37000)}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['todos', 'studio', 'apto', 'loft'] as const).map((item) => (
                <button key={item} type="button" className={`ab-chip ${filter === item ? 'is-active' : ''}`} onClick={() => setFilter(item)}>
                  {item === 'todos' ? 'Todas' : KIND_SHORT[item]}
                </button>
              ))}
              <button type="button" className="ab-chip" onClick={() => setSort((s) => (s === 'unidade' ? 'preco' : 'unidade'))}>
                Ordenar: {sort === 'unidade' ? 'andar' : 'preço'}
              </button>
            </div>
          </div>
        </Reveal>
        <div className="ab-table mt-10">
          <div className="ab-table-head">
            <span>Unidade</span>
            <span>Tipo</span>
            <span className="hidden sm:block">Área</span>
            <span className="hidden md:block">Dorm.</span>
            <span className="hidden md:block">Box</span>
            <span className="text-right">Valor</span>
          </div>
          {rows.map((u) => (
            <button key={u.id} type="button" className="ab-table-row" onClick={() => setUnit(u)}>
              <span className="ov-serif text-xl">{u.id}</span>
              <span>{KIND_SHORT[u.kind]}</span>
              <span className="hidden sm:block">{formatArea(u.area)}</span>
              <span className="hidden md:block">{u.bedrooms}</span>
              <span className="hidden md:block">{u.box}</span>
              <span className="text-right font-semibold">{formatBRL(u.price ?? 0)}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-[color:var(--ov-muted)]">
          Tabela sujeita a alteração sem aviso prévio. Frações podem sofrer pequena variação de área em virtude do desmembramento.
        </p>
      </div>
      <UnitDrawer unit={unit} onClose={() => setUnit(null)} proposeHref={proposeHref} />
    </section>
  );
}

/* ------------------------------- LOCALIZAÇÃO ------------------------------ */

function Location() {
  return (
    <section id="localizacao" className="ab-section">
      <div className="ov-wrap grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="ov-kicker">Localização</p>
          <h2 className="ov-serif mt-3 text-4xl sm:text-6xl">Porto Belo, entre o mar e a serra.</h2>
          <p className="mt-5 max-w-lg text-[color:var(--ov-muted)]">
            Na Av. Francisco Severiano dos Santos, com acesso rápido à BR-101, às praias de Porto Belo e Bombinhas e a Itapema e Balneário Camboriú.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[color:var(--ov-gold)]" />
              {ADDRESS}
            </li>
            <li className="flex gap-3">
              <Calendar size={18} className="mt-0.5 shrink-0 text-[color:var(--ov-gold)]" />
              Início de obra previsto para nov/2026 · entrega prevista para dez/2029
            </li>
          </ul>
          <a
            className="ov-btn ov-btn-ghost mt-8"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Av. Francisco Severiano dos Santos, 717, Porto Belo, SC')}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir no Google Maps <ArrowUpRight size={16} />
          </a>
        </Reveal>
        <Parallax src="/img/localizacao-aerea.jpg" alt="Vista aérea da região com o mar ao fundo" className="ab-location-img" strength={10} />
      </div>
      <div className="ov-wrap mt-10">
        <div className="ab-map">
          <iframe
            title="Mapa do Absoluto Residence"
            src={`https://www.google.com/maps?q=${encodeURIComponent('Av. Francisco Severiano dos Santos, 717, Porto Belo - SC')}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- CLOSING -------------------------------- */

function Closing() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-18%', '18%']);
  return (
    <section ref={ref} className="ab-closing">
      <motion.img src="/img/bangalos.jpg" alt="" style={{ y }} aria-hidden="true" />
      <div className="ab-closing-shade" />
      <div className="ov-wrap relative z-10 text-center">
        <Reveal>
          <p className="ov-kicker justify-center">Corretores e clientes</p>
          <h2 className="ov-serif mx-auto mt-4 max-w-3xl text-4xl sm:text-6xl">Escolheu a unidade? Faça sua proposta agora.</h2>
          <p className="mx-auto mt-5 max-w-xl text-[color:var(--ov-cream)]/75">
            Cadastro aberto para corretores. Cliente cadastrado, fluxo de pagamento da tabela e contrato pronto para assinar. Comissão de 8%.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/membros/propostas" className="ov-btn ov-btn-gold">
              Fazer proposta
            </Link>
            <Link to="/entrar?modo=cadastro" className="ov-btn ov-btn-ghost">
              Quero ser corretor parceiro
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[color:var(--ov-line)] py-12">
      <div className="ov-wrap grid gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-[color:var(--ov-muted)]">
            Realização {BUILDER}. {ADDRESS}. Matrículas 13.904 e 13.892 RI Porto Belo/SC. Imagens, perspectivas e plantas humanizadas são ilustrativas; mobiliário e
            decoração não fazem parte do contrato. Valores da tabela de {TABLE_DATE}, sujeitos a alteração e à disponibilidade.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm md:items-end">
          <Link to="/entrar" className="text-[color:var(--ov-cream)]/80 hover:text-[color:var(--ov-cream)]">
            Área do corretor
          </Link>
          <Link to="/membros/propostas" className="text-[color:var(--ov-gold-2)]">
            Fazer proposta
          </Link>
          <span className="text-xs text-[color:var(--ov-muted)]">© {new Date().getFullYear()} Absoluto Residence</span>
        </div>
      </div>
    </footer>
  );
}
