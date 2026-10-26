'use client';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { PROFILE } from '@/config/arcade';
import { ClientError, fetchProfile } from '@/lib/fetchProfile';
import { parseProfileUrl } from '@/lib/url';
import type { ErrorCode } from '@/lib/types';
import { useTracker } from '@/store/useTracker';
import { ErrorPanel } from './ErrorPanel';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function TrackForm() {
  const router = useRouter();
  const savePull = useTracker((s) => s.savePull);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: ErrorCode; message?: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseProfileUrl(value);
    if (!parsed.ok) return setError({ code: 'INVALID_URL' });

    setLoading(true);
    try {
      const data = await fetchProfile(parsed.normalizedUrl);
      savePull(parsed.normalizedUrl, data);
      router.push(`/dashboard?id=${data.profileId}`);
    } catch (err) {
      const ce = err instanceof ClientError ? err : new ClientError('NETWORK', 'Network problem.');
      setError({ code: ce.code, message: ce.message });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <label htmlFor="profile-url" className="block text-sm font-bold uppercase">
        Public profile URL
      </label>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          id="profile-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder={PROFILE.exampleUrl}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error?.code === 'INVALID_URL'}
        />
        <Button type="submit" disabled={loading} className="h-16 shrink-0 text-lg">
          {loading ? 'Loading…' : 'Track it →'}
        </Button>
      </div>
      <p className="text-sm">
        Example: <span className="break-all font-mono">{PROFILE.exampleUrl}</span>
      </p>
      <p className="text-sm">
        🔒 We only read your <strong>public</strong> profile page. No login, no tracking. Your history is saved only in this browser.
      </p>
      {error && <ErrorPanel code={error.code} message={error.message} />}
    </form>
  );
}
