import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { createChat, UserMessage, validateApiKey } from 'emergentintegrations';

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

    // Future integration hooks (Resend, HubSpot, Zoho, Supabase) go here.

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
3. When the visitor shows real intent (asks about a call, meeting, quote, next steps, or has answered 2+ qualification questions), invite them to book a free 30-min strategy call and ALWAYS include this exact link on its own line: https://calendly.com/fulvoradigital/30min
4. If they prefer WhatsApp, share: +91 72182 00921. For email: fulvoradigital@gmail.com.

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

    return json({ ok: true, sessionId, reply: assistantText });
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
