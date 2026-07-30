'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  FileText,
  MapPin,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Target,
  Search,
  Building2,
  Share2,
  LayoutTemplate,
  BarChart3,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --------------------------------------------------
// Fulvora Digital — Phase 1 Marketing Site
// Sections: Navbar, Hero, Marquee, Positioning, Services, Footer
// --------------------------------------------------

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Who We Help', href: '#who' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const LOCALITIES = [
  'Wakad', 'Hinjewadi', 'Baner', 'Aundh', 'Kothrud', 'Viman Nagar',
  'Pimpri', 'Chinchwad', 'Nigdi', 'Akurdi', 'Ravet', 'Deccan',
];

const OPTIMIZE_ITEMS = [
  { icon: Phone, label: 'Phone Calls', desc: 'Direct dial from ads', value: 82, color: '#6D28D9' },
  { icon: MessageCircle, label: 'WhatsApp Messages', desc: 'Click-to-chat leads', value: 74, color: '#10B981' },
  { icon: FileText, label: 'Lead Form Fills', desc: 'Qualified enquiries', value: 68, color: '#8B5CF6' },
  { icon: MapPin, label: 'Store Visits', desc: 'Local footfall lift', value: 61, color: '#312E81' },
];

const SERVICES = [
  { icon: Target, title: 'Meta Ads', desc: 'Facebook & Instagram campaigns crafted for calls, messages and store walk-ins.' },
  { icon: Search, title: 'Google Ads', desc: 'Search, Performance Max and Local campaigns tuned for high-intent buyers.' },
  { icon: Building2, title: 'Google Business Profile', desc: 'Rank higher in Maps with a fully optimised, review-driven local profile.' },
  { icon: Share2, title: 'Social Media Management', desc: 'Consistent, on-brand content that builds trust between ad campaigns.' },
  { icon: LayoutTemplate, title: 'Landing Page Optimization', desc: 'Fast, conversion-focused pages built to turn ad clicks into real leads.' },
  { icon: BarChart3, title: 'Transparent Reporting', desc: 'Clear monthly dashboards — you always know where every rupee went.' },
];

const TRUST_CHIPS = ['Meta Ads', 'Google Ads', 'WhatsApp Leads', 'Phone Calls'];

// ---------- Fulvora Wordmark (placeholder until official logo is provided) ----------
const Logo = ({ variant = 'light' }) => {
  const dark = variant === 'dark';
  return (
    <a href="#top" className="flex items-center gap-2 group" aria-label="Fulvora Digital">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D28D9] via-[#8B5CF6] to-[#312E81] shadow-glow">
        <span className="absolute inset-[2px] rounded-[10px] bg-white/10 backdrop-blur-sm" />
        <Sparkles className="relative h-4 w-4 text-white" strokeWidth={2.5} />
      </span>
      <span className={`font-heading text-[19px] font-700 tracking-tight ${dark ? 'text-white' : 'text-brand-ink'}`} style={{ fontWeight: 700 }}>
        Fulvora <span className="text-[#6D28D9]">Digital</span>
      </span>
    </a>
  );
};

// ---------- Navbar ----------
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className="container">
        <div className={`flex items-center justify-between rounded-2xl px-4 md:px-6 py-3 transition-all duration-300 ${scrolled ? 'glass border border-white/60 shadow-premium' : 'bg-transparent'}`}>
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="px-3 py-2 text-sm font-500 text-brand-ink2 hover:text-brand-ink transition-colors rounded-lg hover:bg-black/5">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#contact" className="hidden md:inline-flex btn-shine items-center gap-2 rounded-full bg-brand-ink text-white px-4 py-2.5 text-sm font-600 hover:bg-black transition-colors">
              Book a Strategy Call <ArrowRight className="h-4 w-4" />
            </a>
            <button onClick={() => setOpen((v) => !v)} className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-brand-ink hover:bg-black/5" aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden mt-2 glass rounded-2xl border border-white/60 shadow-premium p-3">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-500 text-brand-ink hover:bg-black/5 rounded-lg">
                {l.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="mt-2 block text-center rounded-full bg-brand-ink text-white px-4 py-2.5 text-sm font-600">
              Book a Strategy Call
            </a>
          </motion.div>
        )}
      </div>
    </header>
  );
};

