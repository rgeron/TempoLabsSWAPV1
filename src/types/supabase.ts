// Common deck fields
interface DeckBase {
  title: string;
  description: string;
  price: number;
  cardcount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageurl: string;
  creatorid: string;
  flashcards_file_url?: string | null;
}

// Database types
export interface Database {
  public: {
    Tables: {
      decks: {
        Row: DeckBase & {
          id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<DeckBase> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<DeckBase & {
          id: string;
          created_at: string;
          updated_at: string;
        }>;
      };
      // Similar pattern for profiles...
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
}