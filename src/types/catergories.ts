export interface CategoryDefinition {
  name: string;
  color: string;
  gradient: string;
  hoverGradient: string;
  icon: string;
  subcategories: string[]; // changed from DeckCategory[]
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
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
