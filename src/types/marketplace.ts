export interface Deck {
  id: string;
  title: string;
  description: string;
  price: number;
  cardcount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageurl: string;
  creatorid: string;
  created_at: string;
  flashcardsurl: string | null;
}

export interface FlashCard {
  front: string;
  back: string;
  tags?: string[];
}

export interface BuyDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deck: {
    id: string;
    title: string;
    description: string;
    price: number;
    cardcount: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    creatorName: string;
    flashcardsurl?: string;
  };
}
