'use client';

import { useState, useCallback } from 'react';
import { SiteConfig, PageConfig, SectionConfig } from '@/lib/site-config/types';
import { SectionList } from './SectionList';
import { SectionEditor } from './SectionEditor';
import { ThemeEditor } from './ThemeEditor';
import { PreviewFrame } from './PreviewFrame';
import { Palette, Layers, Eye, Settings } from 'lucide-react';

interface BusinessInfo {
  id: string;
  slug: string;
  name: string;
  template: string;
}

interface SiteEditorProps {
  config: SiteConfig;
  business: BusinessInfo;
  onConfigChange: (config: SiteConfig) => void;
}

type EditorTab = 'sections' | 'theme' | 'settings';
type EditorMode = 'edit' | 'preview';

export function SiteEditor({ config, business, onConfigChange }: SiteEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('sections');
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');

  // Get current page
  const currentPage = config.pages.find((p) => p.slug === selectedPageSlug) || config.pages[0];

  // Get selected section
  const selectedSection = selectedSectionId
    ? currentPage?.sections.find((s) => s.id === selectedSectionId)
    : null;

  // Handle section selection
  const handleSectionSelect = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setActiveTab('sections');
  }, []);

  // Handle section reorder
  const handleSectionsReorder = useCallback(
    (newSections: SectionConfig[]) => {
      const updatedPages = config.pages.map((page) => {
        if (page.slug === selectedPageSlug) {
          return { ...page, sections: newSections };
        }
        return page;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConfigChange({ ...config, pages: updatedPages } as any);
    },
    [config, selectedPageSlug, onConfigChange]
  );

  // Handle section update
  const handleSectionUpdate = useCallback(
    (sectionId: string, updates: Partial<SectionConfig>) => {
      const updatedPages = config.pages.map((page) => {
        if (page.slug === selectedPageSlug) {
          return {
            ...page,
            sections: page.sections.map((section) => {
              if (section.id === sectionId) {
                return { ...section, ...updates };
              }
              return section;
            }),
          };
        }
        return page;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConfigChange({ ...config, pages: updatedPages } as any);
    },
    [config, selectedPageSlug, onConfigChange]
  );

  // Handle section add
  const handleSectionAdd = useCallback(
    (section: SectionConfig, position?: number) => {
      const updatedPages = config.pages.map((page) => {
        if (page.slug === selectedPageSlug) {
          const newSections = [...page.sections];
          if (position !== undefined && position >= 0) {
            newSections.splice(position, 0, section);
          } else {
            newSections.push(section);
          }
          return { ...page, sections: newSections };
        }
        return page;
      });

      onConfigChange({ ...config, pages: updatedPages });
      setSelectedSectionId(section.id);
    },
    [config, selectedPageSlug, onConfigChange]
  );

  // Handle section delete
  const handleSectionDelete = useCallback(
    (sectionId: string) => {
      const updatedPages = config.pages.map((page) => {
        if (page.slug === selectedPageSlug) {
          return {
            ...page,
            sections: page.sections.filter((s) => s.id !== sectionId),
          };
        }
        return page;
      });

      onConfigChange({ ...config, pages: updatedPages });
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
    },
    [config, selectedPageSlug, selectedSectionId, onConfigChange]
  );

  // Handle theme update
  const handleThemeUpdate = useCallback(
    (updates: Partial<SiteConfig['theme']>) => {
      onConfigChange({
        ...config,
        theme: { ...config.theme, ...updates },
      });
    },
    [config, onConfigChange]
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left sidebar - Section list */}
      <div className="w-72 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        {/* Page selector */}
        <div className="p-3 border-b border-zinc-800">
          <select
            value={selectedPageSlug}
            onChange={(e) => {
              setSelectedPageSlug(e.target.value);
              setSelectedSectionId(null);
            }}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {config.pages.map((page) => (
              <option key={page.id} value={page.slug}>
                {page.title || (page.slug === '' ? 'Home' : page.slug)}
              </option>
            ))}
          </select>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'sections'
                ? 'text-white border-b-2 border-blue-500 bg-zinc-800/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Sections
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'theme'
                ? 'text-white border-b-2 border-blue-500 bg-zinc-800/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            Theme
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'sections' && currentPage && (
            <SectionList
              sections={currentPage.sections}
              selectedSectionId={selectedSectionId}
              onSectionSelect={handleSectionSelect}
              onSectionsReorder={handleSectionsReorder}
              onSectionAdd={handleSectionAdd}
              onSectionDelete={handleSectionDelete}
            />
          )}
          {activeTab === 'theme' && (
            <ThemeEditor theme={config.theme} onThemeUpdate={handleThemeUpdate} />
          )}
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col bg-zinc-950">
        {/* Mode toggle */}
        <div className="h-12 border-b border-zinc-800 flex items-center justify-center gap-2 bg-zinc-900/30">
          <button
            onClick={() => setEditorMode('edit')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              editorMode === 'edit'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Edit Mode
          </button>
          <button
            onClick={() => setEditorMode('preview')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              editorMode === 'preview'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Preview iframe */}
        <div className="flex-1 p-4">
          <PreviewFrame
            business={business}
            pageSlug={selectedPageSlug}
            selectedSectionId={editorMode === 'edit' ? selectedSectionId : null}
            onSectionClick={editorMode === 'edit' ? handleSectionSelect : undefined}
          />
        </div>
      </div>

      {/* Right sidebar - Section editor */}
      {activeTab === 'sections' && selectedSection && (
        <div className="w-80 border-l border-zinc-800 bg-zinc-900/50 overflow-y-auto">
          <SectionEditor
            section={selectedSection}
            businessSlug={business.slug}
            onUpdate={(updates) => handleSectionUpdate(selectedSection.id, updates)}
            onClose={() => setSelectedSectionId(null)}
          />
        </div>
      )}
    </div>
  );
}
