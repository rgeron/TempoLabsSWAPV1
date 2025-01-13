import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";

export interface LocalizedEducationCategory {
  key: string;
  label: string;
  localizedLabel: string;
  displayOrder: number;
}

export function useLocalizedEducationCategories() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<LocalizedEducationCategory[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Default to US if no country selected
        const countryCode = profile?.country || "US";

        // First, verify if the tables exist by checking education_systems
        const { data: systemCheck, error: systemError } = await supabase
          .from("education_systems")
          .select("country_code")
          .eq("country_code", countryCode)
          .single();

        if (systemError) {
          console.error("Error checking education system:", systemError);
          throw new Error("Education system not properly configured");
        }

        // Fetch the education levels directly
        const { data: levels, error: levelsError } = await supabase
          .from("education_levels")
          .select("*")
          .eq("country_code", countryCode)
          .order("display_order");

        if (levelsError) throw levelsError;

        // Transform the data into our desired format
        const transformedCategories = levels.map((level) => ({
          key: `education_${level.id}`,
          label: level.level_name,
          localizedLabel: level.level_name_localized,
          displayOrder: level.display_order,
        }));

        setCategories(transformedCategories);
      } catch (err) {
        console.error("Error fetching education categories:", err);
        // Provide fallback categories instead of showing error
        setCategories([
          {
            key: "elementary",
            label: "Elementary",
            localizedLabel: "Elementary",
            displayOrder: 1,
          },
          {
            key: "middle_school",
            label: "Middle School",
            localizedLabel: "Middle School",
            displayOrder: 2,
          },
          {
            key: "high_school",
            label: "High School",
            localizedLabel: "High School",
            displayOrder: 3,
          },
          {
            key: "higher_education",
            label: "Higher Education",
            localizedLabel: "Higher Education",
            displayOrder: 4,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [profile?.country]);

  return { categories, isLoading, error };
}
