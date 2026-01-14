'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface Session {
  id: string;
  session_id: string;
  visitor_id: string;
  business_id: string;
  started_at: string;
  ended_at: string | null;
  landing_page: string | null;
  referrer: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  page_views: number;
  total_clicks: number;
  total_actions: number;
  duration_seconds: number;
  business?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface TimelineEvent {
  id: string;
  event_type: string;
  page_path: string | null;
  duration_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  offset_seconds: number;
}

type SortField = 'started_at' | 'duration_seconds' | 'page_views' | 'total_clicks' | 'total_actions';
type SortDir = 'asc' | 'desc';
type DetailTab = 'timeline' | 'pages' | 'clicks';

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<DetailTab>('timeline');

  // Filters
  const [filterBusiness, setFilterBusiness] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [filterHasAction, setFilterHasAction] = useState(false);
  const [showAdminVisits, setShowAdminVisits] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('started_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Business view mode
  const [businessView, setBusinessView] = useState<string | null>(null);

  // Portal mounting
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSessions = async (includeDays: number, includeAdmin: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: includeDays.toString(),
        limit: '200',
        ...(includeAdmin && { includeAdmin: 'true' }),
      });
      const res = await fetch(`/admin/api/analytics/sessions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique businesses for filter dropdown
  const businesses = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach(s => {
      if (s.business?.id && s.business?.name) {
        map.set(s.business.id, s.business.name);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [sessions]);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Business filter
    if (filterBusiness !== 'all') {
      filtered = filtered.filter(s => s.business_id === filterBusiness);
    }

    // Business view mode (from clicking business name)
    if (businessView) {
      filtered = filtered.filter(s => s.business_id === businessView);
    }

    // Device filter
    if (filterDevice !== 'all') {
      filtered = filtered.filter(s => s.device_type === filterDevice);
    }

    // Has action filter
    if (filterHasAction) {
      filtered = filtered.filter(s => s.total_clicks > 0);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (sortDir === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [sessions, filterBusiness, filterDevice, filterHasAction, sortField, sortDir, businessView]);

  // Business stats when in business view
  const businessStats = useMemo(() => {
    if (!businessView) return null;
    const bSessions = sessions.filter(s => s.business_id === businessView);
    const uniqueVisitors = new Set(bSessions.map(s => s.visitor_id)).size;
    const totalViews = bSessions.reduce((sum, s) => sum + s.page_views, 0);
    const totalClicks = bSessions.reduce((sum, s) => sum + s.total_clicks, 0);
    const totalActions = bSessions.reduce((sum, s) => sum + (s.total_actions || 0), 0);
    const avgDuration = bSessions.length > 0
      ? Math.round(bSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / bSessions.length)
      : 0;
    const conversionRate = bSessions.length > 0
      ? Math.round((bSessions.filter(s => (s.total_actions || 0) > 0).length / bSessions.length) * 100)
      : 0;

    return {
      sessions: bSessions.length,
      uniqueVisitors,
      totalViews,
      totalClicks,
      totalActions,
      avgDuration,
      conversionRate,
      businessName: bSessions[0]?.business?.name || 'Unknown',
    };
  }, [sessions, businessView]);

  const openSession = async (session: Session) => {
    setSelectedSession(session);
    setDrawerOpen(true);
    setActiveTab('timeline');
    try {
      const res = await fetch(`/admin/api/analytics/sessions/${session.session_id}`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedSession(null);
      setTimeline([]);
    }, 300);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleBusinessClick = (businessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBusinessView(businessId);
    setFilterBusiness('all'); // Reset filter when entering business view
  };

  const exitBusinessView = () => {
    setBusinessView(null);
  };

  // Fetch sessions when days or showAdminVisits changes
  useEffect(() => {
    fetchSessions(days, showAdminVisits);
  }, [days, showAdminVisits]);

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds < 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format page path to human-readable name
  const formatPagePath = (path: string | null): string => {
    if (!path || path === '/') return 'Homepage';

    // Remove leading slash and split by /
    const parts = path.replace(/^\//, '').split('/');

    // If it's just the business slug (e.g., /clean-ron-s-plumbing-powell), it's the homepage
    if (parts.length === 1) return 'Homepage';

    // If it's a service page (e.g., /clean-xxx/services/drain-cleaning)
    if (parts.length >= 3 && parts[1] === 'services') {
      // Convert slug to title case: drain-cleaning -> Drain Cleaning
      const serviceName = parts[2]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return serviceName;
    }

    // For other pages, just get the last part and format it
    const lastPart = parts[parts.length - 1];
    return lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDeviceIcon = (device: string | null) => {
    if (device === 'mobile') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    );
  };

  // Page breakdown from timeline - track all pages visited with duration and scroll
  const pageBreakdown = useMemo(() => {
    const pages = new Map<string, { totalMs: number; maxScroll: number; visits: number }>();

    // Build page visit pairs (view -> exit) to calculate duration
    const pageVisits: Array<{ path: string; viewTime: number; exitTime?: number; duration?: number; scroll?: number }> = [];

    timeline.forEach((event, idx) => {
      const path = event.page_path;
      if (!path) return;

      if (event.event_type === 'page_view') {
        pageVisits.push({
          path,
          viewTime: event.offset_seconds,
        });
      } else if (event.event_type === 'page_exit') {
        // Find the most recent page_view for this path
        for (let i = pageVisits.length - 1; i >= 0; i--) {
          if (pageVisits[i].path === path && !pageVisits[i].exitTime) {
            pageVisits[i].exitTime = event.offset_seconds;
            pageVisits[i].duration = event.duration_ms || 0;
            pageVisits[i].scroll = (event.metadata as any)?.scrollDepth || 0;
            break;
          }
        }
      }
    });

    // If a page view has no exit, estimate duration from next event or use 0
    pageVisits.forEach((visit, idx) => {
      if (!visit.exitTime && idx < pageVisits.length - 1) {
        // Estimate: time until next page view
        visit.duration = (pageVisits[idx + 1].viewTime - visit.viewTime) * 1000;
      } else if (!visit.exitTime) {
        // Last page, still open - use 0 or could use current time
        visit.duration = 0;
      }

      // Aggregate by path
      const existing = pages.get(visit.path) || { totalMs: 0, maxScroll: 0, visits: 0 };
      pages.set(visit.path, {
        totalMs: existing.totalMs + (visit.duration || 0),
        maxScroll: Math.max(existing.maxScroll, visit.scroll || 0),
        visits: existing.visits + 1,
      });
    });

    return Array.from(pages.entries())
      .map(([path, data]) => ({
        path,
        seconds: Math.round(data.totalMs / 1000),
        scrollDepth: data.maxScroll,
        visits: data.visits,
      }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [timeline]);

  // All click events from timeline
  const clicks = useMemo(() => {
    return timeline.filter(e =>
      ['button_click', 'link_click', 'phone_click', 'email_click', 'form_start', 'form_submit', 'cta_click', 'service_click'].includes(e.event_type)
    );
  }, [timeline]);

  const maxPageTime = Math.max(...pageBreakdown.map(p => p.seconds), 1);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-600 ml-1">↕</span>;
    return <span className="text-blue-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .analytics-table { font-family: 'Inter', -apple-system, sans-serif; }
        .analytics-mono { font-family: 'JetBrains Mono', monospace; }
        .analytics-drawer { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .analytics-drawer-open { transform: translateX(0); }
        .analytics-drawer-closed { transform: translateX(100%); }
        .analytics-row { transition: background-color 0.15s ease; }
        .analytics-row:hover { background-color: rgba(255, 255, 255, 0.03); }
      `}</style>

      <div className="h-full flex flex-col analytics-table">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              {businessView && businessStats ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={exitBusinessView}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-lg font-semibold text-white">{businessStats.businessName}</h1>
                    <p className="text-sm text-slate-500">{businessStats.sessions} sessions</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-lg font-semibold text-white tracking-tight">Sessions</h1>
                  <p className="text-sm text-slate-500">{filteredSessions.length} sessions</p>
                </div>
              )}
            </div>

            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent border border-white/10 rounded px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-white/20"
            >
              <option value={1} className="bg-slate-900">24h</option>
              <option value={7} className="bg-slate-900">7d</option>
              <option value={14} className="bg-slate-900">14d</option>
              <option value={30} className="bg-slate-900">30d</option>
            </select>
          </div>

          {/* Business Stats Bar */}
          {businessView && businessStats && (
            <div className="flex items-center gap-6 mb-4 p-3 bg-white/[0.02] rounded-lg border border-white/5">
              <div>
                <div className="text-xs text-slate-500">Visitors</div>
                <div className="text-base font-semibold text-white analytics-mono">{businessStats.uniqueVisitors}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Pages</div>
                <div className="text-base font-semibold text-white analytics-mono">{businessStats.totalViews}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Clicks</div>
                <div className="text-base font-semibold text-white analytics-mono">{businessStats.totalClicks}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Actions</div>
                <div className="text-base font-semibold text-green-400 analytics-mono">{businessStats.totalActions}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Avg Time</div>
                <div className="text-base font-semibold text-white analytics-mono">{formatDuration(businessStats.avgDuration)}</div>
              </div>
            </div>
          )}

          {/* Filters */}
          {!businessView && (
            <div className="flex items-center gap-3">
              <select
                value={filterBusiness}
                onChange={(e) => setFilterBusiness(e.target.value)}
                className="bg-transparent border border-white/10 rounded px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-white/20"
              >
                <option value="all" className="bg-slate-900">All businesses</option>
                {businesses.map(([id, name]) => (
                  <option key={id} value={id} className="bg-slate-900">{name}</option>
                ))}
              </select>

              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="bg-transparent border border-white/10 rounded px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-white/20"
              >
                <option value="all" className="bg-slate-900">All devices</option>
                <option value="desktop" className="bg-slate-900">Desktop</option>
                <option value="mobile" className="bg-slate-900">Mobile</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterHasAction}
                  onChange={(e) => setFilterHasAction(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500"
                />
                Has action
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAdminVisits}
                  onChange={(e) => setShowAdminVisits(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500"
                />
                Show admin
              </label>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <p className="text-sm">No sessions found</p>
              <p className="text-xs text-slate-600 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {!businessView && (
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Business
                    </th>
                  )}
                  <th className={`text-left py-3 text-xs font-medium text-slate-500 uppercase tracking-wider ${businessView ? 'px-6' : 'px-4'}`}>
                    First Page
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                    Device
                  </th>
                  <th
                    className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20 cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('page_views')}
                  >
                    Pages<SortIcon field="page_views" />
                  </th>
                  <th
                    className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20 cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('total_clicks')}
                  >
                    Clicks<SortIcon field="total_clicks" />
                  </th>
                  <th
                    className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20 cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('total_actions')}
                  >
                    Actions<SortIcon field="total_actions" />
                  </th>
                  <th
                    className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-24 cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('duration_seconds')}
                  >
                    Time<SortIcon field="duration_seconds" />
                  </th>
                  <th
                    className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-24 cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('started_at')}
                  >
                    When<SortIcon field="started_at" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => openSession(session)}
                    className="analytics-row cursor-pointer"
                  >
                    {!businessView && (
                      <td className="px-6 py-3">
                        <button
                          onClick={(e) => handleBusinessClick(session.business_id, e)}
                          className="text-sm text-white font-medium hover:text-blue-400 transition-colors text-left"
                        >
                          {session.business?.name || 'Unknown'}
                        </button>
                      </td>
                    )}
                    <td className={`py-3 ${businessView ? 'px-6' : 'px-4'}`}>
                      <span className="text-xs text-slate-400">
                        {formatPagePath(session.landing_page)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-slate-400 inline-flex justify-center">
                        {getDeviceIcon(session.device_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-slate-300 analytics-mono">{session.page_views}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm analytics-mono ${session.total_clicks > 0 ? 'text-white' : 'text-slate-500'}`}>
                        {session.total_clicks}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm analytics-mono ${(session.total_actions || 0) > 0 ? 'text-green-400 font-semibold' : 'text-slate-500'}`}>
                        {session.total_actions || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-slate-300 analytics-mono">
                        {formatDuration(session.duration_seconds)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm text-slate-500">{formatTime(session.started_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Backdrop and Drawer via Portal */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          {drawerOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-[9998]"
              onClick={closeDrawer}
            />
          )}

          {/* Slide-out Drawer */}
          {(drawerOpen || selectedSession) && (
            <div
              className={`fixed top-0 right-0 h-screen w-[380px] z-[9999] analytics-drawer ${
                drawerOpen ? 'analytics-drawer-open' : 'analytics-drawer-closed pointer-events-none'
              }`}
              style={{ background: 'var(--admin-surface)', borderLeft: '1px solid var(--admin-border)' }}
            >
          {selectedSession && (
            <div className="h-full flex flex-col" style={{ background: 'var(--admin-surface)' }}>
              {/* Drawer Header - Compact */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ color: 'var(--admin-text-secondary)' }}>
                    {getDeviceIcon(selectedSession.device_type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                      {selectedSession.page_views} pages · {formatDuration(selectedSession.duration_seconds)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      {formatTime(selectedSession.started_at)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: 'var(--admin-text-secondary)' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--admin-surface-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs - Compact */}
              <div className="px-3 py-1.5 flex gap-1" style={{ borderBottom: '1px solid var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
                {(['timeline', 'pages', 'clicks'] as DetailTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 text-xs font-medium rounded transition-colors"
                    style={{
                      background: activeTab === tab ? 'var(--admin-surface-elevated)' : 'transparent',
                      color: activeTab === tab ? 'var(--admin-text)' : 'var(--admin-text-secondary)'
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'clicks' && clicks.length > 0 && (
                      <span className="ml-1.5 px-1 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded">
                        {clicks.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto px-3 py-2" style={{ background: 'var(--admin-surface)' }}>
                {timeline.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)' }} />
                  </div>
                ) : (
                  <>
                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                      <div className="space-y-0.5">
                        {timeline.map((event) => (
                          <div key={event.id} className="flex items-start gap-2 py-1.5">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0"
                              style={{
                                background: ['phone_click', 'email_click', 'form_submit'].includes(event.event_type) ? 'rgba(16, 185, 129, 0.15)' : 'var(--admin-surface-elevated)',
                                color: ['phone_click', 'email_click', 'form_submit'].includes(event.event_type) ? '#10b981' : 'var(--admin-text-secondary)'
                              }}
                            >
                              {event.event_type === 'page_view' && '→'}
                              {event.event_type === 'page_exit' && '✓'}
                              {event.event_type === 'phone_click' && '📞'}
                              {event.event_type === 'email_click' && '✉'}
                              {event.event_type === 'button_click' && '👆'}
                              {event.event_type === 'link_click' && '🔗'}
                              {event.event_type === 'form_start' && '✏'}
                              {event.event_type === 'form_submit' && '✅'}
                              {event.event_type === 'service_click' && '🔧'}
                              {event.event_type === 'cta_click' && '⭐'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-xs"
                                style={{
                                  color: ['phone_click', 'email_click', 'form_submit'].includes(event.event_type) ? '#10b981' : 'var(--admin-text)',
                                  fontWeight: ['phone_click', 'email_click', 'form_submit'].includes(event.event_type) ? 500 : 400
                                }}
                              >
                                {event.event_type === 'page_view' && `→ ${formatPagePath(event.page_path)}`}
                                {event.event_type === 'page_exit' && (() => {
                                  const duration = event.duration_ms ? formatDuration(Math.round(event.duration_ms / 1000)) : '0s';
                                  const scroll = (event.metadata as any)?.scrollDepth;
                                  return `Spent ${duration} on ${formatPagePath(event.page_path)}${scroll ? ` • ${scroll}% scroll` : ''}`;
                                })()}
                                {event.event_type === 'phone_click' && 'Clicked phone number'}
                                {event.event_type === 'email_click' && 'Clicked email'}
                                {event.event_type === 'button_click' && `Clicked "${(event.metadata as any)?.text || 'button'}"`}
                                {event.event_type === 'link_click' && `Clicked "${(event.metadata as any)?.text || 'link'}"`}
                                {event.event_type === 'form_start' && 'Started form'}
                                {event.event_type === 'form_submit' && 'Submitted form'}
                                {event.event_type === 'service_click' && `Viewed ${event.metadata?.serviceName || 'service'}`}
                                {event.event_type === 'cta_click' && `Clicked ${event.metadata?.ctaName || 'CTA'}`}
                              </div>
                              <div className="text-[10px] analytics-mono" style={{ color: 'var(--admin-text-muted)' }}>
                                +{formatDuration(event.offset_seconds)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pages Tab */}
                    {activeTab === 'pages' && (
                      <div className="space-y-2">
                        {pageBreakdown.length === 0 ? (
                          <div className="text-xs text-center py-6" style={{ color: 'var(--admin-text-muted)' }}>
                            No page timing data
                          </div>
                        ) : (
                          pageBreakdown.map((page) => (
                            <div key={page.path} className="pb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs truncate max-w-[60%]" style={{ color: 'var(--admin-text-secondary)' }}>
                                  {formatPagePath(page.path)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs analytics-mono" style={{ color: 'var(--admin-text)' }}>
                                    {formatDuration(page.seconds)}
                                  </span>
                                  {page.scrollDepth > 0 && (
                                    <span className="text-[10px] analytics-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--admin-surface-elevated)', color: 'var(--admin-text-secondary)' }}>
                                      {page.scrollDepth}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--admin-surface-elevated)' }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${(page.seconds / maxPageTime) * 100}%`, background: 'var(--admin-accent)' }}
                                />
                              </div>
                              {page.scrollDepth > 0 && (
                                <div className="mt-0.5 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--admin-surface-elevated)' }}>
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${page.scrollDepth}%`, background: '#10b981' }}
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Clicks Tab */}
                    {activeTab === 'clicks' && (
                      <div className="space-y-1">
                        {clicks.length === 0 ? (
                          <div className="text-xs text-center py-6" style={{ color: 'var(--admin-text-muted)' }}>
                            No clicks this session
                          </div>
                        ) : (
                          clicks.map((click) => {
                            const isAction = ['phone_click', 'email_click', 'form_submit'].includes(click.event_type);
                            return (
                              <div
                                key={click.id}
                                className="p-2 rounded text-xs"
                                style={{
                                  background: isAction ? 'rgba(16, 185, 129, 0.1)' : 'var(--admin-surface-elevated)',
                                  border: isAction ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--admin-border-subtle)'
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-sm">
                                    {click.event_type === 'phone_click' && '📞'}
                                    {click.event_type === 'email_click' && '✉'}
                                    {click.event_type === 'button_click' && '👆'}
                                    {click.event_type === 'link_click' && '🔗'}
                                    {click.event_type === 'form_start' && '✏'}
                                    {click.event_type === 'form_submit' && '✅'}
                                    {click.event_type === 'cta_click' && '⭐'}
                                    {click.event_type === 'service_click' && '🔧'}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div style={{ color: isAction ? '#10b981' : 'var(--admin-text)', fontWeight: isAction ? 500 : 400 }}>
                                      {click.event_type === 'phone_click' && 'Clicked phone number'}
                                      {click.event_type === 'email_click' && 'Clicked email'}
                                      {click.event_type === 'button_click' && `Clicked "${(click.metadata as any)?.text || 'button'}"`}
                                      {click.event_type === 'link_click' && `Clicked "${(click.metadata as any)?.text || 'link'}"`}
                                      {click.event_type === 'form_start' && 'Started form'}
                                      {click.event_type === 'form_submit' && 'Submitted form'}
                                      {click.event_type === 'cta_click' && `Clicked ${click.metadata?.ctaName || 'CTA'}`}
                                      {click.event_type === 'service_click' && `Viewed ${click.metadata?.serviceName || 'service'}`}
                                    </div>
                                    <div className="text-[10px] analytics-mono" style={{ color: 'var(--admin-text-muted)' }}>
                                      +{formatDuration(click.offset_seconds)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="px-3 py-2 text-xs analytics-mono" style={{ borderTop: '1px solid var(--admin-border-subtle)', color: 'var(--admin-text-muted)', background: 'var(--admin-surface)' }}>
                {selectedSession.visitor_id.slice(0, 20)}...
              </div>
            </div>
          )}
        </div>
          )}
        </>,
        document.body
      )}
    </>
  );
}
