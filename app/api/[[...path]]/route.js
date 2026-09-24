import { NextResponse } from 'next/server';
import dns from 'node:dns';
import crypto from 'node:crypto';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { createChat, UserMessage, validateApiKey } from 'emergentintegrations';
import { Resend } from 'resend';

// ------------------------------------------------------------------
// Fulvora Digital — API routes
// Base: /api/*
// Endpoints: /api/health (GET), /api/contact (POST), /api/chat (POST)
// ------------------------------------------------------------------

export const runtime = 'nodejs';

const ADMIN_COOKIE = 'fulvora_admin_session';
const ADMIN_SESSION_SECONDS = 60 * 60 * 12;
const LEAD_COLLECTIONS = {
  contacts: 'contact_leads',
  onboarding: 'onboarding_leads',
  chat: 'chat_leads',
};
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

function sameSecret(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right);
}

function encodeAdminToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', adminSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || !adminSecret()) return false;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  const expected = crypto.createHmac('sha256', adminSecret()).update(encoded).digest('base64url');
  if (!sameSecret(signature, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    return payload.role === 'admin' && Number(payload.exp) > Date.now();
  } catch (_) {
    return false;
  }
}

function isAdmin(request) {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

function adminRequired() {
  return json({ ok: false, error: 'Admin authentication required.' }, 401);
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch (_) {
    return false;
  }
}

function adminMutationAllowed(request) {
  return isAdmin(request) && sameOrigin(request);
}

function loginRateLimited(request, email) {
  const key = `${request.headers.get('x-forwarded-for') || 'local'}:${email}`;
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || now - current.startedAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > LOGIN_MAX_ATTEMPTS;
}

function clearLoginAttempts(request, email) {
  loginAttempts.delete(`${request.headers.get('x-forwarded-for') || 'local'}:${email}`);
}

function safeAdminFields(input) {
  return Object.fromEntries(Object.entries(input || {}).filter(([key]) => (
    key !== '_id' && key !== 'id' && key !== 'source' && key !== 'createdAt' && !key.startsWith('$') && !key.includes('.')
  )));
}

function collectionName(type) {
  return LEAD_COLLECTIONS[type] || null;
}

function serialiseLead(lead) {
  if (!lead) return lead;
  return { ...lead, _id: lead._id?.toString?.() || lead._id };
}

let cachedClient = null;
async function getDb() {
  if (cachedClient) return cachedClient.db(process.env.DB_NAME || 'fulvora');
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error('MONGO_URL not configured');
  const dnsServers = (process.env.MONGO_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
  if (dnsServers.length) dns.setServers(dnsServers);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await client.connect();
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (lastError) throw lastError;
  cachedClient = client;
  return client.db(process.env.DB_NAME || 'fulvora');
}

const json = (data, status = 200) => NextResponse.json(data, { status });

// ------------------------------------------------------------------
// Email alerts via Resend
// ------------------------------------------------------------------
let cachedResend = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

async function sendLeadEmail({ subject, heading, rows, transcript }) {
  const resend = getResend();
  if (!resend) return { skipped: true, reason: 'RESEND_API_KEY missing' };
  const to = process.env.LEAD_ALERT_TO || 'fulvoradigital@gmail.com';
  const from = process.env.LEAD_ALERT_FROM || 'Fulvora Leads <onboarding@resend.dev>';

  const rowsHtml = rows
    .filter((r) => r.value)
    .map((r) => `<tr><td style="padding:8px 14px;color:#4B5563;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(r.label)}</td><td style="padding:8px 14px;color:#111827;font-size:15px;font-weight:600;">${escapeHtml(r.value)}</td></tr>`)
    .join('');

  const transcriptHtml = transcript
    ? `<h3 style="margin:24px 0 8px;font-family:Inter,system-ui;font-size:14px;color:#4B5563;text-transform:uppercase;letter-spacing:0.08em;">Chat transcript</h3><pre style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:14px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#111827;white-space:pre-wrap;word-break:break-word;">${escapeHtml(transcript)}</pre>`
    : '';

  const html = `<!doctype html><html><body style="margin:0;background:#F8FAFC;padding:24px;font-family:Inter,Helvetica,Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px -20px rgba(49,46,129,0.18);">
      <div style="background:linear-gradient(135deg,#6D28D9,#8B5CF6);padding:20px 24px;color:white;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;opacity:0.85;">Fulvora Digital</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">${escapeHtml(heading)}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
      <div style="padding:0 20px 24px;">${transcriptHtml}</div>
      <div style="padding:14px 24px;background:#F8FAFC;color:#6B7280;font-size:12px;">Sent automatically from your Fulvora website.</div>
    </div>
  </body></html>`;

  try {
    const result = await resend.emails.send({ from, to, subject, html });
    if (result?.error) console.error('[Resend] send error:', result.error);
    else console.log('[Resend] sent id=', result?.data?.id, 'to=', to, 'subject=', subject);
    return { ok: !result?.error, id: result?.data?.id, error: result?.error?.message };
  } catch (err) {
    console.error('[Resend] threw:', err?.message);
    return { ok: false, error: err?.message };
  }
}

// ------------------------------------------------------------------
// /api/contact
// ------------------------------------------------------------------
async function handleContact(request) {
  try {
    const body = await request.json();
    const { name, phone, businessType, message } = body || {};
    if (!name || !phone) return json({ ok: false, error: 'Name and phone are required.' }, 400);

    const doc = {
      id: uuidv4(),
      name: String(name).trim().slice(0, 120),
      phone: String(phone).trim().slice(0, 40),
      businessType: businessType ? String(businessType).trim().slice(0, 120) : '',
      message: message ? String(message).trim().slice(0, 2000) : '',
      source: 'website_contact_form',
      createdAt: new Date().toISOString(),
    };

    let stored = false;
    try {
      const db = await getDb();
      await db.collection('contact_leads').insertOne(doc);
      stored = true;
    } catch (dbErr) {
      console.warn('[contact] DB insert skipped:', dbErr?.message || dbErr);
    }

    const emailResult = await sendLeadEmail({
      subject: `New website enquiry — ${doc.name}${doc.businessType ? ` · ${doc.businessType}` : ''}`,
      heading: 'New contact form enquiry',
      rows: [
        { label: 'Name', value: doc.name },
        { label: 'Phone', value: doc.phone },
        { label: 'Business Type', value: doc.businessType },
        { label: 'Message', value: doc.message },
        { label: 'Source', value: 'Contact form' },
        { label: 'Received', value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' },
      ],
    });

    if (!stored && !emailResult?.ok) {
      return json({
        ok: false,
        error: 'We could not save your enquiry. Please try again or contact us on WhatsApp.',
      }, 503);
    }

    return json({
      ok: true,
      id: doc.id,
      stored,
      emailed: !!emailResult?.ok,
    });
  } catch (err) {
    return json({ ok: false, error: err?.message || 'Unexpected error' }, 500);
  }
}

// ------------------------------------------------------------------
// /api/chat  — Gemini-powered concierge via Emergent universal key
// ------------------------------------------------------------------
const FULVORA_SYSTEM = `You are Fulvora Assistant — the friendly, sharp concierge for Fulvora Digital, an AI-powered performance marketing agency serving local businesses in Pune and Pimpri-Chinchwad (PCMC), Maharashtra, India.

YOUR JOB
1. Answer questions about Fulvora's services, pricing, industries, areas served, and process.
2. Qualify visitors by gently asking (across turns, one question at a time): what business they run, which area of Pune/PCMC, current monthly marketing spend if any, and their main goal (calls / WhatsApp / leads / store visits).
3. Once you have their business type and goal, warmly ask for their name and best contact number so our team can follow up. Frame it as an easy next step — never demand.
4. When the visitor shows real intent (asks about a call, meeting, quote, next steps, or has answered 2+ qualification questions), invite them to book a free 30-min strategy call and ALWAYS include this exact link on its own line: https://calendly.com/fulvoradigital/30min
5. If they prefer WhatsApp, share: +91 72182 00921. For email: fulvoradigital@gmail.com.

STYLE
- Warm, confident, professional Indian English. Never salesy.
- Keep replies short (2–4 sentences max). Use light line breaks for readability.
- Never promise guaranteed leads, ROAS, sales, 10X growth, or overnight results.
- Never fabricate testimonials, case studies, or revenue numbers.
- Do not use markdown headers (#, ##). Simple text and short bullet dashes are fine.

KNOWLEDGE BASE
Services: Meta Ads · Google Ads · Google Business Profile · Social Media Management · Landing Page Optimization · Transparent Reporting.
Pricing (INR, per month, ad spend excluded):
  • Starter (Local Lead Engine): ₹18,000 – ₹25,000. Meta OR Google Ads, 6–8 creatives, weekly optimisation, monthly report.
  • Growth (Most Popular – Multi-Channel): ₹30,000 – ₹45,000. Meta + Google, retargeting, landing page, 12–15 creatives, bi-weekly calls.
  • Custom (Full Brand + Ads): Custom quote. Includes brand strategy, website, LinkedIn, YouTube, WhatsApp + email automation, dashboard.
Ad spend is separate, paid directly to Meta/Google. Typical range: ₹10,000 – ₹1,00,000 / month.
Areas served: Wakad, Hinjewadi, Baner, Aundh, Kothrud, Viman Nagar, Pimpri, Chinchwad, Nigdi, Akurdi, Ravet, Deccan and wider Pune + PCMC.
Industries: dentists, dermatologists, clinics, physiotherapists, veterinary clinics, salons, spas, gyms, yoga studios, fitness coaches, interior designers, painters, cleaners, real estate agents, builders, pet stores, kids wear, electronics, footwear, local retailers.
Contact: +91 72182 00921 (Phone + WhatsApp) · fulvoradigital@gmail.com · Hours: Mon–Sat, 10 AM–7 PM IST.
Social: Instagram @fulvoradigital (https://instagram.com/fulvoradigital) · LinkedIn @fulvoradigital (https://www.linkedin.com/company/fulvoradigital).

If you don't know something specific, say so and invite them to WhatsApp or book a call.`;

const EXTRACTOR_SYSTEM = `You are a strict information-extraction tool. Given a chat transcript between a visitor and a marketing agency assistant, extract the visitor's details.

Return ONLY a compact JSON object with these keys and NO other text, no markdown fences:
{
  "name": "",
  "phone": "",
  "businessType": "",
  "area": "",
  "goal": "",
  "bookingIntent": false
}

Rules:
- "name": full name of the visitor if they shared it, else empty string.
- "phone": Indian phone number if they shared it. Keep digits and optional leading +91. Empty string if none.
- "businessType": the visitor's business/industry (e.g. "Dental Clinic", "Salon", "Real Estate"). Empty if not stated.
- "area": Pune/PCMC locality mentioned by the visitor (e.g. "Wakad", "Baner"). Empty if not stated.
- "goal": their main goal in short phrase (e.g. "more phone calls", "walk-ins", "WhatsApp leads"). Empty if not stated.
- "bookingIntent": true only if the visitor asked to book / schedule / hop on a call / meeting or accepted the Calendly link. Otherwise false.
- If a field is unclear or missing, use an empty string (or false for bookingIntent). Do NOT guess.
- Output MUST be valid JSON.`;

function safeJsonParse(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) {}
  // Try to extract JSON object substring
  const m = String(text).match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  return null;
}

async function extractLeadFields(sessionId, transcript) {
  try {
    const chat = createChat({
      apiKey: validateApiKey(process.env.EMERGENT_LLM_KEY),
      sessionId: `extract-${sessionId}`,
      systemMessage: EXTRACTOR_SYSTEM,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      params: { temperature: 0 },
    });
    const res = await chat.sendMessage(new UserMessage({ text: transcript }));
    const raw = typeof res === 'string' ? res : (res?.text || res?.content || '');
    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      name: (parsed.name || '').toString().trim().slice(0, 120),
      phone: (parsed.phone || '').toString().trim().slice(0, 40),
      businessType: (parsed.businessType || '').toString().trim().slice(0, 120),
      area: (parsed.area || '').toString().trim().slice(0, 80),
      goal: (parsed.goal || '').toString().trim().slice(0, 160),
      bookingIntent: !!parsed.bookingIntent,
    };
  } catch (err) {
    return null;
  }
}

async function upsertChatLead(db, sessionId, extracted, transcript) {
  const leads = db.collection('chat_leads');
  const existing = await leads.findOne({ sessionId });

  // Merge: prefer existing non-empty values, but overwrite when new is longer/better.
  const merge = (a, b) => {
    const A = (a || '').trim();
    const B = (b || '').trim();
    if (!A) return B;
    if (!B) return A;
    // Prefer the longer/more specific value
    return B.length > A.length ? B : A;
  };

  const merged = {
    name: merge(existing?.name, extracted.name),
    phone: merge(existing?.phone, extracted.phone),
    businessType: merge(existing?.businessType, extracted.businessType),
    area: merge(existing?.area, extracted.area),
    goal: merge(existing?.goal, extracted.goal),
    bookingIntent: !!(existing?.bookingIntent || extracted.bookingIntent),
  };

  const qualified = !!(merged.name && merged.phone);
  const now = new Date();
  const wasQualified = !!(existing && existing.qualified);
  const wasBookingIntent = !!(existing && existing.bookingIntent);
  const justQualified = qualified && !wasQualified;
  const justBooked = merged.bookingIntent && !wasBookingIntent;

  const doc = {
    ...merged,
    qualified,
    lastTranscript: transcript.slice(-4000),
    updatedAt: now,
  };

  if (!existing) {
    doc.id = uuidv4();
    doc.sessionId = sessionId;
    doc.source = 'website_chatbot';
    doc.createdAt = now;
    await leads.insertOne(doc);
  } else {
    await leads.updateOne({ sessionId }, { $set: doc });
  }

  // Future: send email alert via Resend when justQualified OR justBooked.
  // (Placeholder — plugged in once RESEND_API_KEY is configured.)
  const finalDoc = existing ? { ...existing, ...doc } : doc;
  return { lead: finalDoc, justQualified, justBooked };
}

function buildTranscript(messages) {
  return messages
    .map((m) => `${m.role === 'user' ? 'VISITOR' : 'ASSISTANT'}: ${m.content}`)
    .join('\n');
}

async function handleChat(request) {
  try {
    const body = await request.json();
    const { sessionId, message } = body || {};
    if (!sessionId || !message) return json({ ok: false, error: 'sessionId and message are required' }, 400);

    const trimmed = String(message).trim().slice(0, 2000);
    if (!trimmed) return json({ ok: false, error: 'Message cannot be empty' }, 400);

    const db = await getDb();
    const threads = db.collection('chat_threads');
    const messages = db.collection('chat_messages');

    await threads.updateOne(
      { sessionId },
      { $setOnInsert: { sessionId, createdAt: new Date() }, $set: { updatedAt: new Date() } },
      { upsert: true },
    );

    await messages.insertOne({ sessionId, role: 'user', content: trimmed, createdAt: new Date() });

    const chat = createChat({
      apiKey: validateApiKey(process.env.EMERGENT_LLM_KEY),
      sessionId,
      systemMessage: FULVORA_SYSTEM,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      params: { temperature: 0.5 },
    });

    const reply = await chat.sendMessage(new UserMessage({ text: trimmed }));
    const assistantText = (typeof reply === 'string' ? reply : (reply?.text || reply?.message?.text || reply?.content || '')) || 'Sorry, I could not reply right now. Please WhatsApp us at +91 72182 00921.';

    await messages.insertOne({ sessionId, role: 'assistant', content: assistantText, createdAt: new Date() });
    await threads.updateOne({ sessionId }, { $set: { updatedAt: new Date() } });

    // ---- Lead auto-capture (fire-and-await, still fast) ----
    let leadStatus = null;
    try {
      const recent = await messages
        .find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(16)
        .toArray();
      const transcript = buildTranscript(recent.reverse());
      const extracted = await extractLeadFields(sessionId, transcript);
      if (extracted) {
        const result = await upsertChatLead(db, sessionId, extracted, transcript);
        leadStatus = {
          qualified: result.lead.qualified,
          justQualified: result.justQualified,
          justBooked: result.justBooked,
        };

        // Email alert when a chat lead becomes qualified OR shows booking intent (once each)
        if (result.justQualified || result.justBooked) {
          const eventLabel = result.justBooked && result.justQualified
            ? 'Qualified lead + booking intent'
            : result.justBooked ? 'Booking intent detected' : 'New qualified chat lead';
          sendLeadEmail({
            subject: `${eventLabel} — ${result.lead.name || 'Unnamed visitor'}${result.lead.businessType ? ` · ${result.lead.businessType}` : ''}`,
            heading: eventLabel,
            rows: [
              { label: 'Name', value: result.lead.name },
              { label: 'Phone', value: result.lead.phone },
              { label: 'Business Type', value: result.lead.businessType },
              { label: 'Area', value: result.lead.area },
              { label: 'Goal', value: result.lead.goal },
              { label: 'Booking Intent', value: result.lead.bookingIntent ? 'Yes' : 'No' },
              { label: 'Session ID', value: sessionId },
              { label: 'Source', value: 'AI Concierge chat' },
              { label: 'Received', value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' },
            ],
            transcript,
          }).catch(() => {});
        }
      }
    } catch (leadErr) {
      // Never let lead extraction break the chat.
      console.error('lead extraction failed:', leadErr?.message);
    }

    return json({ ok: true, sessionId, reply: assistantText, lead: leadStatus });
  } catch (err) {
    return json({ ok: false, error: err?.message || 'Chat failed' }, 500);
  }
}

function resolvePath(params) {
  const parts = params?.path || [];
  return '/' + (Array.isArray(parts) ? parts.join('/') : parts);
}

export async function GET(request, ctx) {
  const params = await ctx.params;
  const path = resolvePath(params);
  if (path === '/admin/me') return handleAdminMe(request);
  if (path.startsWith('/admin/leads/')) return handleAdminLeads(request, path.split('/')[3]);
  if (path === '/health' || path === '/') {
    return json({ ok: true, service: 'fulvora-api', time: new Date().toISOString() });
  }
  return json({ ok: false, error: 'Not found' }, 404);
}

async function handleOnboarding(request) {
  try {
    const body = await request.json();
    const payload = body || {};

    const required = ['businessName', 'ownerName', 'phoneWhatsapp', 'email', 'address', 'serviceAreas', 'topServices'];
    const missing = required.filter((field) => !String(payload[field] || '').trim());
    if (missing.length) {
      return json({ ok: false, error: 'Missing required onboarding fields.', missing }, 400);
    }

    const doc = {
      id: uuidv4(),
      source: 'client_onboarding_form',
      ...payload,
      createdAt: new Date().toISOString(),
      mainGoals: Array.isArray(payload.mainGoals) ? payload.mainGoals : [],
    };

    try {
      const db = await getDb();
      await db.collection('onboarding_leads').insertOne(doc);
    } catch (dbErr) {
      console.warn('[onboarding] DB insert skipped:', dbErr?.message || dbErr);
    }

    const rows = [
      { label: 'Business Name', value: doc.businessName },
      { label: 'Owner', value: doc.ownerName },
      { label: 'Phone / WhatsApp', value: doc.phoneWhatsapp },
      { label: 'Email', value: doc.email },
      { label: 'Address', value: doc.address },
      { label: 'Service Area', value: doc.serviceAreas },
      { label: 'Top Services', value: doc.topServices },
      { label: 'Main Goal(s)', value: doc.mainGoals.join(', ') },
      { label: 'Ad Spend Comfort', value: doc.comfortableAdSpend },
      { label: 'Website', value: doc.website },
      { label: 'Source', value: 'Client onboarding form' },
      { label: 'Received', value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' },
    ];

    sendLeadEmail({
      subject: `New onboarding form — ${doc.businessName || doc.ownerName || 'Unnamed business'}`,
      heading: 'New client onboarding submission',
      rows,
    }).catch(() => {});

    return json({ ok: true, id: doc.id });
  } catch (err) {
    return json({ ok: false, error: err?.message || 'Unexpected error' }, 500);
  }
}

async function handleAdminLogin(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    if (loginRateLimited(request, email)) {
      return json({ ok: false, error: 'Too many login attempts. Try again later.' }, 429);
    }
    const valid = adminSecret()
      && sameSecret(email, String(process.env.ADMIN_EMAIL || '').trim().toLowerCase())
      && sameSecret(password, process.env.ADMIN_PASSWORD);
    if (!valid) return json({ ok: false, error: 'Invalid admin credentials.' }, 401);
    clearLoginAttempts(request, email);

    const response = json({ ok: true, email });
    response.cookies.set(ADMIN_COOKIE, encodeAdminToken({
      role: 'admin',
      email,
      exp: Date.now() + ADMIN_SESSION_SECONDS * 1000,
    }), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ADMIN_SESSION_SECONDS,
      path: '/',
    });
    return response;
  } catch (err) {
    return json({ ok: false, error: err?.message || 'Login failed.' }, 400);
  }
}

function handleAdminLogout() {
  const response = json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, expires: new Date(0), path: '/' });
  return response;
}

