import { formatRupiah } from './currency';

export interface CartProductItem {
  name: string;
  price: number;
  quantity: number;
}

export interface WhatsAppOrderData {
  companyName: string;
  whatsappNumber: string;
  customTemplate?: string;
  items: CartProductItem[];
  total: number;
  customerName: string;
  phone?: string;
  address: string;
  city?: string;
  notes?: string;
}

export function generateWhatsAppMessage(data: WhatsAppOrderData): string {
  const {
    companyName,
    customTemplate,
    items,
    total,
    customerName,
    address,
    notes,
  } = data;

  // Format products list
  const productLines = items
    .map((item) => `- ${item.name} x ${item.quantity} (${formatRupiah(item.price * item.quantity)})`)
    .join('\n');

  const formattedTotal = formatRupiah(total);
  const formattedAddress = address || '-';
  const formattedNotes = notes && notes.trim() ? notes.trim() : '-';

  if (customTemplate && customTemplate.includes('[PRODUK]')) {
    let msg = customTemplate
      .replace(/\[NAMA TOKO\]/g, companyName)
      .replace(/\[PRODUK\]/g, productLines)
      .replace(/\[TOTAL\]/g, formattedTotal)
      .replace(/\[NAMA\]/g, customerName)
      .replace(/\[ALAMAT\]/g, formattedAddress)
      .replace(/\[CATATAN\]/g, formattedNotes);
    return msg;
  }

  // Default fallback format
  return `Halo ${companyName},

Saya ingin melakukan pemesanan:

Produk:
${productLines}

Total:
${formattedTotal}

Nama:
${customerName}

Alamat:
${formattedAddress}

Catatan:
${formattedNotes}`;
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  // Normalize phone number (strip '+', spaces, dashes; replace leading '08' with '628')
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
