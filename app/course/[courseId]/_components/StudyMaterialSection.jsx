import React from 'react'
import MaterialCardItem from './MaterialCardItem'
import { BookOpen, Sparkles } from 'lucide-react'

function StudyMaterialSection({ courseId }) {
    const MaterialList = [
        {
            name: 'Notes/Chapters',
            desc: 'Read comprehensive notes to get profound understanding of each topic',
            icon: '/notes.png',
            path: `/course/${courseId}/notes`,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50',
            borderColor: 'border-blue-200'
        },
        {
            name: 'Flashcards',
            desc: 'Interactive flashcards help you memorize key concepts quickly',
            icon: '/flashcard.png',
            path: `/course/${courseId}/flashcards`,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'from-green-50 to-emerald-50',
            borderColor: 'border-green-200'
        },
        {
            name: 'Practice Quiz',
            desc: 'Test your knowledge with AI-generated quizzes and assessments',
            icon: '/quiz.png',
            path: `/course/${courseId}/quiz`,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'from-purple-50 to-pink-50',
            borderColor: 'border-purple-200'
        },
        {
            name: 'Q&A Practice',
            desc: 'Practice with question-answer pairs to deepen your understanding',
            icon: '/qa.png',
            path: `/course/${courseId}/qa`,
            color: 'from-orange-500 to-red-500',
            bgColor: 'from-orange-50 to-red-50',
            borderColor: 'border-orange-200'
        },
    ]

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
                    <p className="text-gray-600">Choose your preferred learning method</p>
                </div>
                <div className="ml-auto">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">AI-Powered</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MaterialList.map((item) => (
                    <MaterialCardItem key={item.name} item={item} />
                ))}
            </div>
        </div>
    )
}

export default StudyMaterialSection
