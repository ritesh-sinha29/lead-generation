import { NextResponse } from 'next/server';
import { getLeads } from '@/lib/db';
import { generateLeadsPipelinePdf, generateSingleLeadProposalPdf } from '@/lib/pdfGenerator';
import { LeadStatus } from '@/types/lead';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get('format') || 'csv').toLowerCase();
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status') as LeadStatus | 'all' | null;
    const niche = searchParams.get('niche');
    const search = searchParams.get('search');
    const ids = searchParams.get('ids');

    let leads = await getLeads();

    // If exporting a single specific lead
    if (leadId) {
      const singleLead = leads.find((l) => l.id === leadId);
      if (!singleLead) {
        return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      }

      if (format === 'pdf') {
        const pdfBuffer = generateSingleLeadProposalPdf(singleLead);
        const safeName = (singleLead.businessName || 'lead').replace(/[^a-zA-Z0-9_-]/g, '_');
        return new NextResponse(new Uint8Array(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="proposal_${safeName}_${new Date().toISOString().split('T')[0]}.pdf"`,
          },
        });
      }
      leads = [singleLead];
    }

    // Apply filters if provided
    if (ids) {
      const idList = ids.split(',').map((id) => id.trim());
      leads = leads.filter((l) => idList.includes(l.id));
    }
    if (status && status !== 'all') {
      leads = leads.filter((l) => l.status === status);
    }
    if (niche && niche !== 'All') {
      leads = leads.filter((l) => l.niche?.toLowerCase() === niche.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      leads = leads.filter((l) =>
        (l.businessName || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        (l.niche || '').toLowerCase().includes(q)
      );
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // 1. PDF Format (Pipeline Intelligence Report)
    if (format === 'pdf') {
      let filterDesc = '';
      if (status && status !== 'all') filterDesc += `Status: ${status.toUpperCase()} `;
      if (niche && niche !== 'All') filterDesc += `Niche: ${niche} `;
      if (search) filterDesc += `Search: "${search}"`;

      const pdfBuffer = generateLeadsPipelinePdf(leads, {
        filterDescription: filterDesc.trim() || undefined,
      });

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="leads_report_${todayDate}.pdf"`,
        },
      });
    }

    // 2. JSON Format
    if (format === 'json') {
      return new NextResponse(JSON.stringify(leads, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="leads_export_${todayDate}.json"`,
        },
      });
    }

    // 3. Excel / CSV Format (with UTF-8 BOM so Microsoft Excel renders accents and symbols cleanly)
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

    // \uFEFF ensures Microsoft Excel detects UTF-8 correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads_${todayDate}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
