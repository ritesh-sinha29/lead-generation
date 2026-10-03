import { NextResponse } from 'next/server';
import { getLeads } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';
    const leads = await getLeads();

    if (format === 'json') {
      return new NextResponse(JSON.stringify(leads, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // CSV format
    const headers = [
      'Business Name',
      'Niche',
      'City',
      'Country',
      'Phone',
      'Email',
      'Website',
      'Decision Maker',
      'Role',
      'Google Rating',
      'Reviews Count',
      'Tech Health Score',
      'Monthly Revenue Leak',
      'Primary Gap Service',
      'Detected Issue',
      'Status',
      'Recommended Package',
      'Quote Sweet Spot Price',
      'ROI Break-Even Math',
      'Turnaround Timeline',
      'Cold Call Opener',
      'Cold Call Smoking Gun',
      'WhatsApp Pitch Message'
    ];

    const rows = leads.map((l) => {
      const primaryGap = l.audit.topGaps[0];
      const totalLeak = l.audit.topGaps.reduce((acc, g) => acc + (g.estimatedLostRevenueMonthly || 0), 0);
      const sweetSpot = l.pitchKit?.affordability?.recommendedSweetSpotPrice || l.pitchKit?.estimatedPrice || '';
      const roiMath = l.pitchKit?.affordability?.roiBreakEvenMath || l.pitchKit?.estimatedRoi || '';

      return [
        `"${(l.businessName || '').replace(/"/g, '""')}"`,
        `"${(l.niche || '').replace(/"/g, '""')}"`,
        `"${(l.city || '').replace(/"/g, '""')}"`,
        `"${(l.country || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.website || '').replace(/"/g, '""')}"`,
        `"${(l.decisionMakerName || '').replace(/"/g, '""')}"`,
        `"${(l.decisionMakerRole || '').replace(/"/g, '""')}"`,
        l.googleRating || 0,
        l.googleReviewsCount || 0,
        l.audit?.overallHealthScore || 0,
        `"₹${totalLeak.toLocaleString('en-IN')}/mo"`,
        `"${(primaryGap?.serviceTitle || '').replace(/"/g, '""')}"`,
        `"${(primaryGap?.detectedIssue || '').replace(/"/g, '""')}"`,
        `"${(l.status || '').replace(/"/g, '""')}"`,
        `"${(l.pitchKit?.recommendedPackageName || '').replace(/"/g, '""')}"`,
        `"${sweetSpot.replace(/"/g, '""')}"`,
        `"${roiMath.replace(/"/g, '""')}"`,
        `"${(l.pitchKit?.deliveryTimeline || '').replace(/"/g, '""')}"`,
        `"${(l.pitchKit?.coldCallOpener || '').replace(/"/g, '""')}"`,
        `"${(l.pitchKit?.coldCallSmokingGun || '').replace(/"/g, '""')}"`,
        `"${(l.pitchKit?.whatsappMessage || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
