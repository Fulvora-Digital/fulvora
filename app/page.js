'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Phone, MessageCircle, FileText, MapPin, Sparkles, ArrowRight, Menu, X,
  Target, Search, Building2, Share2, LayoutTemplate, BarChart3, Check,
  Stethoscope, Scissors, Dumbbell, Home as HomeIcon, ShoppingBag,
  Zap, Layers, Eye, Rocket, Send, Mail, Bot, HelpCircle, Instagram, Linkedin,
} from 'lucide-react';
import { FULVORA } from '@/lib/fulvora-config';

// ------------------------------------------------------------------
// Fulvora Digital — Full marketing site (Phase 1 + Phase 2)
// ------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Who We Help', href: '#who' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const LOCALITIES = ['Wakad','Hinjewadi','Baner','Aundh','Kothrud','Viman Nagar','Pimpri','Chinchwad','Nigdi','Akurdi','Ravet','Deccan'];

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

const INDUSTRIES = [
  'Dentists','Dermatologists','Clinics','Physiotherapists','Veterinary Clinics',
  'Salons','Spas','Gyms','Yoga Studios','Fitness Coaches',
  'Interior Designers','Painters','Cleaners','Real Estate Agents','Builders',
  'Pet Stores','Kids Wear','Electronics','Footwear','Local Retailers',
];

const NICHE_CARDS = [
  { icon: Stethoscope, title: 'Dental Clinics', offer: 'First Visit at ₹99', tint: '#6D28D9' },
  { icon: Scissors, title: 'Salons & Spas', offer: 'Bridal Trial Special', tint: '#8B5CF6' },
  { icon: Dumbbell, title: 'Gyms & Fitness', offer: 'Free Trial Workout', tint: '#10B981' },
  { icon: HomeIcon, title: 'Real Estate', offer: 'Free Site Visit + Brochure', tint: '#312E81' },
  { icon: ShoppingBag, title: 'Local Retail', offer: 'Festival Sale up to 40% Off', tint: '#6D28D9' },
];

const PRICING = [
  {
    name: 'Starter', subtitle: 'Local Lead Engine', price: '₹18,000 – ₹25,000', period: '/month',
    features: ['Meta OR Google Ads', 'Campaign Setup', '6–8 Creatives', 'Weekly Optimization', 'Monthly Report'],
    highlighted: false,
  },
  {
    name: 'Growth', subtitle: 'Multi-Channel Growth', price: '₹30,000 – ₹45,000', period: '/month',
    features: ['Meta Ads + Google Ads', 'Search + Local Campaigns', 'Retargeting', 'Landing Page', '12–15 Creatives', 'Bi-weekly Calls', 'Monthly Reports'],
    highlighted: true, badge: 'Most Popular',
  },
  {
    name: 'Custom', subtitle: 'Full Brand + Ads', price: 'Custom Quote', period: '',
    features: ['Brand Strategy', 'Website + Landing Pages', 'Meta · Google · LinkedIn · YouTube', 'WhatsApp + Email Automation', 'Executive Dashboard'],
    highlighted: false,
  },
];

const WHY_FULVORA = [
  { icon: MapPin, title: 'Local', desc: 'Deep understanding of Pune & PCMC customer behaviour, culture and buying patterns.' },
  { icon: Layers, title: 'Integrated', desc: 'Ads, creative, landing pages and reporting — handled by one focused team.' },
  { icon: Eye, title: 'Transparent', desc: 'You always see where the spend goes and what it delivers. No black boxes.' },
  { icon: Zap, title: 'Fast', desc: 'Quick campaign launches, tight iteration loops, and speedy WhatsApp support.' },
];

