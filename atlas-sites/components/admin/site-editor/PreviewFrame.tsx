'use client';

import { useState, useEffect, useRef } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react';

interface BusinessInfo {
  id: string;
  slug: string;
  name: string;
  template: string;
}

interface PreviewFrameProps {
  business: BusinessInfo;
  pageSlug: string;
  selectedSectionId: string | null;
  onSectionClick?: (sectionId: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
};

export function PreviewFrame({
  business,
  pageSlug,
  selectedSectionId,
  onSectionClick,
}: PreviewFrameProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build preview URL
  // Build URL with template-slug format (e.g., /plumbing-marco-plumbing)
  const basePath = `/${business.template}-${business.slug}`;
  const previewUrl = `${basePath}${pageSlug ? `/${pageSlug}` : ''}?preview=true&t=${refreshKey}`;

  // Handle iframe load
  useEffect(() => {
    setLoading(true);
  }, [previewUrl]);

  // Scroll to selected section
  useEffect(() => {
    if (selectedSectionId && iframeRef.current?.contentWindow) {
      try {
        const doc = iframeRef.current.contentDocument;
        const element = doc?.querySelector(`[data-section-id="${selectedSectionId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (e) {
        // Cross-origin restrictions may prevent this
      }
    }
  }, [selectedSectionId]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Viewport controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
          {(Object.entries(viewportSizes) as [ViewportSize, { width: string; icon: typeof Monitor }][]).map(
            ([size, { icon: Icon }]) => (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={`p-2 rounded-md transition-colors ${
                  viewport === size
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-500 hover:text-white'
                }`}
                title={size.charAt(0).toUpperCase() + size.slice(1)}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 text-zinc-500 hover:text-white transition-colors"
          title="Refresh preview"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Preview frame container */}
      <div className="flex-1 flex justify-center bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <div
          className="h-full bg-white overflow-auto transition-all duration-300"
          style={{
            width: viewportSizes[viewport].width,
            maxWidth: '100%',
          }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
              <div className="flex items-center gap-2 text-zinc-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading preview...</span>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title="Site Preview"
          />
        </div>
      </div>

      {/* Selected section indicator */}
      {selectedSectionId && (
        <div className="mt-2 text-center">
          <span className="text-xs text-zinc-500">
            Selected: <span className="text-zinc-300">{selectedSectionId}</span>
          </span>
        </div>
      )}
    </div>
  );
}
