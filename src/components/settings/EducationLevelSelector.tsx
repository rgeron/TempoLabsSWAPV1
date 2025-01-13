import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface EducationLevel {
  id: number;
  level_name: string;
  level_name_localized: string;
  display_order: number;
}

interface EducationLevelSelectorProps {
  countryCode?: string;
  value?: number;
  onChange: (value: number) => void;
}

export function EducationLevelSelector({
  countryCode,
  value,
  onChange,
}: EducationLevelSelectorProps) {
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducationLevels = async () => {
      if (!countryCode) {
        setLevels([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("education_levels")
          .select("*")
          .eq("country_code", countryCode)
          .order("display_order");

        if (error) throw error;

        console.log(
          `Fetched ${data?.length || 0} education levels for ${countryCode}:`,
          data,
        );
        setLevels(data || []);
      } catch (error) {
        console.error("Error fetching education levels:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load education levels",
        );
        setLevels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEducationLevels();
  }, [countryCode]);

  if (!countryCode) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select country first" />
        </SelectTrigger>
      </Select>
    );
  }

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder={`Error: ${error}`} />
        </SelectTrigger>
      </Select>
    );
  }

  if (levels.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No education levels found" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => onChange(parseInt(value))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select education level" />
      </SelectTrigger>
      <SelectContent>
        {levels.map((level) => (
          <SelectItem key={level.id} value={level.id.toString()}>
            {level.level_name_localized}
            {level.level_name_localized !== level.level_name && (
              <span className="ml-2 text-gray-500">({level.level_name})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
