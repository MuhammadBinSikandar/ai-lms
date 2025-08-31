import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Target, Zap, Users, Code, Trophy } from 'lucide-react';

function FeaturesSection() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: "AI-Powered Personalization",
      description: "Our advanced AI analyzes your learning patterns, strengths, and areas for improvement to create a completely personalized learning experience that adapts in real-time.",
      bgGradient: "from-blue-500 to-cyan-500",
      titleColor: "text-blue-800",
      borderColor: "border-blue-100",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Smart Progress Tracking",
      description: "Advanced analytics provide detailed insights into your learning journey with predictive modeling to optimize your study schedule and identify knowledge gaps before they become problems.",
      bgGradient: "from-purple-500 to-pink-500",
      titleColor: "text-purple-800",
      borderColor: "border-purple-100",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Interactive Learning",
      description: "Engage with multimedia content, interactive simulations, AI-powered quizzes, and real-time feedback systems designed to maximize retention and understanding.",
      bgGradient: "from-indigo-500 to-blue-500",
      titleColor: "text-indigo-800",
      borderColor: "border-indigo-100",
      bgColor: "bg-indigo-50"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Parent Dashboard",
      description: "Parents can monitor their child's progress with comprehensive reports, performance analytics, and insights into learning habits to support their educational journey.",
      bgGradient: "from-green-500 to-emerald-500",
      titleColor: "text-green-800",
      borderColor: "border-green-100",
      bgColor: "bg-green-50"
    },
    {
      icon: <Code className="w-8 h-8 text-white" />,
      title: "Multi-Difficulty Levels",
      description: "From beginner to expert, our AI adjusts content complexity, pacing, and assessment difficulty to match your current skill level and learning objectives.",
      bgGradient: "from-orange-500 to-red-500",
      titleColor: "text-orange-800",
      borderColor: "border-orange-100",
      bgColor: "bg-orange-50"
    },
    {
      icon: <Trophy className="w-8 h-8 text-white" />,
      title: "Achievement System",
      description: "Stay motivated with our gamified learning system featuring badges, achievements, leaderboards, and progress milestones that celebrate your learning victories.",
      bgGradient: "from-yellow-500 to-orange-500",
      titleColor: "text-yellow-800",
      borderColor: "border-yellow-100",
      bgColor: "bg-yellow-50"
    }
  ];

  return (
    <section className="py-20" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
            <Zap className="w-4 h-4 mr-2" />
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Why Choose Our AI LMS?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of learning with cutting-edge AI technology that adapts to your unique learning style and accelerates your educational journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.bgColor} ${feature.borderColor} border-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group`}>
              <CardHeader>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.bgGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <CardTitle className={`${feature.titleColor} text-xl font-bold mb-3`}>
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;