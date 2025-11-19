import fs from 'fs';
import path from 'path';
import { getApiToken, getBaseUrl, getProvidedResetToken, getResetTokenFile } from './env';

export async function fetchLatestResetToken(email: string): Promise<string> {
  const provided = getProvidedResetToken();
  if (provided) return provided;

  const filePath = getResetTokenFile();
  if (filePath && fs.existsSync(filePath)) {
    return fs.readFileSync(path.resolve(filePath), 'utf-8').trim();
  }

  const baseUrl = getBaseUrl();
  const apiToken = getApiToken();
  const url = `${baseUrl}/api/test-utils/reset-token?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    headers: {
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch reset token (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { token?: string; otp?: string };
  const token = data.token || data.otp;
  if (!token) throw new Error('No reset token/otp returned by API');
  return token;
}