// ---------- Hero ----------
const Hero = () => {
  const reduce = useReducedMotion();
  return (
    <section id="top" className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 -z-10 aurora-bg" />
      {/* Grid */}
      <div className="absolute inset-0 -z-10 grid-fade-mask opacity-[0.35]" style={{
        backgroundImage: 'linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      {/* Floating blurred shapes */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#8B5CF6]/25 blur-3xl -z-10" />
      <div className="absolute top-40 -right-16 h-72 w-72 rounded-full bg-[#10B981]/20 blur-3xl -z-10" />

      <div className="container grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-white/70 backdrop-blur px-3 py-1.5 text-xs md:text-sm font-500 text-brand-ink shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75 animate-pulse-dot" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
            </span>
            AI-Powered Performance Marketing
            <span className="mx-1 text-brand-ink2/50">•</span>
            <span className="text-brand-purple font-600">Pune • PCMC</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-heading text-[44px] leading-[1.05] sm:text-6xl lg:text-[72px] lg:leading-[1.02] font-700 text-brand-ink text-balance"
          >
            We Grow Your Brand.
            <br />
            <span className="bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#312E81] bg-clip-text text-transparent">You Grow Your Business.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-6 max-w-xl text-base md:text-lg text-brand-ink2 leading-relaxed">
            We focus on the metrics that actually move a local business — phone calls, WhatsApp enquiries, qualified leads, and store visits. Not vanity likes. Not empty reach.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#contact" className="btn-shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white px-6 py-3.5 text-sm md:text-base font-600 shadow-glow hover:shadow-premium transition-all">
              Book a Free Strategy Call
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-white/70 backdrop-blur px-6 py-3.5 text-sm md:text-base font-600 text-brand-ink hover:bg-white transition-colors">
              See Pricing
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-8 flex flex-wrap gap-2">
            {TRUST_CHIPS.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-brand-ink/10 bg-white/60 backdrop-blur px-3 py-1.5 text-xs font-500 text-brand-ink2">
                <Check className="h-3.5 w-3.5 text-brand-green" /> {c}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Analytics card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative gradient-border shadow-premium">
            <div className="relative rounded-[24px] bg-white/80 backdrop-blur-xl p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-600 uppercase tracking-widest text-brand-purple">What We Optimize</p>
                  <h3 className="mt-1 font-heading text-xl font-700 text-brand-ink">Real business outcomes</h3>
                </div>
                <span className="text-[10px] font-600 uppercase tracking-wider rounded-full bg-brand-ink/5 text-brand-ink2 px-2 py-1">Illustrative Data</span>
              </div>

              <div className="mt-6 space-y-5">
                {OPTIMIZE_ITEMS.map((it, i) => (
                  <motion.div
                    key={it.label}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 * i }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${it.color}14`, color: it.color }}>
                          <it.icon className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <p className="text-sm font-600 text-brand-ink">{it.label}</p>
                          <p className="text-xs text-brand-ink2">{it.desc}</p>
                        </div>
                      </div>
                      <span className="text-sm font-700 text-brand-ink tabular-nums">{it.value}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-brand-ink/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${it.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: 0.25 + 0.15 * i, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${it.color}, ${it.color}AA)` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-br from-[#6D28D9]/5 to-[#10B981]/5 border border-brand-ink/5 p-3.5">
                <div className="flex items-center gap-2 text-xs font-500 text-brand-ink2">
                  <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
                  AI-assisted optimisation across Meta + Google
                </div>
                <ArrowRight className="h-4 w-4 text-brand-ink2" />
              </div>
            </div>
          </div>
          {/* floating accent card */}
          <motion.div
            aria-hidden
            animate={reduce ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-2 rounded-2xl glass border border-white/70 shadow-premium px-3.5 py-2.5"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green"><Phone className="h-4 w-4" /></span>
            <div className="text-xs">
              <p className="font-600 text-brand-ink">New call today</p>
              <p className="text-brand-ink2">from Wakad campaign</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ---------- Marquee ----------
const Marquee = () => {
  const items = [...LOCALITIES, ...LOCALITIES];
  return (
    <section aria-label="Localities served" className="relative bg-[#312E81] text-white py-10 overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
        background: 'radial-gradient(600px 200px at 20% 50%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(600px 200px at 80% 50%, rgba(16,185,129,0.18), transparent 60%)',
      }} />
      <div className="relative marquee-pause overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap marquee w-max">
          {items.map((city, i) => (
            <div key={i} className="flex items-center gap-3 text-lg md:text-xl font-heading font-600 text-white/90">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
              {city}
              <span className="text-white/30">/</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------- Positioning quote ----------
const Positioning = () => (
  <section id="about" className="relative py-24 md:py-32">
    <div className="container max-w-4xl text-center">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-xs md:text-sm font-600 uppercase tracking-[0.2em] text-brand-purple"
      >
        Our positioning
      </motion.p>
      <motion.blockquote
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-6 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.15] font-600 text-brand-ink text-balance"
      >
        “We design and run{' '}
        <span className="text-[#6D28D9]">Meta + Google Ads</span>{' '}
        that bring real phone calls, WhatsApp messages, qualified leads, and store visits — not just likes and reach.”
      </motion.blockquote>
      <div className="mt-8 inline-flex items-center gap-2 text-sm text-brand-ink2">
        <span className="h-px w-8 bg-brand-ink/20" />
        Fulvora Digital
        <span className="h-px w-8 bg-brand-ink/20" />
      </div>
    </div>
  </section>
);

// ---------- Services ----------
const Services = () => (
  <section id="services" className="relative py-24 md:py-32 bg-white">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-ink/10 to-transparent" />
    <div className="container">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-xs font-600 uppercase tracking-wider text-brand-purple">
          Services
        </span>
        <h2 className="mt-5 font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.05] font-700 text-brand-ink text-balance">
          Everything a local brand needs to <span className="text-[#6D28D9]">actually grow</span>.
        </h2>
        <p className="mt-5 text-base md:text-lg text-brand-ink2 max-w-xl">
          Six focused services, one integrated system — built to bring qualified customers to your business every month.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.05 }}
            className="group relative gradient-border shadow-[0_10px_40px_-20px_rgba(49,46,129,0.15)] hover:shadow-premium transition-shadow"
          >
            <div className="relative rounded-[24px] bg-white p-6 md:p-7 h-full flex flex-col">
              <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9]/10 via-[#8B5CF6]/10 to-[#10B981]/10 text-[#6D28D9]">
                <s.icon className="h-5 w-5" />
                <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-purple/10" />
              </div>
              <h3 className="mt-5 font-heading text-xl md:text-[22px] font-600 text-brand-ink">{s.title}</h3>
              <p className="mt-2 text-sm md:text-[15px] text-brand-ink2 leading-relaxed">{s.desc}</p>
              <div className="mt-6 pt-4 border-t border-brand-ink/5 flex items-center justify-between text-sm font-500 text-brand-ink2">
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-brand-purple" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ---------- Footer ----------
const Footer = () => (
  <footer id="contact" className="relative bg-[#0B0B14] text-white/80 pt-20 pb-10 overflow-hidden">
    <div className="absolute inset-0 opacity-40" style={{
      background: 'radial-gradient(700px 300px at 20% 0%, rgba(109,40,217,0.35), transparent 60%), radial-gradient(700px 300px at 90% 100%, rgba(16,185,129,0.15), transparent 60%)',
    }} />
    <div className="container relative">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <Logo variant="dark" />
          <p className="mt-4 max-w-md text-white/70">
            We Grow Your Brand. You Grow Your Business.
            <br />
            AI-powered performance marketing for local businesses in Pune & PCMC.
          </p>
        </div>
        <div className="md:justify-self-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-white/70 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
        <p>© {new Date().getFullYear()} Fulvora Digital. All rights reserved.</p>
        <p>Crafted with intent for Pune & PCMC businesses.</p>
      </div>
    </div>
  </footer>
);

// ---------- Page ----------
function App() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Marquee />
      <Positioning />
      <Services />
      <Footer />
    </main>
  );
}

export default App;
