import {
  jsonOk,
  preflightResponse,
  withApiErrors,
} from '../backend/apiResponse';
import { listCountries } from '../backend/foodService';
import { methodNotAllowed } from '../backend/validation';

export default async function handleCountries(req: Request) {
  if (req.method === 'OPTIONS') return preflightResponse();
  if (req.method !== 'GET') return methodNotAllowed();

  return withApiErrors(async () => {
    const url = new URL(req.url);
    const withCounts = ['1', 'true'].includes(
      (url.searchParams.get('counts') || '').toLowerCase()
    );
    const countries = await listCountries({ withCounts });
    return jsonOk(countries);
  });
}
