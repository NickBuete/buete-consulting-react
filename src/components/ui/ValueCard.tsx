import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./Card";

interface ValueCardProps {
  icon: string;
  title: string;
  description: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description }) => {
  return (
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-brand-500 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
          <span className="text-xl text-white">{icon}</span>
        </div>
        <CardTitle className="text-center text-xl font-semibold text-gray-900 mb-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-12 h-0.5 bg-gradient-to-r from-orange-500 to-brand-500 mx-auto mb-4 opacity-30"></div>
        <CardDescription className="text-gray-600 leading-relaxed text-sm">
            {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default ValueCard;
