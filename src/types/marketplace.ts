import { useLocalizedEducationCategories } from "@/lib/hooks/useLocalizedEducationCategories";

export interface CategoryDefinition {
  name: string;
  color: string;
  gradient: string;
  hoverGradient: string;
  icon: string;
  subcategories: DeckCategory[];
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
  {
    name: "Education",
    color: "from-emerald-500 to-teal-500",
    gradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
    hoverGradient:
      "hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100",
    icon: "🎓",
    subcategories: [
      // These will be replaced dynamically based on country
      "Elementary",
      "Middle School",
      "High School",
      "College",
      "University",
      "Professional",
      "Adult Education",
      "Special Education",
      "Early Childhood",
      "Test Prep",
      "Study Skills",
      "Teaching Resources",
    ],
  },
];

// Flatten all subcategories for type safety
export const DECK_CATEGORIES = CATEGORY_DEFINITIONS.flatMap(
  (cat) => cat.subcategories,
) as const;

export type DeckCategory = (typeof DECK_CATEGORIES)[number];

// Helper function to get category styling
export const getCategoryStyle = (category: DeckCategory) => {
  const parentCategory = CATEGORY_DEFINITIONS.find((cat) =>
    cat.subcategories.includes(category),
  );
  return parentCategory
    ? {
        gradient: parentCategory.gradient,
        hoverGradient: parentCategory.hoverGradient,
        icon: parentCategory.icon,
      }
    : null;
};

export interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
  bio?: string;
  followersCount: number;
  decksCount: number;
  isFollowed?: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  price: number;
  cardcount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageurl: string;
  creatorid: string;
  categories?: DeckCategory[] | null;
  created_at: string;
}

export interface FlashCard {
  front: string;
  back: string;
  tags?: string[];
}

export interface DeckWithProfile extends Deck {
  creatorName: string;
  creatorAvatar: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
  categories?: DeckCategory[] | null;
}

export interface BuyDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckWithProfile;
}

export interface CreatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
}
