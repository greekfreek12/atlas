'use client';

import { SectionConfig } from '@/lib/site-config/types';
import { getSectionMetadata } from '@/lib/site-config/registry';
import { X } from 'lucide-react';
import { HeroEditor } from './editors/HeroEditor';
import { TrustBarEditor } from './editors/TrustBarEditor';
import { ServicesEditor } from './editors/ServicesEditor';
import { ReviewsEditor } from './editors/ReviewsEditor';
import { CtaEditor } from './editors/CtaEditor';
import { ContactFormEditor } from './editors/ContactFormEditor';

interface SectionEditorProps {
  section: SectionConfig;
  businessSlug: string;
  onUpdate: (updates: Partial<SectionConfig>) => void;
  onClose: () => void;
}

export function SectionEditor({
  section,
  businessSlug,
  onUpdate,
  onClose,
}: SectionEditorProps) {
  const metadata = getSectionMetadata(section.type);

  // Render the appropriate editor based on section type
  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroEditor
            section={section}
            businessSlug={businessSlug}
            onUpdate={onUpdate}
          />
        );
      case 'trust-bar':
        return (
          <TrustBarEditor
            section={section}
            onUpdate={onUpdate}
          />
        );
      case 'services':
        return (
          <ServicesEditor
            section={section}
            businessSlug={businessSlug}
            onUpdate={onUpdate}
          />
        );
      case 'reviews':
        return (
          <ReviewsEditor
            section={section}
            onUpdate={onUpdate}
          />
        );
      case 'cta':
        return (
          <CtaEditor
            section={section}
            onUpdate={onUpdate}
          />
        );
      case 'contact-form':
        return (
          <ContactFormEditor
            section={section}
            onUpdate={onUpdate}
          />
        );
      default:
        return (
          <div className="p-4 text-zinc-400 text-center">
            No editor available for this section type.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div>
          <h3 className="text-white font-medium">
            {metadata?.label || section.type}
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">Edit section</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto">{renderEditor()}</div>
    </div>
  );
}
