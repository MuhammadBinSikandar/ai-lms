//app/supabase-provider.js
"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';

// Simple in-flight request coalescing so multiple callers share the same GET
let inflightProfilePromise = null;

const PROFILE_CACHE_KEY = 'profile_cache_v1';
const PROFILE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const FRESH_CACHE_THRESHOLD = 30 * 1000; // 30 seconds for super fresh data

function readCachedEntry(userId) {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.userId !== userId) return null;
    if (Date.now() - (parsed.updatedAt || 0) > PROFILE_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedProfile(userId, profile, etag) {
  try {
    if (typeof window === 'undefined') return;
    const payload = { userId, profile, etag: etag || null, updatedAt: Date.now() };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(payload));
    // Broadcast to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('profile-cache');
      bc.postMessage({ type: 'profile-updated', payload });
      bc.close();
    }
  } catch { }
}
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const SupabaseContext = createContext({});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const router = useRouter();
  // Create a stable Supabase client instance to avoid re-subscribing & re-fetching on each render
  const supabase = useMemo(() => createClient(), []);

  // Internal guards to prevent duplicate /api/auth/user calls
  const hasFetchedProfileRef = useRef(false);
  const fetchingProfileRef = useRef(false);

  const fetchProfileOnce = useCallback(async (userId) => {
    // Don't fetch if already fetching, no user exists, or we already have fresh data
    if (fetchingProfileRef.current || !userId || userProfile?.id) {
      return;
    }

    // Check cache first and return early if fresh
    const cached = readCachedEntry(userId);
    if (cached?.profile && Date.now() - (cached.updatedAt || 0) < FRESH_CACHE_THRESHOLD) { // 30 second fresh cache
      setUserProfile(cached.profile);
      return;
    }

    fetchingProfileRef.current = true;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (cached?.etag) {
        headers['If-None-Match'] = cached.etag;
      }

      // Use singleton pattern for in-flight requests
      if (!inflightProfilePromise) {
        inflightProfilePromise = fetch('/api/auth/user', { method: 'GET', headers });
        inflightProfilePromise.finally(() => {
          setTimeout(() => { inflightProfilePromise = null; }, 100);
        });
      }

      const response = await inflightProfilePromise;

      if (response.status === 304 && cached?.profile) {
        setUserProfile(cached.profile);
        // Update cache timestamp to prevent immediate refetch
        writeCachedProfile(userId, cached.profile, cached.etag);
      } else if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        const etag = response.headers.get('etag');
        writeCachedProfile(userId, data.user, etag);
      } else if (response.status === 404) {
        setUserProfile(null);
      } else if (response.status === 401) {
        // Auth error - clear everything and don't retry
        setUser(null);
        setUserProfile(null);
        hasFetchedProfileRef.current = false;
      } else if (response.status === 429) {
        // Rate limited - use cached data if available, don't retry immediately
        if (cached?.profile) {
          setUserProfile(cached.profile);
        }
      }
    } catch (error) {
      // Handle profile fetch errors gracefully
      setUserProfile(null);

      // If it's an auth error, clear the user state to prevent infinite retries
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setUser(null);
        hasFetchedProfileRef.current = false;
      }
    } finally {
      fetchingProfileRef.current = false;
    }
  }, [userProfile?.id]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!isMounted) return;

        // Handle auth errors gracefully
        if (error) {
          // If there's an invalid token or refresh token error, clear the session entirely
          if (error.message?.includes('does not exist') ||
            error.message?.includes('invalid') ||
            error.message?.includes('Invalid Refresh Token') ||
            error.message?.includes('Refresh Token Not Found')) {
            try {
              await supabase.auth.signOut({ scope: 'local' }); // Clear local session only
            } catch (signOutError) {
              // If sign out fails, just continue - we'll clear state anyway
              console.warn('Failed to sign out during token error cleanup:', signOutError);
            }
          }

          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setUser(user);

        // Only fetch profile if user exists and we don't have recent data
        if (user && !hasFetchedProfileRef.current && !userProfile?.id) {
          // Try cache first to avoid a network call
          const cached = readCachedEntry(user.id);
          if (cached?.profile && Date.now() - (cached.updatedAt || 0) < PROFILE_CACHE_TTL_MS) {
            setUserProfile(cached.profile);
            hasFetchedProfileRef.current = true;
          } else {
            hasFetchedProfileRef.current = true;
            await fetchProfileOnce(user.id);
          }
        } else if (!user) {
          // No user, clear profile and set not loading
          setUserProfile(null);
          hasFetchedProfileRef.current = false; // Reset flag when no user
        }
        setLoading(false);
      } catch (initError) {
        // Handle any initialization errors, including token refresh errors
        console.warn('Supabase initialization error:', initError);

        // Clear any invalid tokens if this is a token-related error
        if (initError.message?.includes('Invalid Refresh Token') ||
          initError.message?.includes('Refresh Token Not Found')) {
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (signOutError) {
            // Ignore sign out errors during error cleanup
          }
        }

        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          const newUser = session?.user ?? null;

          // Only update user state if it's actually different
          if (newUser?.id !== user?.id) {
            setUser(newUser);

            if (newUser) {
              // New user logged in, check cache first
              const cached = readCachedEntry(newUser.id);
              if (cached?.profile && Date.now() - (cached.updatedAt || 0) < PROFILE_CACHE_TTL_MS) {
                setUserProfile(cached.profile);
                setProfileLoaded(true);
                hasFetchedProfileRef.current = true;
              } else if (!profileLoaded && !userProfile?.id) {
                // Only fetch if we don't have profile data at all
                hasFetchedProfileRef.current = true;
                await fetchProfileOnce(newUser.id);
                setProfileLoaded(true);
              }
            } else {
              // User signed out, clear profile
              setUserProfile(null);
              setProfileLoaded(false);
              hasFetchedProfileRef.current = false;
            }
          }

          // Only set loading to false if it's currently true to prevent unnecessary re-renders
          if (loading) setLoading(false);
        } catch (authChangeError) {
          // Handle auth change errors, including token refresh errors
          console.warn('Auth state change error:', authChangeError);

          // Clear invalid tokens if this is a token-related error
          if (authChangeError.message?.includes('Invalid Refresh Token') ||
            authChangeError.message?.includes('Refresh Token Not Found')) {
            try {
              await supabase.auth.signOut({ scope: 'local' });
            } catch (signOutError) {
              // Ignore sign out errors during error cleanup
            }
            setUser(null);
            setUserProfile(null);
            setProfileLoaded(false);
            hasFetchedProfileRef.current = false;
          }

          if (loading) setLoading(false);
        }
      }
    );

    // Cross-tab sync for cache updates
    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('profile-cache');
      bc.onmessage = (event) => {
        if (event?.data?.type === 'profile-updated') {
          const payload = event.data.payload;
          if (payload?.userId && payload.userId === user?.id) {
            setUserProfile(payload.profile || null);
          }
        }
      };
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (bc) bc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // Realtime subscription for instant approval/suspension updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-status-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `supabase_id=eq.${user.id}` },
        (payload) => {
          const nextProfile = payload?.new || null;
          if (!nextProfile) return;

          setUserProfile(nextProfile);
          try {
            writeCachedProfile(user.id, nextProfile, null);
          } catch (_) { }

          // If suspended, immediately block access and route to waiting page (without logging out)
          if (nextProfile.isSuspended) {
            try {
              if (typeof window !== 'undefined') {
                sessionStorage.clear();
                localStorage.removeItem(PROFILE_CACHE_KEY);
              }
            } catch (_) { }
            router.replace('/auth/waiting-approval');
            return;
          }

          // If not suspended, route to appropriate destination instantly
          if (!nextProfile.isSuspended) {
            const role = (nextProfile.role || '').toLowerCase();
            const destination = role === 'admin'
              ? '/admin'
              : role === 'parent'
                ? '/dashboard/parent'
                : role === 'student'
                  ? '/dashboard/student'
                  : '/dashboard';
            router.replace(destination);
          }
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch (_) { }
    };
  }, [supabase, user?.id, router]);

  // Sanitize allowed profile fields client-side to match server whitelist
  const sanitizeProfileInput = (payload) => {
    const allowed = [
      'role', 'name', 'bio', 'location', 'website', 'linkedin_url', 'github_url',
      'phone', 'country', 'city', 'timezone', 'language', 'twitter_url',
      // Student fields
      'grade', 'school_name', 'date_of_birth', 'learning_goals', 'subjects_of_interest',
      'learning_style', 'difficulty_preference',
      // Parent fields
      'occupation', 'number_of_children', 'education_level', 'parenting_experience', 'children_age_range'
    ];
    const result = {};
    for (const key of allowed) {
      if (payload[key] == null) continue;
      let value = payload[key];
      if (typeof value === 'string') value = value.trim();
      // Minimal length limits for strings
      if (typeof value === 'string' && value.length > 1000) value = value.slice(0, 1000);
      result[key] = value;
    }
    if (typeof result.role === 'string') result.role = result.role.toLowerCase();
    return result;
  };

  const updateProfile = async (updates) => {
    if (!user) return { data: null, error: 'No user logged in' };

    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizeProfileInput(updates)),
      });

      const responseData = await response.json();

      if (response.ok || response.status === 202) {
        const updatedProfile = responseData.user || null;
        // Ensure we preserve the existing role if it's not being updated
        if (updatedProfile && userProfile && !updatedProfile.role && userProfile.role) {
          updatedProfile.role = userProfile.role;
        }
        setUserProfile(updatedProfile);
        // Update cache with new profile data
        if (user?.id && updatedProfile) {
          writeCachedProfile(user.id, updatedProfile, null);
        }
        return { data: updatedProfile, error: null };
      } else {
        return { data: null, error: responseData.error };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const createProfile = async (user, additionalData = {}) => {
    try {
      const profileData = {
        role: additionalData.role || 'student',
        ...additionalData
      };

      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizeProfileInput(profileData)),
      });

      const responseData = await response.json();

      if (response.ok || response.status === 202) {
        // Use optimistic user from 202 response when background processing is used
        const updatedProfile = responseData.user || null;
        setUserProfile(updatedProfile);
        // Update cache with new profile data
        if (user?.id && updatedProfile) {
          writeCachedProfile(user.id, updatedProfile, null);
        }
        return { data: updatedProfile, error: null };
      }
      return { data: null, error: responseData.error };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
  };

  // Method to refresh user profile (bypasses cache)
  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return { data: null, error: 'No user logged in' };

    try {
      // Clear cache to force fresh fetch
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PROFILE_CACHE_KEY);
      }

      // Reset fetch flags to allow new fetch
      hasFetchedProfileRef.current = false;
      fetchingProfileRef.current = false;

      // Force fetch with no cache and get fresh data
      const headers = { 'Content-Type': 'application/json' };
      const response = await fetch('/api/auth/user', { method: 'GET', headers });

      if (response.ok) {
        const data = await response.json();
        const freshProfile = data.user;
        setUserProfile(freshProfile);

        // Update cache with fresh data
        if (user?.id && freshProfile) {
          const etag = response.headers.get('etag');
          writeCachedProfile(user.id, freshProfile, etag);
        }

        return { data: freshProfile, error: null };
      } else if (response.status === 404) {
        setUserProfile(null);
        return { data: null, error: 'User profile not found' };
      } else if (response.status === 401) {
        setUser(null);
        setUserProfile(null);
        hasFetchedProfileRef.current = false;
        return { data: null, error: 'Unauthorized' };
      } else {
        return { data: null, error: 'Failed to fetch user profile' };
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return { data: null, error };
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const value = {
    user,
    userProfile,
    loading,
    supabase,
    refreshUserProfile,
    signOut: async () => {
      // Best-effort: revoke all refresh tokens (global sign out)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (_) {
        // Fallback: clear only local session if global fails
        try { await supabase.auth.signOut({ scope: 'local' }); } catch (_) { }
      }

      // Clear client-side caches and storage
      if (typeof window !== 'undefined') {
        try {
          // App-specific session flag
          sessionStorage.removeItem('dashboard_loaded');

          // Remove cached profile
          localStorage.removeItem(PROFILE_CACHE_KEY);

          // Remove any Supabase auth entries from localStorage
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          }

          // Best-effort cookie clearing for auth tokens (in case cookies are used)
          const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'supabase.auth.token'];
          cookiesToClear.forEach((name) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          });
        } catch (_) { }
      }

      // Reset in-memory state
      setUser(null);
      setUserProfile(null);
      setProfileLoaded(false);
      hasFetchedProfileRef.current = false;

      // Redirect to homepage (replace to avoid back button returning to authed views)
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    },
    updateProfile,
    createProfile,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}