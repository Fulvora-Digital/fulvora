'use client';

import { OnboardingWizard } from '@/components/ClientOnboardingForm';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(109,40,217,0.12),_transparent_35%),linear-gradient(180deg,#f9f7ff_0%,#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-purple">Fulvora Digital</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-brand-ink md:text-4xl">
              Client onboarding
            </h1>
          </div>
          <a
            href="/"
            className="inline-flex items-center rounded-full border border-brand-ink/10 bg-white px-4 py-2 text-sm font-medium text-brand-ink transition hover:border-brand-purple/60 hover:text-brand-purple"
          >
            Back to home
          </a>
        </div>

        <div className="rounded-[30px] border border-brand-ink/10 bg-white/80 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-6">
          <div className="mb-5 rounded-2xl border border-brand-purple/15 bg-brand-purple/5 p-4 text-sm text-brand-ink2">
            Tell us about your business. This helps us understand your goals, market, and the best growth path for your brand.
          </div>
          <OnboardingWizard />
        </div>
      </div>
    </main>
  );
}
