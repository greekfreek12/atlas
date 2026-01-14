'use client';

import { SectionConfig } from '@/lib/site-config/types';
import { FormField } from '../FormField';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface TrustBarEditorProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

interface TrustPoint {
  id: string;
  icon: string;
  text: string;
}

interface EditorContent {
  points?: TrustPoint[];
}

interface EditorStyles {
  variant?: 'horizontal' | 'grid';
  background?: 'transparent' | 'muted' | 'accent';
}

export function TrustBarEditor({ section, onUpdate }: TrustBarEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (section as any).content as EditorContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = ((section as any).styles || {}) as EditorStyles;

  const points = content.points || [];

  const updateContent = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ content: { ...content, [key]: value } } as any);
  };

  const updateStyles = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ styles: { ...styles, [key]: value } } as any);
  };

  const updatePoint = (index: number, updates: Partial<TrustPoint>) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], ...updates };
    updateContent('points', newPoints);
  };

  const addPoint = () => {
    const newPoints = [
      ...points,
      {
        id: `point-${Date.now()}`,
        icon: 'check',
        text: 'New trust point',
      },
    ];
    updateContent('points', newPoints);
  };

  const removePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    updateContent('points', newPoints);
  };

  const iconOptions = [
    { value: 'check', label: 'Check' },
    { value: 'shield', label: 'Shield' },
    { value: 'clock', label: 'Clock' },
    { value: 'star', label: 'Star' },
    { value: 'badge', label: 'Badge' },
    { value: 'phone', label: 'Phone' },
    { value: 'wrench', label: 'Wrench' },
    { value: 'home', label: 'Home' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Trust Points */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium text-sm">Trust Points</h4>
          <button
            onClick={addPoint}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Point
          </button>
        </div>

        <div className="space-y-3">
          {points.map((point, index) => (
            <div
              key={point.id}
              className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
            >
              <div className="flex items-start gap-2">
                <div className="text-zinc-500 mt-2">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <FormField label="Icon">
                      <select
                        value={point.icon}
                        onChange={(e) =>
                          updatePoint(index, { icon: e.target.value })
                        }
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <FormField label="Text">
                    <input
                      type="text"
                      value={point.text}
                      onChange={(e) =>
                        updatePoint(index, { text: e.target.value })
                      }
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                </div>
                <button
                  onClick={() => removePoint(index)}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {points.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-sm">
              No trust points yet. Click "Add Point" to add one.
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Styles</h4>
        <div className="space-y-4">
          <FormField label="Layout">
            <select
              value={styles.variant || 'horizontal'}
              onChange={(e) => updateStyles('variant', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="horizontal">Horizontal</option>
              <option value="grid">Grid</option>
            </select>
          </FormField>

          <FormField label="Background">
            <select
              value={styles.background || 'muted'}
              onChange={(e) => updateStyles('background', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="transparent">Transparent</option>
              <option value="muted">Muted</option>
              <option value="accent">Accent</option>
            </select>
          </FormField>
        </div>
      </div>
    </div>
  );
}
