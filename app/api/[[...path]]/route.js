import { NextResponse } from 'next/server';
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

let cachedClient = null;
async function getDb() {
  if (cachedClient) return cachedClient.db(process.env.DB_NAME || 'fulvora');
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error('MONGO_URL not configured');
  const client = new MongoClient(uri);
  await client.connect();
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

    const db = await getDb();
    await db.collection('contact_leads').insertOne(doc);

    // Fire-and-forget email alert (non-blocking to the visitor's response)
    sendLeadEmail({
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
    }).catch(() => {});

    return json({ ok: true, id: doc.id });
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
  if (path === '/health' || path === '/') {
    return json({ ok: true, service: 'fulvora-api', time: new Date().toISOString() });
  }
  return json({ ok: false, error: 'Not found' }, 404);
}

export async function POST(request, ctx) {
  const params = await ctx.params;
  const path = resolvePath(params);
  if (path === '/contact') return handleContact(request);
  if (path === '/chat') return handleChat(request);
  return json({ ok: false, error: 'Not found' }, 404);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
