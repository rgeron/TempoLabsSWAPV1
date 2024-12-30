export interface Deck {
  id: string;
  title: string;
  description: string;
  price: number;
  cardCount: number;
  difficulty: string;
  creatorName: string;
}

export interface FlashCard {
  front: string;
  back: string;
  tags?: string[];
}

export interface BuyDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck;
}
