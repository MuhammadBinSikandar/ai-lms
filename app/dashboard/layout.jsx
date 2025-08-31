"use client";

import React, { useEffect, useRef } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'
import Sidebar from './_components/Sidebar'
import DashboardHeader from './_components/DashboardHeader'

function DashboardLayout({ children }) {
    const { userProfile, loading: supabaseLoading, user } = useSupabase();
    const router = useRouter();
    const eventListenersSet = useRef(false);
    const initialLoadComplete = useRef(false);
    const sessionChecked = useRef(false);

    // Authentication guard - redirect unauthorized users (only once)
    useEffect(() => {
        if (!supabaseLoading && !user) {
            // Clear dashboard session and redirect to homepage
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('dashboard_loaded');
            }
            router.replace('/'); // Use replace to avoid back button issues
            return;
        }

        // Check if user has profile and redirect admin users
        if (!supabaseLoading && user && userProfile) {
            // Admin users should not access regular dashboard
            if (userProfile.role === 'admin') {
                router.replace('/admin');
                return;
            }

            // Suspended users should see suspension notice
            if (userProfile.isSuspended) {
                router.replace('/auth/waiting-approval');
                return;
            }

            // Non-approved regular users should wait for approval
            if (!userProfile.isApproved) {
                router.replace('/auth/waiting-approval');
                return;
            }
        }
    }, [user, userProfile, supabaseLoading, router]);

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
        if (!userProfile.isApproved || userProfile.isSuspended) return null;

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

    // Show loader only on initial load - don't rely on supabaseLoading after initial load
    if (!initialLoadComplete.current && supabaseLoading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center'>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
                    <p className="text-gray-500">Setting up your personalized workspace...</p>
                </div>
            </div>
        );
    }

    return dashboardContent;
}

export default DashboardLayout