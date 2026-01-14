'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, ExternalLink, Pencil, Globe } from 'lucide-react';

interface Business {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  template: string;
  is_published: boolean;
  custom_domain: string | null;
}

export default function SitesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from('businesses')
          .select('id, slug, name, city, state, template, is_published, custom_domain')
          .order('name');

        if (error) throw error;

        setBusinesses(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load businesses');
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading sites...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sites</h1>
        <p className="text-slate-400 mt-1">
          Manage and customize your business websites
        </p>
      </div>

      {/* Sites Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => {
          const siteUrl = `/${business.template}-${business.slug}`;

          return (
            <div
              key={business.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{business.name}</h3>
                  {(business.city || business.state) && (
                    <p className="text-slate-400 text-sm mt-0.5">
                      {[business.city, business.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    business.is_published
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {business.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              {business.custom_domain && (
                <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{business.custom_domain}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                <Link
                  href={`/admin/businesses/${business.slug}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Site
                </Link>
                <Link
                  href={siteUrl}
                  target="_blank"
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {businesses.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No businesses found. Add a business to get started.
        </div>
      )}
    </div>
  );
}
