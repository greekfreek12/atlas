import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">
            Configure your Atlas admin settings
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="admin-content">
        <div className="max-w-2xl space-y-4">
          <Link
            href="/admin/settings/sms"
            className="block p-6 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] hover:bg-[var(--admin-surface-hover)] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-[var(--admin-text)]">SMS Settings</h2>
                <p className="text-sm text-[var(--admin-text-muted)]">
                  Manage phone numbers and message templates
                </p>
              </div>
              <svg className="w-5 h-5 text-[var(--admin-text-muted)] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
