export type CrashReport = {
  message: string;
  stack?: string;
  isFatal: boolean;
  source: 'global' | 'boundary';
  time: string;
  platform: string;
  osVersion: string;
  appVersion: string;
};

export const REPO_ISSUES_URL =
  'https://github.com/jeong-jihyun/arena-brawl-mobile/issues/new';

const MAX_BODY = 5500;

export function buildReportText(report: CrashReport): string {
  const lines = [
    `source: ${report.source}${report.isFatal ? ' (fatal)' : ''}`,
    `time: ${report.time}`,
    `device: ${report.platform} ${report.osVersion}`,
    `app: ${report.appVersion}`,
    '',
    `message: ${report.message}`,
    '',
    'stack:',
    report.stack ?? '(none)',
  ];
  return lines.join('\n');
}

export function buildIssueUrl(report: CrashReport): string {
  const title = `[crash] ${report.message}`.slice(0, 100);
  let text = buildReportText(report);
  if (text.length > MAX_BODY) {
    text = `${text.slice(0, MAX_BODY)}\n...(truncated)`;
  }
  const body = `\`\`\`\n${text}\n\`\`\``;
  return `${REPO_ISSUES_URL}?title=${encodeURIComponent(title)}&labels=crash&body=${encodeURIComponent(body)}`;
}

export function toReport(
  error: unknown,
  isFatal: boolean,
  source: CrashReport['source'],
  env: { platform: string; osVersion: string; appVersion: string },
): CrashReport {
  const err = error as { message?: unknown; stack?: unknown } | null;
  return {
    message: String(err?.message ?? error ?? 'unknown error'),
    stack: typeof err?.stack === 'string' ? err.stack : undefined,
    isFatal,
    source,
    time: new Date().toISOString(),
    ...env,
  };
}
