import { NextResponse } from 'next/server';
import { getLeads, addLeads } from '@/lib/db';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ success: true, leads, total: leads.length });
  } catch (error) {
    console.error('Failed to get leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newLeads = Array.isArray(body) ? body : [body];
    const updated = await addLeads(newLeads);
    return NextResponse.json({ success: true, leads: updated, count: newLeads.length });
  } catch (error) {
    console.error('Failed to save leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to save leads' }, { status: 500 });
  }
}
