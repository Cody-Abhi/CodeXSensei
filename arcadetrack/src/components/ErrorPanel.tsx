import { Card } from '@/components/ui/Card';
import type { ErrorCode } from '@/lib/types';

const COPY: Record<ErrorCode, { title: string; body: string }> = {
  INVALID_URL: {
    title: 'That is not a profile URL',
    body: 'Paste a public profile link like https://www.skills.google/public_profiles/<your-id>. Only skills.google and cloudskillsboost.google links work.',
  },
  PROFILE_PRIVATE_OR_NOT_FOUND: {
    title: 'Profile is private or not found',
    body: 'We can only read public profiles. Check the link, or make your profile public using the steps below.',
  },
  FETCH_TIMEOUT: { title: 'Timed out', body: 'The profile page took too long to respond. Try again in a moment.' },
  PARSE_FAILED: {
    title: 'Could not read this profile',
    body: 'The profile page loaded, but its layout was not what we expected. The site may have changed. Please try again later.',
  },
  RATE_LIMITED: { title: 'Slow down a little', body: 'Too many requests. Wait a minute and try again.' },
  UPSTREAM_ERROR: { title: 'Profile site unavailable', body: 'We could not reach the profile page. Try again shortly.' },
  NETWORK: { title: 'Network problem', body: 'Check your connection and try again.' },
};

export function ErrorPanel({ code, message }: { code: ErrorCode; message?: string }) {
  const copy = COPY[code];
  return (
    <Card role="alert" className="border-ink bg-pink">
      <h2 className="text-xl uppercase">{copy.title}</h2>
      <p className="mt-1">{message && code !== 'INVALID_URL' && code !== 'NETWORK' ? message : copy.body}</p>
      {code === 'PROFILE_PRIVATE_OR_NOT_FOUND' && (
        <div className="mt-4 border-3 border-ink bg-white p-4">
          <h3 className="text-base uppercase">How to make your profile public</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Sign in at skills.google.</li>
            <li>Open your profile settings from the account menu.</li>
            <li>Turn on <strong>Make profile public</strong> and save.</li>
            <li>Copy the public profile link and paste it here.</li>
          </ol>
        </div>
      )}
    </Card>
  );
}
