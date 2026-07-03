import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function createInvoicePdf(input: {
  number: string;
  customerName: string;
  customerEmail: string;
  company: { name?: string; oib?: string; address?: string };
  items: Array<{ name?: string; label?: string; quantity?: number; qty?: number; price?: number; amount?: number }>;
  total: number;
  paymentStatus: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const yellow = rgb(0.96, 0.77, 0.09);
  page.drawRectangle({ x: 0, y: height - 115, width, height: 115, color: rgb(0.12, 0.12, 0.12) });
  page.drawText('PETRONI', { x: 48, y: height - 67, size: 28, font: bold, color: yellow });
  page.drawText('RACUN / POTVRDA', { x: 390, y: height - 64, size: 12, font: bold, color: rgb(1, 1, 1) });
  let y = height - 155;
  const text = (value: string, x = 48, size = 10, font = regular) => {
    page.drawText(value.replace(/[^\x20-\x7E]/g, ''), { x, y, size, font, color: rgb(0.18, 0.18, 0.18) });
  };
  text(input.company.name || 'Petroni d.o.o.', 48, 12, bold);
  y -= 17; text(input.company.address || '');
  y -= 15; text(input.company.oib ? `OIB: ${input.company.oib}` : '');
  y = height - 155; text(`Broj: ${input.number}`, 350, 10, bold);
  y -= 17; text(`Datum: ${new Date().toLocaleDateString('hr-HR')}`, 350);
  y -= 15; text(`Status placanja: ${input.paymentStatus}`, 350);
  y = height - 245; text('KUPAC', 48, 10, bold);
  y -= 18; text(input.customerName);
  y -= 15; text(input.customerEmail);
  y -= 35;
  page.drawRectangle({ x: 48, y: y - 8, width: 499, height: 26, color: rgb(0.95, 0.95, 0.95) });
  text('Stavka', 58, 9, bold); text('Kol.', 390, 9, bold); text('Iznos', 475, 9, bold);
  y -= 28;
  for (const item of input.items.slice(0, 18)) {
    text(String(item.name ?? item.label ?? 'Stavka').slice(0, 52), 58);
    text(String(item.quantity ?? item.qty ?? 1), 400);
    text(`${Number(item.amount ?? item.price ?? 0).toFixed(2)} EUR`, 470);
    y -= 22;
    page.drawLine({ start: { x: 48, y: y + 7 }, end: { x: 547, y: y + 7 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  }
  y -= 18;
  text('UKUPNO', 390, 12, bold);
  text(`${input.total.toFixed(2)} EUR`, 470, 12, bold);
  page.drawText('Hvala na povjerenju.', { x: 48, y: 48, size: 9, font: regular, color: rgb(0.4, 0.4, 0.4) });
  return pdf.save();
}
