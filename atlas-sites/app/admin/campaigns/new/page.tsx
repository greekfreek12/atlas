'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Available template variables
const VARIABLES = [
  { name: '{name}', description: 'Contact or business name' },
  { name: '{first_name}', description: 'First name only' },
  { name: '{business_name}', description: 'Full business name' },
  { name: '{city}', description: 'Business city' },
  { name: '{state}', description: 'Business state' },
  { name: '{rating}', description: 'Google rating' },
  { name: '{reviews}', description: 'Review count' },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  // Target criteria
  const [targetStatus, setTargetStatus] = useState<string[]>(['new']);
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');

  const insertVariable = (variable: string) => {
    setMessage((prev) => prev + variable);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/admin/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          message_template: message,
          target_criteria: {
            status: targetStatus,
            min_score: minScore ? parseInt(minScore) : undefined,
            max_score: maxScore ? parseInt(maxScore) : undefined,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      const campaign = await response.json();
      router.push(`/admin/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'interested', label: 'Interested' },
    { value: 'demo', label: 'Demo' },
  ];

  return (
    <div>
      {/* Header */}
      <header className="admin-page-header">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/campaigns"
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-elevated)] transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--admin-text-secondary)]">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="admin-page-title">New Campaign</h1>
            <p className="admin-page-subtitle">
              Create a new SMS outreach campaign
            </p>
          </div>
        </div>
      </header>

      <div className="admin-content max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Campaign Name */}
          <div className="admin-card animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Campaign Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input"
                  placeholder="e.g., Initial Outreach - January"
                  required
                />
              </div>
            </div>
          </div>

          {/* Message Template */}
          <div className="admin-card animate-fade-in" style={{ animationDelay: '50ms' }}>
            <h2 className="text-lg font-semibold mb-4">Message Template</h2>
            <div className="space-y-4">
              {/* Variable buttons */}
              <div>
                <label className="admin-label">Insert Variables</label>
                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => insertVariable(v.name)}
                      className="px-3 py-1.5 text-xs font-mono bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-md hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] transition-colors"
                      title={v.description}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message textarea */}
              <div>
                <label className="admin-label">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="admin-input admin-textarea font-mono text-sm"
                  placeholder="Hi {first_name}, I noticed {business_name} in {city} has great reviews..."
                  rows={5}
                  required
                />
                <p className="text-xs text-[var(--admin-text-muted)] mt-2">
                  {message.length} characters
                  {message.length > 160 && (
                    <span className="text-yellow-500 ml-2">
                      (will be sent as {Math.ceil(message.length / 160)} messages)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Target Criteria */}
          <div className="admin-card animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold mb-4">Target Audience</h2>
            <div className="space-y-4">
              {/* Status filter */}
              <div>
                <label className="admin-label">Lead Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all
                        ${targetStatus.includes(option.value)
                          ? 'bg-[var(--admin-accent)]/10 border-[var(--admin-accent)] text-[var(--admin-accent)]'
                          : 'bg-[var(--admin-surface-elevated)] border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={targetStatus.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetStatus([...targetStatus, option.value]);
                          } else {
                            setTargetStatus(targetStatus.filter((s) => s !== option.value));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Score range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Minimum Score</label>
                  <input
                    type="number"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="admin-input"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="admin-label">Maximum Score</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="admin-input"
                    placeholder="100"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/campaigns"
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-btn admin-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
