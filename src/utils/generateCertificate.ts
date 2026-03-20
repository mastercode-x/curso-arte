import jsPDF from 'jspdf';

interface CertificateData {
  studentName: string;
  courseName?: string;
  completionDate?: string;
}

export async function generateCertificate({
  studentName,
  courseName = 'Poética de la Mirada',
  completionDate,
}: CertificateData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const W = 297;
  const H = 210;

  // ── Background ────────────────────────────────────────────────
  doc.setFillColor(11, 11, 13); // #0B0B0D
  doc.rect(0, 0, W, H, 'F');

  // ── Outer border ──────────────────────────────────────────────
  doc.setDrawColor(199, 163, 109); // #C7A36D gold
  doc.setLineWidth(0.6);
  doc.rect(10, 10, W - 20, H - 20);

  // ── Inner border ──────────────────────────────────────────────
  doc.setDrawColor(199, 163, 109, 0.3);
  doc.setLineWidth(0.2);
  doc.rect(13, 13, W - 26, H - 26);

  // ── Corner ornaments ──────────────────────────────────────────
  const corners = [
    [14, 14],
    [W - 14, 14],
    [14, H - 14],
    [W - 14, H - 14],
  ] as [number, number][];

  doc.setDrawColor(199, 163, 109);
  doc.setLineWidth(0.5);
  corners.forEach(([cx, cy]) => {
    const s = 6;
    doc.circle(cx, cy, 1.5, 'S');
    // small cross lines
    doc.line(cx - s, cy, cx - 2, cy);
    doc.line(cx + 2, cy, cx + s, cy);
    doc.line(cx, cy - s, cx, cy - 2);
    doc.line(cx, cy + 2, cx, cy + s);
  });

  // ── Top decorative line ───────────────────────────────────────
  doc.setDrawColor(199, 163, 109);
  doc.setLineWidth(0.3);
  doc.line(40, 38, W / 2 - 20, 38);
  doc.line(W / 2 + 20, 38, W - 40, 38);

  // ── "CERTIFICADO" label ───────────────────────────────────────
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 163, 109);
  doc.setCharSpace(4);
  doc.text('CERTIFICADO DE FINALIZACIÓN', W / 2, 38, { align: 'center' });
  doc.setCharSpace(0);

  // ── Decorative dot ────────────────────────────────────────────
  doc.setFillColor(199, 163, 109);
  doc.circle(W / 2, 46, 0.8, 'F');

  // ── "Se certifica que" ────────────────────────────────────────
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(184, 180, 170); // #B8B4AA
  doc.text('Se certifica que', W / 2, 60, { align: 'center' });

  // ── Student name ──────────────────────────────────────────────
  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(244, 242, 236); // #F4F2EC
  doc.text(studentName, W / 2, 83, { align: 'center' });

  // ── Name underline ────────────────────────────────────────────
  const nameWidth = doc.getTextWidth(studentName);
  const underlineX = W / 2 - nameWidth / 2;
  doc.setDrawColor(199, 163, 109);
  doc.setLineWidth(0.4);
  doc.line(underlineX, 86, underlineX + nameWidth, 86);

  // ── "ha completado satisfactoriamente" ───────────────────────
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(184, 180, 170);
  doc.text('ha completado satisfactoriamente el curso', W / 2, 100, { align: 'center' });

  // ── Course name ───────────────────────────────────────────────
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(199, 163, 109);
  doc.text(courseName, W / 2, 116, { align: 'center' });

  // ── Bottom decorative line ────────────────────────────────────
  doc.setDrawColor(199, 163, 109);
  doc.setLineWidth(0.3);
  doc.line(40, 128, W - 40, 128);

  // ── Date ──────────────────────────────────────────────────────
  const date =
    completionDate ||
    new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(184, 180, 170);
  doc.text(`Fecha de finalización: ${date}`, W / 2, 138, { align: 'center' });

  // ── Signature line (left) ─────────────────────────────────────
  const sigY = 165;
  doc.setDrawColor(184, 180, 170);
  doc.setLineWidth(0.3);
  doc.line(50, sigY, 120, sigY);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(184, 180, 170);
  doc.text('Firma del Instructor', 85, sigY + 6, { align: 'center' });

  // ── Signature line (right) ────────────────────────────────────
  doc.line(177, sigY, 247, sigY);
  doc.text('Dirección Académica', 212, sigY + 6, { align: 'center' });

  // ── Small seal circle ─────────────────────────────────────────
  doc.setDrawColor(199, 163, 109);
  doc.setLineWidth(0.5);
  doc.circle(W / 2, sigY - 5, 12, 'S');
  doc.setDrawColor(199, 163, 109, 0.4);
  doc.setLineWidth(0.2);
  doc.circle(W / 2, sigY - 5, 10, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(199, 163, 109);
  doc.setCharSpace(1);
  doc.text('POÉTICA', W / 2, sigY - 7, { align: 'center' });
  doc.text('DE LA MIRADA', W / 2, sigY - 3, { align: 'center' });
  doc.setCharSpace(0);

  // ── Save ──────────────────────────────────────────────────────
  const safeName = studentName.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
  doc.save(`Certificado_${safeName}_Poetica_de_la_Mirada.pdf`);
}