import jsPDF from 'jspdf';
import type { Activity } from '../types';
import { CATEGORY_LABELS } from '../types';

/**
 * Generates a styled PDF certificate for an approved AICTE activity
 * and triggers a browser download — entirely client-side, no server required.
 */
export async function downloadCertificate(activity: Activity, studentName: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;
  const H = 210;

  // ── Background ────────────────────────────────────────────────────────────
  doc.setFillColor(9, 9, 11);           // neutral-950
  doc.rect(0, 0, W, H, 'F');

  // Outer decorative border
  doc.setDrawColor(99, 102, 241);       // indigo-500
  doc.setLineWidth(1.2);
  doc.rect(8, 8, W - 16, H - 16, 'S');

  // Inner thin border
  doc.setDrawColor(60, 60, 80);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, W - 24, H - 24, 'S');

  // ── Header accent bar ─────────────────────────────────────────────────────
  doc.setFillColor(99, 102, 241);
  doc.rect(8, 8, W - 16, 2, 'F');
  doc.rect(8, H - 10, W - 16, 2, 'F');

  // ── Logo text ─────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(129, 140, 248);      // indigo-400
  doc.setFont('helvetica', 'bold');
  doc.text('AAMS', W / 2, 22, { align: 'center' });

  // ── Certificate heading ───────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('CERTIFICATE OF ACTIVITY COMPLETION', W / 2, 30, { align: 'center' });

  // Divider
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 60, 33, W / 2 + 60, 33);

  // ── Main content ──────────────────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setTextColor(160, 160, 180);
  doc.setFont('helvetica', 'normal');
  doc.text('This certifies that', W / 2, 46, { align: 'center' });

  // Student name
  doc.setFontSize(26);
  doc.setTextColor(250, 250, 250);
  doc.setFont('helvetica', 'bold');
  doc.text(studentName, W / 2, 62, { align: 'center' });

  // Has completed
  doc.setFontSize(11);
  doc.setTextColor(160, 160, 180);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed the following AICTE-recognised activity:', W / 2, 74, { align: 'center' });

  // Activity title
  doc.setFontSize(18);
  doc.setTextColor(129, 140, 248);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(activity.title, W - 80);
  doc.text(titleLines, W / 2, 88, { align: 'center' });

  // ── Detail boxes ──────────────────────────────────────────────────────────
  const boxY = 108;
  const boxes = [
    { label: 'Category', value: CATEGORY_LABELS[activity.category] },
    { label: 'Points Awarded', value: `${activity.points} pts` },
    { label: 'Reviewed By', value: activity.reviewedBy ?? '—' },
    { label: 'Date', value: new Date(activity.reviewedAt ?? activity.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
  ];

  const boxW = 52;
  const startX = (W - (boxes.length * boxW + (boxes.length - 1) * 6)) / 2;
  boxes.forEach((box, i) => {
    const bx = startX + i * (boxW + 6);
    doc.setFillColor(25, 25, 35);
    doc.setDrawColor(60, 60, 90);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, boxY, boxW, 22, 2, 2, 'FD');
    // Label
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label.toUpperCase(), bx + boxW / 2, boxY + 7, { align: 'center' });
    // Value
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 240);
    doc.setFont('helvetica', 'bold');
    doc.text(box.value, bx + boxW / 2, boxY + 16, { align: 'center' });
  });

  // ── Review comment ────────────────────────────────────────────────────────
  if (activity.reviewComment) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 150);
    doc.setFont('helvetica', 'italic');
    const commentLines = doc.splitTextToSize(`"${activity.reviewComment}"`, W - 80);
    doc.text(commentLines, W / 2, 142, { align: 'center' });
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'AICTE Activity Management System  ·  Generated on ' + new Date().toLocaleDateString('en-IN'),
    W / 2, H - 16, { align: 'center' }
  );

  doc.text(`Activity ID: ${activity.id}`, W / 2, H - 11, { align: 'center' });

  // ── Download ──────────────────────────────────────────────────────────────
  const safeName = studentName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const safeTitle = activity.title.slice(0, 30).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  doc.save(`AAMS_Certificate_${safeName}_${safeTitle}.pdf`);
}
