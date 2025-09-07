"use client";

import React, { useEffect, useRef } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'
import Sidebar from './_components/Sidebar'
import DashboardHeader from './_components/DashboardHeader'
import { LoadingSpinner } from '@/components/ui/loading'

function DashboardLayout({ children }) {
    const { userProfile, loading: supabaseLoading, user, refreshUserProfile } = useSupabase();
    const router = useRouter();
    const eventListenersSet = useRef(false);
    const initialLoadComplete = useRef(false);
    const sessionChecked = useRef(false);
    const statusCheckInterval = useRef(null);
    const redirectingRef = useRef(false);

    // Clear all caches when user is suspended or not approved
    const clearAllCaches = () => {
        if (typeof window !== 'undefined') {
            // Clear dashboard session
            sessionStorage.removeItem('dashboard_loaded');
            // Clear profile cache
            localStorage.removeItem('profile_cache_v1');
            // Clear any other potential caches
            sessionStorage.clear();
            // Reset the initial load flag
            initialLoadComplete.current = false;
        }
    };

    // Authentication guard - redirect unauthorized users (only once)
    useEffect(() => {
        if (!supabaseLoading && !user) {
            clearAllCaches();
            redirectingRef.current = true;
            router.replace('/'); // Use replace to avoid back button issues
            return;
        }

        // Check if user has profile and redirect admin users
        if (!supabaseLoading && user && userProfile) {
            // Admin users should not access regular dashboard
            if (userProfile.role === 'admin') {
                clearAllCaches();
                redirectingRef.current = true;
                router.replace('/admin');
                return;
            }

            // Suspended users should see suspension notice - CLEAR ALL CACHES
            if (userProfile.isSuspended) {
                clearAllCaches();
                redirectingRef.current = true;
                router.replace('/auth/waiting-approval');
                return;
            }

            // Allow access if not suspended (unsuspension implies restored access)
        }
    }, [user, userProfile, supabaseLoading, router]);

    // Continuous status monitoring for real-time suspension detection
    useEffect(() => {
        if (!user || supabaseLoading) return;

        let isMounted = true;

        const checkUserStatus = async () => {
            if (!isMounted) return;

            try {
                // Use centralized refresh method instead of direct API call
                const { data: currentUser, error } = await refreshUserProfile();

                if (!error && currentUser && isMounted) {
                    // Check if user status requires blocking access
                    if (currentUser.isSuspended) {
                        clearAllCaches();
                        redirectingRef.current = true;
                        router.replace('/auth/waiting-approval');
                        return;
                    }

                    // If user is now admin, redirect to admin panel and CLEAR CACHES
                    if (currentUser.role === 'admin') {
                        clearAllCaches();
                        redirectingRef.current = true;
                        router.replace('/admin');
                        return;
                    }
                } else if (!currentUser && isMounted) {
                    // User profile not found, redirect to login and CLEAR CACHES
                    clearAllCaches();
                    redirectingRef.current = true;
                    router.replace('/');
                    return;
                }
            } catch (error) {
                // Silent error handling - don't interrupt user experience
                console.warn('Status check failed:', error);
            }
        };

        // Initial check
        checkUserStatus();

        // Set up interval for continuous monitoring (every 5 seconds)
        statusCheckInterval.current = setInterval(checkUserStatus, 5000);

        return () => {
            isMounted = false;
            if (statusCheckInterval.current) {
                clearInterval(statusCheckInterval.current);
                statusCheckInterval.current = null;
            }
        };
    }, [user, supabaseLoading, router, refreshUserProfile]);

    // Check session storage only once on mount using useRef to prevent re-renders
    useEffect(() => {
        if (sessionChecked.current) return;

        if (typeof window !== 'undefined') {
            const sessionLoaded = sessionStorage.getItem('dashboard_loaded');
            if (sessionLoaded === 'true') {
                initialLoadComplete.current = true;
            }
        }
        sessionChecked.current = true;
    }, []);

    // Handle initial loading state - only once using refs
    useEffect(() => {
        if (!supabaseLoading && userProfile && !initialLoadComplete.current) {
            const timer = setTimeout(() => {
                initialLoadComplete.current = true;

                // Store in sessionStorage
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('dashboard_loaded', 'true');
                }
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [supabaseLoading, userProfile]); // Only runs when these values change

    // Only set up event listeners once to prevent re-renders
    useEffect(() => {
        if (eventListenersSet.current) return; // Prevent multiple setups

        // Set up a single event listener that doesn't cause re-renders
        const handleTabSwitch = () => {
            // No state updates needed - just maintain the loaded state
        };

        document.addEventListener('visibilitychange', handleTabSwitch);
        window.addEventListener('focus', handleTabSwitch);

        eventListenersSet.current = true;

        return () => {
            document.removeEventListener('visibilitychange', handleTabSwitch);
            window.removeEventListener('focus', handleTabSwitch);
            eventListenersSet.current = false;
        };
    }, []); // Empty dependency array - only runs once

    // Memoize the dashboard content to prevent unnecessary re-renders
    const dashboardContent = React.useMemo(() => {
        if (!user || !userProfile || userProfile.role === 'admin') return null;
        if (userProfile.isSuspended) return null;

        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
                <div className='md:w-72 hidden md:block fixed h-full z-10'>
                    <Sidebar />
                </div>
                <div className='md:ml-72'>
                    <DashboardHeader />
                    <div className='p-6 lg:p-10'>
                        {children}
                    </div>
                </div>
            </div>
        );
    }, [user, userProfile, children]); // Only re-render if user, userProfile or children change

    // If we're actively redirecting, use a full-screen loader
    if (redirectingRef.current) {
        return (
            <LoadingSpinner
                text="Redirecting..."
                subtitle="Taking you to the right place"
                variant="default"
            />
        );
    }

    // Always render the shell (Sidebar + Header) quickly; gate only the main content
    const isContentReady = !supabaseLoading && !!user && !!userProfile && !userProfile.isSuspended && initialLoadComplete.current;

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
            <div className='md:w-72 hidden md:block fixed h-full z-10'>
                <Sidebar />
            </div>
            <div className='md:ml-72'>
                <DashboardHeader />
                <div className='p-6 lg:p-10'>
                    {isContentReady ? (
                        children
                    ) : (
                        <LoadingSpinner
                            text="Loading Dashboard"
                            subtitle="Setting up your personalized workspace..."
                            variant="default"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout