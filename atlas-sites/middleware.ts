import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Domains that are NOT custom domains (our platform domains)
const PLATFORM_DOMAINS = [
  'localhost',
  'vercel.app',
  'github.dev',
  'app.github.dev',
  process.env.NEXT_PUBLIC_BASE_DOMAIN || 'atlas-sites.vercel.app',
];

function isPlatformDomain(hostname: string): boolean {
  return PLATFORM_DOMAINS.some(domain => hostname.includes(domain));
}

// Cache for domain -> slug lookups (in-memory, resets on deploy)
const domainCache = new Map<string, { slug: string; template: string } | null>();

async function getBusinessByDomain(domain: string): Promise<{ slug: string; template: string } | null> {
  // Check cache first
  if (domainCache.has(domain)) {
    return domainCache.get(domain) || null;
  }

  try {
    // Query Supabase for business with this custom domain
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/businesses?custom_domain=eq.${encodeURIComponent(domain)}&select=slug,template&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const business = data[0] || null;

    // Cache the result (null results cached too to avoid repeated lookups)
    domainCache.set(domain, business);

    return business;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ============================================
  // 1. CUSTOM DOMAIN ROUTING
  // ============================================
  // If this is a custom domain (not our platform), look up business and rewrite
  if (!isPlatformDomain(hostname)) {
    // Skip API routes and static files on custom domains
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }

    // Look up business by custom domain
    const business = await getBusinessByDomain(hostname);

    if (business) {
      // Rewrite to /{template}-{slug}/...
      const url = request.nextUrl.clone();
      const basePath = `/${business.template}-${business.slug}`;
      url.pathname = pathname === '/' ? basePath : `${basePath}${pathname}`;
      return NextResponse.rewrite(url);
    }

    // No business found for this domain - show 404
    return NextResponse.next();
  }

  // ============================================
  // 2. ADMIN AUTH (existing logic)
  // ============================================
  // Allow login page and API routes
  if (pathname === '/admin/login' || pathname.startsWith('/admin/api/')) {
    return NextResponse.next();
  }

  // Non-admin routes on platform domains pass through
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Protect admin routes with auth
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check for authenticated user
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no user or error, redirect to login
  if (error || !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    // All paths for custom domain detection (excluding static files)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
