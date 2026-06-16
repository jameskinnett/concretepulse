import jsPDF from 'jspdf';
import { format } from 'date-fns';

const BRAND = '#FA8964';
const DARK = '#1a1a1a';
const GRAY = '#6b7280';
const LIGHT = '#f9fafb';

function addHeader(doc, title, subtitle) {
  doc.setFillColor(BRAND);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor('#ffffff');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ConcretePulse', 10, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('by Conversely.net', 60, 11);

  doc.setTextColor(DARK);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 10, 32);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(GRAY);
  doc.text(subtitle, 10, 39);
  doc.text(`Generated: ${format(new Date(), 'PPP p')}`, 140, 39);

  doc.setDrawColor('#e5e7eb');
  doc.line(10, 43, 200, 43);
  return 50; // starting Y
}

function addTableHeader(doc, y, cols) {
  doc.setFillColor('#f3f4f6');
  doc.rect(10, y, 190, 7, 'F');
  doc.setTextColor(DARK);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  cols.forEach(({ label, x }) => doc.text(label, x, y + 5));
  return y + 9;
}

function checkPage(doc, y, margin = 270) {
  if (y > margin) {
    doc.addPage();
    return 20;
  }
  return y;
}

// ── 1. Daily Dispatch Summary ────────────────────────────────────────────────
export function exportDailyDispatch(orders, dateStr) {
  const doc = new jsPDF();
  const dateLabel = dateStr ? format(new Date(dateStr), 'EEEE, MMMM d yyyy') : format(new Date(), 'EEEE, MMMM d yyyy');
  let y = addHeader(doc, 'Daily Dispatch Summary', dateLabel);

  const dayOrders = dateStr
    ? orders.filter(o => {
        const d = o.scheduled_time || o.created_date;
        return d && d.slice(0, 10) === dateStr;
      })
    : orders;

  // Summary counts
  const counts = { new: 0, assigned: 0, in_progress: 0, delivered: 0, cancelled: 0 };
  dayOrders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  const statCols = [
    ['Total Orders', dayOrders.length],
    ['Delivered', counts.delivered],
    ['In Progress', counts.in_progress],
    ['Assigned', counts.assigned],
    ['New', counts.new],
    ['Cancelled', counts.cancelled],
  ];

  // Summary boxes
  doc.setFontSize(8);
  statCols.forEach(([label, val], i) => {
    const bx = 10 + (i % 3) * 65;
    const by = y + Math.floor(i / 3) * 16;
    doc.setFillColor(LIGHT);
    doc.setDrawColor('#e5e7eb');
    doc.roundedRect(bx, by, 60, 13, 2, 2, 'FD');
    doc.setTextColor(GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(label, bx + 3, by + 5);
    doc.setTextColor(DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(String(val), bx + 3, by + 11);
    doc.setFontSize(8);
  });

  y += 38;
  doc.setDrawColor('#e5e7eb');
  doc.line(10, y, 200, y);
  y += 6;

  // Table
  const cols = [
    { label: 'Order #', x: 11 },
    { label: 'Company', x: 35 },
    { label: 'Location', x: 80 },
    { label: 'Mix', x: 120 },
    { label: 'M³', x: 135 },
    { label: 'Scheduled', x: 148 },
    { label: 'Status', x: 178 },
  ];
  y = addTableHeader(doc, y, cols);

  dayOrders.forEach((o, i) => {
    y = checkPage(doc, y);
    if (i % 2 === 0) { doc.setFillColor('#fafafa'); doc.rect(10, y - 1, 190, 7, 'F'); }
    doc.setTextColor(DARK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(o.order_number || '—', 11, y + 4);
    doc.text((o.company_name || '—').slice(0, 22), 35, y + 4);
    doc.text((o.delivery_location_name || '—').slice(0, 22), 80, y + 4);
    doc.text(o.mix_type || '—', 120, y + 4);
    doc.text(String(o.quantity_m3 || '—'), 135, y + 4);
    doc.text(o.scheduled_time ? format(new Date(o.scheduled_time), 'HH:mm') : '—', 148, y + 4);
    doc.setTextColor(o.status === 'delivered' ? '#059669' : o.status === 'cancelled' ? '#dc2626' : GRAY);
    doc.text(o.status?.toUpperCase() || '—', 178, y + 4);
    doc.setTextColor(DARK);
    y += 7;
  });

  doc.save(`dispatch-summary-${dateStr || format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ── 2. Delivery History by Company/Location ──────────────────────────────────
export function exportDeliveryHistory(orders, companies, locations) {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Delivery History Report', 'By Company & Location');

  const delivered = orders.filter(o => o.status === 'delivered');

  // Group by company
  const byCompany = {};
  delivered.forEach(o => {
    const key = o.company_name || o.company_id || 'Unknown';
    if (!byCompany[key]) byCompany[key] = [];
    byCompany[key].push(o);
  });

  Object.entries(byCompany).forEach(([company, ords]) => {
    y = checkPage(doc, y, 255);

    doc.setFillColor(BRAND);
    doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor('#fff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${company}  (${ords.length} deliveries)`, 12, y + 5);
    y += 10;

    const cols = [
      { label: 'Order #', x: 11 },
      { label: 'Location', x: 40 },
      { label: 'Mix', x: 105 },
      { label: 'M³', x: 120 },
      { label: 'Driver', x: 135 },
      { label: 'Delivered At', x: 168 },
    ];
    y = addTableHeader(doc, y, cols);

    ords.forEach((o, i) => {
      y = checkPage(doc, y);
      if (i % 2 === 0) { doc.setFillColor('#fafafa'); doc.rect(10, y - 1, 190, 7, 'F'); }
      doc.setTextColor(DARK);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(o.order_number || '—', 11, y + 4);
      doc.text((o.delivery_location_name || '—').slice(0, 30), 40, y + 4);
      doc.text(o.mix_type || '—', 105, y + 4);
      doc.text(String(o.quantity_m3 || '—'), 120, y + 4);
      doc.text((o.assigned_driver_name || '—').slice(0, 18), 135, y + 4);
      doc.text(o.completion_time ? format(new Date(o.completion_time), 'MM/dd HH:mm') : '—', 168, y + 4);
      y += 7;
    });

    y += 6;
  });

  doc.save(`delivery-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ── 3. Driver Performance / Compensation Report ──────────────────────────────
export function exportDriverPerformance(driverData, monthLabel) {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Driver Performance Report', monthLabel);

  // Summary
  const totalOrders = driverData.reduce((s, d) => s + d.orders, 0);
  const totalHours = driverData.reduce((s, d) => s + d.hours, 0);
  const totalComp = driverData.reduce((s, d) => s + (d.compensation || 0), 0);

  const summCols = [
    ['Total Drivers', driverData.length],
    ['Total Orders', totalOrders],
    ['Total Hours', `${totalHours.toFixed(1)}h`],
    ['Est. Compensation', `$${totalComp.toFixed(2)}`],
  ];

  summCols.forEach(([label, val], i) => {
    const bx = 10 + i * 48;
    doc.setFillColor(LIGHT);
    doc.setDrawColor('#e5e7eb');
    doc.roundedRect(bx, y, 44, 14, 2, 2, 'FD');
    doc.setTextColor(GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(label, bx + 2, y + 5);
    doc.setTextColor(DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(String(val), bx + 2, y + 12);
  });

  y += 24;
  doc.setDrawColor('#e5e7eb');
  doc.line(10, y, 200, y);
  y += 6;

  const cols = [
    { label: '#', x: 11 },
    { label: 'Driver Name', x: 20 },
    { label: 'Type', x: 80 },
    { label: 'Orders', x: 105 },
    { label: 'Hours', x: 125 },
    { label: 'Avg h/Order', x: 145 },
    { label: 'Est. Comp.', x: 170 },
  ];
  y = addTableHeader(doc, y, cols);

  driverData.forEach((d, i) => {
    y = checkPage(doc, y);
    if (i % 2 === 0) { doc.setFillColor('#fafafa'); doc.rect(10, y - 1, 190, 7, 'F'); }
    const avgH = d.orders > 0 ? (d.hours / d.orders).toFixed(1) : '—';
    doc.setTextColor(DARK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(String(i + 1), 11, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text((d.name || '—').slice(0, 28), 20, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(d.type || '—', 80, y + 4);
    doc.text(String(d.orders), 105, y + 4);
    doc.text(`${d.hours}h`, 125, y + 4);
    doc.text(avgH !== '—' ? `${avgH}h` : '—', 145, y + 4);
    doc.setTextColor(d.compensation ? '#059669' : GRAY);
    doc.text(d.compensation ? `$${d.compensation.toFixed(2)}` : '—', 170, y + 4);
    doc.setTextColor(DARK);
    y += 7;
  });

  doc.save(`driver-performance-${monthLabel.replace(/\s/g, '-')}.pdf`);
}