'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionComponentProps } from '@/lib/site-config/registry';
import { GallerySectionConfig } from '@/lib/site-config/types';

export function GallerySection({ config }: SectionComponentProps<GallerySectionConfig>) {
  const { content, styles } = config;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = content.images || [];

  if (images.length === 0) {
    return (
      <section
        className="py-16 bg-[var(--color-background-alt)]"
        data-section-id={config.id}
        data-section-type={config.type}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
            {content.heading || 'Our Work'}
          </h2>
          <p className="text-[var(--color-text-muted)]">No images added yet.</p>
        </div>
      </section>
    );
  }

  const columns = styles?.columns || 3;
  const gap = styles?.gap || 'md';

  const gapClasses: Record<string, string> = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses: Record<number, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <>
      <section
        className="py-16 lg:py-24 bg-[var(--color-background-alt)]"
        data-section-id={config.id}
        data-section-type={config.type}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {content.heading && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
                {content.heading}
              </h2>
            </div>
          )}

          <div className={`grid grid-cols-1 ${columnClasses[columns] || columnClasses[3]} ${gapClasses[gap] || gapClasses['md']}`}>
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setLightboxOpen(true);
                }}
                className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <Image
                  src={image.src || '/placeholder.jpg'}
                  alt={image.alt || 'Gallery image'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((currentIndex - 1 + images.length) % images.length);
                }}
                className="absolute left-4 p-2 text-white/70 hover:text-white z-10"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((currentIndex + 1) % images.length);
                }}
                className="absolute right-4 p-2 text-white/70 hover:text-white z-10"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl max-h-[80vh] w-full h-full m-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex].src || '/placeholder.jpg'}
              alt={images[currentIndex].alt || ''}
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
