// Shared WhatsApp ordering helpers (single source for the business number).
export const WA_NUMBER = "96176993533";

export function waLink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Builds a single product line like: "تمر سلطاني - جامبو - 500 g - صندوق 20 قطعة ×2"
export function orderLine(parts: {
  name: string;
  grade?: string;
  weight?: string;
  unitLabel?: string;
  qty?: number;
}): string {
  const segs = [parts.name, parts.grade, parts.weight, parts.unitLabel].filter(Boolean);
  let line = segs.join(" - ");
  if (parts.qty && parts.qty > 1) line += ` ×${parts.qty}`;
  return line;
}
