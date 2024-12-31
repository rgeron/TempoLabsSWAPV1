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
          cardcount: number;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          imageurl: string;
          creatorid: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          cardcount: number;
          difficulty: "Beginner" | "Intermediate" | "Advanced";
          imageurl: string;
          creatorid: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          cardcount?: number;
          difficulty?: "Beginner" | "Intermediate" | "Advanced";
          imageurl?: string;
          creatorid?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          purchaseddeckids: string[];
          likeddeckids: string[];
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          purchaseddeckids?: string[];
          likeddeckids?: string[];
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          purchaseddeckids?: string[];
          likeddeckids?: string[];
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
