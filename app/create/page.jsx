"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';
import { useSupabase } from '../supabase-provider';
import { v4 as uuidv4 } from 'uuid';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    Brain,
    BookOpen,
    Target,
    Code,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Sparkles,
    GraduationCap,
    Briefcase,
    Lightbulb,
    BarChart3,
    Loader
} from 'lucide-react';

function Create() {
    const [step, setStep] = useState(0);
    const [selectedStudyType, setSelectedStudyType] = useState('');
    const [topic, setTopic] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { user, userProfile } = useSupabase();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check if parent is creating course for student
    const studentId = searchParams.get('studentId');
    const studentEmail = searchParams.get('studentEmail');
    const studentName = searchParams.get('studentName');
    const isParentCreating = !!(studentId && studentEmail && studentName);

    const studyTypes = [
        {
            name: "Exam Preparation",
            icon: <GraduationCap className="w-8 h-8" />,
            description: "Comprehensive study materials for academic exams",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            examples: ["SAT", "GRE", "TOEFL", "Academic Tests"]
        },
        {
            name: "Job Interview",
            icon: <Briefcase className="w-8 h-8" />,
            description: "Interview preparation and career development",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            examples: ["Technical Interviews", "Behavioral Questions", "Case Studies"]
        },
        {
            name: "Practice Sessions",
            icon: <Target className="w-8 h-8" />,
            description: "Hands-on practice with real-world scenarios",
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            examples: ["Problem Solving", "Skill Building", "Practical Exercises"]
        },
        {
            name: "Coding Prep",
            icon: <Code className="w-8 h-8" />,
            description: "Programming and software development skills",
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            examples: ["Algorithms", "Data Structures", "System Design"]
        },
        {
            name: "Custom Learning",
            icon: <Lightbulb className="w-8 h-8" />,
            description: "Personalized learning for any subject",
            color: "from-indigo-500 to-purple-500",
            bgColor: "bg-indigo-50",
            borderColor: "border-indigo-200",
            examples: ["Any Topic", "Personal Interest", "Skill Development"]
        }
    ];

    const difficultyLevels = [
        { value: "beginner", label: "Beginner", description: "Basic concepts and fundamentals" },
        { value: "intermediate", label: "Intermediate", description: "Moderate complexity and depth" },
        { value: "advanced", label: "Advanced", description: "Complex topics and expert-level content" }
    ];

    const GenerateCourseOutline = async () => {
        const courseId = uuidv4();
        setIsGenerating(true);

        try {
            const formData = {
                studyType: selectedStudyType,
                topic: topic,
                difficultyLevel: difficultyLevel,
                additionalDetails: additionalDetails
            };

            // Use student's email if parent is creating course for student, otherwise use current user's email
            const createdByEmail = isParentCreating ? studentEmail : user?.email;

            const result = await axios.post('/api/generate-course-outline', {
                courseId: courseId,
                ...formData,
                createdBy: createdByEmail,
                createdFor: isParentCreating ? studentId : null, // Add student ID for reference
            });

            setIsGenerating(false);
            router.replace('/dashboard');
            const successMessage = isParentCreating
                ? `Course for ${studentName} is being generated, it will appear on their dashboard after few minutes`
                : "Your course content is being generated, refresh the page after few minutes";
            toast(successMessage);
            console.log(result.data.result.resp);
        } catch (error) {
            setIsGenerating(false);
            toast.error("Failed to generate course. Please try again.");
            console.error("Error generating course:", error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI-Powered
                        </Badge>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        {isParentCreating ? (
                            <>
                                Create Course for
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"> {studentName}</span>
                            </>
                        ) : (
                            <>
                                Create Your Perfect
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"> Learning Experience</span>
                            </>
                        )}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {isParentCreating
                            ? `Generate personalized study materials for ${studentName}, tailored to their learning goals and skill level.`
                            : "Our AI will generate personalized study materials tailored to your goals, skill level, and learning style."
                        }
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center space-x-2 ${step >= 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 0 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                {step > 0 ? <CheckCircle className="w-4 h-4" /> : '1'}
                            </div>
                            <span className="font-medium">Choose Type</span>
                        </div>
                        <div className="flex-1 h-1 bg-gray-200 mx-4">
                            <div className={`h-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${step >= 1 ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                {step > 1 ? <CheckCircle className="w-4 h-4" /> : '2'}
                            </div>
                            <span className="font-medium">Add Details</span>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="max-w-4xl mx-auto">
                    {step === 0 && (
                        <div className="space-y-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    What type of learning material do you need?
                                </h2>
                                <p className="text-gray-600">Select the category that best matches your learning goals</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studyTypes.map((type, index) => (
                                    <Card
                                        key={index}
                                        className={`${type.bgColor} ${type.borderColor} border-2 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${selectedStudyType === type.name ? 'ring-4 ring-blue-200 shadow-lg' : ''
                                            }`}
                                        onClick={() => setSelectedStudyType(type.name)}
                                    >
                                        <CardContent className="p-6">
                                            <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg`}>
                                                {type.icon}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">{type.name}</h3>
                                            <p className="text-gray-600 text-sm text-center mb-4">{type.description}</p>
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-500">Examples:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {type.examples.map((example, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs border-gray-300 text-gray-600">
                                                            {example}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Tell us about your learning goals
                                </h2>
                                <p className="text-gray-600">Provide details to help our AI create the perfect study materials</p>
                            </div>

                            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                                <CardContent className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Topic or Subject
                                        </label>
                                        <Input
                                            placeholder="e.g., Advanced Calculus, JavaScript Programming, Data Science..."
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="border-blue-200 focus:border-blue-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Difficulty Level
                                        </label>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {difficultyLevels.map((level) => (
                                                <div
                                                    key={level.value}
                                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${difficultyLevel === level.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    onClick={() => setDifficultyLevel(level.value)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 ${difficultyLevel === level.value
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-gray-300'
                                                            }`}></div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{level.label}</h4>
                                                            <p className="text-sm text-gray-600">{level.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Additional Details (Optional)
                                        </label>
                                        <Textarea
                                            placeholder="Describe your specific learning objectives, preferred learning style, or any special requirements..."
                                            className="border-blue-200 focus:border-blue-400 min-h-[100px]"
                                            value={additionalDetails}
                                            onChange={(e) => setAdditionalDetails(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12">
                        {step > 0 ? (
                            <Button
                                onClick={() => setStep(step - 1)}
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>
                        ) : <div></div>}

                        {step === 0 ? (
                            <Button
                                onClick={() => setStep(step + 1)}
                                disabled={!selectedStudyType}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={GenerateCourseOutline}
                                disabled={!topic || !difficultyLevel || isGenerating}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader className="animate-spin w-4 h-4 mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Course
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Features Preview */}
                    <div className="mt-16">
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-8">
                            What you&apos;ll get with your AI-generated course
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Comprehensive Content</h4>
                                    <p className="text-sm text-gray-600">Structured lessons, examples, and practice materials</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Personalized Learning</h4>
                                    <p className="text-sm text-gray-600">Adapted to your skill level and learning style</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/80 backdrop-blur-sm border-green-100">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Progress Tracking</h4>
                                    <p className="text-sm text-gray-600">Monitor your learning progress and achievements</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Create
