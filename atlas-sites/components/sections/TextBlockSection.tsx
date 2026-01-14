'use client';

import Image from 'next/image';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { TextBlockSectionConfig } from '@/lib/site-config/types';

/**
 * TextBlockSection - Rich text content with optional image
 *
 * Security Note: Uses dangerouslySetInnerHTML for rich content rendering.
 * This is acceptable in this context because:
 * 1. Content comes from admin-controlled site configs, not public user input
 * 2. Only authenticated admin users can modify site configs
 * 3. The AI agent generates content, which is reviewed before publishing
 *
 * For additional safety, consider adding DOMPurify sanitization in production.
 */
export function TextBlockSection({ config }: SectionComponentProps<TextBlockSectionConfig>) {
  const { content } = config;
  const imagePosition = content.imagePosition || 'right';
  const hasImage = content.image && content.image.src;

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--color-background)]"
      data-section-id={config.id}
      data-section-type={config.type}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${
          hasImage
            ? imagePosition === 'left'
              ? 'lg:flex-row-reverse'
              : 'lg:flex-row'
            : ''
        } gap-12 items-center`}>
          {/* Text Content */}
          <div className={hasImage ? 'flex-1' : 'max-w-3xl mx-auto'}>
            {content.heading && (
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-6">
                {content.heading}
              </h2>
            )}
            {/* Admin-controlled rich content - see security note above */}
            <div
              className="prose prose-lg max-w-none text-[var(--color-text-muted)]
                         prose-headings:text-[var(--color-text)]
                         prose-strong:text-[var(--color-text)]
                         prose-a:text-[var(--color-accent)]"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </div>

          {/* Image */}
          {hasImage && content.image && (
            <div className={`flex-1 relative ${
              imagePosition === 'top' || imagePosition === 'bottom'
                ? 'w-full aspect-video'
                : 'aspect-video lg:aspect-square w-full'
            } rounded-xl overflow-hidden`}>
              <Image
                src={content.image.src}
                alt={content.image.alt || ''}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
