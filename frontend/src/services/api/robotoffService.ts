import { RobotoffInsight } from '@/types';
import { fetchWithTimeout } from './apiClient';

/**
 * Optional Layer 2 Product Intelligence Service: Robotoff
 * Robotoff is Open Food Facts' prediction service for categories, labels, and packaging insights.
 * 
 * Non-negotiable architectural rules:
 * 1. Robotoff is OPTIONAL and NON-BLOCKING.
 * 2. Robotoff MUST NEVER override or fabricate nutrition values (calories, protein, fat, sodium, etc.).
 * 3. If unavailable, it fails gracefully returning an empty array without disrupting Open Food Facts.
 */
export async function getRobotoffInsights(barcode: string): Promise<RobotoffInsight[]> {
  if (!barcode) return [];

  const cleanBarcode = barcode.trim();
  const url = `https://robotoff.openfoodfacts.org/api/v1/insights?barcode=${cleanBarcode}`;

  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 3000 });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data || !Array.isArray(data.insights)) return [];

    return data.insights
      .filter((i: any) => i && i.type && i.value)
      .map((i: any) => ({
        type: String(i.type || 'insight'),
        value: String(i.value || ''),
        confidence: typeof i.confidence === 'number' ? i.confidence : undefined,
      }))
      .slice(0, 10);
  } catch (err) {
    // Non-blocking fallback: Log warning silently and return empty insights array
    console.warn(`[Robotoff] Insight query skipped or timed out for barcode ${cleanBarcode}:`, err);
    return [];
  }
}
