import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { CrashReport, toReport } from './report';

const KEY = 'arena-brawl:last-crash';

const env = () => ({
  platform: Platform.OS,
  osVersion: String(Platform.Version),
  appVersion: Constants.expoConfig?.version ?? 'unknown',
});

export async function saveReport(report: CrashReport): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(report));
  } catch {
    // never throw from the crash path
  }
}

export async function loadPendingReport(): Promise<CrashReport | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CrashReport) : null;
  } catch {
    return null;
  }
}

export async function clearPendingReport(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function reportFromBoundary(error: unknown): CrashReport {
  const report = toReport(error, false, 'boundary', env());
  void saveReport(report);
  return report;
}

/** Persist uncaught JS errors so they can be shown/sent on the next launch. */
export function installGlobalHandler(): void {
  const errorUtils = (globalThis as any).ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return;
  const previous = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    void saveReport(toReport(error, !!isFatal, 'global', env()));
    previous?.(error, isFatal);
  });
}
