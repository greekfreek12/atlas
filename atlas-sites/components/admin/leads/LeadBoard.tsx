'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LeadDetailDrawer from './LeadDetailDrawer';

interface Business {
  id: string;
  name: string;
  slug: string;
  site: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  google_reviews_link: string | null;
  logo: string | null;
  photo: string | null;
  logo_quality: string | null;
  photos_count: number | null;
  verified: boolean;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  youtube: string | null;
  working_hours: string | null;
}

interface Lead {
  id: string;
  business_id: string;
  status: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
  business: Business;
}

interface LeadBoardProps {
  initialLeads: Lead[];
  states: string[];
  currentPage: number;
  totalPages: number;
  totalLeads: number;
  pageSize: number;
}

export default function LeadBoard({
  initialLeads,
  states,
  currentPage,
  totalPages,
  totalLeads,
  pageSize,
}: LeadBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Client-side search filter (within current page)
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return initialLeads;

    return initialLeads.filter((lead) => {
      const b = lead.business;
      if (!b) return false;
      const query = searchQuery.toLowerCase();
      return (
        b.name?.toLowerCase().includes(query) ||
        b.city?.toLowerCase().includes(query) ||
        b.state?.toLowerCase().includes(query) ||
        lead.contact_phone?.includes(query)
      );
    });
  }, [initialLeads, searchQuery]);

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const handleAddToPipeline = async (leadIds: string[]) => {
    try {
      const response = await fetch('/admin/api/leads/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds, status: 'contacted' }),
      });

      if (response.ok) {
        router.refresh();
        setSelectedLeads(new Set());
        handleCloseDrawer();
      }
    } catch (error) {
      console.error('Failed to update leads:', error);
    }
  };

  const handleViewSite = (slug: string) => {
    window.open(`/clean-${slug}`, '_blank');
  };

  const handleOpenDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedLead(null);
  };

  const handleSkipLead = async (leadId: string) => {
    try {
      const response = await fetch('/admin/api/leads/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [leadId], status: 'lost' }),
      });
      if (response.ok) {
        router.refresh();
        handleCloseDrawer();
      }
    } catch (error) {
      console.error('Failed to skip lead:', error);
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/leads?${params.toString()}`);
  };

  // Calculate showing range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalLeads);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-4 p-4 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)]">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, city, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
          />
        </div>
        <span className="text-sm text-[var(--admin-text-muted)] font-mono">
          Showing {startItem}-{endItem} of {totalLeads}
        </span>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--admin-accent)]/10 rounded-lg border border-[var(--admin-accent)]/30">
          <span className="text-sm font-medium text-[var(--admin-accent)]">
            {selectedLeads.size} selected
          </span>
          <button
            onClick={() => handleAddToPipeline(Array.from(selectedLeads))}
            className="px-3 py-1.5 text-sm font-medium bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent-hover)] transition-colors"
          >
            Add to Pipeline
          </button>
          <button
            onClick={() => setSelectedLeads(new Set())}
            className="px-3 py-1.5 text-sm text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--admin-surface-elevated)] border-b border-[var(--admin-border)]">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Business
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Reviews
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border-subtle)]">
            {filteredLeads.map((lead) => {
              const b = lead.business;
              return (
                <tr
                  key={lead.id}
                  className="hover:bg-[var(--admin-surface-hover)] transition-colors cursor-pointer"
                  onClick={() => handleOpenDrawer(lead)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.logo ? (
                        <img
                          src={b.logo}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover bg-[var(--admin-surface-elevated)]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[var(--admin-surface-elevated)] flex items-center justify-center text-[var(--admin-text-muted)] text-xs font-bold">
                          {b.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--admin-text)]">{b.name}</p>
                          {b.verified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--admin-text-muted)]">{lead.contact_phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[var(--admin-text-secondary)]">
                      {b.city ? `${b.city}, ${b.state}` : b.state || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.google_rating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium text-[var(--admin-text)]">
                          {b.google_rating}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--admin-text-muted)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[var(--admin-text-secondary)]">
                      {b.google_reviews_count || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {b.site ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400">
                          Site
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-400">
                          No Site
                        </span>
                      )}
                      {b.facebook && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400">
                          FB
                        </span>
                      )}
                      {b.instagram && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-pink-500/10 text-pink-400">
                          IG
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewSite(b.slug)}
                        className="px-2 py-1 text-xs font-medium text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/10 rounded transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleAddToPipeline([lead.id])}
                        className="px-2 py-1 text-xs font-medium bg-[var(--admin-accent)] text-white rounded hover:bg-[var(--admin-accent-hover)] transition-colors"
                      >
                        + Pipeline
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--admin-text-muted)]">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No leads found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--admin-border)]">
          <p className="text-sm text-[var(--admin-text-muted)]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-[var(--admin-accent)] text-white'
                        : 'bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onAddToPipeline={(id) => handleAddToPipeline([id])}
        onSkip={handleSkipLead}
        onViewSite={handleViewSite}
      />
    </div>
  );
}