function handleAdminMe(request) {
  return json({ ok: isAdmin(request), authenticated: isAdmin(request) });
}

async function handleAdminLeads(request, type) {
  if (!isAdmin(request)) return adminRequired();
  const name = collectionName(type);
  if (!name) return json({ ok: false, error: 'Unknown lead collection.' }, 404);
  const db = await getDb();
  const leads = await db.collection(name).find({}).sort({ createdAt: -1, updatedAt: -1 }).limit(500).toArray();
  return json({ ok: true, type, leads: leads.map(serialiseLead) });
}

async function handleAdminLeadCreate(request, type) {
  if (!adminMutationAllowed(request)) return adminRequired();
  const name = collectionName(type);
  if (!name) return json({ ok: false, error: 'Unknown lead collection.' }, 404);
  const body = await request.json();
  const input = body && typeof body === 'object' ? safeAdminFields(body) : {};
  const doc = {
    ...input,
    id: uuidv4(),
    source: input.source || `admin_${type}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const db = await getDb();
  await db.collection(name).insertOne(doc);
  return json({ ok: true, lead: serialiseLead(doc) }, 201);
}

async function handleAdminLeadMutation(request, type, id, method) {
  if (!adminMutationAllowed(request)) return adminRequired();
  const name = collectionName(type);
  if (!name) return json({ ok: false, error: 'Unknown lead collection.' }, 404);
  if (!id) return json({ ok: false, error: 'Lead id is required.' }, 400);
  const db = await getDb();
  const leads = db.collection(name);
  const filter = { id };

  if (method === 'DELETE') {
    const result = await leads.deleteOne(filter);
    if (!result.deletedCount) return json({ ok: false, error: 'Lead not found.' }, 404);
    return json({ ok: true, deleted: id });
  }

  const body = await request.json();
  const updates = body && typeof body === 'object' ? safeAdminFields(body) : {};
  updates.updatedAt = new Date();
  const result = await leads.updateOne(filter, { $set: updates });
  if (!result.matchedCount) return json({ ok: false, error: 'Lead not found.' }, 404);
  const updated = await leads.findOne(filter);
  return json({ ok: true, lead: serialiseLead(updated) });
}

export async function POST(request, ctx) {
  const params = await ctx.params;
  const path = resolvePath(params);
  if (path === '/admin/login') return handleAdminLogin(request);
  if (path === '/admin/logout') return sameOrigin(request) ? handleAdminLogout() : adminRequired();
  if (path.startsWith('/admin/leads/')) return handleAdminLeadCreate(request, path.split('/')[3]);
  if (path === '/contact') return handleContact(request);
  if (path === '/chat') return handleChat(request);
  if (path === '/onboarding') return handleOnboarding(request);
  return json({ ok: false, error: 'Not found' }, 404);
}

export async function PUT(request, ctx) {
  const params = await ctx.params;
  const parts = params?.path || [];
  if (Array.isArray(parts) && parts[0] === 'admin' && parts[1] === 'leads') {
    return handleAdminLeadMutation(request, parts[2], parts[3], 'PUT');
  }
  return json({ ok: false, error: 'Not found' }, 404);
}

export async function PATCH(request, ctx) {
  return PUT(request, ctx);
}

export async function DELETE(request, ctx) {
  const params = await ctx.params;
  const parts = params?.path || [];
  if (Array.isArray(parts) && parts[0] === 'admin' && parts[1] === 'leads') {
    return handleAdminLeadMutation(request, parts[2], parts[3], 'DELETE');
  }
  return json({ ok: false, error: 'Not found' }, 404);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
