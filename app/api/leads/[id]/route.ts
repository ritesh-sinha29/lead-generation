import { NextResponse } from 'next/server';
import { updateLead, deleteLead } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateLead(id, body);
    
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error('Failed to update lead:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteLead(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
