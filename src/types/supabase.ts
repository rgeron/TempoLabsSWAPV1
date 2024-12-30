export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          cardCount: number;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          imageUrl: string;
          creatorId: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          cardCount: number;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          imageUrl: string;
          creatorId: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          cardCount?: number;
          difficulty?: "Beginner" | "Intermediate" | "Advanced";
          imageUrl?: string;
          creatorId?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          purchasedDeckIds: string[];
          likedDeckIds: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          purchasedDeckIds?: string[];
          likedDeckIds?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          purchasedDeckIds?: string[];
          likedDeckIds?: string[];
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
