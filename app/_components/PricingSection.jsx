import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle, Trophy } from 'lucide-react';

function PricingSection() {
    const plans = [
        {
            name: "Student",
            price: "$-",
            period: "/month",
            description: "Perfect for individual learners",
            features: [
                "5 AI-generated courses per month",
                "Basic progress tracking",
                "Community support",
                "Mobile app access",
                "Standard difficulty levels"
            ],
            color: "from-blue-500 to-cyan-500",
            popular: false
        },
        {
            name: "Pro",
            price: "$-",
            period: "/month",
            description: "Best for serious learners",
            features: [
                "Unlimited AI-generated courses",
                "Advanced analytics & insights",
                "Priority support",
                "Parent dashboard access",
                "All difficulty levels",
                "Custom learning paths",
            ],
            color: "from-purple-500 to-pink-500",
            popular: true
        },
        {
            name: "Family",
            price: "$-",
            period: "/month",
            description: "Ideal for families",
            features: [
                "Up to 5 student accounts",
                "Comprehensive parent dashboard",
                "Family progress reports",
                "All Pro features included",
                "Bulk course creation",
                "Family leaderboards"
            ],
            color: "from-green-500 to-emerald-500",
            popular: false
        }
    ];

    return (
        <section className="py-20 bg-white" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-700">
                        <Trophy className="w-4 h-4 mr-2" />
                        Pricing Plans
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Choose Your Learning Journey
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Flexible pricing options designed to fit every learner&apos;s needs and budget
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card key={index} className={`relative ${plan.popular ? 'ring-4 ring-purple-200 shadow-2xl scale-105' : 'hover:shadow-xl'} transition-all duration-300 hover:-translate-y-2`}>
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                    Most Popular
                                </Badge>
                            )}
                            <CardHeader className="text-center">
                                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                    <span className="text-white text-2xl font-bold">{plan.name.charAt(0)}</span>
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-800">{plan.name}</CardTitle>
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    {plan.price}<span className="text-lg text-gray-500">{plan.period}</span>
                                </div>
                                <CardDescription className="text-gray-600">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className={`w-full bg-gradient-to-r ${plan.color} hover:shadow-lg transition-all duration-300 ${plan.popular ? 'shadow-xl' : ''}`}>
                                    Get Started
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PricingSection;