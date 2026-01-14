'use client';

import { ThemeConfig } from '@/lib/site-config/types';
import { FormField } from './FormField';

interface ThemeEditorProps {
  theme: ThemeConfig;
  onThemeUpdate: (updates: Partial<ThemeConfig>) => void;
}

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
];

const colorPresets = [
  { name: 'Blue', primary: '#2563eb', accent: '#3b82f6' },
  { name: 'Green', primary: '#16a34a', accent: '#22c55e' },
  { name: 'Orange', primary: '#ea580c', accent: '#f97316' },
  { name: 'Purple', primary: '#7c3aed', accent: '#8b5cf6' },
  { name: 'Red', primary: '#dc2626', accent: '#ef4444' },
  { name: 'Teal', primary: '#0d9488', accent: '#14b8a6' },
];

export function ThemeEditor({ theme, onThemeUpdate }: ThemeEditorProps) {
  const updateColors = (key: keyof ThemeConfig['colors'], value: string) => {
    onThemeUpdate({
      colors: { ...theme.colors, [key]: value },
    });
  };

  const updateFonts = (key: keyof ThemeConfig['fonts'], value: string) => {
    onThemeUpdate({
      fonts: { ...theme.fonts, [key]: value },
    });
  };

  const applyPreset = (preset: { primary: string; accent: string }) => {
    onThemeUpdate({
      colors: { ...theme.colors, primary: preset.primary, accent: preset.accent },
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Color Presets */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Color Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: preset.primary }}
              />
              <span className="text-zinc-300 text-xs">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Colors</h4>
        <div className="space-y-4">
          <FormField label="Primary Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.colors.primary}
                onChange={(e) => updateColors('primary', e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.colors.primary}
                onChange={(e) => updateColors('primary', e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>

          <FormField label="Accent Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.colors.accent}
                onChange={(e) => updateColors('accent', e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.colors.accent}
                onChange={(e) => updateColors('accent', e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>

          <FormField label="Background Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.colors.background}
                onChange={(e) => updateColors('background', e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.colors.background}
                onChange={(e) => updateColors('background', e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>

          <FormField label="Text Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.colors.text}
                onChange={(e) => updateColors('text', e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.colors.text}
                onChange={(e) => updateColors('text', e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>

          <FormField label="Muted Text Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.colors.textMuted}
                onChange={(e) => updateColors('textMuted', e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.colors.textMuted}
                onChange={(e) => updateColors('textMuted', e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Typography</h4>
        <div className="space-y-4">
          <FormField label="Heading Font">
            <select
              value={theme.fonts.heading}
              onChange={(e) => updateFonts('heading', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Body Font">
            <select
              value={theme.fonts.body}
              onChange={(e) => updateFonts('body', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Border Radius</h4>
        <FormField label="Corner Style">
          <select
            value={theme.borderRadius}
            onChange={(e) =>
              onThemeUpdate({
                borderRadius: e.target.value as ThemeConfig['borderRadius'],
              })
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">Sharp (0px)</option>
            <option value="sm">Small (4px)</option>
            <option value="md">Medium (8px)</option>
            <option value="lg">Large (12px)</option>
            <option value="full">Full (9999px)</option>
          </select>
        </FormField>
      </div>

      {/* Preview */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Preview</h4>
        <div
          className="p-4 rounded-lg border border-zinc-700"
          style={{
            backgroundColor: theme.colors.background,
            fontFamily: theme.fonts.body,
          }}
        >
          <h3
            className="text-lg font-bold mb-2"
            style={{
              color: theme.colors.text,
              fontFamily: theme.fonts.heading,
            }}
          >
            Sample Heading
          </h3>
          <p
            className="text-sm mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            This is sample body text to show how your theme looks.
          </p>
          <button
            className="px-4 py-2 text-sm font-medium text-white"
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius:
                theme.borderRadius === 'none'
                  ? '0'
                  : theme.borderRadius === 'sm'
                  ? '4px'
                  : theme.borderRadius === 'md'
                  ? '8px'
                  : theme.borderRadius === 'lg'
                  ? '12px'
                  : '9999px',
            }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  );
}
