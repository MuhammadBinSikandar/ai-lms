'use client'
import React, { useEffect, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import DashboardHeader from '@/app/dashboard/_components/DashboardHeader';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import CourseIntroCard from './_components/CourseIntroCard';
import StudyMaterialSection from './_components/StudyMaterialSection';
import ChapterList from './_components/ChapterList';
import { Loader2, ArrowLeft } from 'lucide-react';

function Course() {
    const { courseId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

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

                <div className="space-y-8">
                    <CourseIntroCard course={course} />
                    <StudyMaterialSection courseId={courseId} />
                    <ChapterList course={course} />
                </div>
            </div>
        </div>
    )
}

export default Course;
