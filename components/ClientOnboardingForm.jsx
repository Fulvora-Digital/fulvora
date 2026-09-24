'use client';

import Link from 'next/link';
import { useState } from 'react';

const ONBOARDING_ENDPOINT = '/api/onboarding';

const STEPS = [
  'Basic Business Info',
  'Location & Service Area',
  'Offers & Services',
  'Current Marketing',
  'Competitor & Market Info',
  'Goals & Expectations',
  'Operations & Follow-up',
  'Brand & Content',
  'Review & Submit',
];

const GOAL_OPTIONS = ['Calls', 'WhatsApp messages', 'Form leads', 'Store visits', 'Other'];
const SPEND_OPTIONS = ['₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'];

const initialData = {
  businessName: '',
  ownerName: '',
  phoneWhatsapp: '',
  email: '',
  website: '',
  gmbLink: '',
  socialHandles: '',
  address: '',
  serviceAreas: '',
  hasMultipleBranches: '',
  branchList: '',
  topServices: '',
  bestOffer: '',
  newCustomerOffer: '',
  avgTicketSize: '',
  runningAdsNow: '',
  adDetails: '',
  howCustomersFindYou: '',
  hasExistingCreatives: '',
  directCompetitors: '',
  uniqueSellingPoint: '',
  targetCustomerProfile: '',
  competitorsToBenchmark: '',
  mainGoals: [],
  leadsPerMonthWorthIt: '',
  comfortableAdSpend: '',
  pastConcerns: '',
  whoHandlesLeads: '',
  businessHours: '',
  leadConversionProcess: '',
  openToTracking: '',
  hasLogoColors: '',
  brandDoDonts: '',
  canUsePhotosVideos: '',
};

