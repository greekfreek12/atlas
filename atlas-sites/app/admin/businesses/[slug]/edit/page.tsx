'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { SiteEditor } from '@/components/admin/site-editor/SiteEditor';
import { SiteConfig } from '@/lib/site-config/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BusinessInfo {
  id: string;
  slug: string;
  name: string;
  template: string;
}

export default function SiteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch site config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`/admin/api/site-config/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load site config');
        }

        setConfig(data.config);
        setBusiness(data.business);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load site config');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [slug]);

  // Handle config changes
  const handleConfigChange = useCallback((newConfig: SiteConfig) => {
    setConfig(newConfig);
    setHasUnsavedChanges(true);
  }, []);

  // Save config
  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch(`/admin/api/site-config/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Publish config
  const handlePublish = async () => {
    if (!config) return;

    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      await handleSave();
    }

    setSaving(true);
    try {
      const response = await fetch(`/admin/api/site-config/${slug}/publish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish');
      }

      alert('Site published successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setSaving(false);
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading site editor...</span>
        </div>
      </div>
    );
  }

  if (error || !config || !business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div className="text-red-500 mb-4">{error || 'Failed to load site'}</div>
        <Link
          href="/admin"
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white font-medium">{business.name}</h1>
            <p className="text-zinc-500 text-xs">Site Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-amber-500 text-sm">Unsaved changes</span>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Main editor */}
      <main className="pt-14">
        <SiteEditor
          config={config}
          business={business}
          onConfigChange={handleConfigChange}
        />
      </main>
    </div>
  );
}
