import React from 'react';
import { Users, BookOpen, Trophy, MessageCircle } from 'lucide-react';

export default function StatsSection() {
    const stats = [
        { number: "50K+", label: "Active Learners", icon: <Users className="w-8 h-8" />, color: "text-blue-600", bg: "bg-blue-100" },
        { number: "1000+", label: "AI-Generated Courses", icon: <BookOpen className="w-8 h-8" />, color: "text-purple-600", bg: "bg-purple-100" },
        { number: "98%", label: "Success Rate", icon: <Trophy className="w-8 h-8" />, color: "text-green-600", bg: "bg-green-100" },
        { number: "24/7", label: "AI Support", icon: <MessageCircle className="w-8 h-8" />, color: "text-indigo-600", bg: "bg-indigo-100" }
    ];

    return (
        <section className="py-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Trusted by Learners Worldwide
                    </h2>
                    <p className="text-xl text-gray-600">
                        Join thousands of successful learners who have transformed their careers with our AI-powered platform
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center group">
                            <div className={`${stat.bg} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <div className={stat.color}>
                                    {stat.icon}
                                </div>
                            </div>
                            <h3 className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.number}</h3>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}