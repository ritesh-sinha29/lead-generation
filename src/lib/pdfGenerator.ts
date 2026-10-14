import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead, getLeadDealValue } from '@/types/lead';

/**
 * Sanitizes and normalizes text for standard jsPDF Helvetica fonts (WinAnsi encoding)
 * Replacing unicode currency symbols, smart quotes, dashes, and unsupported glyphs.
 */
function cleanPdfText(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  const str = String(text);
  return str
    .replace(/₹/g, 'Rs. ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u25CF]/g, '*')
    .replace(/[^\x20-\x7E\r\n\t]/g, ' ')
    .trim();
}

export interface PipelinePdfOptions {
  title?: string;
  subtitle?: string;
  filterDescription?: string;
}

/**
 * Generates an executive-ready multi-page Landscape A4 PDF report
 * containing pipeline metrics, summaries, and complete lead intelligence tables.
 */
export function generateLeadsPipelinePdf(leads: Lead[], options?: PipelinePdfOptions): Buffer {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm
  const totalPagesExp = '{total_pages_count_string}';

  // Calculate Pipeline Metrics
  const totalPipelineValue = leads.reduce((acc, l) => acc + getLeadDealValue(l), 0);
  const totalMonthlyLeak = leads.reduce((acc, l) => {
    const gaps = l.audit?.topGaps || [];
    return acc + gaps.reduce((sum, g) => sum + (g.estimatedLostRevenueMonthly || 0), 0);
  }, 0);
  const verifiedPhones = leads.filter((l) => !!(l.phone && l.phone.trim() && l.phone !== 'N/A')).length;
  const highPriorityCount = leads.filter((l) => l.status === 'to_call' || l.status === 'meeting_booked').length;

  // 1. Top Accent Line (Indigo Brand Color)
  doc.setFillColor(99, 102, 241); // #6366f1
  doc.rect(0, 0, pageWidth, 3.5, 'F');

  // 2. Main Header Bar (Dark Slate/Zinc)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 3.5, pageWidth, 28, 'F');

  // Company Brand / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(cleanPdfText(options?.title || 'IXION LABS — PIPELINE INTELLIGENCE REPORT'), 14, 15);

  // Subtitle / Scope
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // #94a3b8
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const subText = options?.filterDescription
    ? `Generated on ${dateStr} • Scope: ${options.filterDescription} • Qualified Leads: ${leads.length}`
    : `Generated on ${dateStr} • Complete Agency Leads Pipeline • Total Qualified: ${leads.length}`;
  doc.text(cleanPdfText(subText), 14, 22);

  // Confidentiality Badge (Right Side)
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - 52, 10, 38, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(129, 140, 248);
  doc.text('STRICTLY CONFIDENTIAL', pageWidth - 33, 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('INTERNAL USE ONLY', pageWidth - 33, 20.5, { align: 'center' });

  // 3. Executive KPI Cards Row (Side-by-side metric boxes)
  const cardStartY = 35;
  const cardHeight = 15;
  const cardGap = 4;
  const usableWidth = pageWidth - 28; // 269 mm
  const cardWidth = (usableWidth - cardGap * 3) / 4; // ~64.25 mm each

  const kpis = [
    {
      label: 'EST. PIPELINE VALUE',
      value: `Rs. ${totalPipelineValue.toLocaleString('en-IN')}`,
      sub: 'Based on sweet-spot quote math',
      color: [99, 102, 241], // Indigo
    },
    {
      label: 'QUALIFIED OPPORTUNITIES',
      value: `${leads.length} Leads`,
      sub: `${highPriorityCount} Pending Call / Meeting`,
      color: [16, 185, 129], // Emerald
    },
    {
      label: 'MONTHLY REVENUE BLEED',
      value: `Rs. ${totalMonthlyLeak.toLocaleString('en-IN')}/mo`,
      sub: 'Combined client revenue gap',
      color: [244, 63, 94], // Rose
    },
    {
      label: 'DIRECT REACHABILITY',
      value: `${verifiedPhones} / ${leads.length}`,
      sub: 'Verified phones & contacts',
      color: [14, 165, 233], // Sky
    },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = 14 + idx * (cardWidth + cardGap);
    
    // Card background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(cardX, cardStartY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    // Left accent pill indicator
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(cardX, cardStartY, 2.5, cardHeight, 'F');

    // KPI Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, cardX + 5.5, cardStartY + 4.5);

    // KPI Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(cleanPdfText(kpi.value), cardX + 5.5, cardStartY + 9.5);

    // KPI Subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(cleanPdfText(kpi.sub), cardX + 5.5, cardStartY + 13);
  });

  // 4. Data Table (AutoTable)
  const headers = [
    '#',
    'Business & Location',
    'Contact & Decision Maker',
    'Audit & Rating',
    'Primary Gap & Monthly Leak',
    'Pitch Quote & Status',
  ];

  const rows = leads.map((l, index) => {
    const primaryGap = l.audit?.topGaps?.[0];
    const totalLeak = (l.audit?.topGaps || []).reduce(
      (acc, g) => acc + (g.estimatedLostRevenueMonthly || 0),
      0
    );
    const sweetSpot = l.pitchKit?.affordability?.recommendedSweetSpotPrice || l.pitchKit?.estimatedPrice || 'Rs. 45,000';
    const statusLabel = (l.status || 'to_call').toUpperCase().replace(/_/g, ' ');

    // Business Cell
    const businessCell = [
      l.businessName || 'Unnamed Business',
      `${l.niche || 'N/A'} • ${l.city || ''}${l.country ? ', ' + l.country : ''}`,
      l.website ? l.website.replace(/^https?:\/\//i, '').replace(/\/$/, '') : 'No website listed',
    ].filter(Boolean).join('\n');

    // Contact Cell
    const contactCell = [
      l.decisionMakerName ? `${l.decisionMakerName} (${l.decisionMakerRole || 'Owner'})` : 'Decision Maker Unknown',
      l.phone ? `Phone: ${l.phone}` : 'Phone: N/A',
      l.email ? `Email: ${l.email}` : '',
    ].filter(Boolean).join('\n');

    // Audit Cell
    const auditScore = l.audit?.overallHealthScore !== undefined ? `${l.audit.overallHealthScore}/100` : 'N/A';
    const ratingStr = l.googleRating ? `${l.googleRating} (${l.googleReviewsCount || 0} reviews)` : 'Not rated';
    const auditCell = [
      `Tech Health: ${auditScore}`,
      `Google: ${ratingStr}`,
      l.audit?.mobileResponsive === false ? '! Not mobile optimized' : '',
    ].filter(Boolean).join('\n');

    // Gap & Leak Cell
    const gapTitle = primaryGap?.serviceTitle || 'General AI Optimization';
    const gapIssue = primaryGap?.detectedIssue || 'Manual processes & missed leads';
    const leakStr = totalLeak > 0 ? `Rs. ${totalLeak.toLocaleString('en-IN')}/mo leak` : 'Leak not calculated';
    const gapCell = [
      gapTitle,
      leakStr,
      `Issue: ${gapIssue.slice(0, 75)}${gapIssue.length > 75 ? '...' : ''}`,
    ].join('\n');

    // Offer & Status Cell
    const delivery = l.pitchKit?.deliveryTimeline || '5-7 Days';
    const offerCell = [
      `Status: [${statusLabel}]`,
      `Quote: ${sweetSpot.split('+')[0].trim()}`,
      `Timeline: ${delivery}`,
    ].join('\n');

    return [
      String(index + 1),
      cleanPdfText(businessCell),
      cleanPdfText(contactCell),
      cleanPdfText(auditCell),
      cleanPdfText(gapCell),
      cleanPdfText(offerCell),
    ];
  });

  autoTable(doc, {
    startY: 54,
    head: [headers],
    body: rows,
    theme: 'grid',
    margin: { left: 14, right: 14, bottom: 16 },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      valign: 'top',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 50 },
      3: { cellWidth: 38 },
      4: { cellWidth: 64 },
      5: { cellWidth: 54 },
    },
    didDrawPage: (data) => {
      // Footer Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11);

      // Footer Left Notice
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Ixion Labs Intelligence System • Confidential Pipeline Report • All Rights Reserved',
        14,
        pageHeight - 6.5
      );

      // Footer Right Page Count
      const pageNumberStr = `Page ${data.pageNumber} of ${totalPagesExp}`;
      doc.text(pageNumberStr, pageWidth - 14, pageHeight - 6.5, { align: 'right' });
    },
  });

  // Replace total pages placeholder
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

