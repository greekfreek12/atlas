'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPhoneNumber } from '@/lib/textgrid';

interface PhoneNumber {
  id: string;
  phone_number: string;
  state: string;
  area_code: string;
  friendly_name: string | null;
  is_active: boolean;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  body: string;
  is_default: boolean;
  created_at: string;
}

export default function SMSSettingsPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Phone number form
  const [newPhone, setNewPhone] = useState('');
  const [newState, setNewState] = useState('');
  const [newFriendlyName, setNewFriendlyName] = useState('');
  const [addingPhone, setAddingPhone] = useState(false);

  // Template form
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateBody, setNewTemplateBody] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/admin/api/sms/phone-numbers').then((r) => r.json()),
      fetch('/admin/api/sms/templates').then((r) => r.json()),
    ])
      .then(([phones, temps]) => {
        setPhoneNumbers(phones || []);
        setTemplates(temps || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddPhoneNumber = async () => {
    if (!newPhone || !newState) return;

    setAddingPhone(true);
    try {
      const response = await fetch('/admin/api/sms/phone-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: newPhone,
          state: newState,
          friendly_name: newFriendlyName || undefined,
        }),
      });

      if (response.ok) {
        const newNumber = await response.json();
        setPhoneNumbers([...phoneNumbers, newNumber]);
        setNewPhone('');
        setNewState('');
        setNewFriendlyName('');
      }
    } catch (error) {
      console.error('Failed to add phone number:', error);
    } finally {
      setAddingPhone(false);
    }
  };

  const handleTogglePhone = async (id: string, isActive: boolean) => {
    try {
      await fetch('/admin/api/sms/phone-numbers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      });

      setPhoneNumbers(
        phoneNumbers.map((p) =>
          p.id === id ? { ...p, is_active: !isActive } : p
        )
      );
    } catch (error) {
      console.error('Failed to toggle phone:', error);
    }
  };

  const handleDeletePhone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phone number?')) return;

    try {
      await fetch(`/admin/api/sms/phone-numbers?id=${id}`, {
        method: 'DELETE',
      });
      setPhoneNumbers(phoneNumbers.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete phone:', error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName || !newTemplateBody) return;

    setSavingTemplate(true);
    try {
      if (editingTemplate) {
        // Update existing
        const response = await fetch('/admin/api/sms/templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTemplate.id,
            name: newTemplateName,
            body: newTemplateBody,
          }),
        });

        if (response.ok) {
          const updated = await response.json();
          setTemplates(templates.map((t) => (t.id === updated.id ? updated : t)));
        }
      } else {
        // Create new
        const response = await fetch('/admin/api/sms/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newTemplateName,
            body: newTemplateBody,
          }),
        });

        if (response.ok) {
          const newTemplate = await response.json();
          setTemplates([...templates, newTemplate]);
        }
      }

      setNewTemplateName('');
      setNewTemplateBody('');
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateBody(template.body);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await fetch(`/admin/api/sms/templates?id=${id}`, {
        method: 'DELETE',
      });
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch('/admin/api/sms/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_default: true }),
      });

      setTemplates(
        templates.map((t) => ({
          ...t,
          is_default: t.id === id,
        }))
      );
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--admin-text-muted)]">
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings"
            className="p-2 hover:bg-[var(--admin-surface-hover)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="admin-page-title">SMS Settings</h1>
            <p className="admin-page-subtitle">
              Manage phone numbers and message templates
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="admin-content flex-1 overflow-y-auto">
        <div className="max-w-4xl space-y-8">
          {/* Phone Numbers Section */}
          <section className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Phone Numbers
            </h2>
            <p className="text-sm text-[var(--admin-text-muted)] mb-6">
              Add TextGrid phone numbers for each state. Messages will be sent from the number matching the lead&apos;s state.
            </p>

            {/* Add form */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Phone (+15125551234)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
              <input
                type="text"
                placeholder="State (TX)"
                value={newState}
                onChange={(e) => setNewState(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-20 px-3 py-2 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] uppercase"
              />
              <input
                type="text"
                placeholder="Label (optional)"
                value={newFriendlyName}
                onChange={(e) => setNewFriendlyName(e.target.value)}
                className="w-40 px-3 py-2 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
              <button
                onClick={handleAddPhoneNumber}
                disabled={addingPhone || !newPhone || !newState}
                className="px-4 py-2 text-sm font-medium bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent-hover)] transition-colors disabled:opacity-50"
              >
                {addingPhone ? 'Adding...' : 'Add'}
              </button>
            </div>

            {/* Phone list */}
            {phoneNumbers.length > 0 ? (
              <div className="space-y-2">
                {phoneNumbers.map((phone) => (
                  <div
                    key={phone.id}
                    className="flex items-center justify-between p-3 bg-[var(--admin-surface-elevated)] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-lg bg-[var(--admin-accent)]/10 flex items-center justify-center text-[var(--admin-accent)] font-bold text-sm">
                        {phone.state}
                      </span>
                      <div>
                        <p className="font-medium text-[var(--admin-text)]">
                          {formatPhoneNumber(phone.phone_number)}
                        </p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          {phone.friendly_name || `Area code ${phone.area_code}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePhone(phone.id, phone.is_active)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          phone.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {phone.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleDeletePhone(phone.id)}
                        className="p-2 text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--admin-text-muted)] text-center py-8">
                No phone numbers configured. Add one above to start sending SMS.
              </p>
            )}
          </section>

          {/* Templates Section */}
          <section className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Message Templates
            </h2>
            <p className="text-sm text-[var(--admin-text-muted)] mb-6">
              Create reusable message templates. Use variables like {'{business_name}'}, {'{first_name}'}, {'{city}'}, {'{site_url}'}.
            </p>

            {/* Template form */}
            <div className="space-y-3 mb-6 p-4 bg-[var(--admin-surface-elevated)] rounded-lg">
              <input
                type="text"
                placeholder="Template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
              <textarea
                placeholder="Template message..."
                value={newTemplateBody}
                onChange={(e) => setNewTemplateBody(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {['{business_name}', '{first_name}', '{city}', '{state}', '{site_url}'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setNewTemplateBody((prev) => prev + ' ' + v)}
                      className="px-2 py-1 text-xs bg-[var(--admin-bg)] text-[var(--admin-text-muted)] rounded hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)] transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {editingTemplate && (
                    <button
                      onClick={() => {
                        setEditingTemplate(null);
                        setNewTemplateName('');
                        setNewTemplateBody('');
                      }}
                      className="px-3 py-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate || !newTemplateName || !newTemplateBody}
                    className="px-4 py-1.5 text-sm font-medium bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent-hover)] transition-colors disabled:opacity-50"
                  >
                    {savingTemplate ? 'Saving...' : editingTemplate ? 'Update' : 'Add Template'}
                  </button>
                </div>
              </div>
            </div>

            {/* Templates list */}
            {templates.length > 0 ? (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 bg-[var(--admin-surface-elevated)] rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--admin-text)]">
                          {template.name}
                        </h3>
                        {template.is_default && (
                          <span className="px-2 py-0.5 text-xs bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!template.is_default && (
                          <button
                            onClick={() => handleSetDefault(template.id)}
                            className="px-2 py-1 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--admin-text-muted)]">
                      {template.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--admin-text-muted)] text-center py-8">
                No templates yet. Create one above.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
