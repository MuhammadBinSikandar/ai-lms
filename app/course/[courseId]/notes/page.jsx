'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText, CheckCircle, BookOpen, Clock, Trophy, Sparkles, ArrowLeft } from 'lucide-react'
import { useSupabase } from '@/app/supabase-provider';
import { useRouter } from 'next/navigation';

function ViewNotes() {
    const { courseId } = useParams();
    const { userProfile } = useSupabase();
    const router = useRouter();
    const [notes, setNotes] = useState(null);
    const [stepCount, setStepCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completedChapters, setCompletedChapters] = useState(new Set());
    const [marking, setMarking] = useState(false);

    const GetNotes = useCallback(async () => {
        try {
            setLoading(true);
            const result = await axios.post('/api/study-type', {
                courseId: courseId,
                studyType: 'notes'
            });
            setNotes(result?.data || []);
            setStepCount(0);
            // Prefill progress state from server
            try {
                const prog = await axios.get(`/api/course-progress?userId=${userProfile?.id || ''}&courseId=${courseId}`);
                const percentage = prog?.data?.result?.progressPercentage || 0;
                if (percentage > 0 && Array.isArray(result?.data)) {
                    const completedCount = Math.floor((percentage / 100) * result.data.length);
                    const initial = new Set();
                    for (let i = 0; i < completedCount; i++) initial.add(i);
                    setCompletedChapters(initial);
                    // Place user at first incomplete chapter
                    const firstIncomplete = Math.min(completedCount, result.data.length - 1);
                    setStepCount(firstIncomplete);
                }
            } catch { }
        } catch (e) {
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [courseId, userProfile?.id]);

    useEffect(() => {
        GetNotes();
    }, [GetNotes]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                <div className="relative text-center z-10">
                    <div className="relative mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Loading Your Notes
                        </h3>
                        <p className="text-gray-600 text-lg">Preparing your learning experience...</p>
                        <div className="flex items-center justify-center gap-1 mt-4">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!notes || notes.length === 0) {
        return (
            <div className="relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative backdrop-blur-sm bg-white/80 rounded-3xl border border-white/60 shadow-2xl p-12 text-center">
                    <div className="relative mb-6">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-xl"></div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        No Notes Available Yet
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                        Your personalized course notes will appear here once they&apos;re generated.
                        <span className="block mt-2 text-indigo-600 font-medium">Stay tuned for an amazing learning experience! ✨</span>
                    </p>
                </div>
            </div>
        );
    }

    const current = notes[stepCount];
    const canGoPrev = stepCount > 0;
    const canGoNext = stepCount < notes.length - 1;
    const isCompleted = completedChapters.has(stepCount);
    const isNextUnlocked = isCompleted;
    const progressPercentage = Math.round(((stepCount + 1) / notes.length) * 100);
    const completedCount = completedChapters.size;

    const enhanceHtml = (html) => {
        if (!html) return '';
        let output = html;

        // Handle LaTeX-style math blocks
        try {
            const mathBlockRegex = /<code>\s*\\\[\s*((?:.|\n)*?)\s*\\\]\s*<\/code>/g;
            output = output.replace(mathBlockRegex, (match, inner) => {
                const cleanMath = String(inner)
                    .replace(/\\begin\{bmatrix\}/g, '[')
                    .replace(/\\end\{bmatrix\}/g, ']')
                    .replace(/\\cos/g, 'cos')
                    .replace(/\\sin/g, 'sin')
                    .replace(/\\theta/g, 'θ')
                    .replace(/\\\\/g, '\n')
                    .replace(/&/g, '  ')
                    .trim();

                return `<div class="my-8 p-8 rounded-2xl bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 border border-blue-200/50 shadow-xl backdrop-blur-sm relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div class="absolute top-4 right-4 text-blue-400/30 transform rotate-12">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="font-mono text-center text-xl text-gray-800 whitespace-pre-line leading-relaxed relative z-10">${cleanMath}</div>
                </div>`;
            });
        } catch (e) {
            console.warn('Math block processing error:', e);
        }

        // Enhanced inline code
        try {
            output = output.replace(/<code>([^\\]*?)<\/code>/g, (match, code) => {
                const cleaned = String(code).trim();
                return `<code class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200/80 font-mono text-sm text-gray-800 shadow-sm">${cleaned}</code>`;
            });
        } catch (e) {
            console.warn('Inline code processing error:', e);
        }

        // Stunning chapter titles with animated elements
        output = output.replaceAll('<h3>', `<div class="mb-12 text-center relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-3xl blur-3xl transform scale-150"></div>
            <h3 class="relative text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">`)
            .replaceAll('</h3>', `</h3>
            <div class="flex items-center justify-center gap-2 mb-4">
                <div class="w-16 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent rounded-full"></div>
                <div class="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg"></div>
                <div class="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent rounded-full"></div>
            </div>
            <div class="w-24 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full mx-auto shadow-lg"></div>
        </div>`);

        // Beautiful section headings
        output = output.replaceAll('<h4>', `<div class="mt-10 mb-6 relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl transform -skew-y-1 group-hover:skew-y-0 transition-transform duration-300"></div>
            <h4 class="relative text-2xl font-bold text-gray-900 flex items-center gap-3 p-4">
                <div class="flex items-center gap-2">
                    <div class="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full shadow-lg"></div>
                    <div class="w-2 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                </div>`)
            .replaceAll('</h4>', `</h4></div>`);

        // Enhanced paragraphs with better typography
        output = output.replaceAll('<p>', '<p class="text-gray-700 leading-relaxed mb-6 text-lg font-light tracking-wide">');

        // Stunning list containers
        output = output.replaceAll('<ul>', `<div class="relative my-8 group">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 rounded-2xl shadow-inner"></div>
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/60 to-indigo-600/60 rounded-t-2xl"></div>
            <ul class="relative space-y-4 p-8">`)
            .replaceAll('</ul>', '</ul></div>')
            .replaceAll('<li>', `<li class="flex items-start gap-4 text-gray-700 text-lg group/item hover:text-gray-900 transition-colors duration-200">
                <div class="relative mt-2 shrink-0">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg group-hover/item:scale-110 transition-transform duration-200"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-full blur-sm group-hover/item:blur-md transition-all duration-200"></div>
                </div>
                <span class="leading-relaxed">`)
            .replaceAll('</li>', '</span></li>');

        // Enhanced strong text
        output = output.replaceAll('<strong>', '<strong class="text-gray-900 font-semibold bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-2 py-0.5 rounded-md">');

        // Better subscripts
        output = output.replaceAll('<sub>', '<sub class="text-sm font-medium">');

        return output;
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Dynamic background with animated elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-0 w-72 h-72 bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <div className="relative backdrop-blur-sm bg-white/90 rounded-3xl border border-white/60 shadow-2xl m-4 overflow-hidden">
                {/* Back button */}
                <div className="absolute top-4 left-4 z-20">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </div>

                {/* Glassmorphism header with enhanced styling */}
                <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
                                        <BookOpen className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="absolute -inset-2 bg-white/20 rounded-3xl blur-md"></div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Course Notes</h1>
                                    <p className="text-white/90 text-lg font-medium">Chapter {stepCount + 1} of {notes.length}</p>
                                </div>
                            </div>

                            {/* Enhanced navigation buttons */}
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    disabled={!canGoPrev}
                                    onClick={() => canGoPrev && setStepCount(stepCount - 1)}
                                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 disabled:opacity-50 shadow-xl"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                                </Button>
                                <Button
                                    variant="default"
                                    size="lg"
                                    disabled={!canGoNext || !isCompleted}
                                    onClick={() => (canGoNext && isCompleted) && setStepCount(stepCount + 1)}
                                    className="bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold disabled:opacity-50"
                                >
                                    Next <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Enhanced progress visualization */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-white/90">
                                <span className="flex items-center gap-2 font-medium">
                                    <Trophy className="w-5 h-5 text-yellow-300" />
                                    Progress: {completedCount}/{notes.length} completed
                                </span>
                                <span className="text-2xl font-bold text-white">
                                    {progressPercentage}%
                                </span>
                            </div>

                            {/* Dynamic progress bar */}
                            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>

                            {/* Chapter progress dots */}
                            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 pt-2">
                                {notes.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`relative h-2 rounded-full transition-all duration-300 ${completedChapters.has(index)
                                            ? 'bg-gradient-to-r from-emerald-400 to-green-400 shadow-lg'
                                            : index === stepCount
                                                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg animate-pulse'
                                                : 'bg-white/30'
                                            }`}
                                    >
                                        {completedChapters.has(index) && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-green-400/50 rounded-full blur-sm"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area with enhanced styling */}
                <div className="p-8 relative">
                    {/* Reading progress card */}
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/80 border border-white/60 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-xl blur-md"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Chapter {stepCount + 1}</h3>
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Reading progress: {stepCount + 1} of {notes.length} chapters
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        {progressPercentage}%
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Complete</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced content container */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl shadow-2xl"></div>
                        <div className="relative backdrop-blur-sm bg-white/90 rounded-3xl p-12 border border-white/60 shadow-inner">
                            <div className="prose prose-lg max-w-none">
                                <div
                                    className="text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: enhanceHtml((current?.notes || '').replace(/\n/g, '<br />'))
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced bottom navigation */}
                    <div className="mt-8 flex items-center justify-between gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            disabled={!canGoPrev}
                            onClick={() => canGoPrev && setStepCount(stepCount - 1)}
                            className="bg-white/80 backdrop-blur-sm border-gray-200/80 text-gray-700 hover:bg-white shadow-lg disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" /> Previous Chapter
                        </Button>

                        <div className="flex items-center gap-4">
                            {isCompleted ? (
                                <Button
                                    variant="default"
                                    size="lg"
                                    disabled
                                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl cursor-default"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" /> Completed ✨
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="lg"
                                    disabled={marking}
                                    onClick={async () => {
                                        const total = notes.length;
                                        const percent = Math.round(((stepCount + 1) / total) * 100);
                                        try {
                                            setMarking(true);
                                            await axios.post('/api/course-progress', {
                                                userId: userProfile?.id,
                                                courseId,
                                                chapterId: current?.chapterId ?? stepCount + 1,
                                                progressPercentage: percent
                                            });
                                            setCompletedChapters(prev => {
                                                const next = new Set(prev);
                                                next.add(stepCount);
                                                return next;
                                            });
                                        } catch (e) {
                                            // ignore
                                        } finally {
                                            setMarking(false);
                                        }
                                    }}
                                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-xl font-semibold"
                                >
                                    {marking ? (
                                        <>
                                            <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Marking Complete...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" /> Mark as Completed
                                        </>
                                    )}
                                </Button>
                            )}

                            <Button
                                variant="default"
                                size="lg"
                                disabled={!canGoNext || !isNextUnlocked}
                                onClick={() => (canGoNext && isNextUnlocked) && setStepCount(stepCount + 1)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl font-semibold disabled:opacity-50"
                            >
                                {canGoNext ? (
                                    <>Next Chapter <ChevronRight className="w-5 h-5 ml-2" /></>
                                ) : (
                                    <>🎉 Course Complete!</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Completion celebration */}
                    {!canGoNext && (
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white font-bold rounded-full shadow-2xl animate-bounce">
                                <Trophy className="w-6 h-6" />
                                Congratulations! You&apos;ve mastered all chapters! 🎊
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ViewNotes