/**
 * Generates an executive-ready Portrait A4 PDF proposal specifically
 * tailored for pitching a single qualified business lead.
 */
export function generateSingleLeadProposalPdf(lead: Lead): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const totalPagesExp = '{total_pages_count_string}';

  const affordability = lead.pitchKit?.affordability;
  const sweetSpot = affordability?.recommendedSweetSpotPrice || lead.pitchKit?.estimatedPrice || 'Rs. 45,000 + Rs. 12,000/mo';
  const totalMonthlyLeak = (lead.audit?.topGaps || []).reduce(
    (acc, g) => acc + (g.estimatedLostRevenueMonthly || 0),
    0
  );

  // 1. Top Brand Banner
  doc.setFillColor(99, 102, 241); // Indigo top bar
  doc.rect(0, 0, pageWidth, 3, 'F');

  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 3, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('IXION LABS — CLIENT GROWTH PROPOSAL & TECH AUDIT', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const proposalDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`PREPARED EXCLUSIVELY FOR: ${cleanPdfText(lead.businessName).toUpperCase()}`, 14, 20);
  doc.text(`Date: ${proposalDate} • Location: ${cleanPdfText(lead.city || 'India')}`, 14, 25);

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - 48, 8, 34, 15, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(52, 211, 153);
  doc.text('GROWTH BLUEPRINT', pageWidth - 31, 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text('DONE-FOR-YOU', pageWidth - 31, 18.5, { align: 'center' });

  // 2. Client Overview Box
  let currentY = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Target Business: ${cleanPdfText(lead.businessName)}`, 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Niche: ${cleanPdfText(lead.niche)} • City: ${cleanPdfText(lead.city)}`, 18, currentY + 11.5);
  doc.text(`Decision Maker: ${cleanPdfText(lead.decisionMakerName || 'Owner')} (${cleanPdfText(lead.decisionMakerRole || 'Executive')})`, 18, currentY + 16.5);
  doc.text(`Phone: ${cleanPdfText(lead.phone || 'N/A')} • Website: ${cleanPdfText(lead.website || 'N/A')}`, 18, currentY + 21);

  // Diagnostic Scores on Right side of Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 68, currentY + 3.5, 50, 17, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('OVERALL TECH SCORE', pageWidth - 43, currentY + 8, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const healthScore = lead.audit?.overallHealthScore || 60;
  doc.setTextColor(healthScore < 60 ? 225 : 30, healthScore < 60 ? 29 : 140, 72);
  doc.text(`${healthScore} / 100`, pageWidth - 43, currentY + 14, { align: 'center' });

  currentY += 28;

  // 3. Identified Critical Gaps & Revenue Leak
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. DIAGNOSTIC GAPS & ESTIMATED MONTHLY REVENUE BLEED', 14, currentY);

  currentY += 3;

  const gapHeaders = ['Identified Gap / Service', 'Detected System Flaw', 'Est. Monthly Bleed'];
  const gapRows = (lead.audit?.topGaps || []).map((g) => [
    cleanPdfText(g.serviceTitle),
    cleanPdfText(g.detectedIssue),
    `Rs. ${(g.estimatedLostRevenueMonthly || 0).toLocaleString('en-IN')}/mo`,
  ]);

  if (gapRows.length === 0) {
    gapRows.push(['AI Chatbot & Lead Automation', 'Missing 24/7 immediate booking capture on web visitors', 'Rs. 45,000/mo']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [gapHeaders],
    body: gapRows,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 92 },
      2: { cellWidth: 35, fontStyle: 'bold', textColor: [225, 29, 72] },
    },
  });

  // Position after table
  // @ts-expect-error - lastAutoTable exists on jsPDF instance
  currentY = (doc.lastAutoTable?.finalY || currentY + 30) + 7;

  // Leak Summary Banner
  doc.setFillColor(254, 242, 242); // Red-50
  doc.setDrawColor(254, 205, 211); // Red-200
  doc.roundedRect(14, currentY, pageWidth - 28, 10, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(190, 18, 60); // Red-700
  doc.text(
    `Total Estimated Revenue Leak: Rs. ${totalMonthlyLeak.toLocaleString('en-IN')}/month in uncaptured inbound leads and missed customer bookings.`,
    18,
    currentY + 6.5
  );

  currentY += 16;

  // 4. Proposed Solution & Value Strategy
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. OUR TURNKEY SOLUTION & HIGH-CONVERSION ENGINE', 14, currentY);

  currentY += 4;

  const pkgName = lead.pitchKit?.recommendedPackageName || 'Autonomous AI Growth Suite';
  const timeline = lead.pitchKit?.deliveryTimeline || '5-7 Days Turnkey';

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(99, 102, 241);
  doc.text(`Recommended Implementation: ${cleanPdfText(pkgName)}`, 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    cleanPdfText(`- Turnaround Speed: ${timeline} complete setup and testing. Zero disruption to daily operations.`),
    18,
    currentY + 11.5
  );
  doc.text(
    '- Includes 24/7 Smart AI Receptionist, WhatsApp Booking Integration & Google GEO/AEO Indexing.',
    18,
    currentY + 16.5
  );
  doc.text(
    '- Immediate ROI Payback Math: Recover 100% of the investment with just 1 to 2 newly captured appointments.',
    18,
    currentY + 21.5
  );

  currentY += 34;

  // 5. Pricing Tiers Options
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. INVESTMENT TIERS & TRANSPARENT PRICING', 14, currentY);

  currentY += 3;

  const tierOptions = affordability?.quoteOptions || [
    { tierName: 'Starter Setup', price: 'Rs. 25,000', description: 'Core AI Booking Assistant & Google Profile Optimization' },
    { tierName: 'Growth Engine (Recommended)', price: cleanPdfText(sweetSpot), description: 'Complete 24/7 AI Receptionist, GEO Search Engine Schema & WhatsApp Integration', isRecommended: true },
    { tierName: 'Market Dominator', price: 'Rs. 85,000 + Rs. 18,000/mo', description: 'Full Custom AI Calling Voice Agent, Dedicated Funnel & Multi-channel Automation' },
  ];

  const tierHeaders = ['Tier Package', 'Investment', 'Included Scope'];
  const tierRows = tierOptions.map((t) => [
    cleanPdfText(t.tierName),
    cleanPdfText(t.price),
    cleanPdfText(t.description),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [tierHeaders],
    body: tierRows,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold', textColor: [15, 23, 42] },
      2: { cellWidth: 90 },
    },
  });

  // @ts-expect-error - lastAutoTable exists on jsPDF instance
  currentY = (doc.lastAutoTable?.finalY || currentY + 30) + 7;

  // 6. Guarantee & Call to Action Box
  doc.setFillColor(240, 253, 244); // Green-50
  doc.setDrawColor(187, 247, 208); // Green-200
  doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61); // Green-700
  doc.text('100% DONE-FOR-YOU PERFORMANCE GUARANTEE:', 18, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52); // Green-800
  doc.text(
    cleanPdfText('Fully deployed and tested within guaranteed timeline. Full training and ongoing support included.'),
    18,
    currentY + 10.5
  );

  // Page Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Ixion Labs AI Growth Engine • Prepared Exclusively for ${cleanPdfText(lead.businessName)}`,
      14,
      pageHeight - 6.5
    );
    doc.text(`Page ${i} of ${totalPagesExp}`, pageWidth - 14, pageHeight - 6.5, { align: 'right' });
  }

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