// ---------- Logo ----------
const Logo = ({ variant = 'light' }) => {
  const dark = variant === 'dark';
  return (
    <a href="#top" className="flex items-center gap-2.5 group" aria-label="Fulvora Digital">
      <span className="relative inline-flex h-10 w-10 items-center justify-center">
        <Image
          src="/fulvora-logo.png"
          alt="Fulvora Digital"
          width={80}
          height={80}
          priority
          className="h-10 w-10 object-contain drop-shadow-[0_6px_20px_rgba(109,40,217,0.35)]"
        />
      </span>
      <span className={`font-heading text-[19px] tracking-tight ${dark ? 'text-white' : 'text-brand-ink'}`} style={{ fontWeight: 700 }}>
        Fulvora <span className="text-[#8B5CF6]">Digital</span>
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
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-brand-ink2 hover:text-brand-ink transition-colors rounded-lg hover:bg-black/5">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#contact" className="hidden md:inline-flex btn-shine items-center gap-2 rounded-full bg-brand-ink text-white px-4 py-2.5 text-sm font-semibold hover:bg-black transition-colors">
              Book a Strategy Call <ArrowRight className="h-4 w-4" />
            </a>
            <button onClick={() => setOpen((v) => !v)} className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-brand-ink hover:bg-black/5" aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="md:hidden mt-2 glass rounded-2xl border border-white/60 shadow-premium p-3">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-brand-ink hover:bg-black/5 rounded-lg">
                  {l.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="mt-2 block text-center rounded-full bg-brand-ink text-white px-4 py-2.5 text-sm font-semibold">
                Book a Strategy Call
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

// ---------- Hero ----------
const Hero = () => {
  const reduce = useReducedMotion();
  return (
    <section id="top" className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 aurora-bg" />
      <div className="absolute inset-0 -z-10 grid-fade-mask opacity-[0.35]" style={{
        backgroundImage: 'linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#8B5CF6]/25 blur-3xl -z-10" />
      <div className="absolute top-40 -right-16 h-72 w-72 rounded-full bg-[#10B981]/20 blur-3xl -z-10" />

      <div className="container grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-white/70 backdrop-blur px-3 py-1.5 text-xs md:text-sm font-medium text-brand-ink shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75 animate-pulse-dot" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
            </span>
            AI-Powered Performance Marketing
            <span className="mx-1 text-brand-ink2/50">•</span>
            <span className="text-brand-purple font-semibold">Pune • PCMC</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-heading text-[44px] leading-[1.05] sm:text-6xl lg:text-[72px] lg:leading-[1.02] font-bold text-brand-ink text-balance"
          >
            We Grow Your Brand.
            <br />
            <span className="bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#312E81] bg-clip-text text-transparent">You Grow Your Business.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-6 max-w-xl text-base md:text-lg text-brand-ink2 leading-relaxed">
            We focus on the metrics that actually move a local business — phone calls, WhatsApp enquiries, qualified leads, and store visits. Not vanity likes. Not empty reach.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#contact" className="btn-shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white px-6 py-3.5 text-sm md:text-base font-semibold shadow-glow hover:shadow-premium transition-all">
              Book a Free Strategy Call
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 bg-white/70 backdrop-blur px-6 py-3.5 text-sm md:text-base font-semibold text-brand-ink hover:bg-white transition-colors">
              See Pricing
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-8 flex flex-wrap gap-2">
            {TRUST_CHIPS.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-brand-ink/10 bg-white/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-brand-ink2">
                <Check className="h-3.5 w-3.5 text-brand-green" /> {c}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} className="lg:col-span-5 relative">
          <div className="relative gradient-border shadow-premium">
            <div className="relative rounded-[24px] bg-white/80 backdrop-blur-xl p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">What We Optimize</p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-brand-ink">Real business outcomes</h3>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand-ink/5 text-brand-ink2 px-2 py-1">Illustrative Data</span>
              </div>
              <div className="mt-6 space-y-5">
                {OPTIMIZE_ITEMS.map((it, i) => (
                  <motion.div key={it.label} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 * i }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${it.color}14`, color: it.color }}>
                          <it.icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-brand-ink">{it.label}</p>
                          <p className="text-xs text-brand-ink2">{it.desc}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-brand-ink tabular-nums">{it.value}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-brand-ink/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${it.value}%` }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.25 + 0.15 * i, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${it.color}, ${it.color}AA)` }} />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-br from-[#6D28D9]/5 to-[#10B981]/5 border border-brand-ink/5 p-3.5">
                <div className="flex items-center gap-2 text-xs font-medium text-brand-ink2">
                  <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
                  AI-assisted optimisation across Meta + Google
                </div>
                <ArrowRight className="h-4 w-4 text-brand-ink2" />
              </div>
            </div>
          </div>
          <motion.div aria-hidden animate={reduce ? {} : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-2 rounded-2xl glass border border-white/70 shadow-premium px-3.5 py-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green"><Phone className="h-4 w-4" /></span>
            <div className="text-xs">
              <p className="font-semibold text-brand-ink">New call today</p>
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
            <div key={i} className="flex items-center gap-3 text-lg md:text-xl font-heading font-semibold text-white/90">
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

// ---------- Positioning ----------
const Positioning = () => (
  <section className="relative py-24 md:py-32">
    <div className="container max-w-4xl text-center">
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-brand-purple">
        Our positioning
      </motion.p>
      <motion.blockquote initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mt-6 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.15] font-semibold text-brand-ink text-balance">
        “We design and run <span className="text-[#6D28D9]">Meta + Google Ads</span> that bring real phone calls, WhatsApp messages, qualified leads, and store visits — not just likes and reach.”
      </motion.blockquote>
      <div className="mt-8 inline-flex items-center gap-2 text-sm text-brand-ink2">
        <span className="h-px w-8 bg-brand-ink/20" /> Fulvora Digital <span className="h-px w-8 bg-brand-ink/20" />
      </div>
    </div>
  </section>
);

// ---------- About ----------
const About = () => (
  <section id="about" className="relative py-24 md:py-32">
    <div className="container grid lg:grid-cols-12 gap-12 items-start">
      <div className="lg:col-span-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">About</span>
        <h2 className="mt-5 font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.05] font-bold text-brand-ink text-balance">
          A small, agile team.<br /><span className="text-[#6D28D9]">Trusted like family.</span>
        </h2>
        <p className="mt-6 text-base md:text-lg text-brand-ink2 leading-relaxed">
          Fulvora Digital is a performance marketing agency helping local businesses across Pune and PCMC grow using AI-powered advertising, creative strategy, and transparent reporting.
        </p>
        <p className="mt-4 text-base text-brand-ink2 leading-relaxed">
          We work as a trusted extension of your team — focused on outcomes that matter to your business.
        </p>
        <div className="mt-8 gradient-border shadow-premium">
          <div className="rounded-[24px] bg-white p-6 md:p-7">
            <p className="font-heading text-lg md:text-xl text-brand-ink leading-snug">
              “We leverage AI-powered marketing to grow your business, <span className="text-[#6D28D9]">so you can focus on what you do best.</span>”
            </p>
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="rounded-[28px] bg-gradient-to-br from-white to-[#F5F3FF] border border-brand-ink/5 p-6 md:p-8 shadow-[0_10px_60px_-20px_rgba(49,46,129,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">Who We Help</p>
          <h3 className="mt-2 font-heading text-2xl md:text-3xl font-bold text-brand-ink">Local businesses across 20+ categories</h3>
          <div className="mt-6 flex flex-wrap gap-2">
            {INDUSTRIES.map((it, i) => (
              <motion.span key={it} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.02 }} className="inline-flex items-center gap-1.5 rounded-full border border-brand-ink/10 bg-white px-3.5 py-1.5 text-sm text-brand-ink hover:border-brand-purple/40 hover:shadow-sm transition-all">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" /> {it}
              </motion.span>
            ))}
          </div>
        </div>
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
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">Services</span>
        <h2 className="mt-5 font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.05] font-bold text-brand-ink text-balance">
          Everything a local brand needs to <span className="text-[#6D28D9]">actually grow</span>.
        </h2>
        <p className="mt-5 text-base md:text-lg text-brand-ink2 max-w-xl">Six focused services, one integrated system — built to bring qualified customers to your business every month.</p>
      </div>
      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {SERVICES.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, delay: i * 0.05 }} className="group relative gradient-border shadow-[0_10px_40px_-20px_rgba(49,46,129,0.15)] hover:shadow-premium hover:-translate-y-1 transition-all">
            <div className="relative rounded-[24px] bg-white p-6 md:p-7 h-full flex flex-col">
              <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9]/10 via-[#8B5CF6]/10 to-[#10B981]/10 text-[#6D28D9]">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-xl md:text-[22px] font-semibold text-brand-ink">{s.title}</h3>
              <p className="mt-2 text-sm md:text-[15px] text-brand-ink2 leading-relaxed">{s.desc}</p>
              <div className="mt-6 pt-4 border-t border-brand-ink/5 flex items-center justify-between text-sm font-medium text-brand-ink2">
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

// ---------- Who We Help (niche cards) ----------
const WhoWeHelp = () => (
  <section id="who" className="relative py-24 md:py-32">
    <div className="container">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">Who We Help</span>
        <h2 className="mt-5 font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.05] font-bold text-brand-ink text-balance">
          Built for the businesses <span className="text-[#6D28D9]">your neighbourhood loves</span>.
        </h2>
        <p className="mt-5 text-base md:text-lg text-brand-ink2 max-w-xl">A few of the categories we run high-performing campaigns for. Illustrative offers only.</p>
      </div>
      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {NICHE_CARDS.map((n, i) => (
          <motion.div key={n.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: i * 0.06 }} className={`group relative overflow-hidden rounded-[24px] p-6 border border-brand-ink/5 bg-white shadow-[0_10px_40px_-24px_rgba(49,46,129,0.2)] hover:shadow-premium hover:-translate-y-1 transition-all ${i === 2 ? 'lg:translate-y-4' : ''}`}>
            <span aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-30" style={{ background: n.tint }} />
            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${n.tint}, ${n.tint}CC)` }}>
                <n.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold text-brand-ink">{n.title}</h3>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-purple">Example offer</div>
              <p className="mt-1 text-[15px] font-medium text-brand-ink">{n.offer}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ---------- Pricing ----------
const Pricing = () => (
  <section id="pricing" className="relative py-24 md:py-32 bg-white">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-ink/10 to-transparent" />
    <div className="container">
      <div className="max-w-2xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">Pricing</span>
        <h2 className="mt-5 font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.05] font-bold text-brand-ink text-balance">
          Simple, transparent plans. <span className="text-[#6D28D9]">No surprises.</span>
        </h2>
        <p className="mt-5 text-base md:text-lg text-brand-ink2">Choose the engine that fits your business today — you can scale up any time.</p>
      </div>

      <div className="mt-14 grid lg:grid-cols-3 gap-6 items-stretch">
        {PRICING.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.08 }} className={`relative rounded-[28px] border p-7 md:p-8 flex flex-col ${p.highlighted ? 'bg-gradient-to-br from-[#1a1533] via-[#241a4a] to-[#0f0c24] text-white border-white/10 shadow-premium lg:-translate-y-3' : 'bg-white text-brand-ink border-brand-ink/5 shadow-[0_10px_40px_-24px_rgba(49,46,129,0.2)]'}`}>
            {p.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-glow">
                <Sparkles className="h-3 w-3" /> {p.badge}
              </span>
            )}
            <div>
              <h3 className="font-heading text-2xl font-bold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlighted ? 'text-white/70' : 'text-brand-ink2'}`}>{p.subtitle}</p>
            </div>
            <div className="mt-6">
              <div className={`font-heading text-3xl md:text-[34px] font-bold ${p.highlighted ? 'text-white' : 'text-brand-ink'}`}>{p.price}</div>
              {p.period && <div className={`mt-1 text-sm ${p.highlighted ? 'text-white/60' : 'text-brand-ink2'}`}>{p.period}</div>}
            </div>
            <ul className={`mt-6 space-y-3 text-sm ${p.highlighted ? 'text-white/85' : 'text-brand-ink2'}`}>
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className={`mt-0.5 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full ${p.highlighted ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-brand-green/10 text-brand-green'}`}><Check className="h-3 w-3" /></span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href="#contact" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold btn-shine transition-colors ${p.highlighted ? 'bg-white text-[#1a1533] hover:bg-white/90' : 'bg-brand-ink text-white hover:bg-black'}`}>
              {p.name === 'Custom' ? 'Request Custom Quote' : 'Get Started'} <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-bg px-5 py-4 text-left">
          <HelpCircle className="h-5 w-5 text-brand-purple mt-0.5" />
          <p className="text-sm text-brand-ink2">
            <span className="font-semibold text-brand-ink">Ad spend is separate</span> and paid directly by you to Meta or Google. Typical ad spend ranges from <span className="font-semibold text-brand-ink">₹10,000 to ₹1,00,000/month</span> depending on your goals.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ---------- Why Fulvora (dark) ----------
const WhyFulvora = () => (
  <section className="relative py-24 md:py-32 bg-[#0B0B14] text-white overflow-hidden">
    <div className="absolute inset-0 opacity-70" style={{
      background: 'radial-gradient(700px 400px at 15% 0%, rgba(109,40,217,0.4), transparent 60%), radial-gradient(700px 400px at 85% 100%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(500px 300px at 50% 50%, rgba(139,92,246,0.2), transparent 60%)',
    }} />
    <div className="container relative">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">Why Fulvora</span>
        <h2 className="mt-5 font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.05] font-bold text-white text-balance">
          A modern agency built for <span className="bg-gradient-to-r from-[#A78BFA] to-[#6EE7B7] bg-clip-text text-transparent">local growth</span>.
        </h2>
        <p className="mt-5 text-base md:text-lg text-white/70 max-w-xl">Four values that shape every campaign, creative, and conversation we have with clients.</p>
      </div>
      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {WHY_FULVORA.map((w, i) => (
          <motion.div key={w.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.08 }} className="group relative rounded-[24px] p-6 md:p-7 glass-dark border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D28D9] via-[#8B5CF6] to-[#10B981] text-white shadow-glow">
              <w.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-heading text-xl font-semibold text-white">{w.title}</h3>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{w.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ---------- Contact ----------
const Contact = ({ onBusinessTypeChange }) => {
  const [state, setState] = useState({ loading: false, ok: false, err: '' });
  const [form, setForm] = useState({ name: '', phone: '', businessType: '', message: '' });
  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ loading: true, ok: false, err: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Submission failed');
      setState({ loading: false, ok: true, err: '' });
      setForm({ name: '', phone: '', businessType: '', message: '' });
    } catch (err) {
      setState({ loading: false, ok: false, err: err.message });
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 aurora-bg" />
      <div className="absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-[#8B5CF6]/20 blur-3xl -z-10" />
      <div className="container grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">Contact</span>
          <h2 className="mt-5 font-heading text-4xl md:text-5xl lg:text-[56px] leading-[1.05] font-bold text-brand-ink text-balance">
            Let’s make your phone <span className="text-[#6D28D9]">ring</span>.
          </h2>
          <p className="mt-5 text-base md:text-lg text-brand-ink2 max-w-md">
            Tell us a little about your business and we’ll get back within one working day with a clear next step.
          </p>
          <div className="mt-8 space-y-3">
            <a href={FULVORA.phoneHref} className="flex items-center gap-3 group">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-brand-ink/10 text-[#6D28D9] group-hover:border-[#6D28D9] transition-colors"><Phone className="h-4 w-4" /></span>
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-ink2 font-semibold">Phone</p>
                <p className="font-medium text-brand-ink">{FULVORA.phone}</p>
              </div>
            </a>
            <a href={FULVORA.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-brand-ink/10 text-[#10B981] group-hover:border-[#10B981] transition-colors"><MessageCircle className="h-4 w-4" /></span>
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-ink2 font-semibold">WhatsApp</p>
                <p className="font-medium text-brand-ink">{FULVORA.whatsapp}</p>
              </div>
            </a>
            <a href={FULVORA.emailHref} className="flex items-center gap-3 group">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-brand-ink/10 text-[#8B5CF6] group-hover:border-[#8B5CF6] transition-colors"><Mail className="h-4 w-4" /></span>
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-ink2 font-semibold">Email</p>
                <p className="font-medium text-brand-ink">{FULVORA.email}</p>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-brand-ink/10 text-[#312E81]"><MapPin className="h-4 w-4" /></span>
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-ink2 font-semibold">Business Area</p>
                <p className="font-medium text-brand-ink">{FULVORA.businessArea}</p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-brand-ink/10">
              <p className="text-xs uppercase tracking-wider text-brand-ink2 font-semibold mb-2.5">Follow us</p>
              <div className="flex items-center gap-2.5">
                <a href={FULVORA.instagram} target="_blank" rel="noreferrer" aria-label="Instagram @fulvoradigital" className="group inline-flex items-center gap-2 rounded-full border border-brand-ink/10 bg-white px-3.5 py-2 text-sm font-medium text-brand-ink hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors">
                  <Instagram className="h-4 w-4" />
                  <span>{FULVORA.instagramHandle}</span>
                </a>
                <a href={FULVORA.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn @fulvoradigital" className="group inline-flex items-center gap-2 rounded-full border border-brand-ink/10 bg-white px-3.5 py-2 text-sm font-medium text-brand-ink hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors">
                  <Linkedin className="h-4 w-4" />
                  <span>{FULVORA.linkedinHandle}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative gradient-border shadow-premium">
            <form onSubmit={onSubmit} className="relative rounded-[24px] glass border border-white/60 p-6 md:p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-brand-ink2 uppercase tracking-wider">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="mt-1.5 w-full rounded-xl border border-brand-ink/10 bg-white/80 backdrop-blur px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/10 transition" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-ink2 uppercase tracking-wider">Phone</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" className="mt-1.5 w-full rounded-xl border border-brand-ink/10 bg-white/80 backdrop-blur px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/10 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-ink2 uppercase tracking-wider">Business Type</label>
                <input value={form.businessType} onChange={(e) => { const v = e.target.value; setForm({ ...form, businessType: v }); onBusinessTypeChange?.(v); }} placeholder="e.g. Dental Clinic, Salon, Real Estate" className="mt-1.5 w-full rounded-xl border border-brand-ink/10 bg-white/80 backdrop-blur px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/10 transition" />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-ink2 uppercase tracking-wider">Message</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your goals, location, and current marketing." className="mt-1.5 w-full rounded-xl border border-brand-ink/10 bg-white/80 backdrop-blur px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#6D28D9]/10 transition resize-none" />
              </div>

              {state.ok && (
                <div className="flex items-center gap-2 rounded-xl bg-brand-green/10 border border-brand-green/20 px-4 py-3 text-sm text-brand-green font-medium">
                  <Check className="h-4 w-4" /> Thanks! We’ve received your enquiry and will be in touch within one working day.
                </div>
              )}
              {state.err && (
                <div className="rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3 text-sm text-red-600">{state.err}</div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-xs text-brand-ink2">By submitting you agree to be contacted about your enquiry.</p>
                <button disabled={state.loading} type="submit" className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white px-5 py-3 text-sm font-semibold shadow-glow hover:shadow-premium transition disabled:opacity-70">
                  {state.loading ? 'Sending…' : 'Send Enquiry'} <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- Footer ----------
const Footer = () => (
  <footer className="relative bg-[#0B0B14] text-white/80 pt-20 pb-10 overflow-hidden">
    <div className="absolute inset-0 opacity-40" style={{
      background: 'radial-gradient(700px 300px at 20% 0%, rgba(109,40,217,0.35), transparent 60%), radial-gradient(700px 300px at 90% 100%, rgba(16,185,129,0.15), transparent 60%)',
    }} />
    <div className="container relative">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <Logo variant="dark" />
          <p className="mt-4 max-w-md text-white/70">
            {FULVORA.tagline}<br />AI-powered performance marketing for local businesses in Pune & PCMC.
          </p>
        </div>
        <div className="md:justify-self-end space-y-4">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-white/70 hover:text-white transition-colors">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3 md:justify-end">
            <a href={FULVORA.instagram} target="_blank" rel="noreferrer" aria-label="Instagram @fulvoradigital" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={FULVORA.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn @fulvoradigital" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href={FULVORA.whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
        <p>© {new Date().getFullYear()} Fulvora Digital. All rights reserved.</p>
        <p>Crafted with intent for Pune & PCMC businesses.</p>
      </div>
    </div>
  </footer>
);

// ---------- WhatsApp Lead Router Pill / Sticky Mobile Bar ----------
// Desktop: a floating pill on the bottom-left that auto-expands with the
// pre-filled Business Type from the Contact form.
// Mobile: a full-width sticky bar pinned to the bottom of the viewport so
// every phone visitor is one tap from a WhatsApp chat.
const WhatsAppPill = ({ businessType }) => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-expand briefly (desktop) when businessType is typed
  useEffect(() => {
    if (!businessType || businessType.trim().length < 2) return;
    setExpanded(true);
    const t = setTimeout(() => setExpanded(false), 4200);
    return () => clearTimeout(t);
  }, [businessType]);

  const trimmed = (businessType || '').trim();
  const message = trimmed
    ? `Hi Fulvora! I run a ${trimmed} in Pune/PCMC and I'd like to grow with performance marketing.`
    : `Hi Fulvora! I'd like to discuss performance marketing for my business in Pune/PCMC.`;
  const base = FULVORA.whatsappHref.split('?')[0];
  const href = `${base}?text=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop pill */}
          <motion.a
            key="wa-pill-desktop"
            href={href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            className="hidden md:inline-flex fixed bottom-5 left-5 z-40 group items-center gap-2.5 rounded-full bg-[#25D366] text-white pl-3 pr-4 py-2.5 shadow-[0_18px_40px_-15px_rgba(37,211,102,0.65)] hover:shadow-[0_22px_50px_-15px_rgba(37,211,102,0.85)] hover:scale-[1.03] transition-all"
            aria-label="Chat with Fulvora on WhatsApp"
          >
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-60" />
              <MessageCircle className="relative h-4 w-4" strokeWidth={2.4} />
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/85">Chat on WhatsApp</span>
              <motion.span
                initial={false}
                animate={{ opacity: expanded ? 1 : 0, height: expanded ? 'auto' : 0, marginTop: expanded ? 2 : 0 }}
                transition={{ duration: 0.25 }}
                className="text-[12px] font-medium max-w-[220px] truncate"
              >
                {trimmed ? `Pre-filled: ${trimmed}` : 'Instant reply during work hours'}
              </motion.span>
            </div>
          </motion.a>

          {/* Mobile sticky bar */}
          <motion.div
            key="wa-bar-mobile"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2 pointer-events-none"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          >
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with Fulvora on WhatsApp"
              className="pointer-events-auto relative flex items-center justify-between gap-3 rounded-full bg-[#25D366] text-white pl-3 pr-5 py-3 shadow-[0_18px_40px_-10px_rgba(37,211,102,0.75)] active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 shrink-0">
                  <span className="absolute inset-0 rounded-full bg-white/25 animate-ping opacity-60" />
                  <MessageCircle className="relative h-5 w-5" strokeWidth={2.4} />
                </span>
                <span className="flex flex-col leading-tight min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/85">Chat on WhatsApp</span>
                  <span className="text-[13px] font-semibold truncate">
                    {trimmed ? `Ask about ${trimmed}` : 'Get a reply within minutes'}
                  </span>
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </a>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ---------- Floating Chatbot (Gemini-powered concierge) ----------
const QUICK_REPLIES = ['What do you offer?', 'What are your prices?', 'Book a strategy call'];

// Renders assistant text with clickable links (http/https, phones, emails).
const renderRichText = (text) => {
  const parts = String(text).split(/(https?:\/\/[^\s]+|\+91[\s-]?\d[\d\s-]{8,}|[\w.+-]+@[\w-]+\.[\w.-]+)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (/^https?:\/\//.test(p)) return <a key={i} href={p} target="_blank" rel="noreferrer" className="text-[#6D28D9] underline font-semibold break-all">{p}</a>;
    if (/^\+91/.test(p)) return <a key={i} href={`tel:${p.replace(/[^\d+]/g, '')}`} className="text-[#6D28D9] underline font-semibold">{p}</a>;
    if (/@/.test(p)) return <a key={i} href={`mailto:${p}`} className="text-[#6D28D9] underline font-semibold">{p}</a>;
    return <span key={i}>{p}</span>;
  });
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\u2019m the Fulvora Assistant. Tell me a bit about your business \u2014 what do you run and which area of Pune/PCMC are you in?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const KEY = 'fulvora_chat_session_id';
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = (window.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2));
      window.localStorage.setItem(KEY, id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value || loading || !sessionId) return;
    setMessages((m) => [...m, { from: 'user', text: value }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: value }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Chat failed');
      setMessages((m) => [...m, { from: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: `Sorry, I hit a snag. Please WhatsApp us at ${FULVORA.whatsapp} or use the Contact form above.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen((v) => !v)} aria-label="Open chat" className="fixed bottom-24 md:bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white shadow-glow hover:scale-105 transition-transform">
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ duration: 0.25 }} className="fixed bottom-40 md:bottom-24 right-5 z-40 w-[92vw] max-w-sm rounded-[24px] glass border border-white/60 shadow-premium overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15"><Bot className="h-4 w-4" /></span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Fulvora Assistant</p>
                <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> AI-powered · replies in seconds
                </p>
              </div>
            </div>
            <div ref={listRef} className="h-80 overflow-y-auto px-4 py-3 space-y-2 bg-white/70">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap leading-relaxed ${m.from === 'user' ? 'bg-brand-ink text-white' : 'bg-white border border-brand-ink/10 text-brand-ink'}`}>
                    {m.from === 'bot' ? renderRichText(m.text) : m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white border border-brand-ink/10 px-3.5 py-2.5 text-sm text-brand-ink2 inline-flex gap-1">
                    <span className="h-1.5 w-1.5 bg-brand-purple rounded-full animate-pulse" />
                    <span className="h-1.5 w-1.5 bg-brand-purple rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-brand-purple rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            <div className="px-3 pt-2 pb-3 bg-white/80 border-t border-white/60">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_REPLIES.map((q) => (
                  <button key={q} onClick={() => send(q)} disabled={loading} className="text-[11px] rounded-full border border-brand-ink/10 bg-white px-2.5 py-1 text-brand-ink2 hover:border-[#6D28D9] hover:text-[#6D28D9] transition-colors disabled:opacity-50">{q}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} disabled={loading} placeholder="Ask about pricing, book a call…" className="flex-1 rounded-full border border-brand-ink/10 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-[#6D28D9] disabled:opacity-60" />
                <button onClick={() => send()} disabled={loading || !input.trim()} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white disabled:opacity-50"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ---------- Page ----------
function App() {
  const [businessType, setBusinessType] = useState('');
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Marquee />
      <Positioning />
      <About />
      <Services />
      <WhoWeHelp />
      <Pricing />
      <WhyFulvora />
      <Contact onBusinessTypeChange={setBusinessType} />
      <Footer />
      <WhatsAppPill businessType={businessType} />
      <Chatbot />
    </main>
  );
}

export default App;
