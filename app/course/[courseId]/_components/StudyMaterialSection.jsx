import React, { useEffect, useState, useCallback } from 'react'
import MaterialCardItem from './MaterialCardItem'
import axios from 'axios';
import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react'

function StudyMaterialSection({ courseId }) {
    const [studyTypeContent, setStudyTypeContent] = useState([]);

    const MaterialList = [
        {
            name: 'Notes/Chapters',
            desc: 'Read Notes to get a profound understanding',
            icon: '/notes.png',
            path: '/notes',
            type: 'notes'
        },
        {
            name: 'Flashcard',
            desc: 'Flashcard help to get a gist of the notes',
            icon: '/flashcard.png',
            path: '/flashcards',
            type: 'flashcard'
        },
        {
            name: 'Quiz',
            desc: 'Great way to test your knowledge',
            icon: '/quiz.png',
            path: '/quiz',
            type: 'quiz'
        },
        {
            name: 'Question/Answer',
            desc: 'Allows to comprehend your understanding',
            icon: '/qa.png',
            path: '/qa',
            type: 'qa'
        },
    ]

    const GetStudyMaterial = useCallback(async () => {
        const result = await axios.post('/api/study-type',
            {
                courseId: courseId,
                studyType: 'ALL'
            }
        )
        // console.log(result);
        setStudyTypeContent(result.data)
    }, [courseId]);

    useEffect(() => {
        GetStudyMaterial();
    }, [GetStudyMaterial])

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
                {MaterialList.map((item, index) => (
                    <Link key={index} href={'/course/' + courseId + item.path}>
                        <MaterialCardItem key={item.name} item={item}
                            studyTypeContent={studyTypeContent}
                        />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default StudyMaterialSection