function Field({ label, required, hint, children }) {
  return (
    <label className="mb-5 block">
      <span className="mb-1.5 block text-sm font-semibold text-brand-ink">
        {label}
        {required && <span className="ml-1 text-brand-purple">*</span>}
      </span>
      {hint && <span className="mb-1.5 block text-xs text-brand-ink2">{hint}</span>}
      {children}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-brand-ink/10 bg-white px-3.5 py-3 text-sm text-brand-ink placeholder:text-brand-ink/45 transition focus:border-brand-purple focus:outline-none focus:ring-4 focus:ring-brand-purple/10';
const textareaClass = `${inputClass} min-h-[100px] resize-y`;

function TextInput(props) {
  return <input {...props} className={inputClass} />;
}

function TextArea(props) {
  return <textarea {...props} className={textareaClass} />;
}

function RadioGroup({ value, onChange, options = ['Yes', 'No'] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            value === opt ? 'border-brand-purple bg-brand-purple text-white shadow-[0_10px_24px_rgba(109,40,217,0.25)]' : 'border-brand-ink/10 bg-white text-brand-ink hover:border-brand-purple/60 hover:text-brand-purple'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function OnboardingWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const set = (key) => (value) =>
    setData((d) => ({ ...d, [key]: typeof value === 'object' && value?.target ? value.target.value : value }));

  const toggleGoal = (goal) => {
    setData((d) => ({
      ...d,
      mainGoals: d.mainGoals.includes(goal) ? d.mainGoals.filter((g) => g !== goal) : [...d.mainGoals, goal],
    }));
  };

  const REQUIRED_BY_STEP = {
    0: ['businessName', 'ownerName', 'phoneWhatsapp', 'email'],
    1: ['address', 'serviceAreas'],
    2: ['topServices'],
  };

  const validateStep = (i) => {
    const required = REQUIRED_BY_STEP[i] || [];
    const newErrors = {};
    required.forEach((key) => {
      if (!String(data[key] || '').trim()) newErrors[key] = 'Required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setStatus('submitting');
    try {
      const res = await fetch(ONBOARDING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.ok) throw new Error(payload.error || 'Request failed');
      setStatus('success');
      setTimeout(() => onClose?.(), 1800);
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-xl px-6 py-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">✓</div>
        <h2 className="mb-2 text-2xl font-semibold text-neutral-900">Thank you!</h2>
        <p className="text-neutral-600">We&apos;ll review your answers and follow up to schedule your strategy call.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1 pb-2">
        <div className="mb-8 rounded-2xl border border-brand-ink/10 bg-gradient-to-r from-[#f8f5ff] to-[#f3fff9] p-4">
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium text-brand-ink2">
            <span>{STEPS[step]}</span>
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-brand-ink/10">
            <div
              className="h-full bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#10B981] transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-brand-purple/15 bg-brand-purple/5 p-3 text-sm text-brand-ink2">
          This usually takes 3–5 minutes and helps us understand your business, goals, and growth opportunities.
        </div>

      {step === 0 && (
        <>
          <Field label="Business name" required>
            <TextInput value={data.businessName} onChange={set('businessName')} placeholder="e.g. Smile Care Dental Clinic" />
            {errors.businessName && <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>}
          </Field>
          <Field label="Owner / main contact person name" required>
            <TextInput value={data.ownerName} onChange={set('ownerName')} />
            {errors.ownerName && <p className="mt-1 text-xs text-red-600">{errors.ownerName}</p>}
          </Field>
          <Field label="Phone number & WhatsApp number" required>
            <TextInput value={data.phoneWhatsapp} onChange={set('phoneWhatsapp')} placeholder="+91 XXXXX XXXXX" />
            {errors.phoneWhatsapp && <p className="mt-1 text-xs text-red-600">{errors.phoneWhatsapp}</p>}
          </Field>
          <Field label="Email address" required>
            <TextInput type="email" value={data.email} onChange={set('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </Field>
          <Field label="Website / landing page" hint="If any">
            <TextInput value={data.website} onChange={set('website')} placeholder="https://" />
          </Field>
          <Field label="Google Business Profile link" hint="If any">
            <TextInput value={data.gmbLink} onChange={set('gmbLink')} placeholder="https://g.page/..." />
          </Field>
          <Field label="Social media handles" hint="Instagram, Facebook, etc.">
            <TextInput value={data.socialHandles} onChange={set('socialHandles')} />
          </Field>
        </>
      )}

      {step === 1 && (
        <>
          <Field label="Full business address" required>
            <TextArea value={data.address} onChange={set('address')} />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
          </Field>
          <Field label="Areas/localities you mainly serve" required hint="e.g. Wakad, Hinjewadi, Baner…">
            <TextInput value={data.serviceAreas} onChange={set('serviceAreas')} />
            {errors.serviceAreas && <p className="mt-1 text-xs text-red-600">{errors.serviceAreas}</p>}
          </Field>
          <Field label="Do you have more than one branch?">
            <RadioGroup value={data.hasMultipleBranches} onChange={set('hasMultipleBranches')} />
          </Field>
          {data.hasMultipleBranches === 'Yes' && (
            <Field label="List your branches">
              <TextArea value={data.branchList} onChange={set('branchList')} />
            </Field>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <Field label="Top 3–5 services or products you want to promote" required>
            <TextArea value={data.topServices} onChange={set('topServices')} />
            {errors.topServices && <p className="mt-1 text-xs text-red-600">{errors.topServices}</p>}
          </Field>
          <Field label="Your best / most popular offer right now">
            <TextInput value={data.bestOffer} onChange={set('bestOffer')} />
          </Field>
          <Field label="Any special offers you can run for new customers?" hint="Discounts, free consults, trials, etc.">
            <TextArea value={data.newCustomerOffer} onChange={set('newCustomerOffer')} />
          </Field>
          <Field label="Average ticket size / average spend per customer">
            <TextInput value={data.avgTicketSize} onChange={set('avgTicketSize')} placeholder="₹" />
          </Field>
        </>
      )}

      {step === 3 && (
        <>
          <Field label="Are you running any ads right now?" hint="Meta, Google, others">
            <RadioGroup value={data.runningAdsNow} onChange={set('runningAdsNow')} />
          </Field>
          {data.runningAdsNow === 'Yes' && (
            <Field label="Platforms, approx. monthly spend, what's working / not working">
              <TextArea value={data.adDetails} onChange={set('adDetails')} />
            </Field>
          )}
          <Field label="How do most customers find you today?" hint="Walk-in, Google, Instagram, referrals, etc.">
            <TextInput value={data.howCustomersFindYou} onChange={set('howCustomersFindYou')} />
          </Field>
          <Field label="Do you have existing creatives?" hint="Photos, videos, logos, brand guidelines">
            <RadioGroup value={data.hasExistingCreatives} onChange={set('hasExistingCreatives')} />
          </Field>
        </>
      )}

      {step === 4 && (
        <>
          <Field label="Who are your direct competitors?" hint="Names, locations, or profile/website links">
            <TextArea value={data.directCompetitors} onChange={set('directCompetitors')} />
          </Field>
          <Field label="What makes you different from them?" hint="Your unique selling point">
            <TextArea value={data.uniqueSellingPoint} onChange={set('uniqueSellingPoint')} />
          </Field>
          <Field label="Describe your ideal customer" hint="Age, gender, income level, interests, etc.">
            <TextArea value={data.targetCustomerProfile} onChange={set('targetCustomerProfile')} />
          </Field>
          <Field label="Any competitors you admire or want to benchmark against?">
            <TextInput value={data.competitorsToBenchmark} onChange={set('competitorsToBenchmark')} />
          </Field>
        </>
      )}

      {step === 5 && (
        <>
          <Field label="What is your main goal from ads?" hint="Select all that apply">
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  type="button"
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`rounded-full border px-3.5 py-2.5 text-sm font-medium transition ${
                    data.mainGoals.includes(goal) ? 'border-brand-purple bg-brand-purple text-white shadow-[0_10px_24px_rgba(109,40,217,0.2)]' : 'border-brand-ink/10 bg-white text-brand-ink hover:border-brand-purple/50 hover:text-brand-purple'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </Field>
          <Field label="How many new customers/leads per month would make this 'worth it'?">
            <TextInput value={data.leadsPerMonthWorthIt} onChange={set('leadsPerMonthWorthIt')} />
          </Field>
          <Field label="Rough monthly ad spend you're comfortable with">
            <div className="flex flex-wrap gap-2">
              {SPEND_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => set('comfortableAdSpend')(opt)}
                  className={`rounded-full border px-3.5 py-2.5 text-sm font-medium transition ${
                    data.comfortableAdSpend === opt ? 'border-brand-purple bg-brand-purple text-white shadow-[0_10px_24px_rgba(109,40,217,0.2)]' : 'border-brand-ink/10 bg-white text-brand-ink hover:border-brand-purple/50 hover:text-brand-purple'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Any specific concerns or past bad experiences with ads/agencies?">
            <TextArea value={data.pastConcerns} onChange={set('pastConcerns')} />
          </Field>
        </>
      )}

      {step === 6 && (
        <>
          <Field label="Who will handle incoming calls/WhatsApp from ads?">
            <TextInput value={data.whoHandlesLeads} onChange={set('whoHandlesLeads')} />
          </Field>
          <Field label="What are your business hours?">
            <TextInput value={data.businessHours} onChange={set('businessHours')} />
          </Field>
          <Field label="Do you have a standard process to convert a lead into a customer?">
            <TextArea value={data.leadConversionProcess} onChange={set('leadConversionProcess')} />
          </Field>
          <Field label="Are you open to tracking calls/WhatsApp from ads?">
            <RadioGroup value={data.openToTracking} onChange={set('openToTracking')} />
          </Field>
        </>
      )}

      {step === 7 && (
        <>
          <Field label="Do you have a logo and brand colors?">
            <RadioGroup value={data.hasLogoColors} onChange={set('hasLogoColors')} />
          </Field>
          <Field label="Any specific do's/don'ts for how your brand should appear?">
            <TextArea value={data.brandDoDonts} onChange={set('brandDoDonts')} />
          </Field>
          <Field label="Can we use your real photos/videos in ads?">
            <RadioGroup value={data.canUsePhotosVideos} onChange={set('canUsePhotosVideos')} />
          </Field>
        </>
      )}

      {step === 8 && (
        <div>
          <p className="mb-5 text-neutral-600">Quick check before you submit — you can go back to any step to fix something.</p>
          <dl className="mb-6 max-h-72 space-y-2 overflow-y-auto pr-1 text-sm">
            {Object.entries(data).map(([key, value]) => {
              const display = Array.isArray(value) ? value.join(', ') : value;
              if (!display) return null;
              return (
                <div key={key} className="flex gap-3 border-b border-neutral-100 pb-2">
                  <dt className="w-44 shrink-0 capitalize text-neutral-500">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</dt>
                  <dd className="text-neutral-800">{display}</dd>
                </div>
              );
            })}
          </dl>
          {status === 'error' && <p className="mb-3 text-sm text-red-600">Something went wrong sending your form. Please try again.</p>}
        </div>
      )}

      <div className="mt-8 flex justify-between border-t border-neutral-100 pt-6">
        <button type="button" onClick={goBack} disabled={step === 0} className="rounded-xl border border-brand-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-brand-ink transition hover:border-brand-ink/20 hover:bg-brand-ink/5 disabled:opacity-0">
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={goNext} className="rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(109,40,217,0.25)] transition hover:brightness-110">
            Continue
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={status === 'submitting'} className="rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(109,40,217,0.25)] transition hover:brightness-110 disabled:opacity-60">
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ClientOnboardingForm() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-5xl rounded-[30px] border border-brand-ink/10 bg-gradient-to-r from-[#f7f3ff] via-white to-[#f1fff8] p-6 shadow-premium md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">
                Client onboarding
              </span>
              <h2 className="mt-5 font-heading text-3xl md:text-5xl font-bold text-brand-ink leading-[1.05]">
                Ready to grow your business with a sharper strategy?
              </h2>
              <p className="mt-4 max-w-xl text-base text-brand-ink2">
                Tell us about your business and goals. We’ll review the details and build a plan around the channels, offers, and positioning that fit your market.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <Link
                href="/onboarding"
                className="btn-shine inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(109,40,217,0.3)] transition hover:shadow-premium"
              >
                Start onboarding
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
