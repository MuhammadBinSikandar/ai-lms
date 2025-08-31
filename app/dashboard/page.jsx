"use client";

import React, { useEffect } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function Dashboard() {
    const { loading, userProfile } = useSupabase();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if explicitly navigated to /dashboard
        // Don't interfere with profile updates on other dashboard pages
        if (!loading && userProfile && userProfile.role && window.location.pathname === '/dashboard') {
            const role = userProfile.role.toString().toUpperCase();
            if (role === 'PARENT') {
                router.replace('/dashboard/parent');
            } else if (role === 'STUDENT') {
                router.replace('/dashboard/student');
            } else {
                router.replace('/auth/signup');
            }
        }
    }, [loading, userProfile, router]);

    // Add a small delay to prevent dashboard mismatches
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <span className="text-gray-600 text-lg">Loading your dashboard...</span>
                </div>
            </div>
        );
    }

    // Show loading while determining where to redirect
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Redirecting to your dashboard...</span>
        </div>
    );
}

export default Dashboard
