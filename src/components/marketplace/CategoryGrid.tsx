import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { LocalizedEducationCategories } from "./LocalizedEducationCategories";
import { CATEGORY_DEFINITIONS } from "@/types/marketplace";

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCategoryClick = (category: string) => {
    // If user is logged in, use app route, otherwise use public route
    const basePath = user ? "/app" : "";
    navigate(`${basePath}/category/${category}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 p-6 w-full">
      {CATEGORY_DEFINITIONS.map((category) => (
        <div key={category.name} className="flex">
          <Card
            className={`flex flex-col shadow-md ${category.gradient} border-0 w-full`}
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
              {category.name === "Education" ? (
                <LocalizedEducationCategories
                  onSelect={handleCategoryClick}
                  className="w-full"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      className={`text-left px-4 py-3 bg-white/80 rounded-xl transition-all duration-200 shadow-sm
                        ${category.hoverGradient} hover:shadow-md
                        text-gray-700 hover:text-gray-900 font-medium`}
                      onClick={() => handleCategoryClick(subcategory)}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
