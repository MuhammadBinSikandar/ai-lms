import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { Star } from 'lucide-react';

function TestimonialsSection() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "High School Student",
            image: "👩‍🎓",
            content: "The AI-powered exam prep helped me improve my SAT scores by 200 points! The personalized study plan was exactly what I needed.",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Software Developer",
            image: "👨‍💻",
            content: "The coding prep courses are incredibly thorough. The AI feedback on my code helped me land my dream job at a tech company.",
            rating: 5
        },
        {
            name: "Lisa Rodriguez",
            role: "Parent",
            image: "👩‍👧",
            content: "The parent dashboard gives me perfect insight into my daughter's progress. I love how engaged she is with the interactive content!",
            rating: 5
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700">
                        <Star className="w-4 h-4 mr-2" />
                        Success Stories
                    </Badge>
                    <h2 className="text-4xl font-bold text-gray-800 mb-6">
                        What Our Learners Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover how our AI-powered learning platform has transformed the educational journey of thousands of learners
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-white/80 backdrop-blur-sm border-2 border-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <CardHeader>
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-2xl mr-4">
                                        {testimonial.image}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <CardDescription className="text-gray-700 leading-relaxed italic">
                                    &quot;{testimonial.content}&quot;
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default TestimonialsSection;