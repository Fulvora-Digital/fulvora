'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/me').then((response) => response.json()).then((data) => {
      if (data.authenticated) router.replace('/admin/dashboard');
    }).catch(() => {});
  }, [router]);

  async function submit(event) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Login failed.');
      router.replace('/admin/dashboard');
    } catch (err) {
      setStatus('idle');
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#101318] px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur md:p-9">
          <div className="mb-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Fulvora Digital</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin workspace</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">Sign in to manage enquiries, onboarding submissions, and chat leads.</p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <label className="block text-sm text-white/70">
              Email
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300" />
            </label>
            <label className="block text-sm text-white/70">
              Password
              <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300" />
            </label>
            {error && <p className="rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <button disabled={status === 'loading'} className="w-full rounded-xl bg-emerald-300 px-4 py-3 font-semibold text-[#101318] transition hover:bg-emerald-200 disabled:opacity-60">
              {status === 'loading' ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
