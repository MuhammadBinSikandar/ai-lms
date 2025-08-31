"use client";

import React, { useEffect } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'
import { Shield, Users, BarChart3, Settings, LogOut, Brain } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function AdminLayout({ children }) {
    const { userProfile, loading: supabaseLoading, user, supabase } = useSupabase();
    const router = useRouter();

    // Authentication and authorization guard
    useEffect(() => {
        if (!supabaseLoading) {
            if (!user) {
                // No user logged in, redirect to login
                router.replace('/auth/login');
                return;
            }

            if (!userProfile) {
                // Still loading profile; do nothing here to avoid redirect flicker
                return;
            }

            if (userProfile.role !== 'admin') {
                // User is not admin, redirect to appropriate dashboard
                if (userProfile.role === 'parent') {
                    router.replace('/dashboard/parent');
                } else {
                    router.replace('/dashboard/student');
                }
                return;
            }

            // Admins can access admin panel regardless of approval
        }
    }, [user, userProfile, supabaseLoading, router]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            // Force redirect to homepage using window.location for complete navigation
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
            // Even if signOut fails, redirect to homepage
            window.location.href = '/';
        }
    };

    // Show loading while checking authentication
    if (supabaseLoading || !userProfile || userProfile.role !== 'admin') {
        return (
            <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center'>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Admin Panel</h2>
                    <p className="text-gray-500">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
            {/* Admin Sidebar */}
            <div className='md:w-72 hidden md:block fixed h-full z-10 bg-white shadow-xl border-r border-gray-200'>
                <div className='p-6 border-b border-gray-200'>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                            <p className="text-sm text-gray-500">AI LMS Platform</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className='p-6 space-y-2'>
                    <Link
                        href='/admin'
                        className='flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors duration-200'
                    >
                        <Users className='w-5 h-5' />
                        <span className='font-medium'>User Management</span>
                    </Link>
                </nav>

                {/* Admin Info & Sign Out */}
                <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200'>
                    <div className='bg-indigo-50 p-4 rounded-lg mb-4'>
                        <div className='flex items-center space-x-3'>
                            <Shield className='w-5 h-5 text-indigo-600' />
                            <div>
                                <p className='text-sm font-medium text-indigo-800'>{userProfile.name}</p>
                                <p className='text-xs text-indigo-600'>Administrator</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full flex items-center justify-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className='md:ml-72'>
                {/* Top Header */}
                <div className='bg-white shadow-sm border-b border-gray-200 p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                            <p className="text-gray-600">Manage users and monitor platform activity</p>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className='p-6'>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AdminLayout
