import { useEffect, useState } from 'react';
import { Copy, Check, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getUserLinks, deleteLink } from '../api/services/url.service';
import { API_BASE_URL } from '../api/baseClient';
import type { ShortenResponse } from '../api/services/url.service';
import type { AppUser } from '../types/user';

interface ProfileProps {
  user: AppUser;
}

export const Profile = ({
  user,
}: ProfileProps) => {
  const [links, setLinks] = useState<ShortenResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    getUserLinks()
      .then(setLinks)
      .catch(() => toast.error('Failed to load links'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete link');
    }
  };

  const handleCopy = async (shortLink: string, id: string) => {
    await navigator.clipboard.writeText(`${API_BASE_URL}/${shortLink}`);
    toast.success('Copied to clipboard!');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Your Links
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {user.username || user.email}
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      ) : links.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-10 text-center dark:border-white/10 dark:bg-[#171b34]">
          <p className="text-lg text-slate-500 dark:text-slate-400">
            No links yet. Shorten your first URL above!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-[#171b34]"
            >
              <div className="min-w-0 flex-1">
                <a
                  href={`${API_BASE_URL}/${link.shortLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-base font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {API_BASE_URL}/{link.shortLink}
                  <ExternalLink size={14} />
                </a>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {link.originalLink}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {new Date(link.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(link.shortLink, link.id)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                  title="Copy link"
                >
                  {copiedId === link.id ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  title="Delete link"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
