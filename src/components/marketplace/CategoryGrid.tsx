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

  // Séparer les catégories d'éducation des autres
  const educationCategory = CATEGORY_DEFINITIONS.find(
    (cat) => cat.name === "Education",
  );
  const otherCategories = CATEGORY_DEFINITIONS.filter(
    (cat) => cat.name !== "Education",
  );

  return (
    <div className="space-y-6">
      {/* Education Section - Horizontal */}
      {educationCategory && (
        <Card className={`p-6 ${educationCategory.gradient} border-0 w-full`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{educationCategory.icon}</span>
              <h3
                className={`text-xl font-bold bg-gradient-to-r ${educationCategory.color} bg-clip-text text-transparent`}
              >
                {educationCategory.name}
              </h3>
            </div>
            <LocalizedEducationCategories
              onSelect={handleCategoryClick}
              className="grid grid-cols-4 md:grid-cols-6 gap-2"
            />
          </div>
        </Card>
      )}

      {/* Other Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {otherCategories.map((category) => (
          <Card
            key={category.name}
            className={`flex flex-col shadow-md ${category.gradient} border-0`}
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
              <div className="grid grid-cols-2 gap-2">
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
