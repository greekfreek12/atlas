'use client';

import { useState, useEffect } from 'react';
import { SectionConfig, SectionType } from '@/lib/site-config/types';
import {
  X,
  Image,
  Shield,
  Briefcase,
  Star,
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react';

interface SectionTypeInfo {
  type: SectionType;
  name: string;
  description: string;
  isImplemented: boolean;
}

interface AddSectionModalProps {
  onAdd: (section: SectionConfig) => void;
  onClose: () => void;
}

// Icon mapping for section types
const sectionIcons: Record<string, React.ReactNode> = {
  hero: <Image className="w-5 h-5" />,
  'trust-bar': <Shield className="w-5 h-5" />,
  services: <Briefcase className="w-5 h-5" />,
  reviews: <Star className="w-5 h-5" />,
  cta: <Phone className="w-5 h-5" />,
  'contact-form': <MessageSquare className="w-5 h-5" />,
};

export function AddSectionModal({ onAdd, onClose }: AddSectionModalProps) {
  const [loading, setLoading] = useState(true);
  const [sectionTypes, setSectionTypes] = useState<SectionTypeInfo[]>([]);
  const [defaults, setDefaults] = useState<Record<string, SectionConfig>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSectionTypes() {
      try {
        const response = await fetch('/admin/api/site-config/sections');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load section types');
        }

        setSectionTypes(data.available);
        setDefaults(data.defaults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sections');
      } finally {
        setLoading(false);
      }
    }

    fetchSectionTypes();
  }, []);

  const handleAddSection = (type: SectionType) => {
    const defaultConfig = defaults[type];
    if (defaultConfig) {
      // Generate a unique ID
      const newSection: SectionConfig = {
        ...defaultConfig,
        id: `${type}-${Date.now()}`,
      };
      onAdd(newSection);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Add Section</h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : (
            <div className="grid gap-3">
              {sectionTypes.map((section) => {
                const icon = sectionIcons[section.type] || (
                  <div className="w-5 h-5 bg-zinc-600 rounded" />
                );

                return (
                  <button
                    key={section.type}
                    onClick={() => handleAddSection(section.type)}
                    className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-zinc-700/50 text-zinc-300 group-hover:text-white group-hover:bg-blue-600/30 transition-colors">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">{section.name}</div>
                      <div className="text-zinc-400 text-sm mt-0.5">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
