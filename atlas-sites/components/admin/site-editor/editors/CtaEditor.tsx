'use client';

import { SectionConfig } from '@/lib/site-config/types';
import { FormField } from '../FormField';

interface CtaEditorProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

interface EditorContent {
  headline?: string;
  subheadline?: string;
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  showPhone?: boolean;
}

interface EditorStyles {
  variant?: 'simple' | 'split' | 'banner';
  background?: 'primary' | 'accent' | 'dark' | 'gradient';
  alignment?: 'left' | 'center' | 'right';
}

export function CtaEditor({ section, onUpdate }: CtaEditorProps) {
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
      {/* Content */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Content</h4>
        <div className="space-y-4">
          <FormField label="Headline">
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
              placeholder="Ready to Get Started?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Subheadline">
            <textarea
              value={content.subheadline || ''}
              onChange={(e) => updateContent('subheadline', e.target.value)}
              placeholder="Contact us today for a free quote"
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
        <h4 className="text-white font-medium text-sm mb-3">Secondary Button (optional)</h4>
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
              placeholder="Learn More"
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
              placeholder="/services"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>

      {/* Options */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Options</h4>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={content.showPhone !== false}
            onChange={(e) => updateContent('showPhone', e.target.checked)}
            className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-white text-sm">Show phone number</span>
        </label>
      </div>

      {/* Styles */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Styles</h4>
        <div className="space-y-4">
          <FormField label="Variant">
            <select
              value={styles.variant || 'simple'}
              onChange={(e) => updateStyles('variant', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple</option>
              <option value="split">Split (Text + Buttons)</option>
              <option value="banner">Full Width Banner</option>
            </select>
          </FormField>

          <FormField label="Background">
            <select
              value={styles.background || 'primary'}
              onChange={(e) => updateStyles('background', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="primary">Primary Color</option>
              <option value="accent">Accent Color</option>
              <option value="dark">Dark</option>
              <option value="gradient">Gradient</option>
            </select>
          </FormField>

          <FormField label="Alignment">
            <select
              value={styles.alignment || 'center'}
              onChange={(e) => updateStyles('alignment', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </FormField>
        </div>
      </div>
    </div>
  );
}
