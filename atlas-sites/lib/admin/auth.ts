import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'editor' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  profile: Profile;
}

/**
 * Create a Supabase client for server components
 */
async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user with their profile.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // Profile doesn't exist yet - might be a new user
    // Return user with default role
    return {
      id: user.id,
      email: user.email || '',
      profile: {
        id: user.id,
        email: user.email || '',
        full_name: null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  return {
    id: user.id,
    email: user.email || '',
    profile: profile as Profile,
  };
}

/**
 * Require authentication for a page.
 * Redirects to login if not authenticated.
 */
export async function requireAuth(): Promise<AdminUser> {
  const user = await getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return user;
}

/**
 * Require admin role for a page.
 * Redirects to login if not authenticated, or unauthorized if not admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (user.profile.role !== 'admin') {
    redirect('/admin/unauthorized');
  }

  return user;
}

/**
 * Require admin or editor role for a page.
 */
export async function requireEditor(): Promise<AdminUser> {
  const user = await getUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (user.profile.role !== 'admin' && user.profile.role !== 'editor') {
    redirect('/admin/unauthorized');
  }

  return user;
}

/**
 * Check if the current user has a specific role.
 */
export function hasRole(user: AdminUser, role: UserRole): boolean {
  return user.profile.role === role;
}

/**
 * Check if the current user is an admin.
 */
export function isAdmin(user: AdminUser): boolean {
  return user.profile.role === 'admin';
}

/**
 * Create a Supabase client for use in route handlers
 */
export async function createRouteHandlerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in route handlers
          }
        },
      },
    }
  );
}
