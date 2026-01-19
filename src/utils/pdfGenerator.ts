import jsPDF from 'jspdf';
import { AppData, FilterState } from '@/types/dashboard';

export async function generatePDFReport(data: AppData, filters: FilterState) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  pdf.setFillColor(0, 0, 128); // Navy blue
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('UIDAI OpsCommand Report', pageWidth / 2, 20, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN', {
    dateStyle: 'full'
  })}`, pageWidth / 2, 32, { align: 'center' });

  yPos = 55;

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Applied Filters Section
  if (filters.state || filters.district || filters.priority) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    let filterText = 'Filters Applied: ';
    if (filters.state) filterText += `State: ${filters.state} `;
    if (filters.district) filterText += `District: ${filters.district} `;
    if (filters.priority) filterText += `Priority: ${filters.priority}`;
    pdf.text(filterText, 15, yPos);
    yPos += 10;
  }

  // Summary Section
  pdf.setFillColor(248, 249, 250);
  pdf.rect(15, yPos, pageWidth - 30, 35, 'F');

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', 20, yPos + 10);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPos += 15;

  pdf.text(`Total Pincodes Analyzed: ${data.summary.total_pincodes.toLocaleString()}`, 25, yPos + 7);
  pdf.text(`MBU Backlog: ${data.summary.mbu_backlog_total.toLocaleString()}`, 25, yPos + 14);
  pdf.text(`Critical Alerts: ${data.summary.critical_alerts.toLocaleString()}`, 25, yPos + 21);

  yPos += 45;

  // Anomaly Detection Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(128, 0, 0);
  pdf.text('1. Satark - Anomaly Detection', 15, yPos);
  pdf.setTextColor(0, 0, 0);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Analyzed: ${data.anomaly_summary.total_analyzed.toLocaleString()}`, 20, yPos);
  yPos += 6;
  pdf.text(`High Risk Count: ${data.anomaly_summary.high_risk_count.toLocaleString()}`, 20, yPos);
  yPos += 6;
  pdf.text(`Average Confidence: ${data.anomaly_summary.average_confidence.toFixed(1)}%`, 20, yPos);
  yPos += 10;

  // Top Fraud Tickets
  const fraudTickets = data.action_tickets?.filter(t => t.task.includes('Fraud')).slice(0, 5) || [];
  if (fraudTickets.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top 5 Fraud Cases:', 20, yPos);
    yPos += 6;

    fraudTickets.forEach((ticket, i) => {
      pdf.setFont('helvetica', 'normal');
      pdf.text(`  ${i + 1}. ${ticket.pincode} - ${ticket.priority} priority`, 25, yPos);
      yPos += 5;
    });
  }

  yPos += 10;

  // MBU Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 153, 51);
  pdf.text('2. Saksham - MBU Compliance', 15, yPos);
  pdf.setTextColor(0, 0, 0);
  yPos += 10;

  const totalDeficit = data.compliance_map_data.reduce((acc, item) => acc + item.deficit, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Deficit: ${totalDeficit.toLocaleString()}`, 20, yPos);
  yPos += 6;
  pdf.text(`Pincodes with Issues: ${data.compliance_map_data.length.toLocaleString()}`, 20, yPos);
  yPos += 10;

  // Top Districts
  pdf.setFont('helvetica', 'bold');
  pdf.text('Top 5 Districts by Deficit:', 20, yPos);
  yPos += 6;

  const districtDeficits: Record<string, number> = {};
  data.compliance_map_data.forEach(item => {
    districtDeficits[item.district] = (districtDeficits[item.district] || 0) + item.deficit;
  });

  const topDistricts = Object.entries(districtDeficits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  topDistricts.forEach(([district, deficit], i) => {
    pdf.setFont('helvetica', 'normal');
    pdf.text(`  ${i + 1}. ${district}: ${deficit.toLocaleString()} deficit`, 25, yPos);
    yPos += 5;
  });

  yPos += 10;

  // Check if we need a new page
  if (yPos > 250) {
    pdf.addPage();
    yPos = 20;
  }

  // Migration Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 100, 0);
  pdf.text('3. Pravas - Migration Trends', 15, yPos);
  pdf.setTextColor(0, 0, 0);
  yPos += 10;

  const migrationTickets = data.action_tickets?.filter(t =>
    t.task.includes('Urban Planning') || t.whatsapp_msg?.includes('MIGRATION')
  ) || [];

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Migration Surveys: ${migrationTickets.length}`, 20, yPos);
  yPos += 6;

  const criticalMigration = migrationTickets.filter(t => t.priority === 'Critical').length;
  pdf.text(`Critical Areas: ${criticalMigration}`, 20, yPos);

  // Footer
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i} of ${pageCount} | UIDAI OpsCommand Dashboard | Confidential`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  pdf.save(`UIDAI_OpsCommand_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
