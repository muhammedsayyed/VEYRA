import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../src/services/backend/apiResponse';
import {
  getCountryByIdOrCode,
  listCountries,
} from '../src/services/backend/foodService';
import {
  isValidResourceId,
  methodNotAllowed,
  notFound,
} from '../src/services/backend/validation';

/**
 * GET /api/countries              -> all countries (optionally ?withCounts=1)
 * GET /api/countries?code=eg      -> single country lookup by code
 * GET /api/countries?id=1         -> single country lookup by numeric id
 */
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const id = url.searchParams.get('id');

    if (code || id) {
      const key = (code || id)!;
      if (!isValidResourceId(key)) {
        return jsonOk(null); // malformed key -> treated as not found
      }
      const country = await getCountryByIdOrCode(key);
      if (!country) return notFound('Country');
      return jsonOk(country);
    }

    const withCounts = ['1', 'true'].includes(
      (url.searchParams.get('withCounts') || '').toLowerCase()
    );
    const countries = await listCountries({ withCounts });
    return jsonOk(countries);
  });
}
