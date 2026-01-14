'use client';

/**
 * GenericSection - Fallback renderer for unknown section types
 *
 * This component renders ANY section config, even for types that don't have
 * dedicated components. It intelligently reads the config.content object
 * and renders common patterns like headings, text, images, and lists.
 *
 * Used when:
 * - AI creates a new section type (e.g., "pricing", "team")
 * - A section type exists in config but no component is registered
 *
 * Note: Body text uses dangerouslySetInnerHTML for rich content. This is
 * acceptable since content comes from admin-controlled site configs, not
 * untrusted user input. Consider adding DOMPurify for additional safety.
 */

import Image from 'next/image';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { BaseSectionConfig } from '@/lib/site-config/types';

interface GenericSectionConfig extends BaseSectionConfig {
  type: string;
  content: Record<string, unknown>;
}

export function GenericSection({ config }: SectionComponentProps<GenericSectionConfig>) {
  const { content, type } = config;

  // Extract common content patterns
  const heading = (content.heading || content.headline || content.title) as string | undefined;
  const subheading = (content.subheading || content.tagline || content.subtitle || content.description) as string | undefined;
  const body = (content.body || content.text || content.content) as string | undefined;
  const items = (content.items || content.list || content.features || content.faqs || content.options || content.tiers) as unknown[] | undefined;
  const images = (content.images || content.gallery) as Array<{ src?: string; url?: string; alt?: string }> | undefined;
  const image = content.image as { src?: string; url?: string; alt?: string } | undefined;

  // Check if we have any content to render
  const hasContent = heading || subheading || body || items?.length || images?.length || image;

  if (!hasContent) {
    return (
      <section
        className="py-16 bg-[var(--color-background-alt)]"
        data-section-id={config.id}
        data-section-type={type}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[var(--color-text-muted)]">
            Section "{type}" - No content yet
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 lg:py-24 bg-[var(--color-background)]"
      data-section-id={config.id}
      data-section-type={type}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(heading || subheading) && (
          <div className="text-center mb-12">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </div>
        )}

        {/* Body text - admin-controlled content */}
        {body && (
          <div
            className="prose prose-lg max-w-3xl mx-auto text-[var(--color-text-muted)] mb-12"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}

        {/* Single image */}
        {image && (image.src || image.url) && (
          <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden mb-12">
            <Image
              src={image.src || image.url || ''}
              alt={image.alt || ''}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Image gallery */}
        {images && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={img.src || img.url || '/placeholder.jpg'}
                  alt={img.alt || `Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Items/list rendering */}
        {items && items.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              // Handle different item shapes
              if (typeof item === 'string') {
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-[var(--color-background-alt)] border border-[var(--color-text)]/5"
                  >
                    <p className="text-[var(--color-text)]">{item}</p>
                  </div>
                );
              }

              const itemObj = item as Record<string, unknown>;
              const itemTitle = (itemObj.title || itemObj.name || itemObj.question || itemObj.label) as string | undefined;
              const itemDesc = (itemObj.description || itemObj.answer || itemObj.text || itemObj.body) as string | undefined;
              const itemPrice = (itemObj.price || itemObj.cost || itemObj.amount) as string | number | undefined;
              const itemImage = itemObj.image as { src?: string; url?: string } | undefined;

              return (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-[var(--color-background-alt)] border border-[var(--color-text)]/5"
                >
                  {itemImage && (itemImage.src || itemImage.url) && (
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                      <Image
                        src={itemImage.src || itemImage.url || ''}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  {itemTitle && (
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                      {itemTitle}
                    </h3>
                  )}
                  {itemPrice !== undefined && (
                    <p className="text-2xl font-bold text-[var(--color-accent)] mb-2">
                      {typeof itemPrice === 'number' ? `$${itemPrice}` : itemPrice}
                    </p>
                  )}
                  {itemDesc && (
                    <p className="text-[var(--color-text-muted)]">{itemDesc}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
