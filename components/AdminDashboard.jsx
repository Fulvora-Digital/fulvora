'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const TABS = [
  { key: 'contacts', label: 'Contact leads', hint: 'Website enquiries' },
  { key: 'onboarding', label: 'Onboarding', hint: 'Client questionnaires' },
  { key: 'chat', label: 'Chat leads', hint: 'Assistant conversations' },
];

const LABELS = {
  contacts: ['name', 'phone', 'businessType', 'message', 'createdAt'],
  onboarding: ['businessName', 'ownerName', 'phoneWhatsapp', 'email', 'serviceAreas', 'createdAt'],
  chat: ['name', 'phone', 'businessType', 'area', 'goal', 'qualified', 'updatedAt'],
};

function displayValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function csvValue(value) {
  return `"${displayValue(value).replaceAll('"', '""')}"`;
}

function downloadCsv(rows, type) {
  if (!rows.length) return;
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row).filter((key) => key !== '_id')))];
  const csv = [keys.map(csvValue).join(','), ...rows.map((row) => keys.map((key) => csvValue(row[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `fulvora-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [type, setType] = useState('contacts');
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);

  const visibleLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) => JSON.stringify(lead).toLowerCase().includes(needle));
  }, [leads, query]);

  async function loadLeads(nextType = type) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/leads/${nextType}`, { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401) return router.replace('/admin');
      if (!response.ok || !data.ok) throw new Error(data.error || 'Could not load leads.');
      setLeads(data.leads || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLeads(); }, [type]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin');
  }

  async function saveLead() {
    setSaving(true);
    setError('');
    try {
      const isNew = editor.mode === 'create';
      const url = isNew ? `/api/admin/leads/${type}` : `/api/admin/leads/${type}/${editor.record.id}`;
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(JSON.parse(editor.text)),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Could not save lead.');
      setEditor(null);
      await loadLeads();
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Enter valid JSON before saving.' : err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteLead(lead) {
    if (!window.confirm('Delete this lead permanently?')) return;
    const response = await fetch(`/api/admin/leads/${type}/${lead.id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok || !data.ok) return setError(data.error || 'Could not delete lead.');
    setLeads((current) => current.filter((item) => item.id !== lead.id));
  }

  const fields = LABELS[type];

  return (
    <main className="min-h-screen bg-[#f4f6f3] text-[#17211d]">
      <header className="border-b border-[#17211d]/10 bg-[#17211d] text-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Fulvora Digital</p>
            <h1 className="mt-1 text-2xl font-semibold">Lead desk</h1>
          </div>
          <button onClick={logout} className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10">Sign out</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
        <div className="mb-7 grid gap-3 md:grid-cols-3">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setType(tab.key); setQuery(''); }} className={`rounded-2xl border p-4 text-left transition ${type === tab.key ? 'border-emerald-500 bg-white shadow-sm' : 'border-[#17211d]/10 bg-white/50 hover:bg-white'}`}>
              <div className="flex items-center justify-between gap-3"><span className="font-semibold">{tab.label}</span><span className="text-xl font-semibold">{type === tab.key ? leads.length : '-'}</span></div>
              <p className="mt-1 text-sm text-[#17211d]/55">{tab.hint}</p>
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-[#17211d]/10 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#17211d]/10 p-4 md:flex-row md:items-center md:justify-between">
            <div><h2 className="font-semibold">{TABS.find((tab) => tab.key === type)?.label}</h2><p className="text-sm text-[#17211d]/55">{visibleLeads.length} visible of {leads.length} records</p></div>
            <div className="flex flex-wrap gap-2">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads" className="rounded-lg border border-[#17211d]/15 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
              <button onClick={() => downloadCsv(visibleLeads, type)} disabled={!visibleLeads.length} className="rounded-lg border border-[#17211d]/15 px-3 py-2 text-sm font-medium hover:bg-[#f4f6f3] disabled:opacity-40">Export CSV</button>
              <button onClick={() => setEditor({ mode: 'create', record: {}, text: JSON.stringify({}, null, 2) })} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-[#102019] hover:bg-emerald-400">New lead</button>
            </div>
          </div>

          {error && <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {loading ? <p className="p-8 text-sm text-[#17211d]/55">Loading leads...</p> : !visibleLeads.length ? <p className="p-8 text-sm text-[#17211d]/55">No leads in this collection.</p> : (
            <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-[#f4f6f3] text-xs uppercase tracking-wide text-[#17211d]/55"><tr>{fields.map((field) => <th key={field} className="whitespace-nowrap px-4 py-3">{field}</th>)}<th className="px-4 py-3">Actions</th></tr></thead><tbody>{visibleLeads.map((lead) => <tr key={lead.id || lead._id} className="border-t border-[#17211d]/10 align-top hover:bg-[#fbfcfa]">{fields.map((field) => <td key={field} className="max-w-[260px] px-4 py-4 text-[#17211d]/75">{displayValue(lead[field]).slice(0, 220)}</td>)}<td className="whitespace-nowrap px-4 py-4"><button onClick={() => setEditor({ mode: 'edit', record: lead, text: JSON.stringify(lead, null, 2) })} className="mr-3 font-medium text-emerald-700 hover:underline">Edit</button><button onClick={() => deleteLead(lead)} className="font-medium text-red-600 hover:underline">Delete</button></td></tr>)}</tbody></table></div>
          )}
        </section>
      </div>

      {editor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101318]/60 p-5"><div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{editor.mode === 'create' ? 'Create lead' : 'Edit lead'}</h2><button onClick={() => setEditor(null)} className="text-xl text-[#17211d]/50">&times;</button></div><p className="mt-1 text-sm text-[#17211d]/55">Edit the record as JSON. System fields are preserved by the server.</p><textarea value={editor.text} onChange={(event) => setEditor({ ...editor, text: event.target.value })} className="mt-4 h-80 w-full rounded-xl border border-[#17211d]/15 bg-[#f8faf7] p-4 font-mono text-xs outline-none focus:border-emerald-500" spellCheck="false" /><div className="mt-4 flex justify-end gap-2"><button onClick={() => setEditor(null)} className="rounded-lg border border-[#17211d]/15 px-4 py-2 text-sm">Cancel</button><button onClick={saveLead} disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Save lead'}</button></div></div></div>}
    </main>
  );
}
