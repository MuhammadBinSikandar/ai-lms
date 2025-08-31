"use client"
import { useEffect, useRef } from 'react'
import Header from './_components/Header';
import HeroSection from './_components/HeroSection';
import CourseOptionsSection from './_components/CourseOptionsSection';
import FeaturesSection from './_components/FeaturesSection';
import StatsSection from './_components/StatsSection';
import PricingSection from './_components/PricingSection';
import TestimonialsSection from './_components/TestimonialsSection';
import CTASection from './_components/CTASection';
import Footer from './_components/Footer';
import { useSupabase } from '@/app/supabase-provider'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { loading, userProfile, user } = useSupabase();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Don't redirect if loading or already redirected
    if (loading || hasRedirectedRef.current) return;
    if (!user) return; // No user, stay on homepage
    
    // Only redirect authenticated users with profiles, and only once
    if (userProfile?.role && typeof window !== 'undefined' && window.location.pathname === '/') {
      hasRedirectedRef.current = true;
      const role = userProfile.role.toLowerCase();
      const destination = role === 'admin' ? '/admin'
        : role === 'parent' ? '/dashboard/parent'
        : role === 'student' ? '/dashboard/student'
        : '/dashboard';
      // Use replace to prevent back button issues
      router.replace(destination);
    }
  }, [loading, user, userProfile?.role, router]); // More specific dependency

  // Show nothing while loading or if user exists (to prevent flashing)
  if (loading || user) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <HeroSection />
      <CourseOptionsSection />
      <FeaturesSection />
      <StatsSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}