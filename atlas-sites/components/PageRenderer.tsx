'use client';

/**
 * PageRenderer
 *
 * Renders a complete page from JSON config by mapping sections
 * to their registered components. Handles theme CSS variables,
 * edit mode, and section ordering.
 */

import { useMemo } from 'react';
import { PageConfig, ThemeConfig, SectionConfig } from '@/lib/site-config/types';
import { getSection } from '@/lib/site-config/registry';
import { Business } from '@/lib/types';

// Import sections to ensure they're registered
import '@/components/sections';
import { GenericSection } from '@/components/sections/GenericSection';

interface PageRendererProps {
  /** The page configuration to render */
  page: PageConfig;

  /** Theme settings for CSS variables */
  theme: ThemeConfig;

  /** Business data from database */
  business: Business;

  /** Base path for internal links (e.g., "/plumbing-marco-plumbing") */
  basePath: string;

  /** Enable edit mode highlighting */
  isEditing?: boolean;

  /** Callback when section is clicked in edit mode */
  onSectionClick?: (sectionId: string) => void;
}

/**
 * Convert theme config to CSS variables
 */
function getThemeCssVariables(theme: ThemeConfig): React.CSSProperties {
  const borderRadiusMap: Record<string, string> = {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  };

  return {
    '--color-primary': theme.colors.primary,
    '--color-primary-dark': theme.colors.primaryDark,
    '--color-primary-light': theme.colors.primaryLight,
    '--color-accent': theme.colors.accent,
    '--color-accent-hover': theme.colors.accentHover,
    '--color-accent-muted': theme.colors.accentMuted,
    '--color-accent-light': theme.colors.accentLight,
    '--color-background': theme.colors.background,
    '--color-background-alt': theme.colors.backgroundAlt,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--font-heading': theme.fonts.heading,
    '--font-body': theme.fonts.body,
    '--border-radius': borderRadiusMap[theme.borderRadius] || '0.5rem',
  } as React.CSSProperties;
}

/**
 * Renders a single section from config
 */
function SectionRenderer({
  section,
  business,
  basePath,
  isEditing,
  onSectionClick,
}: {
  section: SectionConfig;
  business: Business;
  basePath: string;
  isEditing?: boolean;
  onSectionClick?: (sectionId: string) => void;
}) {
  const Component = getSection(section.type);

  // If no dedicated component exists, use GenericSection as fallback
  // This allows AI-created section types to render with reasonable defaults
  const RenderComponent = Component || GenericSection;

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing && onSectionClick) {
      e.preventDefault();
      onSectionClick(section.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={
        isEditing
          ? 'relative cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all'
          : ''
      }
    >
      {isEditing && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          {section.type}
        </div>
      )}
      <RenderComponent
        config={section}
        business={business}
        basePath={basePath}
        isEditing={isEditing}
      />
    </div>
  );
}

/**
 * Main PageRenderer component
 *
 * Renders all enabled sections in order with theme applied.
 */
export function PageRenderer({
  page,
  theme,
  business,
  basePath,
  isEditing = false,
  onSectionClick,
}: PageRendererProps) {
  // Filter to only enabled sections
  const enabledSections = useMemo(
    () => page.sections.filter((section) => section.enabled),
    [page.sections]
  );

  // Generate CSS variables from theme
  const cssVariables = useMemo(() => getThemeCssVariables(theme), [theme]);

  return (
    <div
      className="min-h-screen"
      style={{
        ...cssVariables,
        fontFamily: 'var(--font-body)',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      {enabledSections.length === 0 ? (
        // Empty state for edit mode
        isEditing ? (
          <div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No sections yet
              </h3>
              <p className="text-gray-500">
                Add your first section to start building this page.
              </p>
            </div>
          </div>
        ) : null
      ) : (
        // Render all enabled sections
        enabledSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            business={business}
            basePath={basePath}
            isEditing={isEditing}
            onSectionClick={onSectionClick}
          />
        ))
      )}
    </div>
  );
}

export default PageRenderer;
