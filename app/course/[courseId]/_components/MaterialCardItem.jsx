import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

function MaterialCardItem({ item }) {
    return (
        <div className={`group relative bg-gradient-to-br ${item.bgColor} border-2 ${item.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className={`w-full h-full bg-gradient-to-br ${item.color} rounded-full transform translate-x-6 -translate-y-6`}></div>
            </div>

            {/* Status badge */}
            <div className="flex justify-between items-start mb-4">
                <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs px-2 py-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                </Badge>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Image
                        src={item.icon}
                        alt={item.name}
                        height={32}
                        width={32}
                        className="filter brightness-0 invert"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    {item.desc}
                </p>
            </div>

            {/* Action button */}
            <Link href={item.path} className="block">
                <Button className={`w-full bg-gradient-to-r ${item.color} hover:shadow-lg transition-all duration-300 text-white group-hover:scale-105`}>
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    )
}

export default MaterialCardItem
