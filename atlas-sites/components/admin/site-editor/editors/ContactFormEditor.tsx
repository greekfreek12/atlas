'use client';

import { SectionConfig } from '@/lib/site-config/types';
import { FormField } from '../FormField';
import { Plus, Trash2 } from 'lucide-react';

interface ContactFormEditorProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface EditorContent {
  headline?: string;
  subheadline?: string;
  submitText?: string;
  successMessage?: string;
  fields?: FormFieldConfig[];
  showContactInfo?: boolean;
  showMap?: boolean;
}

interface EditorStyles {
  layout?: 'simple' | 'split' | 'sidebar';
  background?: 'white' | 'muted' | 'dark';
}

export function ContactFormEditor({ section, onUpdate }: ContactFormEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (section as any).content as EditorContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = ((section as any).styles || {}) as EditorStyles;

  const fields = content.fields || [
    { id: 'name', name: 'name', label: 'Name', type: 'text' as const, required: true },
    { id: 'email', name: 'email', label: 'Email', type: 'email' as const, required: true },
    { id: 'phone', name: 'phone', label: 'Phone', type: 'phone' as const, required: false },
    { id: 'message', name: 'message', label: 'Message', type: 'textarea' as const, required: true },
  ];

  const updateContent = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ content: { ...content, [key]: value } } as any);
  };

  const updateStyles = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ styles: { ...styles, [key]: value } } as any);
  };

  const updateField = (index: number, updates: Partial<FormFieldConfig>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    updateContent('fields', newFields);
  };

  const addField = () => {
    const newFields = [
      ...fields,
      {
        id: `field-${Date.now()}`,
        name: `field_${fields.length + 1}`,
        label: 'New Field',
        type: 'text' as const,
        required: false,
      },
    ];
    updateContent('fields', newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    updateContent('fields', newFields);
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
              placeholder="Contact Us"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Subheadline">
            <input
              type="text"
              value={content.subheadline || ''}
              onChange={(e) => updateContent('subheadline', e.target.value)}
              placeholder="Get in touch with us today"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>

      {/* Form Fields */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium text-sm">Form Fields</h4>
          <button
            onClick={addField}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Field
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
            >
              <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  className="bg-zinc-700 border border-zinc-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, { type: e.target.value as FormFieldConfig['type'] })
                  }
                  className="bg-zinc-700 border border-zinc-600 rounded-md px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Dropdown</option>
                </select>

                <label className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                    className="w-3 h-3 rounded bg-zinc-700 border-zinc-600 text-blue-600"
                  />
                  Required
                </label>

                <button
                  onClick={() => removeField(index)}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Settings */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Form Settings</h4>
        <div className="space-y-4">
          <FormField label="Submit Button Text">
            <input
              type="text"
              value={content.submitText || ''}
              onChange={(e) => updateContent('submitText', e.target.value)}
              placeholder="Send Message"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Success Message">
            <textarea
              value={content.successMessage || ''}
              onChange={(e) => updateContent('successMessage', e.target.value)}
              placeholder="Thank you! We'll be in touch soon."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </FormField>
        </div>
      </div>

      {/* Options */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Options</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.showContactInfo !== false}
              onChange={(e) => updateContent('showContactInfo', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white text-sm">Show contact info (phone, email, address)</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.showMap || false}
              onChange={(e) => updateContent('showMap', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white text-sm">Show map</span>
          </label>
        </div>
      </div>

      {/* Styles */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Styles</h4>
        <div className="space-y-4">
          <FormField label="Layout">
            <select
              value={styles.layout || 'simple'}
              onChange={(e) => updateStyles('layout', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple (Form Only)</option>
              <option value="split">Split (Form + Info)</option>
              <option value="sidebar">Sidebar Layout</option>
            </select>
          </FormField>

          <FormField label="Background">
            <select
              value={styles.background || 'white'}
              onChange={(e) => updateStyles('background', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="white">White</option>
              <option value="muted">Muted</option>
              <option value="dark">Dark</option>
            </select>
          </FormField>
        </div>
      </div>
    </div>
  );
}
