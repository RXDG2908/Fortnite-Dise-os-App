// Precios disponibles como imagen en public/images/logo/PRECIOS (soles = V-Bucks * 0.03).
// Cualquier precio que no esté en esta lista no tiene PNG y por eso no "vincula" con el texto.
export const PRICE_TAGS: number[] = [
  3, 4.5, 6, 7.5, 9, 12, 15, 18, 22.5, 24, 27, 30, 31.5, 33, 34.5, 36, 37.5, 39,
  40.5, 42, 45, 48, 51, 52.5, 54, 57, 60,
];

export function formatPriceTag(n: number): string {
  const clean = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `S/.${clean}`;
}

export function priceTagFilename(n: number): string {
  const clean = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `S${clean}.png`;
}

export function parsePriceValue(price: string): number {
  if (!price) return PRICE_TAGS[0];
  const clean = price.trim().toUpperCase().replace(/\s+/g, '')
    .replace(/^S\/\./, '').replace(/^S\//, '').replace(/^S/, '');
  const num = parseFloat(clean);
  return isNaN(num) ? PRICE_TAGS[0] : num;
}

export function nearestPriceTag(n: number): number {
  return PRICE_TAGS.reduce((closest, val) =>
    Math.abs(val - n) < Math.abs(closest - n) ? val : closest, PRICE_TAGS[0]);
}

export const PRICE_TAG_OPTIONS = PRICE_TAGS.map((n) => ({
  value: formatPriceTag(n),
  label: formatPriceTag(n),
}));
