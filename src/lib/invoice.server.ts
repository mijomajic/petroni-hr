import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function createInvoicePdf(input: {
  number: string;
  customerName: string;
  customerEmail: string;
  company: {
    name?: string;
    oib?: string;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  ibans?: Array<{ label?: string; bank?: string; iban?: string }>;
  items: Array<{
    name?: string;
    name_hr?: string;
    name_en?: string;
    label?: string;
    slug?: string;
    quantity?: number;
    qty?: number;
    price?: number;
    amount?: number;
  }>;
  total: number;
  paymentStatus: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const yellow = rgb(0.96, 0.77, 0.09);
  const clean = (value: unknown) => String(value ?? '').replace(/[^\x20-\x7E]/g, '');
  page.drawRectangle({ x: 0, y: height - 115, width, height: 115, color: rgb(0.12, 0.12, 0.12) });
  page.drawText('PETRONI', { x: 48, y: height - 67, size: 28, font: bold, color: yellow });
  page.drawText('RACUN / POTVRDA', { x: 390, y: height - 64, size: 12, font: bold, color: rgb(1, 1, 1) });
  let y = height - 155;
  const text = (value: string, x = 48, size = 10, font = regular) => {
    page.drawText(clean(value), { x, y, size, font, color: rgb(0.18, 0.18, 0.18) });
  };
  text(input.company.name || 'Petroni d.o.o.', 48, 12, bold);
  y -= 17; text(input.company.address || '');
  y -= 15; text(input.company.oib ? `OIB: ${input.company.oib}` : '');
  y -= 15; text([input.company.email, input.company.phone].filter(Boolean).join('  |  '));
  y -= 15; text(input.company.website || '');
  y = height - 155; text(`Broj: ${input.number}`, 350, 10, bold);
  y -= 17; text(`Datum: ${new Date().toLocaleDateString('hr-HR')}`, 350);
  y -= 15; text(`Status placanja: ${input.paymentStatus}`, 350);
  y = height - 260; text('KUPAC', 48, 10, bold);
  y -= 18; text(input.customerName);
  y -= 15; text(input.customerEmail);
  y -= 35;
  page.drawRectangle({ x: 48, y: y - 8, width: 499, height: 26, color: rgb(0.95, 0.95, 0.95) });
  text('Stavka', 58, 9, bold); text('Kol.', 390, 9, bold); text('Iznos', 475, 9, bold);
  y -= 28;
  for (const item of input.items.slice(0, 18)) {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    const itemName = item.name_hr ?? item.name ?? item.name_en ?? item.label ?? item.slug ?? 'Stavka';
    const lineTotal = item.amount ?? Number(item.price ?? 0) * quantity;
    text(String(itemName).slice(0, 52), 58);
    text(String(quantity), 400);
    text(`${Number(lineTotal).toFixed(2)} EUR`, 470);
    y -= 22;
    page.drawLine({ start: { x: 48, y: y + 7 }, end: { x: 547, y: y + 7 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  }
  y -= 18;
  text('UKUPNO', 390, 12, bold);
  text(`${input.total.toFixed(2)} EUR`, 470, 12, bold);
  const accountLines = (input.ibans ?? [])
    .filter((account) => account.iban)
    .slice(0, 3)
    .map((account) => `${account.bank ?? account.label ?? 'IBAN'}: ${account.iban}`);
  page.drawLine({ start: { x: 48, y: 93 }, end: { x: 547, y: 93 }, thickness: 0.5, color: rgb(0.82, 0.82, 0.82) });
  accountLines.forEach((line, index) => {
    page.drawText(clean(line).slice(0, 92), { x: 48, y: 76 - index * 11, size: 7.5, font: regular, color: rgb(0.4, 0.4, 0.4) });
  });
  page.drawText('Hvala na povjerenju.', { x: 48, y: 36, size: 9, font: regular, color: rgb(0.4, 0.4, 0.4) });
  return pdf.save();
}
