// marketplace.ts
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
  };
 }
 
 export interface BuyDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckWithProfile;
 }