'use client'
import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation';
import DashboardHeader from '@/app/dashboard/_components/DashboardHeader';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import CourseIntroCard from './_components/CourseIntroCard';
import StudyMaterialSection from './_components/StudyMaterialSection';
import ChapterList from './_components/ChapterList';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useSupabase } from '@/app/supabase-provider';
import { LoadingSpinner } from '@/components/ui/loading';

function Course() {
    const { courseId } = useParams();
    const router = useRouter();
    const { user, userProfile, loading: supabaseLoading } = useSupabase();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
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
        }
    };

    // Authentication and status monitoring
    useEffect(() => {
        if (supabaseLoading) return;

        if (!user) {
            clearAllCaches();
            redirectingRef.current = true;
            router.replace('/auth/login');
            return;
        }

        if (userProfile) {
            // Check if user is suspended or not approved
            if (userProfile.isSuspended || !userProfile.isApproved) {
                clearAllCaches();
                redirectingRef.current = true;
                router.replace('/auth/waiting-approval');
                return;
            }

            // Admin users should go to admin panel
            if (userProfile.role === 'admin') {
                clearAllCaches();
                redirectingRef.current = true;
                router.replace('/admin');
                return;
            }
        }
    }, [user, userProfile, supabaseLoading, router]);

    // Continuous status monitoring
    useEffect(() => {
        if (!user || supabaseLoading) return;

        let isMounted = true;

        const checkUserStatus = async () => {
            if (!isMounted) return;

            try {
                const response = await fetch('/api/auth/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });

                if (response.ok && isMounted) {
                    const data = await response.json();
                    const currentUser = data.user;

                    if (currentUser) {
                        // If user is now suspended or not approved, redirect immediately
                        if (currentUser.isSuspended || !currentUser.isApproved) {
                            clearAllCaches();
                            redirectingRef.current = true;
                            router.replace('/auth/waiting-approval');
                            return;
                        }

                        // If user is now admin, redirect to admin panel
                        if (currentUser.role === 'admin') {
                            clearAllCaches();
                            redirectingRef.current = true;
                            router.replace('/admin');
                            return;
                        }
                    } else {
                        // User profile not found, redirect to login
                        clearAllCaches();
                        redirectingRef.current = true;
                        router.replace('/auth/login');
                        return;
                    }
                }
            } catch (error) {
                console.warn('Course page status check failed:', error);
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
    }, [user, supabaseLoading, router]);

    const getCourse = useCallback(async () => {
        try {
            setLoading(true);

            // Check cache first
            const cacheKey = `course_${courseId}`;
            const cachedCourse = sessionStorage.getItem(cacheKey);
            const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
            const cacheExpiry = 5 * 60 * 1000; // 5 minutes

            if (cachedCourse && cacheTimestamp) {
                const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry;
                if (!isExpired) {
                    setCourse(JSON.parse(cachedCourse));
                    setLoading(false);
                    return;
                }
            }

            // Fetch from API if not cached or expired
            const result = await axios.get(`/api/courses?courseId=${courseId}`);
            console.log(result);
            const courseData = result.data.result;
            setCourse(courseData);

            // Cache the result
            sessionStorage.setItem(cacheKey, JSON.stringify(courseData));
            sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        getCourse();
    }, [getCourse]);

    const handleBack = () => {
        router.back();
    };

    // Show loading states for various scenarios
    if (supabaseLoading) {
        return (
            <LoadingSpinner
                text="Loading Course"
                subtitle="Verifying your access..."
                variant="default"
            />
        );
    }

    // Show loading while redirecting
    if (redirectingRef.current) {
        return (
            <LoadingSpinner
                text="Redirecting..."
                subtitle="Taking you to the right place"
                variant="default"
            />
        );
    }

    // Show loading while checking authentication or profile
    if (!user || !userProfile) {
        return (
            <LoadingSpinner
                text="Verifying Access"
                subtitle="Checking your account status..."
                variant="default"
            />
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <DashboardHeader />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">Loading Course...</h2>
                        <p className="text-gray-500">Please wait while we fetch your course content</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <DashboardHeader />
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Courses
                    </Button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                    <div className="space-y-8">
                        <CourseIntroCard course={course} />
                        <StudyMaterialSection courseId={courseId} />
                        <ChapterList course={course} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Course;
