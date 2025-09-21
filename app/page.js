"use client"
import { useEffect, useRef, lazy, Suspense } from 'react'
import Header from './_components/Header';
import HeroSection from './_components/HeroSection';
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'

// Lazy load below-the-fold components
const CourseOptionsSection = lazy(() => import('./_components/CourseOptionsSection'));
const FeaturesSection = lazy(() => import('./_components/FeaturesSection'));
const StatsSection = lazy(() => import('./_components/StatsSection'));
const PricingSection = lazy(() => import('./_components/PricingSection'));
const TestimonialsSection = lazy(() => import('./_components/TestimonialsSection'));
const CTASection = lazy(() => import('./_components/CTASection'));
const Footer = lazy(() => import('./_components/Footer'));

export default function Home() {
  const { loading, userProfile, user } = useSupabase();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Don't redirect if loading or already redirected
    if (loading || hasRedirectedRef.current) return;
    if (!user) return; // No user, stay on homepage

    // Only process if we're on the homepage to avoid unnecessary redirects
    if (typeof window !== 'undefined' && window.location.pathname !== '/') return;

    hasRedirectedRef.current = true;

    // If user is suspended or not approved, send to waiting-approval
    if (userProfile && (userProfile.isSuspended || !userProfile.isApproved)) {
      router.replace('/auth/waiting-approval');
      return;
    }

    // Redirect authenticated users immediately, even without full profile loaded
    if (user) {
      // If we have userProfile with role, use specific destination
      if (userProfile?.role && userProfile?.isApproved && !userProfile?.isSuspended) {
        const role = userProfile.role.toLowerCase();
        const destination = role === 'admin' ? '/admin'
          : role === 'parent' ? '/dashboard/parent'
            : role === 'student' ? '/dashboard/student'
              : '/dashboard';
        router.replace(destination);
      } else {
        // If no profile yet, go to generic dashboard and let it handle role-based routing
        router.replace('/dashboard');
      }
    }
  }, [loading, user, userProfile, router]); // Include userProfile in dependencies

  // Show loading spinner while determining user state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if user exists (prevent homepage flash during redirect)
  if (user) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <HeroSection />
      <Suspense fallback={<div className="h-20 bg-gray-50 animate-pulse" />}>
        <CourseOptionsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
        <CTASection />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  );
}