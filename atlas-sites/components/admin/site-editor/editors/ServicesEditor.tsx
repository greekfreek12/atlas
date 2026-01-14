'use client';

import { SectionConfig } from '@/lib/site-config/types';
import { FormField } from '../FormField';
import { ImageUploader } from '../ImageUploader';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ServicesEditorProps {
  section: SectionConfig;
  businessSlug: string;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  href?: string;
}

interface EditorContent {
  headline?: string;
  subheadline?: string;
  services?: ServiceItem[];
}

interface EditorStyles {
  columns?: 2 | 3 | 4;
  cardStyle?: 'minimal' | 'bordered' | 'elevated';
  showImages?: boolean;
}

export function ServicesEditor({
  section,
  businessSlug,
  onUpdate,
}: ServicesEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (section as any).content as EditorContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = ((section as any).styles || {}) as EditorStyles;

  const services = content.services || [];

  const updateContent = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ content: { ...content, [key]: value } } as any);
  };

  const updateStyles = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ styles: { ...styles, [key]: value } } as any);
  };

  const updateService = (index: number, updates: Partial<ServiceItem>) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], ...updates };
    updateContent('services', newServices);
  };

  const addService = () => {
    const newServices = [
      ...services,
      {
        id: `service-${Date.now()}`,
        title: 'New Service',
        description: 'Service description',
        icon: 'wrench',
      },
    ];
    updateContent('services', newServices);
    setExpandedIndex(newServices.length - 1);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    updateContent('services', newServices);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Section Header */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Section Header</h4>
        <div className="space-y-4">
          <FormField label="Headline">
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
              placeholder="Our Services"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Subheadline">
            <input
              type="text"
              value={content.subheadline || ''}
              onChange={(e) => updateContent('subheadline', e.target.value)}
              placeholder="Professional services for your needs"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>

      {/* Services List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium text-sm">Services</h4>
          <button
            onClick={addService}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Service
          </button>
        </div>

        <div className="space-y-2">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden"
            >
              {/* Collapsed header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-zinc-800/80 transition-colors"
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {service.title || 'Untitled Service'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeService(index);
                  }}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedIndex === index ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </div>

              {/* Expanded content */}
              {expandedIndex === index && (
                <div className="p-3 pt-0 space-y-4 border-t border-zinc-700/50">
                  <FormField label="Title">
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) =>
                        updateService(index, { title: e.target.value })
                      }
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Description">
                    <textarea
                      value={service.description}
                      onChange={(e) =>
                        updateService(index, { description: e.target.value })
                      }
                      rows={2}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </FormField>

                  <FormField label="Link URL (optional)">
                    <input
                      type="text"
                      value={service.href || ''}
                      onChange={(e) =>
                        updateService(index, { href: e.target.value })
                      }
                      placeholder="/services/service-name"
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  {styles.showImages && (
                    <FormField label="Image">
                      <ImageUploader
                        currentImage={service.image}
                        businessSlug={businessSlug}
                        folder="services"
                        onUpload={(url) => updateService(index, { image: url })}
                        onRemove={() => updateService(index, { image: '' })}
                      />
                    </FormField>
                  )}
                </div>
              )}
            </div>
          ))}

          {services.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-sm">
              No services yet. Click "Add Service" to add one.
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Styles</h4>
        <div className="space-y-4">
          <FormField label="Columns">
            <select
              value={styles.columns || 3}
              onChange={(e) => updateStyles('columns', parseInt(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </FormField>

          <FormField label="Card Style">
            <select
              value={styles.cardStyle || 'bordered'}
              onChange={(e) => updateStyles('cardStyle', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="minimal">Minimal</option>
              <option value="bordered">Bordered</option>
              <option value="elevated">Elevated</option>
            </select>
          </FormField>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={styles.showImages || false}
              onChange={(e) => updateStyles('showImages', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white text-sm">Show service images</span>
          </label>
        </div>
      </div>
    </div>
  );
}
