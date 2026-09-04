import { UserProfile, LoggedMealEntry } from '@/types';
import { dbStore } from '../backend/dbStore';
import { VeyraApiClient } from '../api/veyraApi';

export const USERS_KEY = 'veyra_users';
export const SESSION_KEY = 'veyra_current_user';
export const DAILY_LOG_KEY = 'veyra_daily_log';
export const ONBOARDING_COMPLETED_KEY = 'veyra_onboarding_completed';
export const AUTHENTICATED_KEY = 'veyra_is_authenticated';
export const USERS_LIST_KEY = 'veyra_registered_users';
export const MIGRATION_FLAG_KEY = 'veyra_migrated_to_backend_v1';

export interface StoredUserAccount {
  email: string;
  passwordHash: string;
  profile: UserProfile;
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return (JSON.parse(item) as T) || fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to LocalStorage key "${key}":`, error);
  }
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * One-Time Migration: LocalStorage -> Authenticated Backend Account -> Database
 */
export async function performOneTimeDataMigration(user: UserProfile): Promise<void> {
  if (typeof window === 'undefined') return;
  const isMigrated = readJson<boolean>(MIGRATION_FLAG_KEY, false);
  if (isMigrated) return;

  try {
    console.log('[Veyra Migration] Performing one-time migration from localStorage to backend database...');
    
    // 1. Sync User Profile to Backend
    await VeyraApiClient.updateProfile(user);

    // 2. Migrate Local Meals
    const localMeals = readJson<LoggedMealEntry[]>(`${DAILY_LOG_KEY}_${getTodayKey()}`, []);
    for (const meal of localMeals) {
      try {
        await VeyraApiClient.addFoodLog(meal);
      } catch (e) {
        // ignore duplicate
      }
    }

    // Set Migration Flag
    writeJson(MIGRATION_FLAG_KEY, true);
    console.log('[Veyra Migration] Migration complete. Shared backend database is now the authoritative source of truth.');
  } catch (err) {
    console.warn('[Veyra Migration] One-time migration notice:', err);
  }
}

export function saveUserToStorage(user: UserProfile): void {
  writeJson(USERS_KEY, user);
  writeJson(SESSION_KEY, user);
}

export function loadUserFromStorage(fallback: UserProfile): UserProfile {
  const session = readJson<UserProfile | null>(SESSION_KEY, null);
  if (session) return session;
  return readJson<UserProfile>(USERS_KEY, fallback);
}

export function loadOnboardingCompleted(): boolean {
  return readJson<boolean>(ONBOARDING_COMPLETED_KEY, false);
}

export function saveOnboardingCompleted(completed: boolean): void {
  writeJson(ONBOARDING_COMPLETED_KEY, completed);
}

export function loadAuthState(): boolean {
  return readJson<boolean>(AUTHENTICATED_KEY, false);
}

export function saveAuthState(isAuthenticated: boolean): void {
  writeJson(AUTHENTICATED_KEY, isAuthenticated);
}

export function loadRegisteredAccounts(): StoredUserAccount[] {
  return readJson<StoredUserAccount[]>(USERS_LIST_KEY, []);
}

export function saveRegisteredAccounts(accounts: StoredUserAccount[]): void {
  writeJson(USERS_LIST_KEY, accounts);
}

export function saveMealLogsToStorage(meals: LoggedMealEntry[]): void {
  const key = `${DAILY_LOG_KEY}_${getTodayKey()}`;
  writeJson(key, meals);
}

export function loadMealLogsFromStorage(fallback: LoggedMealEntry[]): LoggedMealEntry[] {
  const key = `${DAILY_LOG_KEY}_${getTodayKey()}`;
  return readJson<LoggedMealEntry[]>(key, fallback);
}
