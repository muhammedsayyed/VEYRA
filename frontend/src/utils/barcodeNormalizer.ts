/**
 * Normalizes an incoming barcode string.
 * - Trims leading and trailing whitespace.
 * - Removes accidental dash/space formatting characters.
 * - Preserves numeric digit sequence without altering values or inventing leading zeros.
 */
export function normalizeBarcode(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/[\s-]/g, '');
}

/**
 * Validates whether a normalized barcode matches basic numeric GTIN/EAN/UPC structure.
 */
export function isValidBarcodeFormat(barcode: string): boolean {
  if (!barcode) return false;
  // Standard barcodes are numeric and typically between 4 and 18 digits (EAN-8, EAN-13, UPC-A, UPC-E, GTIN-14, etc.)
  return /^\d{4,18}$/.test(barcode);
}
