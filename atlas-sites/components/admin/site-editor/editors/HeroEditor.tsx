'use client';

import { SectionConfig } from '@/lib/site-config/types';
import { ImageUploader } from '../ImageUploader';
import { FormField } from '../FormField';

interface HeroEditorProps {
  section: SectionConfig;
  businessSlug: string;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

interface EditorContent {
  headline?: string;
  tagline?: string;
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  backgroundImage?: { src: string; alt: string };
  showRating?: boolean;
  ratingText?: string;
}

interface EditorStyles {
  textAlign?: 'left' | 'center' | 'right';
  overlay?: 'none' | 'light' | 'dark' | 'gradient';
  height?: 'auto' | 'full' | 'large' | 'medium';
}

export function HeroEditor({ section, businessSlug, onUpdate }: HeroEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (section as any).content as EditorContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = ((section as any).styles || {}) as EditorStyles;

  const updateContent = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ content: { ...content, [key]: value } } as any);
  };

  const updateStyles = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ styles: { ...styles, [key]: value } } as any);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Content Section */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Content</h4>
        <div className="space-y-4">
          <FormField label="Headline">
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
              placeholder="Enter headline..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Tagline">
            <textarea
              value={content.tagline || ''}
              onChange={(e) => updateContent('tagline', e.target.value)}
              placeholder="Enter tagline..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </FormField>

          <FormField label="Background Image">
            <ImageUploader
              currentImage={content.backgroundImage?.src}
              businessSlug={businessSlug}
              folder="hero"
              onUpload={(url) => updateContent('backgroundImage', {
                src: url,
                alt: content.backgroundImage?.alt || 'Hero background'
              })}
              onRemove={() => updateContent('backgroundImage', { src: '', alt: '' })}
            />
          </FormField>
        </div>
      </div>

      {/* Primary CTA */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Primary Button</h4>
        <div className="space-y-3">
          <FormField label="Button Text">
            <input
              type="text"
              value={content.primaryCta?.text || ''}
              onChange={(e) =>
                updateContent('primaryCta', {
                  ...content.primaryCta,
                  text: e.target.value,
                })
              }
              placeholder="Call Now"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
          <FormField label="Button Link">
            <input
              type="text"
              value={content.primaryCta?.href || ''}
              onChange={(e) =>
                updateContent('primaryCta', {
                  ...content.primaryCta,
                  href: e.target.value,
                })
              }
              placeholder="tel:+1234567890"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>

      {/* Secondary CTA */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Secondary Button</h4>
        <div className="space-y-3">
          <FormField label="Button Text">
            <input
              type="text"
              value={content.secondaryCta?.text || ''}
              onChange={(e) =>
                updateContent('secondaryCta', {
                  ...content.secondaryCta,
                  text: e.target.value,
                })
              }
              placeholder="Get Quote"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
          <FormField label="Button Link">
            <input
              type="text"
              value={content.secondaryCta?.href || ''}
              onChange={(e) =>
                updateContent('secondaryCta', {
                  ...content.secondaryCta,
                  href: e.target.value,
                })
              }
              placeholder="/contact"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>

      {/* Styles Section */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Styles</h4>
        <div className="space-y-4">
          <FormField label="Text Alignment">
            <select
              value={styles.textAlign || 'left'}
              onChange={(e) => updateStyles('textAlign', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </FormField>

          <FormField label="Overlay">
            <select
              value={styles.overlay || 'dark'}
              onChange={(e) => updateStyles('overlay', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="gradient">Gradient</option>
            </select>
          </FormField>

          <FormField label="Section Height">
            <select
              value={styles.height || 'large'}
              onChange={(e) => updateStyles('height', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="full">Full Screen</option>
            </select>
          </FormField>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Rating Badge</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.showRating !== false}
              onChange={(e) => updateContent('showRating', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white text-sm">Show rating badge</span>
          </label>
          {content.showRating !== false && (
            <FormField label="Rating Text">
              <input
                type="text"
                value={content.ratingText || ''}
                onChange={(e) => updateContent('ratingText', e.target.value)}
                placeholder="5-Star Rated Service"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          )}
        </div>
      </div>
    </div>
  );
}
