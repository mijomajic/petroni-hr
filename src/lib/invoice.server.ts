import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PDF_PAGE: [number, number] = [595.28, 841.89];

function pdfSafeText(value: unknown): string {
  return String(value ?? '')
    .replace(/[čć]/g, 'c')
    .replace(/[ČĆ]/g, 'C')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[š]/g, 's')
    .replace(/[Š]/g, 'S')
    .replace(/[ž]/g, 'z')
    .replace(/[Ž]/g, 'Z')
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '');
}

function splitPdfLines(value: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const rawLine of pdfSafeText(value).replace(/\r\n/g, '\n').split('\n')) {
    const words = rawLine.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(candidate, size) > width) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** A static copy of the version accepted at booking time, intended for email attachment. */
export async function createRentalTermsPdf(input: {
  version: string;
  content: string;
  locale: 'hr' | 'en';
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const yellow = rgb(0.96, 0.77, 0.09);
  const dark = rgb(0.12, 0.12, 0.12);
  const textColor = rgb(0.18, 0.18, 0.18);
  const margin = 52;
  const contentWidth = PDF_PAGE[0] - margin * 2;
  const title = input.locale === 'hr' ? 'UVJETI NAJMA' : 'RENTAL TERMS';
  const subtitle = input.locale === 'hr'
    ? `Verzija uvjeta: ${input.version}`
    : `Terms version: ${input.version}`;
  let pageNumber = 0;
  let page: ReturnType<PDFDocument['addPage']> | undefined;
  let y = 0;

  const addPage = () => {
    pageNumber += 1;
    page = pdf.addPage(PDF_PAGE);
    const { height } = page.getSize();
    page.drawRectangle({ x: 0, y: height - 92, width: PDF_PAGE[0], height: 92, color: dark });
    page.drawText('PETRONI', { x: margin, y: height - 52, size: 24, font: bold, color: yellow });
    page.drawText(title, { x: margin, y: height - 74, size: 9, font: bold, color: rgb(1, 1, 1) });
    page.drawText(subtitle, { x: margin, y: height - 106, size: 8.5, font: regular, color: rgb(0.36, 0.36, 0.36) });
    y = height - 130;
  };

  const footer = () => {
    if (!page) return;
    page.drawLine({ start: { x: margin, y: 42 }, end: { x: PDF_PAGE[0] - margin, y: 42 }, thickness: 0.5, color: rgb(0.82, 0.82, 0.82) });
    page.drawText(`Petroni - ${title} - ${pageNumber}`, { x: margin, y: 27, size: 7.5, font: regular, color: rgb(0.42, 0.42, 0.42) });
  };

  addPage();
  for (const rawLine of String(input.content ?? '').replace(/\r\n/g, '\n').split('\n')) {
    const trimmed = rawLine.trim();
    const isHeading = /^#{1,3}\s+/.test(trimmed) || /^✓?\s*\d+\.\s*\S/.test(trimmed) || /^[A-ZČĆŽŠĐ0-9\s,.&'()/-]{12,}$/.test(trimmed);
    const lineText = trimmed.replace(/^#{1,3}\s+/, '');
    const font = isHeading ? bold : regular;
    const size = isHeading ? 10.5 : 9.2;
    const lineHeight = isHeading ? 15 : 13;
    const lines = splitPdfLines(lineText, font, size, contentWidth);
    if (!trimmed) {
      y -= 7;
      continue;
    }
    for (const line of lines) {
      if (y < 60) {
        footer();
        addPage();
      }
      page?.drawText(line, { x: margin, y, size, font, color: textColor });
      y -= lineHeight;
    }
    y -= isHeading ? 4 : 2;
  }
  footer();
  return pdf.save();
}

export async function createOrderConfirmationPdf(input: {
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
  subtotal?: number;
  shippingCost?: number;
  paymentSurcharge?: number;
  deliveryMethod?: string;
  paymentMethod?: string;
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
  page.drawText('POTVRDA NARUDZBE', { x: 369, y: height - 64, size: 12, font: bold, color: rgb(1, 1, 1) });
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
  const deliveryLabels: Record<string, string> = { overseas: 'Overseas dostava', boxnow: 'BoxNow paketomat', personal_pickup: 'Osobno preuzimanje' };
  const paymentLabels: Record<string, string> = { bank_transfer: 'Bankovna uplata', corvuspay: 'Karticno placanje', cash_on_delivery: 'Placanje pouzecem' };
  text(`Dostava (${deliveryLabels[input.deliveryMethod ?? ''] ?? input.deliveryMethod ?? '-'}): ${Number(input.shippingCost ?? 0).toFixed(2)} EUR`, 315);
  y -= 16;
  if (Number(input.paymentSurcharge ?? 0) > 0) {
    text(`Naknada za pouzece: ${Number(input.paymentSurcharge).toFixed(2)} EUR`, 315);
    y -= 16;
  }
  text(`Nacin placanja: ${paymentLabels[input.paymentMethod ?? ''] ?? input.paymentMethod ?? '-'}`, 315);
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
  page.drawText('OVAJ DOKUMENT NIJE SLUZBENI FISKALIZIRANI RACUN.', { x: 48, y: 36, size: 8, font: bold, color: rgb(0.42, 0.24, 0.04) });
  page.drawText('Hvala na povjerenju.', { x: 48, y: 21, size: 8, font: regular, color: rgb(0.4, 0.4, 0.4) });
  return pdf.save();
}
