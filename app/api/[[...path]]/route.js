import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

// ------------------------------------------------------------------
// Fulvora Digital — API routes
// Base: /api/*
// Currently implements: /api/contact (POST), /api/health (GET)
// ------------------------------------------------------------------

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

async function handleContact(request) {
  try {
    const body = await request.json();
    const { name, phone, businessType, message } = body || {};

    if (!name || !phone) {
      return json({ ok: false, error: 'Name and phone are required.' }, 400);
    }

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

    // ------------------------------------------------------------------
    // Future integration points — uncomment/wire when credentials are ready:
    //
    // 1) Resend (transactional email notification to Fulvora inbox)
    //    import { Resend } from 'resend';
    //    const resend = new Resend(process.env.RESEND_API_KEY);
    //    await resend.emails.send({
    //      from: 'Fulvora <leads@fulvoradigital.com>',
    //      to: ['hello@fulvoradigital.com'],
    //      subject: `New lead: ${doc.name}`,
    //      text: `${doc.phone}\n${doc.businessType}\n${doc.message}`,
    //    });
    //
    // 2) SMTP (Nodemailer) alternative
    //
    // 3) HubSpot CRM — create contact + deal
    //    await fetch('https://api.hubapi.com/crm/v3/objects/contacts', { ... });
    //
    // 4) Zoho CRM — similar to HubSpot with Zoho OAuth
    //
    // 5) Supabase Postgres — replace/mirror Mongo insert
    // ------------------------------------------------------------------

    return json({ ok: true, id: doc.id });
  } catch (err) {
    return json({ ok: false, error: err?.message || 'Unexpected error' }, 500);
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
