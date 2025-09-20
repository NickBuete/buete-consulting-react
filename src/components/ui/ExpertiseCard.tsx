import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

interface ExpertiseCardProps {
    icon: string;
    title: string;
    description: string;
}

const ExpertiseCard: React.FC<ExpertiseCardProps> = ({ icon, title, description}) => {
    return (
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-orange-500 transition-transform duration-300 group-hover:scale-110">
                    <span className="text-2xl text-white font-bold">
                        {icon}
                    </span>
                </div>
                <CardTitle className="text-xl font-semibold text-brand-600">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <CardDescription className="text-gray-700 leading-relaxed">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
};

export default ExpertiseCard;