import { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { shortenUrl } from '../api/services/url.service';
import { API_BASE_URL } from '../api/baseClient';

export const HomePage = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-5 pb-8 pt-14 text-center md:px-8">
      <h1 className="max-w-5xl text-4xl lg:text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-[#171732] md:text-7xl dark:text-white">
        <span className="block">Shorten links.</span>
        <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
          Expand possibilities.
        </span>
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-indigo-950/65 dark:text-indigo-100/70 md:text-2xl">
        The modern URL shortener for people who value speed, security, and
        aesthetics. Create memorable links in seconds.
      </p>

      <div className="input-shell mt-11 flex w-full max-w-5xl items-center gap-2.5 rounded-2xl border border-white/80 bg-white px-3 py-2.5 shadow-[0_20px_45px_rgba(78,63,181,0.18)] dark:border-white/10 dark:bg-[#171b34] dark:shadow-[0_20px_45px_rgba(0,0,0,0.5)]">
        <div className="flex h-9 w-9 items-center justify-center text-indigo-500 dark:text-indigo-300">
          <Link2 size={18} />
        </div>

        <input
          type="url"
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value);
            setError('');
          }}
          placeholder="Paste your long URL here..."
          className="h-9 outline-none flex-1 bg-transparent text-base text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
        />

        <button
          type="button"
          disabled={loading || !inputUrl.trim()}
          onClick={async () => {
            setLoading(true);
            setError('');
            setShortLink('');
            try {
              const data = await shortenUrl(inputUrl.trim());
              setShortLink(`${API_BASE_URL}/${data.shortLink}`);
              toast.success('URL shortened successfully!');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
              const msg = err.response?.data?.error || 'Something went wrong';
              setError(msg);
            } finally {
              setLoading(false);
            }
          }}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 sm:px-8 sm:py-2.5 sm:text-lg font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {shortLink && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-5 py-3 shadow-md dark:border-white/10 dark:bg-[#171b34]">
          <a
            href={shortLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-indigo-600 underline dark:text-indigo-400"
          >
            {shortLink}
          </a>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(shortLink);
              toast.success('Copied to clipboard!');
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
          >
            {copied ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
      )}
    </main>
  );
};
