import { DeckWithProfile } from "./decks";

export interface FlashCard {
  front: string;
  back: string;
  tags?: string[];
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
