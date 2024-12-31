import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  name: string;
  color: string;
  gradient: string;
  hoverGradient: string;
  icon: string;
  subcategories: string[];
}

const categories: Category[] = [
  {
    name: "Languages",
    color: "from-violet-500 to-purple-500",
    gradient: "bg-gradient-to-br from-violet-50 to-purple-50",
    hoverGradient:
      "hover:bg-gradient-to-br hover:from-violet-100 hover:to-purple-100",
    icon: "🌎",
    subcategories: [
      "Spanish",
      "French",
      "German",
      "Japanese",
      "Chinese",
      "Italian",
      "Korean",
      "Russian",
      "Portuguese",
      "Arabic",
      "Hindi",
      "Vietnamese",
    ],
  },
  {
    name: "Sciences",
    color: "from-cyan-500 to-blue-500",
    gradient: "bg-gradient-to-br from-cyan-50 to-blue-50",
    hoverGradient:
      "hover:bg-gradient-to-br hover:from-cyan-100 hover:to-blue-100",
    icon: "🔬",
    subcategories: [
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "Computer Science",
      "Astronomy",
      "Environmental Science",
      "Geology",
      "Statistics",
      "Engineering",
      "Medicine",
      "Psychology",
    ],
  },
  {
    name: "Arts",
    color: "from-rose-500 to-pink-500",
    gradient: "bg-gradient-to-br from-rose-50 to-pink-50",
    hoverGradient:
      "hover:bg-gradient-to-br hover:from-rose-100 hover:to-pink-100",
    icon: "🎨",
    subcategories: [
      "Literature",
      "History",
      "Music",
      "Visual Arts",
      "Theater",
      "Film Studies",
      "Architecture",
      "Photography",
      "Dance",
      "Creative Writing",
      "Art History",
      "Design",
    ],
  },
];

const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-auto lg:h-[calc(60vh-80px)]">
      {categories.map((category) => (
        <Card
          key={category.name}
          className={`overflow-hidden flex flex-col shadow-md ${category.gradient} border-0`}
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">{category.icon}</span>
              <h3
                className={`text-xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
              >
                {category.name}
              </h3>
            </div>
            <ScrollArea className="h-[calc(60vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-4">
                {category.subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    className={`text-left px-4 py-3 bg-white/80 rounded-xl transition-all duration-200 shadow-sm
                      ${category.hoverGradient} hover:shadow-md
                      text-gray-700 hover:text-gray-900 font-medium`}
                    onClick={() =>
                      console.log(
                        `Navigate to ${category.name} - ${subcategory}`,
                      )
                    }
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
